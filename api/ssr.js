// Server-side proxy for the SSR availability POST.
// Called from the browser, it forwards the request to the Akasa API from the
// server, so no Origin or Referer header reaches the API.
const UPSTREAM = 'https://staging-agents-relay-uat.qp.akasaair.com/bgws/api/ibe/agents/ssrAvailabilityV2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const headers = { 'Content-Type': 'application/json' };
  for (const name of ['authorization', 'qp-bot-api-key', 'qp-bot-source']) {
    if (req.headers[name]) headers[name] = req.headers[name];
  }

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers,
      body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? null),
    });

    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    res.send(await upstream.text());
  } catch (err) {
    res.status(502).json({ error: 'Upstream request failed', detail: String(err) });
  }
}
