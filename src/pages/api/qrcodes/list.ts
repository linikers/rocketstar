import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";
import { requireAdmin } from "@/lib/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // A listagem carrega o "code" de cada jurado (credencial de voto). Antes era
  // pública: qualquer visitante baixava todos os códigos e votava como jurado.
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    await dbConnect();

    const { votacaoId } = req.query;
    const filter: Record<string, unknown> = {};
    if (typeof votacaoId === "string" && mongoose.isValidObjectId(votacaoId)) {
      filter.votacaoId = votacaoId;
    }

    // Busca todos os QR codes, ordenados por data de criação (mais recentes primeiro)
    const qrCodes = await QRCodeAuth.find(filter)
      .sort({ createdAt: -1 })
      .populate("votacaoId", "nome ativo")
      .lean();

    // Adiciona o status calculado para cada QR code
    const qrCodesWithStatus = qrCodes.map((qr: any) => {
      let status: "valido" | "expirado" | "usado";

      if (qr.isFinished || qr.isUsed) {
        status = "usado";
      } else if (new Date() > new Date(qr.expiresAt)) {
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
