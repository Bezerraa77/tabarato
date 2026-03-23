export default async function handler(req, res) {
  const q = req.query.q;
  const limit = req.query.limit || '12';

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!q) {
    return res.status(400).json({ error: 'Query obrigatoria' });
  }

  try {
    const clientId = process.env.ML_CLIENT_ID;
    const clientSecret = process.env.ML_CLIENT_SECRET;

    // Buscar token
    const tokenResp = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      }).toString()
    });

    const tokenData = await tokenResp.json();
    console.log('Token response:', JSON.stringify(tokenData));

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(401).json({ error: 'Token invalido', details: tokenData });
    }

    // Buscar produtos
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    console.log('Buscando:', mlUrl);

    const mlResp = await fetch(mlUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const data = await mlResp.json();
    console.log('Total resultados:', data.paging?.total || 0);

    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(data);

  } catch (e) {
    console.error('Erro:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
