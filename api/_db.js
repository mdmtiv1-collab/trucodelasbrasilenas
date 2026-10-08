// Redis REST (Upstash) sem dependencias. Variaveis: UPSTASH_REDIS_REST_URL / _TOKEN
// (ou KV_REST_API_URL / _TOKEN, que a Vercel cria ao conectar o Upstash).
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function pipeline(cmds) {
  if (!URL_ || !TOKEN) throw new Error('banco nao configurado');
  const r = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  const j = await r.json();
  return j.map((x) => x.result);
}

async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let s = typeof req.body === 'string' ? req.body : '';
  if (!s) { for await (const c of req) s += c; }
  try { return JSON.parse(s || '{}'); } catch (e) { return {}; }
}

const TTL = 60 * 60 * 24 * 90; // 90 dias
module.exports = { pipeline, body, TTL };
