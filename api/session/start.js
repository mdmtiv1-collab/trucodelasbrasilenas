const { pipeline, body, TTL } = require('../_db');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({});
  const b = await body(req);
  const ua = String(b.user_agent || req.headers['user-agent'] || '');
  if (/bot|crawler|spider|facebookexternalhit|headless|preview/i.test(ua)) return res.json({ sessionId: null, blocked: 'bot' });
  const id = crypto.randomBytes(8).toString('hex');
  const now = Date.now();
  const f = ['t0', now, 'ua', ua.slice(0, 200), 'ref', String(b.referrer || '').slice(0, 200),
    'country', String(req.headers['x-vercel-ip-country'] || '')];
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { if (b[k]) f.push(k, String(b[k]).slice(0, 100)); });
  try {
    await pipeline([
      ['HSET', 's:' + id, ...f],
      ['EXPIRE', 's:' + id, TTL],
      ['ZADD', 'sessions', now, id],
    ]);
  } catch (e) { return res.json({ sessionId: null }); }
  res.json({ sessionId: id });
};
