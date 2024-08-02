import { createPool } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next/types";

const client = createPool({
  connectionString: process.env.POSTGRES_URL,
});
const createTableIfNotExists = async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS competidores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        work VARCHAR(255) NOT NULL,
        votes INTEGER NOT NULL DEFAULT 0,
        percent DECIMAL(5, 2) DEFAULT 0,
        anatomy INTEGER DEFAULT 0,
        creativity INTEGER DEFAULT 0,
        pigmentation INTEGER DEFAULT 0,
        traces INTEGER DEFAULT 0,
        readability INTEGER DEFAULT 0,
        visualImpact INTEGER DEFAULT 0,
        totalScore INTEGER DEFAULT 0
      );
    `);
    console.log("Tabela competidores verificada/criada.");
  } catch (error) {
    console.error('Erro ao criar a tabela competidores:', error);
  }
};

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    await createTableIfNotExists();

    if (request.method === 'POST') {
      const { name, work, votes } = request.body;

      if (!name || !work || votes === undefined) {
        return response.status(400).json({ error: 'Dados incompletos: name, work e votes são obrigatórios.' });
      }

      try {
        const result = await client.query(
          'INSERT INTO competidores (name, work, votes) VALUES($1, $2, $3) RETURNING *',
          [name, work, votes]
        );
        return response.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Erro ao inserir competidor:', error);
        return response.status(500).json({ error: 'Erro ao cadastrar competidor.' });
      }
    } else {
      response.setHeader("Permitido", ['POST']);
      return response.status(405).end(`Method ${request.method} Sem permissão`);
    }
  } catch (error) {
    console.error('Erro na API handler:', error);
    return response.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
