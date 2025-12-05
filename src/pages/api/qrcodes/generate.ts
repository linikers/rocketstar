import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
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

    // Recebe validityHours do body, padrão 72h
    const { validityHours = 72 } = req.body;

    // Valida o valor
    if (typeof validityHours !== "number" || validityHours <= 0) {
      return res
        .status(400)
        .json({ error: "validityHours deve ser um número positivo" });
    }

    // Gera código único
    const code = uuidv4();

    // Calcula data de expiração
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityHours * 60 * 60 * 1000);

    // Cria o QR Code no banco
    const qrCode = await QRCodeAuth.create({
      code,
      expiresAt,
      createdAt: now,
      isUsed: false,
      validityHours,
    });

    return res.status(201).json({
      success: true,
      data: qrCode,
    });
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error);
    return res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
}
