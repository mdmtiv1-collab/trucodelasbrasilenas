const { pipeline } = require('./_db');

// Le as sessoes recentes e devolve o funil + a lista de pessoas.
module.exports = async (req, res) => {
  const senha = process.env.PAINEL_SENHA;
  if (!senha || req.headers['x-key'] !== senha) return res.status(401).json({ erro: 'senha' });
  const horas = Math.min(parseInt(req.query.horas, 10) || 24, 24 * 90);
  const desde = Date.now() - horas * 3600 * 1000;
  try {
    const ids = (await pipeline([['ZRANGEBYSCORE', 'sessions', desde, '+inf']]))[0] || [];
    const recentes = ids.slice(-1500);
    const dados = recentes.length ? await pipeline(recentes.map((id) => ['HGETALL', 's:' + id])) : [];
    const sessoes = [];
    dados.forEach((arr, i) => {
      if (!arr || !arr.length) return;
      const h = {};
      for (let k = 0; k < arr.length; k += 2) h[arr[k]] = arr[k + 1];
      let max = -1; const passos = {};
      Object.keys(h).forEach((k) => {
        if (k.indexOf('r:') === 0) { const n = +k.slice(2); if (n > max) max = n; passos[n] = h['n:' + n] || ''; }
      });
      const resp = {};
      Object.keys(h).forEach((k) => { if (k.indexOf('a:') === 0) resp[k.slice(2)] = h[k]; });
      sessoes.push({
        id: recentes[i], t0: +h.t0, last: +(h.last || h.t0), max, nome: passos[max] || '',
        checkout: !!h.checkout, src: h.utm_source || '', camp: h.utm_campaign || '',
        pais: h.country || '', resp,
      });
    });
    res.setHeader('Cache-Control', 'no-store');
    res.json({ agora: Date.now(), sessoes: sessoes.reverse() });
  } catch (e) { res.status(500).json({ erro: String(e.message || e) }); }
};
