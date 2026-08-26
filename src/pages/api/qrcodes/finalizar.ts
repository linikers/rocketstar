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

    const qrCode = await QRCodeAuth.findOne({ code });

    if (!qrCode) {
      return res.status(404).json({ error: "QR Code não encontrado" });
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
