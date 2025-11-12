import dbConnect from "@/lib/mongodb";
import Votacao from "@/models/Votacao"; // Importa o modelo Votacao
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  await dbConnect(); // Conecta ao banco de dados

  if (request.method === 'GET') {
    try {
      // Busca todas as votações ativas (ou todas, dependendo da necessidade)
      // Você pode adicionar filtros aqui, por exemplo: { ativo: true, data: { $gte: new Date() } }
      const votacoes = await Votacao.find({});
      return response.status(200).json(votacoes);
    } catch (error) {
      console.error('Erro ao listar votações:', error);
      return response.status(500).json({ error: 'Erro ao listar votações.' });
    }
  } else if (request.method === 'POST') {
    // Exemplo de como criar uma nova votação (opcional, pode ser feito via admin)
    const { nome, data, categorias, ativo } = request.body;
    const novaVotacao = await Votacao.create({ nome, data, categorias, ativo });
    return response.status(201).json(novaVotacao);
  } else if (request.method === 'DELETE') {
    try {
      const { id } = request.query;
      if (!id) {
        return response.status(400).json({ error: 'ID da votação é obrigatório.' });
      }
      await Votacao.findByIdAndDelete(id);
      return response.status(200).json({ message: 'Votação deletada com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar votação:', error);
      return response.status(500).json({ error: 'Erro ao deletar votação.' });
    }
  }
  response.setHeader("Allow", ["GET", "POST", "DELETE"]);
  return response.status(405).end(`Method ${request.method} Not Allowed`);
}