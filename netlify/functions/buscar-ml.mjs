export default async (req) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const limit = url.searchParams.get('limit') || '12';

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query obrigatória' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const resp = await fetch(mlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      }
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: `ML ${resp.status}: ${errText}` }), {
        status: resp.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await resp.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: '/api/buscar-ml'
};
