// Importa a função de conexão com o MongoDB
import dbConnect from "@/lib/mongodb";
import Competidor from "@/models/Competidor";
import { NextApiRequest, NextApiResponse } from "next/types";
import mongoose from "mongoose";
import { verificarToken } from "@/lib/auth";
import { getBearerToken } from "@/lib/apiAuth";
import { diaDaCategoria } from "@/utils/categoryMap";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'GET') {
    response.setHeader("Allow", ['GET']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  try {
    await dbConnect();

    const { votacaoId } = request.query;
    const code = typeof request.query.code === 'string' ? request.query.code : null;

    // Admin (token válido) recebe os documentos completos, inclusive os votos.
    const token = getBearerToken(request);
    const payload = token ? verificarToken(token) : null;
    const isAdmin = payload?.role === 'admin';

    if (votacaoId && (typeof votacaoId !== 'string' || !mongoose.isValidObjectId(votacaoId))) {
      return response.status(400).json({ error: 'votacaoId inválido.' });
    }

    // Sem votacaoId a listagem completa é restrita ao admin. Antes, o jurado
    // recebia competidores de TODOS os eventos (e votava em qualquer um).
    if (!isAdmin && !votacaoId) {
      return response.status(400).json({
        error: 'Informe o votacaoId para listar os competidores de um evento.',
      });
    }

    const filter: { votacaoId?: string } = {};
    if (typeof votacaoId === 'string') filter.votacaoId = votacaoId;

    // Busca competidores com base no filtro. O .populate('votacaoId') substitui
    // o ID do evento pelos dados completos do evento.
    const competidores = await Competidor.find(filter).populate('votacaoId').lean();

    if (isAdmin) {
      return response.status(200).json(
        competidores.map((competidor: any) => ({
          ...competidor,
          dia: diaDaCategoria(competidor.category),
        }))
      );
    }

    // Para quem NÃO é admin: remove o array de votos (que expunha o nome de
    // todos os jurados e as notas dadas) e informa apenas o voto do próprio
    // portador do code, para a tela não pedir voto repetido.
    const sanitizados = competidores.map((competidor: any) => {
      const copia = { ...competidor };
      const votos: any[] = copia.votos || [];
      delete copia.votos;

      const meuVoto = code ? votos.find((voto: any) => voto.code === code) : undefined;

      return {
        ...copia,
        // Dia derivado da categoria: a tela do jurado usa para ele escolher
        // qual dia julgar e para liberar o Finalizar ao terminar o dia.
        dia: diaDaCategoria(copia.category),
        jaVotou: Boolean(meuVoto),
        meuVoto: meuVoto || null,
      };
    });

    return response.status(200).json(sanitizados);
  } catch (error) {
    console.error('Erro na API handler:', error);
    return response.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
