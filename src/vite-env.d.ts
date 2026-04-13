/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEPLOY_MODE?: 'auto' | 'vercel' | 'amplify' | 'inhouse';
  readonly VITE_API_URL?: string;
  readonly VITE_API_URL_VERCEL?: string;
  readonly VITE_API_URL_AMPLIFY?: string;
  readonly VITE_API_URL_INHOUSE?: string;
  readonly VITE_API_URL_INHOUSE_HTTP?: string;
  readonly VITE_API_URL_INHOUSE_HTTPS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
