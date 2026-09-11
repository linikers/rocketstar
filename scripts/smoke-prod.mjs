#!/usr/bin/env node
/**
 * Smoke test de produção do Rocketstar.
 *
 * Responde duas perguntas que o CI (lint/typecheck/build) NÃO responde:
 *   1. o deploy subiu?  -> compara o commit no ar (/api/version) com o commit
 *      mergeado. Se produção não for o commit esperado, o job fica VERMELHO.
 *   2. as correções da auditoria continuam valendo em produção? -> canários de
 *      segurança (rotas administrativas exigindo token, token forjado com o
 *      segredo público recusado) e de não-regressão (o que é público por design
 *      — /api/votacoes e o ranking do Top100 — continuar público).
 *
 * Todo check é NÃO-DESTRUTIVO: apenas GET e um POST /api/auth/login. Nenhuma
 * rota de escrita é chamada, então rodar isto nunca cria/altera/apaga dado.
 *
 * Variáveis (todas opcionais):
 *   SMOKE_BASE              URL base (padrão: produção)
 *   SMOKE_EXPECTED_COMMIT   commit que DEVE estar no ar; espera até subir
 *   SMOKE_WAIT_SECONDS      tempo máximo de espera pelo deploy (padrão 600)
 *   SMOKE_EXPECT_ENV        ambiente esperado (padrão production | 'any')
 *   SMOKE_REQUIRE_BUILD_INFO '0' aceita deploy sem commit no /api/version
 *   SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_SENHA  checam o login de verdade
 *   SMOKE_VOTACAO_ID        votação usada no canário do ranking público
 *
 * Saída: linhas PASS/FAIL e exit code 1 se qualquer check falhar.
 */
import crypto from 'crypto';

const BASE = (process.env.SMOKE_BASE || 'https://rocket-stars.vercel.app').replace(/\/+$/, '');
const EXPECTED_COMMIT = (process.env.SMOKE_EXPECTED_COMMIT || '').trim();
const WAIT_SECONDS = Number(process.env.SMOKE_WAIT_SECONDS || 600);
const EXPECT_ENV = (process.env.SMOKE_EXPECT_ENV || 'production').trim();
const REQUIRE_BUILD_INFO = (process.env.SMOKE_REQUIRE_BUILD_INFO ?? '1') !== '0';
const ADMIN_EMAIL = (process.env.SMOKE_ADMIN_EMAIL || '').trim();
const ADMIN_SENHA = (process.env.SMOKE_ADMIN_SENHA || '').trim();
const VOTACAO_ID = (process.env.SMOKE_VOTACAO_ID || '').trim();

// Segredo que ESTAVA publicado no repositório (fallback removido na auditoria).
// Só é usado aqui para provar que ele não assina mais nada em produção.
const FALLBACK_SECRET = 'rocketstar-jwt-secret-dev';
const TIMEOUT_MS = 20000;

let total = 0;
let fails = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const short = (c) => (c ? String(c).slice(0, 7) : '');

