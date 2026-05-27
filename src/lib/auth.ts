import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'rocketstar-jwt-secret-dev';
const TOKEN_EXPIRY = '24h';

export interface JwtPayload {
  userId: string;
  email: string;
  nome: string;
  role: 'admin' | 'jurado';
}

export function hashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

export function gerarToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verificarToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
