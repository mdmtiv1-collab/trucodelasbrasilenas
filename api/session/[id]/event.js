const { pipeline, body } = require('../../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({});
  const id = String(req.query.id || '').replace(/[^a-f0-9]/g, '');
  if (!id) return res.json({});
  const b = await body(req);
  const d = b.eventData || {};
  const now = Date.now();
  const cmds = [['HSET', 's:' + id, 'last', now]];
  if (b.eventType === 'step_reached') {
    cmds.push(['HSET', 's:' + id, 'r:' + (d.index | 0), now, 'n:' + (d.index | 0), String(d.step || '').slice(0, 40)]);
  } else if (b.eventType === 'step_answered') {
    cmds.push(['HSET', 's:' + id, 'a:' + String(d.step || '').slice(0, 40), String(d.answer == null ? '' : d.answer).slice(0, 100)]);
  } else if (b.eventType === 'checkout_clicked') {
    cmds.push(['HSET', 's:' + id, 'checkout', now]);
  }
  try { await pipeline(cmds); } catch (e) {}
  res.json({ ok: true });
};
