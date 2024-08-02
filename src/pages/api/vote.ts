import { createPool } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";

const client = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handlerVote(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log(request.method);
  if (request.method === 'POST') {
    const { userId, anatomy, creativity, pigmentation, traces, readability, visualImpact } = request.body;
    console.log("antes do try");
    console.log(request.body);
    try {
      // Verifica se o usuário existe
      const userResult = await client.query(
        'SELECT id FROM competidores WHERE id = $1',
        [userId]
      );
        console.log(userId);
      if (userResult.rowCount === 0) {
        return response.status(404).json({ error: "Usuário não encontrado" });
      }

      // Atualiza os votos
      const updateResult = await client.query(
        `
        UPDATE competidores
        SET 
          anatomy = COALESCE($2, anatomy),
          creativity = COALESCE($3, creativity),
          pigmentation = COALESCE($4, pigmentation),
          traces = COALESCE($5, traces),
          readability = COALESCE($6, readability),
          visualimpact = COALESCE($7, visualimpact)
        WHERE id = $1
        RETURNING *
        `,
        [userId, anatomy, creativity, pigmentation, traces, readability, visualImpact]
      );
        console.log(response);
      response.status(200).json(updateResult.rows[0]);
    } catch (error) {
      console.log(response);
      console.error("Erro ao atualizar os votos:", error);
      response.status(500).json({ error: "Erro ao atualizar os votos" });
    }
  } else {
    response.setHeader("Allow", ["POST"]);
    response.status(405).end(`Método ${request.method} não permitido`);
  }
}
