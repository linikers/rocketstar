import { NextApiRequest, NextApiResponse } from 'next';

// Rate limit em memória (por instância). Em serverless cada instância tem seu
// próprio contador, então isto é uma mitigação — não substitui um WAF/Upstash.
// Serve para barrar flood trivial em /api/vote, /api/save e /api/auth/login.
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

export function clientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'desconhecido';
}

/**
 * Retorna true quando a requisição pode seguir. Quando estoura o limite,
 * responde 429 e retorna false.
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  opts: { key: string; limit: number; windowMs: number; message?: string }
): boolean {
  const now = Date.now();
  const id = `${opts.key}:${clientIp(req)}`;

  if (buckets.size > MAX_BUCKETS) {
    // forEach em vez de for..of: o target do tsconfig não tem downlevelIteration
    buckets.forEach((bucket, key) => {
      if (bucket.resetAt <= now) buckets.delete(key);
    });
  }

  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }

  bucket.count += 1;

  if (bucket.count > opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      error:
        opts.message ||
        `Muitas requisições. Tente novamente em ${retryAfter}s.`,
    });
    return false;
  }

  return true;
}
