import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";
import Votacao from "@/models/Votacao";
import { gerarTokenJurado, isCodeFormatValido } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Guardrail anti-brute-force: 30 tentativas por minuto por IP (o code é um
    // UUID, mas sem limite dava para varrer códigos em massa).
    if (
      !rateLimit(req, res, {
        key: "qrcodes-validate",
        limit: 30,
        windowMs: 60 * 1000,
      })
    ) {
      return;
    }

    await dbConnect();

    const { code } = req.body || {};

    if (!code) {
      return res.status(400).json({ error: "Código é obrigatório" });
    }

    if (!isCodeFormatValido(code)) {
      return res.status(400).json({ error: "QR Code inválido" });
    }

    // Busca o QR code pelo código
    const qrCode = await QRCodeAuth.findOne({ code });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: "QR Code não encontrado",
      });
    }

    // Verifica se expirou
    if (new Date() > qrCode.expiresAt) {
      return res.status(400).json({
        success: false,
        error: "QR Code expirado",
        expiresAt: qrCode.expiresAt,
      });
    }

    // Verifica se a votação já foi finalizada para este QR
    if (qrCode.isFinished || qrCode.isUsed) {
      return res.status(400).json({
        success: false,
        error: "QR Code já utilizado",
      });
    }

    // QR valido. NÃO marca como usado aqui: o mesmo QR é reutilizável dentro do
    // período de validade (72h), permitindo que o jurado volte a votar. O flag
    // isUsed/isFinished só é marcado ao FINALIZAR a votação (POST /finalizar).
    // firstUsedAt registra o primeiro acesso (informativo para o painel).
    if (!qrCode.firstUsedAt) {
      await QRCodeAuth.updateOne(
        { _id: qrCode._id, firstUsedAt: null },
        { $set: { firstUsedAt: new Date() } }
      );
    }

    // Evento vinculado ao QR. Se ainda não houver (QR Codes emitidos antes deste
    // campo), devolve os eventos ativos para a tela escolher — e o vínculo é
    // gravado no primeiro voto.
    const votacao = qrCode.votacaoId
      ? await Votacao.findById(qrCode.votacaoId).select("nome ativo")
      : null;

    const votacoesAtivas = qrCode.votacaoId
      ? []
      : await Votacao.find({ ativo: true }).select("nome");

    // Sessão do jurado: assinada com o segredo do servidor e exigida em
    // /api/vote e /api/qrcodes/finalizar. Sem ela, qualquer pessoa com o code
    // (inclusive um link vazado) votava ou queimava o QR de terceiros.
    // A validade da sessão é o tempo que resta do QR Code: o jurado tem a MESMA
    // janela (72h por padrão) para validar o link e votar — abrir hoje e voltar
    // amanhã continua funcionando enquanto o código não expirar.
    const segundosRestantes = Math.max(
      300,
      Math.floor((new Date(qrCode.expiresAt).getTime() - Date.now()) / 1000)
    );

    const jurorToken = gerarTokenJurado(
      {
        code: qrCode.code,
        jurorName: qrCode.jurorName,
      },
      segundosRestantes
    );

    return res.status(200).json({
      success: true,
      message: "QR Code validado com sucesso",
      data: {
        jurorName: qrCode.jurorName,
        expiresAt: qrCode.expiresAt,
        // janela de votação = validade do código
        votacaoValidaAte: qrCode.expiresAt,
        jurorToken,
        jurorTokenExpiraEmSegundos: segundosRestantes,
        votacao: votacao
          ? { _id: String(votacao._id), nome: votacao.nome, ativo: votacao.ativo }
          : null,
        // Dias que este jurado já finalizou (a tela usa para marcar "concluído"
        // no seletor de dia e não pedir o mesmo dia duas vezes).
        diasFinalizados: qrCode.diasFinalizados || [],
        votacoesAtivas: votacoesAtivas.map((v) => ({
          _id: String(v._id),
          nome: v.nome,
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao validar QR Code:", error);
    return res.status(500).json({ error: "Erro ao validar QR Code" });
  }
}
