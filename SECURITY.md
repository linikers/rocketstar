# Segurança — ações obrigatórias

Este arquivo registra o que foi corrigido no código e **o que só o dono do projeto pode fazer**.

## 1. Credencial do banco de produção exposta (crítico)

O arquivo `.env` estava **versionado** neste repositório, que é **público**, desde `b761792` (2024-08-02).
Ele contém a `MONGODB_URI` de produção:

```
mongodb+srv://rocketuser:****@cluster0.vth613o.mongodb.net/rocketstarDB
```

Foi verificado que essa credencial **conecta no banco de produção** e lista as coleções reais
(`users`, `votacaos`, `competidors`, `qrcodeauths`, `qrcodes`) — ou seja, qualquer pessoa teve
acesso de leitura **e escrita** ao banco enquanto o arquivo esteve publicado.

Este PR para de versionar o arquivo, mas **o valor continua no histórico do git**. Portanto:

1. **Trocar a senha do usuário `rocketuser`** no MongoDB Atlas (Database Access → Edit → Change Password).
2. Atualizar a `MONGODB_URI` no `.env` local **e** nas Environment Variables da Vercel.
3. Revisar os dados (admins da coleção `users`, votações, competidores) em busca de alterações
   que você não fez.
4. Opcional, para remover o valor do histórico público: `git filter-repo`/BFG + force-push
   (combine com quem tem clones) ou recriar o repositório.

## 2. JWT_SECRET

O código tinha um segredo **hardcoded** como fallback (`'rocketstar-jwt-secret-dev'`), público no
repositório. Agora não há fallback: sem `JWT_SECRET` o login responde
`500 — Servidor sem JWT_SECRET configurado` (falha explícita em vez de emitir token com segredo
conhecido).

- Defina `JWT_SECRET` nas Environment Variables da Vercel (Production e Preview) e no `.env` local.
- Sugestão de valor: `openssl rand -hex 32`.
- **Se a Vercel não tiver essa variável, o login do painel quebra depois deste PR** — é intencional e
  visível, mas precisa ser configurado antes do merge.

## 3. Variáveis de ambiente na Vercel

O repositório não fornece mais o `.env` para o build. A Vercel precisa ter, no mínimo:

| Variável | Onde |
| --- | --- |
| `MONGODB_URI` | Production + Preview |
| `JWT_SECRET` | Production + Preview |

O CI do GitHub usa stubs (não precisa de credencial real para lint/type-check/build).

## 4. Pendências conhecidas (não incluídas neste PR)

- **Hash de senha sem salt**: `hashSenha` usa SHA-256 puro. Como o hash de todos os usuários era
  visível (item 1), senhas curtas são quebráveis com rainbow tables. Migração sugerida: bcrypt/argon2
  com re-hash no próximo login.
- **Rate limit em memória**: cada instância serverless tem seu próprio contador. Serve como
  mitigação para o app atual; em escala, usar Redis (Upstash) para um limite global.
- **`isUsed`/`isFinished` legados**: registros criados antes do campo `isFinished` podem ficar sem a
  flag. A listagem administrativa já trata `isFinished` com fallback para `isUsed`.
