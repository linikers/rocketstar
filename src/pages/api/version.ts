import { NextApiRequest, NextApiResponse } from 'next';

// Identificação do deploy que ESTÁ NO AR. Existe para o smoke test
// (scripts/smoke-prod.mjs, rodado pelo .github/workflows/post-deploy-smoke.yml)
// comparar o commit em produção com o commit mergeado na master.
//
// Motivo: canário por status ("/api/users responde 401?") não detecta deploy que
// não subiu — com o código velho no ar o resultado simplesmente fica errado sem
// ninguém ver. Com o commit exposto, o job fica vermelho enquanto produção não
// for exatamente o commit esperado.
//
// Nada sensível aqui: o repositório é público e o commit já é público.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  // Sem cache: a resposta precisa refletir o deploy atual, não uma borda antiga.
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  const commit =
    process.env.VERCEL_GIT_COMMIT_SHA || process.env.BUILD_COMMIT_SHA || null;

  return res.status(200).json({
    commit,
    ref: process.env.VERCEL_GIT_COMMIT_REF || null,
    env: process.env.VERCEL_ENV || 'local',
    url: process.env.VERCEL_URL || null,
  });
}
