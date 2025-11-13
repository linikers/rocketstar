import dbConnect from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
// import mongoose, { Types } from "mongoose"; // Importa mongoose para usar ObjectId
import Competidor, { IVoto } from "@/models/Competidor";

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
      anatomy, creativity, pigmentation,
      traces, readability, visualImpact
    } = request.body;

    if (!competidorId) {
      return response.status(400).json({ error: "competidorId e juradoId são obrigatórios." });
    }

    await dbConnect(); // Garante a conexão com o banco de dados

    const novoVoto: IVoto = {
      // juradoId: new Types.ObjectId(juradoId), // Converte para ObjectId
      anatomy: Number(anatomy) || 0,
      creativity: Number(creativity) || 0,
      pigmentation: Number(pigmentation) || 0,
      traces: Number(traces) || 0,
      readability: Number(readability) || 0,
      visualImpact: Number(visualImpact) || 0,
    };

    // Usar findByIdAndUpdate com um pipeline de agregação para atomicidade e recalcular totais
    const updatedCompetidor = await Competidor.findByIdAndUpdate(
      competidorId,
      [ // Início do pipeline de agregação
        // // Passo 1: Remove o voto antigo do jurado (se existir) para garantir que não haja duplicatas.
        // {
        //   $set: {
        //     votos: {
        //       $filter: {
        //         input: "$votos",
        //         as: "voto",
        //         // cond: { $ne: ["$$voto.juradoId", novoVoto.juradoId] }
        //       }
        //     }
        //   }
        // },
        // Passo 2: Adiciona o novo voto ao array de votos.
        {
          $set: {
            votos: { $concatArrays: ["$votos", [novoVoto]] }
          }
        },
        // Passo 3: Recalcula e atualiza os totais usando um pipeline de agregação.
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
        new: true, // Retorna o documento modificado
        runValidators: true // Executa os validadores do esquema Mongoose
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