#!/usr/bin/env node
/**
 * Alinha a lista `categorias` das votações já existentes no banco com o
 * categoryMap atual (src/utils/categoryMap.ts) — o /Register e o /Top100 leem
 * as categorias do banco, então alterar o categoryMap NÃO muda o evento no ar.
 *
 * SEM --apply é DRY RUN: mostra apenas o que mudaria.
 *
 *   MONGODB_URI="mongodb://127.0.0.1:27018/rocketstarDB" node scripts/update-categorias-votacao.mjs
 *   MONGODB_URI="..." node scripts/update-categorias-votacao.mjs --apply --votacao="Otakucon 2026"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_FILE = path.join(__dirname, "..", "src", "utils", "categoryMap.ts");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const votacaoArg = args.find((a) => a.startsWith("--votacao="))?.split("=").slice(1).join("=");

/** Lê o categoryMap direto do fonte para não duplicar a lista aqui. */
function categoriasDoMapa() {
  const src = fs.readFileSync(MAP_FILE, "utf8");
  const re = /^\s*"([^"]+)":\s*"(Sexta|Sábado|Domingo)",/gm;
  const out = [];
  for (const m of src.matchAll(re)) out.push(m[1]);
  if (out.length === 0) throw new Error(`Nenhuma categoria encontrada em ${MAP_FILE}`);
  return out;
}

const alvo = categoriasDoMapa();

if (!process.env.MONGODB_URI) {
  console.error("Defina MONGODB_URI (ex.: mongodb://127.0.0.1:27018/rocketstarDB)");
  process.exit(1);
}

console.log(`${APPLY ? "APLICANDO" : "DRY RUN"} — lista-alvo (${alvo.length}):`);
console.log(alvo.map((c) => `  - ${c}`).join("\n"));

await mongoose.connect(process.env.MONGODB_URI);
const votacoes = await mongoose.connection.db
  .collection("votacaos")
  .find({}, { projection: { nome: 1, categorias: 1 } })
  .toArray();

if (votacoes.length === 0) console.log("\nNenhuma votação no banco.");

for (const v of votacoes) {
  if (votacaoArg && v.nome !== votacaoArg) continue;
  const atual = v.categorias ?? [];
  const remover = atual.filter((c) => !alvo.includes(c));
  const adicionar = alvo.filter((c) => !atual.includes(c));
  console.log(`\n[${v.nome}] ${v._id}`);
  console.log(`  atual (${atual.length}): ${atual.join(", ") || "—"}`);
  console.log(`  remover (${remover.length}): ${remover.join(", ") || "—"}`);
  console.log(`  adicionar (${adicionar.length}): ${adicionar.join(", ") || "—"}`);

  if (APPLY && (remover.length || adicionar.length)) {
    const r = await mongoose.connection.db
      .collection("votacaos")
      .updateOne({ _id: v._id }, { $set: { categorias: alvo } });
    console.log(`  => gravado: ${r.modifiedCount} documento(s) modificado(s)`);
  }
}

if (!APPLY) console.log("\nNada foi gravado (use --apply para aplicar).");
await mongoose.disconnect();
