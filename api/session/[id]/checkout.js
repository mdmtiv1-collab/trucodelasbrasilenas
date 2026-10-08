const { pipeline } = require('../../_db');

module.exports = async (req, res) => {
  const id = String(req.query.id || '').replace(/[^a-f0-9]/g, '');
  if (id) { try { await pipeline([['HSET', 's:' + id, 'checkout', Date.now(), 'last', Date.now()]]); } catch (e) {} }
  res.json({ ok: true });
};
