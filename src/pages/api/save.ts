import dbConnect from "@/lib/mongodb";
import Competidor from "@/models/Competidor";
import Votacao from "@/models/Votacao";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next/types";
import { requireAdmin } from "@/lib/apiAuth";
import { rateLimit } from "@/lib/rateLimit";

const CAMPOS_NOTAS = [
  "anatomy",
  "creativity",
  "pigmentation",
  "traces",
  "readability",
  "visualImpact",
] as const;

function recalcular(competidor: any, votos: any[]) {
  const somar = (chave: string) =>
    votos.reduce((acc: number, v: any) => acc + (Number(v[chave]) || 0), 0);

  competidor.votos = votos;
  competidor.anatomy = somar("anatomy");
  competidor.creativity = somar("creativity");
  competidor.pigmentation = somar("pigmentation");
  competidor.traces = somar("traces");
  competidor.readability = somar("readability");
  competidor.visualImpact = somar("visualImpact");
  competidor.totalScore = CAMPOS_NOTAS.reduce(
    (acc, chave) => acc + Number(competidor[chave] || 0),
    0
  );
}

type Texto = { ok: true; valor: string } | { ok: false; erro: string };

function validarTexto(valor: unknown, campo: string, max = 120): Texto {
  if (typeof valor !== "string" || valor.trim() === "") {
    return { ok: false, erro: `O campo ${campo} é obrigatório.` };
  }
  const limpo = valor.trim();
  if (limpo.length > max) {
    return { ok: false, erro: `O campo ${campo} deve ter no máximo ${max} caracteres.` };
  }
  return { ok: true, valor: limpo };
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  try {
    await dbConnect();

    if (request.method === 'PUT') {
      // Resetar votos altera resultados: admin-only.
      const admin = requireAdmin(request, response);
      if (!admin) return;

      const { id, code } = request.query;
      if (!id || typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return response.status(400).json({ error: 'ID do competidor é obrigatório' });
      }

      const competidor = await Competidor.findById(id);
      if (!competidor) {
        return response.status(404).json({ error: 'Competidor não encontrado.' });
      }

      if (typeof code === "string" && code.length > 0) {
        // Remove apenas os votos DESTE jurado. Antes, o botão "zerar votos" do
        // painel apagava os votos de TODOS os competidores da base.
        recalcular(
          competidor,
          (competidor.votos || []).filter((v: { code: string }) => v.code !== code)
        );
        await competidor.save();
        return response.status(200).json({ success: true, data: competidor });
      }

      // Zera votos e notas do competidor (usado pelo admin em "Resetar votos")
      recalcular(competidor, []);
      await competidor.save();
      return response.status(200).json({ success: true, data: competidor });
    }

    if (request.method === 'PATCH') {
      // Edição de competidor (nome, obra, categoria) SEM tocar nos votos.
      // Antes, corrigir um cadastro só era possível apagando e recriando — o que
      // zerava votos e notas já dados pelos jurados.
      const admin = requireAdmin(request, response);
      if (!admin) return;

      const { id } = request.query;
      if (!id || typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return response.status(400).json({ error: 'ID do competidor é obrigatório' });
      }

      const competidor = await Competidor.findById(id);
      if (!competidor) {
        return response.status(404).json({ error: 'Competidor não encontrado.' });
      }

      const { name, work, category } = request.body || {};
      const atualizacao: Record<string, string> = {};

      if (name !== undefined) {
        const nome = validarTexto(name, "name");
        if (!nome.ok) return response.status(400).json({ error: nome.erro });
        atualizacao.name = nome.valor;
      }

      if (work !== undefined) {
        const obra = validarTexto(work, "work");
        if (!obra.ok) return response.status(400).json({ error: obra.erro });
        atualizacao.work = obra.valor;
      }

      if (category !== undefined) {
        const categoria = validarTexto(category, "category", 60);
        if (!categoria.ok) return response.status(400).json({ error: categoria.erro });

        // A categoria precisa existir na votação: digitar "Anime reto" criaria
        // uma categoria órfã (e um dia "Outros" na tela do jurado).
        const votacao = await Votacao.findById(competidor.votacaoId);
        const permitidas: string[] = votacao?.categorias || [];
        if (permitidas.length > 0 && !permitidas.includes(categoria.valor)) {
          return response.status(400).json({
            error: `Categoria inválida para esta votação. Disponíveis: ${permitidas.join(', ')}.`,
          });
        }

        atualizacao.category = categoria.valor;
      }

      if (Object.keys(atualizacao).length === 0) {
        return response.status(400).json({
          error: 'Nada para atualizar: informe name, work ou category.',
        });
      }

      try {
        // $set apenas nos campos alterados: votos[], notas e totalScore ficam
        // como estão — e um save() aqui sobrescreveria votos chegados no meio.
        const atualizado = await Competidor.findByIdAndUpdate(
          id,
          { $set: atualizacao },
          { new: true, runValidators: true }
        );
        return response.status(200).json({ success: true, data: atualizado });
      } catch (error: any) {
        // Índice único (name, votacaoId, category)
        if (error?.code === 11000) {
          return response.status(409).json({
            error: 'Já existe um competidor com esse nome nesta categoria.',
          });
        }
        console.error('Erro ao editar competidor:', error);
        return response.status(500).json({ error: 'Erro ao editar competidor.' });
      }
    }

    if (request.method === 'DELETE') {
      const admin = requireAdmin(request, response);
      if (!admin) return;

      const { id } = request.query;
      if (!id || typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        return response.status(400).json({ error: 'ID do competidor é obrigatório' });
      }
      await Competidor.findByIdAndDelete(id);
      return response.status(200).json({ success: true });
    }

    if (request.method === 'POST') {
      // Inscrição pública de competidores (página /Register). Segue aberta, mas
      // com validação de tipo/tamanho e limite de requisições — antes dava para
      // preencher a base com lixo (ou campos que não são string).
      if (
        !rateLimit(request, response, {
          key: "save-post",
          limit: 20,
          windowMs: 10 * 60 * 1000,
        })
      ) {
        return;
      }

      const { name, work, category, votacaoId } = request.body || {};

      const nome = validarTexto(name, "name");
      if (!nome.ok) return response.status(400).json({ error: nome.erro });

      const obra = validarTexto(work, "work");
      if (!obra.ok) return response.status(400).json({ error: obra.erro });

      const categoria = validarTexto(category, "category", 60);
      if (!categoria.ok) return response.status(400).json({ error: categoria.erro });

      if (!votacaoId || !mongoose.isValidObjectId(votacaoId)) {
        return response.status(400).json({ error: 'Dados incompletos: name, work, votacaoId e category são obrigatórios.' });
      }

      const votacao = await Votacao.findById(votacaoId);
      if (!votacao) {
        return response.status(404).json({ error: 'Votação não encontrada.' });
      }
      if (votacao.ativo !== true) {
        return response.status(400).json({ error: 'Esta votação não está ativa para inscrições.' });
      }

      const newCompetitorData = {
        name: nome.valor,
        work: obra.valor,
        votacaoId,
        category: categoria.valor,
        votos: [], // Array para armazenar os votos individuais
      };

      try {
        const savedCompetidor = await Competidor.create(newCompetitorData);
        return response.status(201).json(savedCompetidor);
      } catch (error: any) {
        // Erro 11000 = conflito de índice único (mesmo nome na mesma votação)
        if (error?.code === 11000) {
          return response.status(409).json({ error: 'Já existe um competidor com esse nome nesta votação.' });
        }
        console.error('Erro ao inserir competidor:', error);
        return response.status(500).json({ error: 'Erro ao cadastrar competidor.' });
      }
    }

    response.setHeader("Allow", ['POST', 'PUT', 'PATCH', 'DELETE']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  } catch (error) {
    console.error('Erro na API handler:', error);
    return response.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
