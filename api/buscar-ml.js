export default async function handler(req, res) {
  const q = req.query.q;
  const limit = req.query.limit || '12';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (!q) {
    return res.status(400).json({ error: 'Query obrigatoria' });
  }

  try {
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;
    
    const mlResp = await fetch(mlUrl, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });

    const responseText = await mlResp.text();
    console.log('Status ML:', mlResp.status);
    console.log('Resposta parcial:', responseText.substring(0, 200));

    if (!mlResp.ok) {
      return res.status(mlResp.status).json({ error: `ML retornou ${mlResp.status}`, body: responseText });
    }

    const data = JSON.parse(responseText);
    console.log('Total resultados:', data.paging?.total || 0);
    console.log('Resultados retornados:', data.results?.length || 0);

    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(data);

  } catch (e) {
    console.error('Erro:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
