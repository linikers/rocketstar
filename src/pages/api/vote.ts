import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import Competidor, { IVoto } from "@/models/Competidor";
import QRCodeAuth from "@/models/QRCodeAuth";
import Votacao from "@/models/Votacao";
import { isCodeFormatValido, verificarTokenJurado } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

const NOTAS = [
  "anatomy",
  "creativity",
  "pigmentation",
  "traces",
  "readability",
  "visualImpact",
] as const;

type NotaKey = (typeof NOTAS)[number];

// Aceita apenas número (ou string numérica) entre 0 e 10. Antes, null/"" viravam
// Number(0) e o servidor gravava nota zero silenciosamente.
function parseNota(valor: unknown): number | null {
  if (typeof valor !== "number" && typeof valor !== "string") return null;
  if (typeof valor === "string" && valor.trim() === "") return null;
  const nota = Number(valor);
  if (!Number.isFinite(nota) || nota < 0 || nota > 10) return null;
  return nota;
}

export default async function handlerVote(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    response.setHeader("Allow", ["POST"]);
    return response.status(405).end(`Método ${request.method} não permitido`);
  }

  try {
    // Guardrail anti-flood: 40 votos por minuto por IP.
    if (
      !rateLimit(request, response, {
        key: "vote",
        limit: 40,
        windowMs: 60 * 1000,
      })
    ) {
      return;
    }

    const body = request.body || {};
    const { competidorId, code, jurorToken } = body;

    if (!competidorId || !code) {
      return response
        .status(400)
        .json({ error: "competidorId e code são obrigatórios." });
    }

    if (!isCodeFormatValido(code)) {
      return response.status(400).json({ error: "Código de jurado inválido." });
    }

    if (!mongoose.isValidObjectId(competidorId)) {
      return response.status(400).json({ error: "Competidor inválido." });
    }

    await dbConnect();

    // A sessão de jurado (emitida ao abrir o link em /api/qrcodes/validate) é
    // obrigatória e precisa ser do MESMO code. Antes, quem tivesse o code —
    // inclusive um link vazado — votava sem nunca ter aberto o QR na interface.
    const juror = jurorToken ? verificarTokenJurado(jurorToken) : null;
    if (!juror || juror.code !== code) {
      return response.status(401).json({
        error:
          "Sessão de jurado inválida ou expirada. Abra novamente o link do QR Code.",
      });
    }

    // Valida as notas ANTES de tocar no banco
    const notas = {} as Record<NotaKey, number>;
    for (const key of NOTAS) {
      const nota = parseNota(body[key]);
      if (nota === null) {
        return response.status(400).json({
          error: `Nota inválida em ${key}. Use valores entre 0 e 10.`,
        });
      }
      notas[key] = nota;
    }

    // Verifica se o QR code existe, é válido e não foi finalizado
    const qrCode = await QRCodeAuth.findOne({ code });
    if (!qrCode) {
      return response.status(404).json({ error: "QR Code não encontrado." });
    }
    if (new Date() > qrCode.expiresAt) {
      return response.status(400).json({ error: "QR Code expirado." });
    }
    if (qrCode.isFinished || qrCode.isUsed) {
      return response
        .status(400)
        .json({ error: "Votação já foi finalizada para este QR Code." });
    }

    // Busca o competidor
    const competidor = await Competidor.findById(competidorId);
    if (!competidor) {
      return response.status(404).json({ error: 'Competidor não encontrado.' });
    }

    // Guardrail: só permite votar se a votação do competidor estiver ativa
    const votacao = await Votacao.findById(competidor.votacaoId);
    if (!votacao || votacao.ativo !== true) {
      return response.status(400).json({ error: 'Votação não está ativa para este competidor.' });
    }

    // Guardrail: o jurado só vota no evento do seu QR Code. Sem isto, um jurado
    // recebia competidores de outros eventos e podia votar neles.
    if (qrCode.votacaoId && String(qrCode.votacaoId) !== String(competidor.votacaoId)) {
      return response.status(403).json({
        error: "Este QR Code pertence a outro evento.",
      });
    }

    const novoVoto: IVoto = {
      code,
      jurorName: qrCode.jurorName,
      anatomy: notas.anatomy,
      creativity: notas.creativity,
      pigmentation: notas.pigmentation,
      traces: notas.traces,
      readability: notas.readability,
      visualImpact: notas.visualImpact,
    };

    // Adiciona voto e recalcula totais
    // Atualização atômica: a checagem de "jurado já votou" entra no filtro do
    // update. Duas requisições simultâneas do mesmo jurado/competidor não
    // conseguem duplicar o voto (apenas uma passa no filtro).
    const updatedCompetidor = await Competidor.findOneAndUpdate(
      { _id: competidorId, 'votos.code': { $ne: code } },
      [
        {
          $set: {
            votos: { $concatArrays: ["$votos", [novoVoto]] }
          }
        },
        {
          $set: {
            anatomy: { $sum: '$votos.anatomy' },
            creativity: { $sum: '$votos.creativity' },
            pigmentation: { $sum: '$votos.pigmentation' },
            traces: { $sum: '$votos.traces' },
            readability: { $sum: '$votos.readability' },
            visualImpact: { $sum: '$votos.visualImpact' },
            totalScore: {
              $add: [
                { $sum: '$votos.anatomy' }, { $sum: '$votos.creativity' },
                { $sum: '$votos.pigmentation' }, { $sum: '$votos.traces' },
                { $sum: '$votos.readability' }, { $sum: '$votos.visualImpact' }
              ]
            }
          }
        }
      ],
      {
        new: true,
        runValidators: true
      }
    )

    if (!updatedCompetidor) {
      // Se o competidor existe mas o filtro não casou, é porque este jurado já votou
      const existe = await Competidor.exists({ _id: competidorId });
      if (!existe) {
        return response.status(404).json({ error: 'Competidor não encontrado.' });
      }
      return response.status(409).json({ error: 'Você já votou neste competidor.' });
    }

    // Vincula o QR Code ao evento no primeiro voto (compatibilidade com os QR
    // Codes emitidos antes do campo votacaoId existir).
    if (!qrCode.votacaoId) {
      await QRCodeAuth.updateOne(
        { _id: qrCode._id, votacaoId: null },
        { $set: { votacaoId: competidor.votacaoId } }
      );
    }

    // Não devolve o documento do competidor: ele carrega os votos de TODOS os
    // jurados (notas e nomes), que o jurado não deve ver antes de finalizar.
    return response.status(200).json({
      success: true,
      message: 'Voto registrado com sucesso.',
      competidorId,
    });
  } catch (error) {
    console.error('Erro ao votar:', error);
    return response.status(500).json({ error: 'Erro ao votar.' });
  }
}
