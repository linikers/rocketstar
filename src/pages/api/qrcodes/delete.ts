import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";
import Competidor from "@/models/Competidor";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Código é obrigatório" });
  }

  try {
    await dbConnect();

    // Remove o QR code (o "jurado")
    const qrCode = await QRCodeAuth.findOneAndDelete({ code });
    if (!qrCode) {
      return res.status(404).json({ error: "QR Code não encontrado" });
    }

    // Remove os votos feitos com este code e recalcula os scores dos competidores
    const afetados = await Competidor.find({ "votos.code": code });
    for (const c of afetados) {
      const novosVotos = (c.votos || []).filter((v: { code: string }) => v.code !== code);
      const somar = (chave: string) =>
        novosVotos.reduce((acc: number, v: any) => acc + (Number(v[chave]) || 0), 0);

      c.votos = novosVotos;
      c.anatomy = somar("anatomy");
      c.creativity = somar("creativity");
      c.pigmentation = somar("pigmentation");
      c.traces = somar("traces");
      c.readability = somar("readability");
      c.visualImpact = somar("visualImpact");
      c.totalScore = c.anatomy + c.creativity + c.pigmentation + c.traces + c.readability + c.visualImpact;
      await c.save();
    }

    return res.status(200).json({
      success: true,
      jurorName: qrCode.jurorName,
      votosRemovidos: afetados.length,
    });
  } catch (error) {
    console.error("Erro ao excluir QR code:", error);
    return res.status(500).json({ error: "Erro ao excluir QR code" });
  }
}