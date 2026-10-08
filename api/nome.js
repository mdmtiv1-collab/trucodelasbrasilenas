const { pipeline, body } = require('./_db');

// Poe (ou tira) um nome numa visita. Protegido pela senha do painel.
module.exports = async (req, res) => {
  if (req.method !== 'POST' || !process.env.PAINEL_SENHA || req.headers['x-key'] !== process.env.PAINEL_SENHA) return res.status(401).json({});
  const b = await body(req);
  const id = String(b.id || '').replace(/[^a-f0-9]/g, '');
  const nome = String(b.nome || '').trim().slice(0, 40);
  if (!id) return res.status(400).json({});
  try { await pipeline([nome ? ['HSET', 's:' + id, 'nome', nome] : ['HDEL', 's:' + id, 'nome']]); } catch (e) { return res.status(500).json({}); }
  res.json({ ok: true });
};
