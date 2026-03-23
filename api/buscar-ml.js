export default async function handler(req, res) {
  const { q, limit = '12' } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query obrigatoria' });
  }

  try {
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    const resp = await fetch(mlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TaBarato/1.0)',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      }
    });

    const data = await resp.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(resp.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
