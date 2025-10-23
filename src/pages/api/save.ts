import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("rocketstar"); // Use o nome do seu banco de dados

    if (request.method === 'POST') {
      const { name, work, category = null } = request.body;

      // Validação básica
      if (!name || !work) {
        return response.status(400).json({ error: 'Dados incompletos: name e work são obrigatórios.' });
      }

      const newCompetitor = {
        name,
        work,
        category,
        votos: [], // Array para armazenar os votos individuais
        anatomy: 0,
        creativity: 0,
        pigmentation: 0,
        traces: 0,
        readability: 0,
        visualImpact: 0,
        totalScore: 0,
      };

      try {
        const result = await db.collection("competidores").insertOne(newCompetitor);

        // O MongoDB retorna o ID inserido, podemos retornar o documento completo
        const savedCompetitor = { ...newCompetitor, _id: result.insertedId };

        console.log('Competidor salvo com sucesso:', savedCompetitor);
        return response.status(201).json(savedCompetitor);
      } catch (error) {
        console.error('Erro ao inserir competidor:', error);
        return response.status(500).json({ error: 'Erro ao cadastrar competidor.' });
      }
    } else {
      response.setHeader("Allow", ['POST']);
      return response.status(405).end(`Method ${request.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API handler:', error);
    return response.status(500).json({ error: 'Erro interno do servidor.' });
  }
}