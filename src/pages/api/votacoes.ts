import dbConnect from "@/lib/mongodb";
import Votacao from "@/models/Votacao"; // Importa o modelo Votacao
import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/apiAuth";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  await dbConnect(); // Conecta ao banco de dados

  if (request.method === 'GET') {
    try {
      // Listagem pública (usada pelo /Register e pelo /Top100). Devolve apenas
      // os campos que a interface precisa.
      const filter: Record<string, unknown> = {};
      if (request.query.ativo === "true") filter.ativo = true;

      const votacoes = await Votacao.find(filter).select(
        "nome data categorias ativo"
      );
      return response.status(200).json(votacoes);
    } catch (error) {
      console.error('Erro ao listar votações:', error);
      return response.status(500).json({ error: 'Erro ao listar votações.' });
    }
  }

  // Criar/editar/excluir votação é administrativo. Antes, POST e DELETE eram
  // abertos: qualquer visitante criava ou apagava eventos da base.
  const admin = requireAdmin(request, response);
  if (!admin) return;

  if (request.method === 'POST') {
    try {
      const { nome, data, categorias, ativo } = request.body || {};

      if (typeof nome !== "string" || nome.trim() === "") {
        return response.status(400).json({ error: 'Nome da votação é obrigatório.' });
      }
      if (!Array.isArray(categorias) || categorias.length === 0) {
        return response.status(400).json({ error: 'Informe ao menos uma categoria.' });
      }

      const novaVotacao = await Votacao.create({
        nome: nome.trim(),
        data: data ? new Date(data) : new Date(),
        categorias: categorias.map((c: unknown) => String(c).trim()).filter(Boolean),
        ativo: ativo !== false,
      });
      return response.status(201).json(novaVotacao);
    } catch (error) {
      console.error('Erro ao criar votação:', error);
      return response.status(500).json({ error: 'Erro ao criar votação.' });
    }
  }

  if (request.method === 'PUT') {
    try {
      const { id } = request.query;
      if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return response.status(400).json({ error: 'ID da votação é obrigatório.' });
      }

      const { nome, categorias, ativo, data } = request.body || {};
      const update: Record<string, unknown> = {};
      if (typeof nome === "string" && nome.trim() !== "") update.nome = nome.trim();
      if (Array.isArray(categorias)) update.categorias = categorias.map((c: unknown) => String(c).trim());
      if (typeof ativo === "boolean") update.ativo = ativo;
      if (data) update.data = new Date(data);

      const atualizada = await Votacao.findByIdAndUpdate(id, { $set: update }, { new: true });
      if (!atualizada) {
        return response.status(404).json({ error: 'Votação não encontrada.' });
      }
      return response.status(200).json(atualizada);
    } catch (error) {
      console.error('Erro ao atualizar votação:', error);
      return response.status(500).json({ error: 'Erro ao atualizar votação.' });
    }
  }

  if (request.method === 'DELETE') {
    try {
      const { id } = request.query;
      if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return response.status(400).json({ error: 'ID da votação é obrigatório.' });
      }
      await Votacao.findByIdAndDelete(id);
      return response.status(200).json({ message: 'Votação deletada com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar votação:', error);
      return response.status(500).json({ error: 'Erro ao deletar votação.' });
    }
  }

  response.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return response.status(405).end(`Method ${request.method} Not Allowed`);
}
