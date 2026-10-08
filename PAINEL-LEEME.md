# Panel del quiz — puesta en marcha

1. En Vercel → proyecto del quiz → Storage → crear/conectar **Upstash Redis** (plan gratis). Crea solas las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
2. En Settings → Environment Variables añade `PAINEL_SENHA` con la contraseña que quieras.
3. Redeploy. Abre `tudominio.com/painel.html` e ingresa la contraseña.

Los eventos ya salen de `tracking.js` (`/api/session/start`, `/api/session/:id/event`). Los datos se guardan 90 días.
