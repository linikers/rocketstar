
import { createPool } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handlerVote(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    response.setHeader("Allow", ["POST"]);
    return response.status(405).end(`Método ${request.method} não permitido`);
  }

  const { userId, anatomy, creativity, pigmentation, traces, readability, visualImpact } = request.body;

  // Validação básica dos dados recebidos
  if (!userId || anatomy == null || creativity == null || pigmentation == null || traces == null || readability == null || visualImpact == null) {
      return response.status(400).json({ error: "Dados de votação incompletos. Todos os campos de nota são obrigatórios." });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insere o voto individual na nova tabela 'votos'
    const insertVoteQuery = `
      INSERT INTO votos (competidor_id, anatomy, creativity, pigmentation, traces, readability, visual_impact)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(insertVoteQuery, [userId, anatomy, creativity, pigmentation, traces, readability, visualImpact]);

    // 2. Atualiza os scores agregados na tabela 'competidores'
    // Esta query soma todas as notas da tabela 'votos' para um competidor e atualiza a tabela principal.
    const updateCompetidorQuery = `
      WITH aggregated_scores AS (
        SELECT
          COUNT(*) as vote_count,
          SUM(anatomy) as total_anatomy,
          SUM(creativity) as total_creativity,
          SUM(pigmentation) as total_pigmentation,
          SUM(traces) as total_traces,
          SUM(readability) as total_readability,
          SUM(visual_impact) as total_visual_impact
        FROM votos
        WHERE competidor_id = $1
      )
      UPDATE competidores
      SET 
        votes = (SELECT vote_count FROM aggregated_scores),
        anatomy = (SELECT total_anatomy FROM aggregated_scores),
        creativity = (SELECT total_creativity FROM aggregated_scores),
        pigmentation = (SELECT total_pigmentation FROM aggregated_scores),
        traces = (SELECT total_traces FROM aggregated_scores),
        readability = (SELECT total_readability FROM aggregated_scores),
        visual_impact = (SELECT total_visual_impact FROM aggregated_scores),
        total_score = (
            SELECT total_anatomy + total_creativity + total_pigmentation + total_traces + total_readability + total_visual_impact
            FROM aggregated_scores
        )
      WHERE id = $1
      RETURNING *;
    `;
    
    const updateResult = await client.query(updateCompetidorQuery, [userId]);

    await client.query('COMMIT');

    if (updateResult.rowCount === 0) {
      throw new Error("Competidor não encontrado para atualização após o voto.");
    }

    response.status(200).json(updateResult.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao processar o voto:", error);
    response.status(500).json({ error: "Erro ao processar o voto" });
  } finally {
    client.release();
  }
}