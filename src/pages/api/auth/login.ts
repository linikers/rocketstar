import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import { hashSenha, gerarToken } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    await dbConnect();

    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const db = (await dbConnect()).connection.db;
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const senhaHash = hashSenha(senha);

    if (user.senha !== senhaHash) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    if (!user.ativo) {
      return res.status(403).json({ error: "Usuário desativado" });
    }

    const token = gerarToken({
      userId: user._id.toString(),
      email: user.email,
      nome: user.nome,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
