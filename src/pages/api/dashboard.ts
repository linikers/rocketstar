import { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const db = await getDb();

    const now = new Date();

    const [totalVotacoes, totalCompetidores, totalUsers, qrCodes] =
      await Promise.all([
        db.collection("votacaos").countDocuments(),
        db.collection("competidors").countDocuments(),
        db.collection("users").countDocuments(),
        db.collection("qrcodeauths").find({}).toArray(),
      ]);

    // Métricas de QR Codes
    const qrValidos = qrCodes.filter(
      (q) => !q.isUsed && q.expiresAt > now
    ).length;
    const qrUsados = qrCodes.filter((q) => q.isUsed).length;
    const qrExpirados = qrCodes.filter(
      (q) => !q.isUsed && q.expiresAt <= now
    ).length;

    // Total de votos (soma de todos os votos em competidores)
    const competidores = await db
      .collection("competidors")
      .find({})
      .toArray();
    const totalVotos = competidores.reduce(
      (acc, c) => acc + (c.votos?.length || 0),
      0
    );

    // Distribuição por categoria
    const cats: Record<string, number> = {};
    competidores.forEach((c) => {
      if (c.category) cats[c.category] = (cats[c.category] || 0) + 1;
    });

    // Votações por dia
    const votacoesData = await db.collection("votacaos").find({}).toArray();
    const dias: Record<string, number> = {};
    votacoesData.forEach((v) => {
      const dia = v.data
        ? new Date(v.data).toLocaleDateString("pt-BR")
        : "sem data";
      dias[dia] = (dias[dia] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalVotacoes,
        totalCompetidores,
        totalVotos,
        totalUsers,
        qrCodes: {
          total: qrCodes.length,
          validos: qrValidos,
          usados: qrUsados,
          expirados: qrExpirados,
        },
        categorias: Object.entries(cats)
          .map(([nome, total]) => ({ nome, total }))
          .sort((a, b) => b.total - a.total),
        votacoesPorDia: Object.entries(dias).map(([dia, total]) => ({
          dia,
          total,
        })),
      },
    });
  } catch (error: any) {
    console.error("Erro no dashboard:", error);
    return res.status(500).json({ error: error.message });
  }
}