function check(name, ok, detail = '') {
  total += 1;
  if (!ok) fails += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

function skip(name, why) {
  console.log(`  SKIP  ${name} — ${why}`);
}

async function req(path, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(BASE + path, { ...opts, cache: 'no-store', signal: ctrl.signal });
    const text = await r.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    return { status: r.status, body, text, error: null };
  } catch (e) {
    return { status: 0, body: null, text: '', error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

const jsonAuth = (extra = {}) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  ...extra,
});

// Token de admin assinado com o segredo que está no histórico do repositório.
// Em produção corrigida isso TEM que ser recusado (401).
function tokenForjado() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const h = b64({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const p = b64({
    userId: 'smoke-forjado',
    email: 'smoke@invalido.local',
    nome: 'smoke',
    role: 'admin',
    iat: now,
    exp: now + 3600,
  });
  const s = crypto.createHmac('sha256', FALLBACK_SECRET).update(`${h}.${p}`).digest('base64url');
  return `${h}.${p}.${s}`;
}

async function esperarDeploy() {
  const deadline = Date.now() + WAIT_SECONDS * 1000;
  let attempt = 0;
  let anterior = '';

  for (;;) {
    attempt += 1;
    const r = await req('/api/version');
    const commit = r.body && r.body.commit ? r.body.commit : null;
    const estado =
      r.status === 0
        ? `sem resposta (${r.error})`
        : r.status === 404
          ? '/api/version não existe: o código no ar é anterior a este guardrail'
          : `commit no ar: ${short(commit) || 'ausente'}`;

    if (estado !== anterior) {
      console.log(`  [${new Date().toISOString().slice(11, 19)}] tentativa ${attempt}: ${estado}`);
      anterior = estado;
    }

    if (r.status === 200 && commit === EXPECTED_COMMIT) return { status: r.status, body: r.body };
    if (Date.now() >= deadline) {
      console.log(`  [${new Date().toISOString().slice(11, 19)}] ${WAIT_SECONDS}s sem o deploy de ${short(EXPECTED_COMMIT)}`);
      return { status: r.status, body: r.body };
    }
    await sleep(15000);
  }
}

async function main() {
  console.log(`Smoke pós-deploy — ${BASE}`);
  console.log(`commit esperado: ${short(EXPECTED_COMMIT) || '(não informado)'} | env esperado: ${EXPECT_ENV} | espera: ${WAIT_SECONDS}s`);
  console.log('');

  console.log('=== 1. o deploy subiu? ===');
  const version = EXPECTED_COMMIT ? await esperarDeploy() : await req('/api/version');
  const info = (version.body && typeof version.body === 'object' ? version.body : {}) || {};
  const temRota = version.status === 200;

  check(
    '/api/version responde 200',
    temRota,
    version.status === 404
      ? 'rota inexistente: produção roda código anterior ao guardrail'
      : `status ${version.status}${version.error ? ` (${version.error})` : ''}`
  );
  if (REQUIRE_BUILD_INFO) {
    check('deploy identificável (commit presente)', Boolean(info.commit), info.commit ? short(info.commit) : 'sem commit na resposta');
  }
  if (EXPECTED_COMMIT) {
    check(
      `produção roda o commit mergeado (${short(EXPECTED_COMMIT)})`,
      info.commit === EXPECTED_COMMIT,
      info.commit ? `no ar: ${short(info.commit)}` : `no ar: ${temRota ? 'sem commit' : 'desconhecido'}`
    );
  }
  if (EXPECT_ENV !== 'any') {
    check(`ambiente é "${EXPECT_ENV}"`, info.env === EXPECT_ENV, `no ar: ${info.env ?? 'não informado'}`);
  }

  console.log('');
  console.log('=== 2. segurança: rotas administrativas SEM token ===');
  for (const rota of ['/api/users', '/api/dashboard', '/api/qrcodes/list']) {
    const r = await req(rota);
    check(
      `${rota} sem token exige autenticação`,
      r.status === 401 || r.status === 403,
      r.status === 200 ? 'respondeu 200 SEM token: rota administrativa aberta' : `status ${r.status}`
    );
  }

  console.log('');
  console.log('=== 3. segurança: token forjado com o segredo público ===');
  const forjado = tokenForjado();
  for (const rota of ['/api/users', '/api/dashboard']) {
    const r = await req(rota, { headers: { Authorization: `Bearer ${forjado}` } });
    check(
      `${rota} recusa token forjado com o segredo de fallback`,
      r.status === 401 || r.status === 403,
      r.status === 200 ? 'ACEITOU o token forjado: o segredo público ainda assina sessões' : `status ${r.status}`
    );
  }

  console.log('');
  console.log('=== 4. não-regressão: o que é público por design ===');
  const vot = await req('/api/votacoes');
  check('/api/votacoes sem token segue 200 (registro e ranking dependem)', vot.status === 200 && Array.isArray(vot.body), `status ${vot.status}`);

  const semId = await req('/api/list');
  check(
    '/api/list sem votacaoId não entrega a base inteira',
    semId.status >= 400,
    semId.status === 200 ? 'devolveu 200: a base completa está exposta' : `status ${semId.status}`
  );

  let votacaoId = VOTACAO_ID;
  if (!votacaoId && Array.isArray(vot.body)) {
    const ativa = vot.body.find((v) => v && v.ativo) || vot.body[0];
    votacaoId = ativa && ativa._id ? String(ativa._id) : '';
  }
  if (votacaoId) {
    const ranking = await req(`/api/list?votacaoId=${encodeURIComponent(votacaoId)}`);
    check(
      'ranking público (/api/list?votacaoId) segue 200 sem login',
      ranking.status === 200 && Array.isArray(ranking.body),
      `status ${ranking.status}`
    );
    check(
      'ranking não expõe votos individuais (jurorName)',
      ranking.status === 200 && !/jurorName/.test(ranking.text),
      ''
    );
  } else {
    skip('ranking público', 'nenhuma votação encontrada para usar de referência');
  }

  const top = await req('/Top100/Top100');
  check('página /Top100 responde 200 sem login', top.status === 200, `status ${top.status}`);

  console.log('');
  console.log('=== 5. login e painel ===');
  const vazio = await req('/api/auth/login', jsonAuth({ body: '{}' }));
  check('login sem credenciais responde 400 (validação viva)', vazio.status === 400, `status ${vazio.status}`);

  if (ADMIN_EMAIL && ADMIN_SENHA) {
    const login = await req(
      '/api/auth/login',
      jsonAuth({ body: JSON.stringify({ email: ADMIN_EMAIL, senha: ADMIN_SENHA }) })
    );
    const token = login.body && login.body.token ? login.body.token : null;
    const autenticou = check(
      'login de admin responde 200 com token',
      login.status === 200 && Boolean(token),
      login.status === 500 ? '500: JWT_SECRET não configurado na Vercel (o painel fica inacessível)' : `status ${login.status}`
    );

    if (autenticou) {
      const dash = await req('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      check('painel autentica com o token do login (/api/dashboard 200)', dash.status === 200, `status ${dash.status}`);

      const partes = token.split('.');
      const esperado = crypto
        .createHmac('sha256', FALLBACK_SECRET)
        .update(`${partes[0]}.${partes[1]}`)
        .digest('base64url');
      check(
        'token de admin não é assinado com o segredo público de fallback',
        partes[2] !== esperado,
        partes[2] === esperado ? 'o fallback do repositório ainda está assinando tokens de produção' : ''
      );
    }
  } else {
    skip('login real e painel', 'SMOKE_ADMIN_EMAIL/SMOKE_ADMIN_SENHA não definidos');
  }

  console.log('');
  console.log(`================ RESULTADO: ${total - fails} PASS / ${fails} FAIL ================`);
  process.exit(fails > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('smoke falhou de forma inesperada:', e);
  process.exit(1);
});
