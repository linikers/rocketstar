import dbConnect from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import Competidor, { IVoto } from "@/models/Competidor";
import QRCodeAuth from "@/models/QRCodeAuth";
import Votacao from "@/models/Votacao";

export default async function handlerVote(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    response.setHeader("Allow", ["POST"]);
    return response.status(405).end(`Método ${request.method} não permitido`);
  }

  try {
    const {
      competidorId,
      code,
      anatomy, creativity, pigmentation,
      traces, readability, visualImpact
    } = request.body;

    if (!competidorId || !code) {
      return response.status(400).json({ error: "competidorId e code são obrigatórios." });
    }

    await dbConnect();

    // Verifica se o QR code existe, é válido e não foi finalizado
    const qrCode = await QRCodeAuth.findOne({ code });
    if (!qrCode) {
      return response.status(404).json({ error: "QR Code não encontrado." });
    }
    if (new Date() > qrCode.expiresAt) {
      return response.status(400).json({ error: "QR Code expirado." });
    }
    if (qrCode.isFinished) {
      return response.status(400).json({ error: "Votação já foi finalizada para este QR Code." });
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

    // Valida cada nota entre 0 e 10
    const notas = { anatomy, creativity, pigmentation, traces, readability, visualImpact };
    for (const [key, val] of Object.entries(notas)) {
      const nota = Number(val);
      if (isNaN(nota) || nota < 0 || nota > 10) {
        return response.status(400).json({
          error: `Nota inválida em ${key}. Use valores entre 0 e 10.`
        });
      }
    }

    const novoVoto: IVoto = {
      code,
      jurorName: qrCode.jurorName,
      anatomy: Number(anatomy),
      creativity: Number(creativity),
      pigmentation: Number(pigmentation),
      traces: Number(traces),
      readability: Number(readability),
      visualImpact: Number(visualImpact),
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

    return response.status(200).json(updatedCompetidor);
  } catch (error) {
    console.error('Erro ao votar:', error);
    return response.status(500).json({ error: 'Erro ao votar.' });
  }
}
