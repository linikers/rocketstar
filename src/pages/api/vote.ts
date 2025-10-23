import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

export default async function handlerVote(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === 'POST') {
    const { competidorId, juradoId, anatomy, creativity, pigmentation, traces, readability, visualImpact } = request.body;

    if (!competidorId || !juradoId) {
      return response.status(400).json({ error: "competidorId e juradoId são obrigatórios." });
    }

    try {
      const client = await clientPromise;
      const db = client.db("rocketstar");
      const competidoresCollection = db.collection("competidores");

      const competidorObjectId = new ObjectId(competidorId);

      // Passo 1: Remove o voto antigo do jurado (se existir) para garantir que não haja duplicatas.
      await competidoresCollection.updateOne(
        { _id: competidorObjectId },
        { $pull: { votos: { juradoId: juradoId } } }
      );

      // Passo 2: Adiciona o novo voto ao array de votos.
      const novoVoto = {
        juradoId,
        anatomy: Number(anatomy) || 0,
        creativity: Number(creativity) || 0,
        pigmentation: Number(pigmentation) || 0,
        traces: Number(traces) || 0,
        readability: Number(readability) || 0,
        visualImpact: Number(visualImpact) || 0,
      };

      await competidoresCollection.updateOne(
        { _id: competidorObjectId },
        { $push: { votos: novoVoto } }
      );

      // Passo 3: Recalcula e atualiza os totais usando um pipeline de agregação.
      // Isso é muito mais eficiente do que buscar os dados, calcular no servidor e atualizar de novo.
      const updatedCompetitor = await competidoresCollection.findOneAndUpdate(
        { _id: competidorObjectId },
        [ // Início do pipeline de agregação
          {
            $set: {
              anatomy: { $sum: '$votos.anatomy' },
              creativity: { $sum: '$votos.creativity' },
              pigmentation: { $sum: '$votos.pigmentation' },
              traces: { $sum: '$votos.traces' },
              readability: { $sum: '$votos.readability' },
              visualImpact: { $sum: '$votos.visualImpact' },
            }
          },
          {
            $set: {
              totalScore: {
                $add: [
                  '$anatomy', '$creativity', '$pigmentation',
                  '$traces', '$readability', '$visualImpact'
                ]
              }
            }
          }
        ],
        {
          returnDocument: 'after' // Retorna o documento já atualizado
        }
      );

      if (!updatedCompetitor) {
        return response.status(404).json({ error: "Competidor não encontrado após a atualização." });
      }

      response.status(200).json(updatedCompetitor);

    } catch (error) {
      console.error("Erro ao atualizar os votos:", error);
      response.status(500).json({ error: "Erro ao atualizar os votos" });
    }
  } else {
    response.setHeader("Allow", ["POST"]);
    response.status(405).end(`Método ${request.method} não permitido`);
  }
}