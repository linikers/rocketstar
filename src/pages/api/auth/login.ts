import { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/mongodb";
import { gerarToken, hashSenha, isAuthConfigured } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Anti brute-force de senha: 10 tentativas por minuto por IP.
    if (
      !rateLimit(req, res, {
        key: "login",
        limit: 10,
        windowMs: 60 * 1000,
      })
    ) {
      return;
    }

    if (!isAuthConfigured()) {
      console.error("[login] JWT_SECRET não configurado — login bloqueado.");
      return res.status(500).json({
        error:
          "Servidor sem JWT_SECRET configurado. Avise o administrador (Vercel → Settings → Environment Variables).",
      });
    }

    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const db = await getDb();
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

    // Cookie httpOnly: o token sai do alcance do JavaScript da página (o painel
    // continua usando o localStorage por compatibilidade, mas o servidor
    // também aceita o cookie).
    res.setHeader(
      "Set-Cookie",
      `rs_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

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
