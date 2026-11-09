#!/usr/bin/env node
/**
 * BilboStack 2027 - Prueba de carga del frontend estatico.
 *
 * La app es una SPA: en modo `local` no hay backend, asi que la carga real que
 * soporta un servidor es la entrega de assets estaticos (HTML, bundles JS/CSS,
 * SVGs, iconos PWA y el manifiesto). Este arnes simula sesiones de navegador
 * concurrentes contra el build de produccion y mide latencias y errores.
 *
 * Cuando exista el backend real, este mismo arnes se puede apuntar a staging o
 * produccion con --url, pero los criterios de API (R-02, R-03, R-05, R-07, R-08
 * y O-04) NO se pueden validar hasta que exista el servidor.
 *
 * Uso:
 *   node loadtest/loadtest.mjs --url http://127.0.0.1:4173 --users 200 --duration 30
 *
 * Opciones:
 *   --url <url>          URL base del build servido. Default: http://127.0.0.1:4173
 *   --users <n>          Usuarios virtuales concurrentes. Default: 200
 *   --duration <s>       Duracion de la prueba en segundos. Default: 30
 *   --timeout <ms>       Timeout por peticion. Default: 15000
 *   --think <ms>         Pausa entre sesiones de navegacion. 0 = estres puro.
 *                        Default: 0
 *   --p95 <ms>           Umbral de p95 para pasar. Default: 200
 *   --error-rate <pct>   Error rate maximo tolerado (0-1). Default: 0.01
 *   --json <path>        Guarda el informe JSON en el path indicado.
 *   --help               Muestra esta ayuda.
 *
 * Salida: resumen en consola + informe JSON opcional. Exit code 1 si fallan
 * los umbrales (error rate o p95). Exit code 2 si falta el build.
 */

import http from 'node:http';
import https from 'node:https';
import { readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

const DEFAULTS = {
  url: 'http://127.0.0.1:4173',
  users: 200,
  duration: 30,
  timeout: 15000,
  think: 0,
  p95: 200,
  errorRate: 0.01,
  json: null,
};

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    let key = token.slice(2);
    let value;
    const eq = key.indexOf('=');
    if (eq !== -1) {
      value = key.slice(eq + 1);
      key = key.slice(0, eq);
    } else {
      value = argv[i + 1];
      if (value !== undefined && !value.startsWith('--')) {
        i++;
      } else {
        value = undefined;
      }
    }
    switch (key) {
      case 'url':
        opts.url = value;
        break;
      case 'users':
        opts.users = Number(value);
        break;
      case 'duration':
        opts.duration = Number(value);
        break;
      case 'timeout':
        opts.timeout = Number(value);
        break;
      case 'think':
        opts.think = Number(value);
        break;
      case 'p95':
        opts.p95 = Number(value);
        break;
      case 'error-rate':
        opts.errorRate = Number(value);
        break;
      case 'json':
        opts.json = value;
        break;
      case 'help':
        opts.help = true;
        break;
      default:
        break;
    }
  }
  return opts;
}

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, base, out);
    } else {
      out.push('/' + full.slice(base.length + 1).split('\\').join('/'));
    }
  }
  return out;
}

