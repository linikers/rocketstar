import dbConnect from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import Competidor, { IVoto } from "@/models/Competidor";
import QRCodeAuth from "@/models/QRCodeAuth";

export default async function handlerVote(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    response.setHeader("Allow", ["POST"]);
    return response.status(405).end(`Método ${request.method} não permitido`);
  }

  try {
    const {
      competidorId,
      code,
      anatomy, creativity, pigmentation,
      traces, readability, visualImpact
    } = request.body;

    if (!competidorId || !code) {
      return response.status(400).json({ error: "competidorId e code são obrigatórios." });
    }

    await dbConnect();

    // Verifica se o QR code existe e é válido
    const qrCode = await QRCodeAuth.findOne({ code });
    if (!qrCode) {
      return response.status(404).json({ error: "QR Code não encontrado." });
    }
    if (new Date() > qrCode.expiresAt) {
      return response.status(400).json({ error: "QR Code expirado." });
    }

    // Busca o competidor
    const competidor = await Competidor.findById(competidorId);
    if (!competidor) {
      return response.status(404).json({ error: 'Competidor não encontrado.' });
    }

    // Verifica se este jurado (code) já votou neste competidor
    const jaVotou = competidor.votos?.some((v: IVoto) => v.code === code);
    if (jaVotou) {
      return response.status(409).json({
        error: 'Você já votou neste competidor.'
      });
    }

    const novoVoto: IVoto = {
      code,
      anatomy: Number(anatomy) || 0,
      creativity: Number(creativity) || 0,
      pigmentation: Number(pigmentation) || 0,
      traces: Number(traces) || 0,
      readability: Number(readability) || 0,
      visualImpact: Number(visualImpact) || 0,
    };

    // Adiciona voto e recalcula totais
    const updatedCompetidor = await Competidor.findByIdAndUpdate(
      competidorId,
      [
        {
          $set: {
            votos: { $concatArrays: ["$votos", [novoVoto]] }
          }
        },
        {
          $set: {
            anatomy: { $sum: '$votos.anatomy' },
            creativity: { $sum: '$votos.creativity' },
            pigmentation: { $sum: '$votos.pigmentation' },
            traces: { $sum: '$votos.traces' },
            readability: { $sum: '$votos.readability' },
            visualImpact: { $sum: '$votos.visualImpact' },
            totalScore: {
              $add: [
                { $sum: '$votos.anatomy' }, { $sum: '$votos.creativity' },
                { $sum: '$votos.pigmentation' }, { $sum: '$votos.traces' },
                { $sum: '$votos.readability' }, { $sum: '$votos.visualImpact' }
              ]
            }
          }
        }
      ],
      {
        new: true,
        runValidators: true
      }
    )

    if (!updatedCompetidor) {
      return response.status(404).json({ error: 'Competidor não encontrado.' });
    }

    return response.status(200).json(updatedCompetidor);
  } catch (error) {
    console.error('Erro ao votar:', error);
    return response.status(500).json({ error: 'Erro ao votar.' });
  }
}
