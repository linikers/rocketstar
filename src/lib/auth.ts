import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// NÃO existe mais fallback hardcoded de segredo. O valor antigo
// ('rocketstar-jwt-secret-dev') estava publicado no repositório público, então
// qualquer pessoa podia forjar um token de admin. Sem JWT_SECRET configurado o
// sistema falha fechado (401 nas rotas / erro claro no login) em vez de aceitar
// tokens assinados com um segredo público.
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '24h';
// O token de jurado acompanha a validade do QR Code (72h por padrão): o jurado
// precisa poder voltar pelo mesmo link em qualquer momento da janela de votação.
// O valor efetivo é calculado a partir de expiresAt em POST /api/qrcodes/validate.
const JUROR_TOKEN_EXPIRY_SECONDS = 72 * 60 * 60;

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

// `expiresInSeconds` deve ser o tempo restante do QR Code: o token do jurado tem
// que viver exatamente a mesma janela em que ele pode votar (72h por padrão).
export function gerarTokenJurado(
  payload: Omit<JurorTokenPayload, 'scope'>,
  expiresInSeconds?: number
): string {
  const ttl =
    typeof expiresInSeconds === 'number' && expiresInSeconds > 0
      ? Math.min(expiresInSeconds, JUROR_TOKEN_EXPIRY_SECONDS)
      : JUROR_TOKEN_EXPIRY_SECONDS;
  return jwt.sign({ ...payload, scope: 'juror' }, getSecret(), {
    expiresIn: ttl,
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
