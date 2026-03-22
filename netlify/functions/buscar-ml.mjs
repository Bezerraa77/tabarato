export default async (req) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const limit = url.searchParams.get('limit') || '12';

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query obrigatoria' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limit}`;

    const resp = await fetch(mlUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TaBarato/1.0)',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Referer': 'https://tabarat0.netlify.app'
      }
    });

    const responseText = await resp.text();

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `ML ${resp.status}`, details: responseText }), {
        status: resp.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};

export const config = {
  path: '/api/buscar-ml'
};
