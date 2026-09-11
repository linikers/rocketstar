import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";
import { isCodeFormatValido, verificarTokenJurado } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    if (
      !rateLimit(req, res, {
        key: "qrcodes-finalizar",
        limit: 20,
        windowMs: 60 * 1000,
      })
    ) {
      return;
    }

    await dbConnect();

    const { code, jurorToken } = req.body || {};

    if (!code) {
      return res.status(400).json({ error: "Código é obrigatório" });
    }

    if (!isCodeFormatValido(code)) {
      return res.status(400).json({ error: "QR Code inválido" });
    }

    // Finalizar é irreversível e queima o QR Code: exige a sessão de jurado
    // emitida ao abrir o link. Antes, qualquer POST com um code conhecido
    // finalizava a votação de outra pessoa.
    const juror = jurorToken ? verificarTokenJurado(jurorToken) : null;
    if (!juror || juror.code !== code) {
      return res.status(401).json({
        error:
          "Sessão de jurado inválida ou expirada. Abra novamente o link do QR Code.",
      });
    }

    const qrCode = await QRCodeAuth.findOne({ code });

    if (!qrCode) {
      return res.status(404).json({ error: "QR Code não encontrado" });
    }

    if (new Date() > qrCode.expiresAt) {
      return res.status(400).json({ error: "QR Code expirado" });
    }

    if (qrCode.isFinished || qrCode.isUsed) {
      // Idempotente: já finalizado, devolve sucesso sem regravar a data.
      return res.status(200).json({
        success: true,
        message: "Votação já estava finalizada",
        data: { jurorName: qrCode.jurorName },
      });
    }

    qrCode.isFinished = true;
    qrCode.isUsed = true;
    qrCode.usedAt = new Date();
    await qrCode.save();

    return res.status(200).json({
      success: true,
      message: "Votação finalizada com sucesso",
      data: {
        jurorName: qrCode.jurorName,
      },
    });
  } catch (error) {
    console.error("Erro ao finalizar votação:", error);
    return res.status(500).json({ error: "Erro ao finalizar votação" });
  }
}
