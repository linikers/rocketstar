import dbConnect from "@/lib/mongodb";
import Competidor from "@/models/competidor";
// import Competidor from "@/models/Competidor"; // Importa o modelo Competidor
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    await dbConnect(); // Conecta ao banco de dados

    if (request.method === 'POST') {
      const { name, work, category = null } = request.body;

      // Validação básica
      if (!name || !work) {
        return response.status(400).json({ error: 'Dados incompletos: name e work são obrigatórios.' });
      }

      const newCompetitorData = {
        name,
        work,
        category,
        votos: [], // Array para armazenar os votos individuais
      };

      try {
        const savedCompetidor = await Competidor.create(newCompetitorData);

        console.log('Competidor salvo com sucesso:', savedCompetidor);
        return response.status(201).json(savedCompetidor);
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