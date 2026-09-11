import { NextApiRequest, NextApiResponse } from 'next';
import { JwtPayload, verificarToken } from './auth';

// Extrai o token do header Authorization: Bearer <jwt> ou do cookie rs_token.
export function getBearerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.toLowerCase().startsWith('bearer ')) {
    const token = header.slice(7).trim();
    if (token) return token;
  }

  const cookie = req.headers.cookie;
  if (typeof cookie === 'string' && cookie.length > 0) {
    const found = cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('rs_token='));
    if (found) {
      const token = decodeURIComponent(found.slice('rs_token='.length));
      if (token) return token;
    }
  }

  return null;
}

export function getAdminFromRequest(req: NextApiRequest): JwtPayload | null {
  const token = getBearerToken(req);
  if (!token) return null;
  const payload = verificarToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

// Guard para rotas administrativas. Responde 401 e devolve null quando o
// chamador não é um admin autenticado — use sempre como:
//   const admin = requireAdmin(req, res); if (!admin) return;
export function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): JwtPayload | null {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({
      error: 'Não autenticado. Faça login como administrador para continuar.',
    });
    return null;
  }

  const payload = verificarToken(token);
  if (!payload || payload.role !== 'admin') {
    res.status(401).json({
      error: 'Sessão inválida ou expirada. Faça login novamente.',
    });
    return null;
  }

  return payload;
}
