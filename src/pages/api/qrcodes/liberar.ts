import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";
import Competidor from "@/models/Competidor";
import { NextApiRequest, NextApiResponse } from "next/types";
import { requireAdmin } from "@/lib/apiAuth";
import { rateLimit } from "@/lib/rateLimit";
import { isCodeFormatValido } from "@/lib/auth";

// Libera a correção das notas de um jurado SEM apagar voto nenhum.
//
// O caminho antigo para "deixar o jurado corrigir" era RESETAR VOTOS: apagava as
// notas dele em todos os competidores e derrubava o total de cada um, obrigando
// a votar tudo de novo. Aqui a gente só reabre o dia: `diasFinalizados` volta a
// ficar vazio (ou perde o dia informado) e o link é reativado quando já havia
// sido encerrado. Os votos permanecem intactos na base.
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Método não permitido" });
  }

  try {
    await dbConnect();

    const admin = requireAdmin(request, response);
    if (!admin) return;

    // Ação administrativa sensata: limite evita clique duplo/loop no painel.
    if (!rateLimit(request, response, { key: "liberar", limit: 30, windowMs: 60 * 1000 })) {
      return;
    }

    const { code, dia } = request.body || {};

    if (typeof code !== "string" || !isCodeFormatValido(code)) {
      return response.status(400).json({ error: "Código inválido." });
    }

    const qrCode = await QRCodeAuth.findOne({ code });
    if (!qrCode) {
      return response.status(404).json({ error: "Jurado não encontrado." });
    }

    const diasFinalizados: string[] = qrCode.diasFinalizados || [];
    const linkEncerrado = Boolean(qrCode.isFinished || qrCode.isUsed);

    if (diasFinalizados.length === 0 && !linkEncerrado) {
      return response.status(400).json({
        error: `O jurado "${qrCode.jurorName}" não finalizou nenhum dia — as notas dele já podem ser corrigidas pelo próprio link.`,
      });
    }

    // Quantos votos deste jurado continuam salvos (nada é apagado aqui).
    const votosMantidos = await Competidor.countDocuments({
      votacaoId: qrCode.votacaoId,
      "votos.code": code,
    });

    qrCode.diasFinalizados =
      typeof dia === "string" && dia.trim() !== ""
        ? diasFinalizados.filter((d) => d !== dia)
        : [];
    qrCode.isFinished = false;
    qrCode.isUsed = false;
    await qrCode.save();

    return response.status(200).json({
      success: true,
      data: {
        code: qrCode.code,
        jurorName: qrCode.jurorName,
        diasFinalizados: qrCode.diasFinalizados,
        votosMantidos,
        link: `/auth/qrcode?code=${qrCode.code}`,
      },
    });
  } catch (error) {
    console.error("Erro ao liberar correção do jurado:", error);
    return response.status(500).json({ error: "Erro ao liberar correção do jurado." });
  }
}
