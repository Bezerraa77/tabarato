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
    const resp = await fetch(mlUrl);

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Erro ML: ' + resp.status }), {
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
