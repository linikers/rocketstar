import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    await dbConnect();

    // Busca todos os QR codes, ordenados por data de criação (mais recentes primeiro)
    const qrCodes = await QRCodeAuth.find({}).sort({ createdAt: -1 }).lean();

    // Adiciona o status calculado para cada QR code
    const qrCodesWithStatus = qrCodes.map((qr) => {
      let status: "valido" | "expirado" | "usado";

      if (qr.isUsed) {
        status = "usado";
      } else if (new Date() > qr.expiresAt) {
        status = "expirado";
      } else {
        status = "valido";
      }

      return {
        ...qr,
        status,
      };
    });

    return res.status(200).json({
      success: true,
      data: qrCodesWithStatus,
    });
  } catch (error) {
    console.error("Erro ao listar QR Codes:", error);
    return res.status(500).json({ error: "Erro ao listar QR Codes" });
  }
}
