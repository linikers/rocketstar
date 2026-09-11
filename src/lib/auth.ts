import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// NÃO existe mais fallback hardcoded de segredo. O valor antigo
// ('rocketstar-jwt-secret-dev') estava publicado no repositório público, então
// qualquer pessoa podia forjar um token de admin. Sem JWT_SECRET configurado o
// sistema falha fechado (401 nas rotas / erro claro no login) em vez de aceitar
// tokens assinados com um segredo público.
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '24h';
const JUROR_TOKEN_EXPIRY = '12h';

export interface JwtPayload {
  userId: string;
  email: string;
  nome: string;
  role: 'admin' | 'jurado';
}

// Token de sessão do jurado: prova que o portador abriu o link do QR Code
// (emitido em POST /api/qrcodes/validate). Sem ele o /api/vote só exigia o
// "code", que é justamente a credencial que circula no link/QR.
export interface JurorTokenPayload {
  scope: 'juror';
  code: string;
  jurorName: string;
}

function getSecret(): string {
  if (!JWT_SECRET) {
    throw new Error(
      'JWT_SECRET não configurado. Defina a variável de ambiente (Vercel: Settings → Environment Variables).'
    );
  }
  return JWT_SECRET;
}

export function isAuthConfigured(): boolean {
  return Boolean(JWT_SECRET);
}

export function hashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

export function gerarToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_EXPIRY });
}

export function verificarToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export function gerarTokenJurado(payload: Omit<JurorTokenPayload, 'scope'>): string {
  return jwt.sign({ ...payload, scope: 'juror' }, getSecret(), {
    expiresIn: JUROR_TOKEN_EXPIRY,
  });
}

export function verificarTokenJurado(token: string): JurorTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as JurorTokenPayload;
    if (decoded?.scope !== 'juror' || !decoded.code) return null;
    return decoded;
  } catch {
    return null;
  }
}

// Formato aceito para o "code" do QR (uuid v4 na prática). Bloqueia objetos
// (ex.: {"$ne": null}) que virariam query injection no Mongo.
const CODE_FORMAT = /^[A-Za-z0-9_-]{8,64}$/;

export function isCodeFormatValido(code: unknown): code is string {
  return typeof code === 'string' && CODE_FORMAT.test(code);
}
