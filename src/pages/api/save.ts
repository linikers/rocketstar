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
        totalScore INTEGER DEFAULT 0,
        category VARCHAR(255) DEFAULT NULL
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
      const { 
        name, 
        work, 
        votes = 0,
        percent = 0,
        anatomy = 0,
        creativity = 0,
        pigmentation = 0,
        traces = 0,
        readability = 0,
        visualImpact = 0,
        totalScore = 0,
        category = null
      } = request.body;

      // Validação básica
      if (!name || !work) {
        return response.status(400).json({ error: 'Dados incompletos: name e work são obrigatórios.' });
      }

      try {
        const result = await client.query(`
          INSERT INTO competidores (
            name, work, votes, percent, anatomy, creativity, 
            pigmentation, traces, readability, visualImpact, 
            totalScore, category
          ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
          RETURNING *`,
          [
            name, 
            work, 
            votes, 
            percent, 
            anatomy, 
            creativity, 
            pigmentation, 
            traces, 
            readability, 
            visualImpact, 
            totalScore, 
            category
          ]
        );
        
        console.log('Competidor salvo com sucesso:', result.rows[0]);
        return response.status(201).json(result.rows[0]);
        
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