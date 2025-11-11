// Importa a função de conexão com o MongoDB
import dbConnect from "@/lib/mongodb";
import Competidor from "@/models/Competidor";
// Importa o modelo Competidor
// import Competidor from "@/models/competidor";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    await dbConnect(); // Conecta ao banco de dados

    if (request.method === 'GET') {
      try {
        // Busca todos os competidores no MongoDB
        const competidores = await Competidor.find({});
        return response.status(200).json(competidores);
      } catch (error) {
        console.error('Erro ao listar competidores:', error);
        return response.status(500).json({ error: 'Erro ao listar competidores.' });
      }
    } else {
      response.setHeader("Allow", ['GET']);
      return response.status(405).end(`Method ${request.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Erro na API handler:', error);
  }
  return response.status(500).json({ error: 'Erro interno do servidor.' });
}
