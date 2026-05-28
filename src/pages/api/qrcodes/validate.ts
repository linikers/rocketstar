import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    await dbConnect();

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Código é obrigatório" });
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

    // QR valido — nao marca como usado para permitir reutilizacao
    return res.status(200).json({
      success: true,
      message: "QR Code validado com sucesso",
      data: {
        jurorName: qrCode.jurorName,
        expiresAt: qrCode.expiresAt,
      },
    });
  } catch (error) {
    console.error("Erro ao validar QR Code:", error);
    return res.status(500).json({ error: "Erro ao validar QR Code" });
  }
}
