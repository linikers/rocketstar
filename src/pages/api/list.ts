import { createPool } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next/types";

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    if (request.method === 'GET') {
      try {
        const result = await pool.query('SELECT * FROM competidores');
        return response.status(200).json(result.rows);
      } catch (error) {
        console.error('Erro ao listar competidores:', error);
        return response.status(500).json({ error: 'Erro ao listar competidores.' });
      }
    } else {
      response.setHeader("Permitido", ['GET']);
      return response.status(405).end(`Method ${request.method} Sem permissão`);
    }
  } catch (error) {
    console.error('Erro na API handler:', error);
    return response.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
