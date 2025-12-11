import { Hono } from 'hono'

type Bindings = {
    DB: D1Database
    ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Bindings }>()

// API Routes
app.get('/api/prices', async (c) => {
    const ids = c.req.query('ids')
    if (!ids) return c.json({ error: 'Missing ids' }, 400)

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
            { headers: { 'Accept': 'application/json' }, cf: { cacheTtl: 60 } }
        )
        if (!response.ok) throw new Error('CoinGecko Error')
        const data = await response.json()
        return c.json(data)
    } catch (e) {
        return c.json({ error: 'Failed' }, 200)
    }
})

// Serve Static Assets (React SPA)
// Intercept all other requests.
app.get('*', async (c) => {
    // 1. Production: Cloudflare Workers with Assets binding
    if (c.env.ASSETS) {
        // Try to serve the exact file
        const res = await c.env.ASSETS.fetch(c.req.raw)
        if (res.status !== 404) {
            return res
        }
        // Fallback to index.html for SPA routing (excluding /api)
        if (!c.req.path.startsWith('/api')) {
            const indexResponse = await c.env.ASSETS.fetch(new Request(new URL('/index.html', c.req.url), c.req.raw))
            return indexResponse
        }
        return c.text('Not Found', 404)
    }

    // 2. Local Development (Vite)
    // ASSETS binding is missing. We serve a shell HTML that points to the local client entry.
    // Vite's dev server middleware will intercept the request for /client/main.tsx and handle HMR.
    else {
        return c.html(`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PrivateFolio (Local)</title>
    <script type="module">
      import RefreshRuntime from "/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/client/main.tsx"></script>
  </body>
</html>
        `)
    }
})

export default app
