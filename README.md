# Welcome to your Lovable project

## API connection modes

Frontend auth API now supports dynamic backend resolution by deployment mode:

- `VITE_DEPLOY_MODE=vercel` uses `VITE_API_URL_VERCEL`
- `VITE_DEPLOY_MODE=amplify` uses `VITE_API_URL_AMPLIFY`
- `VITE_DEPLOY_MODE=inhouse` uses `VITE_API_URL_INHOUSE_HTTP` or `VITE_API_URL_INHOUSE_HTTPS` depending on browser protocol
- `VITE_DEPLOY_MODE=auto` detects hostname (`vercel.app`, `amplifyapp.com`, `cloudfront.net`) and falls back to in-house logic
- `VITE_API_URL` overrides everything

See `.env.example` for the full list.