function loadAssets() {
  if (!existsSync(DIST_DIR)) {
    console.error(`No existe el build en ${DIST_DIR}. Ejecuta antes: npm run build`);
    process.exit(2);
  }
  const assets = walk(DIST_DIR).map((p) => encodeURI(p));
  const critical = assets.filter(
    (p) => p === '/' || /\.(js|css)$/.test(p) || p === '/manifest.webmanifest',
  );
  const rest = assets.filter((p) => !critical.includes(p));
  return { assets, critical, rest };
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildSession(assets) {
  const session = ['/'];
  for (const asset of assets.critical) {
    if (asset !== '/') session.push(asset);
  }
  const lazyLoads = 1 + Math.floor(Math.random() * 4);
  for (let i = 0; i < lazyLoads && assets.rest.length; i++) {
    session.push(pickRandom(assets.rest));
  }
  return session;
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

class Stats {
  constructor(sampleCap = 200000) {
    this.count = 0;
    this.errors = 0;
    this.bytes = 0;
    this.sumMs = 0;
    this.min = Infinity;
    this.max = 0;
    this.sampleCap = sampleCap;
    this.samples = [];
    this.statuses = new Map();
  }

  record(result) {
    this.count++;
    if (!result.ok) this.errors++;
    this.bytes += result.bytes;
    this.sumMs += result.ms;
    if (result.ms < this.min) this.min = result.ms;
    if (result.ms > this.max) this.max = result.ms;
    const status = String(result.status || 'ERR');
    this.statuses.set(status, (this.statuses.get(status) || 0) + 1);
    if (this.samples.length < this.sampleCap) {
      this.samples.push(result.ms);
    } else {
      const j = Math.floor(Math.random() * this.count);
      if (j < this.sampleCap) this.samples[j] = result.ms;
    }
  }

  summary(durationMs) {
    const sorted = [...this.samples].sort((a, b) => a - b);
    return {
      requests: this.count,
      errors: this.errors,
      errorRate: this.count ? this.errors / this.count : 0,
      bytes: this.bytes,
      throughputRps: this.count / (durationMs / 1000),
      throughputMBps: this.bytes / (durationMs / 1000) / (1024 * 1024),
      latencyMs: {
        avg: this.count ? this.sumMs / this.count : 0,
        min: this.min === Infinity ? 0 : this.min,
        p50: percentile(sorted, 50),
        p90: percentile(sorted, 90),
        p95: percentile(sorted, 95),
        p99: percentile(sorted, 99),
        max: this.max,
      },
      statuses: Object.fromEntries(this.statuses),
    };
  }
}

function createRequester(opts) {
  const target = new URL(opts.url);
  const isHttps = target.protocol === 'https:';
  const client = isHttps ? https : http;
  const agent = new client.Agent({
    keepAlive: true,
    maxSockets: opts.users,
    maxFreeSockets: opts.users,
  });

  return function request(path) {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      const options = {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path,
        method: 'GET',
        agent,
        headers: { 'Accept-Encoding': 'gzip, deflate, br', 'User-Agent': 'bilbostack-loadtest' },
      };
      const req = client.request(options, (res) => {
        let bytes = 0;
        res.on('data', (chunk) => {
          bytes += chunk.length;
        });
        res.on('end', () => {
          const ms = Number(process.hrtime.bigint() - start) / 1e6;
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, ms, bytes });
        });
        res.on('error', () => {
          const ms = Number(process.hrtime.bigint() - start) / 1e6;
          resolve({ ok: false, status: 0, ms, bytes });
        });
      });
      req.setTimeout(opts.timeout, () => req.destroy(new Error('timeout')));
      req.on('error', () => {
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        resolve({ ok: false, status: 0, ms, bytes: 0 });
      });
      req.end();
    });
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWorker(ctx, request) {
  while (Date.now() < ctx.deadline) {
    const session = buildSession(ctx.assets);
    for (const path of session) {
      if (Date.now() >= ctx.deadline) break;
      const result = await request(path);
      ctx.stats.record(result);
    }
    if (ctx.think > 0 && Date.now() < ctx.deadline) {
      await sleep(ctx.think);
    }
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    console.log('node loadtest/loadtest.mjs --url <url> --users 200 --duration 30 [--p95 200] [--error-rate 0.01] [--json path]');
    return;
  }
  const assets = loadAssets();
  const request = createRequester(opts);

  console.log(`Objetivo:        ${opts.url}`);
  console.log(`Usuarios:        ${opts.users} concurrentes`);
  console.log(`Duracion:        ${opts.duration}s`);
  console.log(`Think time:      ${opts.think} ms entre sesiones`);
  console.log(`Assets:          ${assets.assets.length} (${assets.critical.length} criticos)`);
  console.log('Calentando conexion...');
  await request('/');

  const stats = new Stats();
  const startedAt = new Date();
  const deadline = Date.now() + opts.duration * 1000;
  const ctx = { assets, stats, deadline, think: opts.think };

  await Promise.all(Array.from({ length: opts.users }, () => runWorker(ctx, request)));

  const durationMs = Date.now() - deadline + opts.duration * 1000;
  const summary = stats.summary(durationMs);
  const passed =
    summary.errorRate <= opts.errorRate && summary.latencyMs.p95 <= opts.p95;

  const report = {
    target: opts.url,
    startedAt: startedAt.toISOString(),
    durationSeconds: opts.duration,
    users: opts.users,
    thinkTimeMs: opts.think,
    assets: { total: assets.assets.length, critical: assets.critical.length },
    thresholds: { p95Ms: opts.p95, maxErrorRate: opts.errorRate },
    summary,
    passed,
  };

  console.log('\n--- Resultado ---');
  console.log(`Peticiones:      ${summary.requests}`);
  console.log(`Errores:         ${summary.errors} (${(summary.errorRate * 100).toFixed(2)}%)`);
  console.log(`Throughput:      ${summary.throughputRps.toFixed(1)} req/s, ${summary.throughputMBps.toFixed(2)} MB/s`);
  console.log(`Latencia avg:    ${summary.latencyMs.avg.toFixed(2)} ms`);
  console.log(`Latencia p50:    ${summary.latencyMs.p50.toFixed(2)} ms`);
  console.log(`Latencia p95:    ${summary.latencyMs.p95.toFixed(2)} ms (umbral ${opts.p95} ms)`);
  console.log(`Latencia p99:    ${summary.latencyMs.p99.toFixed(2)} ms`);
  console.log(`Latencia max:    ${summary.latencyMs.max.toFixed(2)} ms`);
  console.log(`Estados HTTP:    ${JSON.stringify(summary.statuses)}`);
  console.log(`Veredicto:       ${passed ? 'PASS' : 'FAIL'}`);

  if (opts.json) {
    const outPath = join(process.cwd(), opts.json);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`Informe JSON:    ${outPath}`);
  }

  process.exitCode = passed ? 0 : 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
