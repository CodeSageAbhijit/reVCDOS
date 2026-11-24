export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '';
  const target = url.searchParams.get('target');

  const base = target === 'br'
    ? 'https://br.cdn.dos.zone/vcsky/'
    : 'https://cdn.dos.zone/vcsky/';

  // Try exact path first; if 404 on br CDN, try with .br appended
  let upstream = await fetch(base + path, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': '*/*',
      ...(req.headers.get('range') ? { 'Range': req.headers.get('range') } : {})
    }
  });

  if (upstream.status === 404 && target === 'br' && !path.endsWith('.br')) {
    upstream = await fetch(base + path + '.br', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        ...(req.headers.get('range') ? { 'Range': req.headers.get('range') } : {})
      }
    });
  }

  const headers = new Headers();
  for (const key of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'content-encoding', 'cache-control']) {
    const val = upstream.headers.get(key);
    if (val) headers.set(key, val);
  }
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  return new Response(upstream.body, {
    status: upstream.status,
    headers
  });
}
