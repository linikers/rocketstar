import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";
import Votacao from "@/models/Votacao";
import { requireAdmin } from "@/lib/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Emitir QR Code é ato administrativo: antes qualquer pessoa na internet
  // gerava quantos jurados quisesse.
  const admin = requireAdmin(req, res);
  if (!admin) return;

  try {
    await dbConnect();

    // Recebe validityHours do body, padrão 72h
    const { validityHours = 72, jurorName, votacaoId } = req.body || {};

    // Valida o valor
    if (typeof validityHours !== "number" || validityHours <= 0) {
      return res
        .status(400)
        .json({ error: "validityHours deve ser um número positivo" });
    }

    if (!jurorName || typeof jurorName !== "string" || jurorName.trim() === "") {
      return res
        .status(400)
        .json({ error: "Nome do jurado é obrigatório" });
    }

    // Evento do jurado: OBRIGATÓRIO. Sem ele o jurado recebia competidores de
    // outros eventos (voto cruzado). QR Codes antigos sem vínculo continuam
    // funcionando: são vinculados ao evento no primeiro voto (ver /api/vote).
    if (!votacaoId || typeof votacaoId !== "string") {
      return res
        .status(400)
        .json({ error: "votacaoId é obrigatório: selecione o evento do jurado" });
    }
    if (!mongoose.isValidObjectId(votacaoId)) {
      return res.status(400).json({ error: "votacaoId inválido" });
    }
    const existe = await Votacao.exists({ _id: votacaoId });
    if (!existe) {
      return res.status(400).json({ error: "Votação não encontrada" });
    }
    const votacao: string = String(votacaoId);

    // Gera código único
    const code = uuidv4();

    // Calcula data de expiração
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityHours * 60 * 60 * 1000);

    // Cria o QR Code no banco
    const qrCode = await QRCodeAuth.create({
      code,
      jurorName: jurorName.trim(),
      votacaoId: votacao,
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
