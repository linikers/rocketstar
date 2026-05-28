import { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/mongodb";
import { hashSenha } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await getDb();

  try {
    // GET — Listar usuarios
    if (req.method === "GET") {
      const users = await db
        .collection("users")
        .find({})
        .project({ senha: 0 }) // nunca retorna senha
        .sort({ criadoEm: -1 })
        .toArray();

      return res.status(200).json({ success: true, data: users });
    }

    // POST — Criar usuario
    if (req.method === "POST") {
      const { nome, email, senha, role } = req.body;

      if (!nome || !email || !senha || !role) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      const existing = await db.collection("users").findOne({ email });
      if (existing) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }

      const senhaHash = hashSenha(senha);

      const result = await db.collection("users").insertOne({
        nome,
        email,
        senha: senhaHash,
        role,
        ativo: true,
        criadoEm: new Date(),
      });

      return res.status(201).json({
        success: true,
        data: { _id: result.insertedId, nome, email, role, ativo: true },
      });
    }

    // PUT — Atualizar usuario
    if (req.method === "PUT") {
      const { _id, nome, email, role, ativo, senha } = req.body;

      if (!_id) {
        return res.status(400).json({ error: "ID do usuário é obrigatório" });
      }

      const updateData: any = {};
      if (nome) updateData.nome = nome;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (typeof ativo === "boolean") updateData.ativo = ativo;
      if (senha) updateData.senha = hashSenha(senha);

      const { ObjectId } = require("mongodb");
      await db.collection("users").updateOne(
        { _id: new ObjectId(_id) },
        { $set: updateData }
      );

      return res.status(200).json({ success: true });
    }

    // DELETE — Excluir usuario
    if (req.method === "DELETE") {
      const { _id } = req.query;
      if (!_id) {
        return res.status(400).json({ error: "ID é obrigatório" });
      }

      const { ObjectId } = require("mongodb");
      await db.collection("users").deleteOne({
        _id: new ObjectId(_id as string),
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Método não permitido" });
  } catch (error: any) {
    console.error("Erro em /api/users:", error);
    return res.status(500).json({ error: error.message });
  }
}
