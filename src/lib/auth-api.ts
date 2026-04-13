type DeployMode = 'auto' | 'vercel' | 'amplify' | 'inhouse';

type ResolvedApi = {
  apiBase: string;
  mode: DeployMode | 'override';
  detected: 'vercel' | 'amplify' | 'inhouse' | 'override';
};

const normalizeBaseUrl = (value?: string) => String(value || '').trim().replace(/\/$/, '');

const env = import.meta.env;

const detectModeFromHost = (): Exclude<DeployMode, 'auto'> => {
  const host = window.location.hostname.toLowerCase();

  if (host.includes('vercel.app')) return 'vercel';
  if (host.includes('amplifyapp.com') || host.includes('cloudfront.net')) return 'amplify';

  return 'inhouse';
};

const resolveApiBase = (): ResolvedApi => {
  const explicit = normalizeBaseUrl(env.VITE_API_URL);
  if (explicit) {
    return { apiBase: explicit, mode: 'override', detected: 'override' };
  }

  const mode = (String(env.VITE_DEPLOY_MODE || 'auto').toLowerCase() as DeployMode);
  const detected = mode === 'auto' ? detectModeFromHost() : mode;

  if (detected === 'vercel') {
    return {
      apiBase:
        normalizeBaseUrl(env.VITE_API_URL_VERCEL) ||
        normalizeBaseUrl(env.VITE_API_URL_INHOUSE) ||
        'http://localhost:3001',
      mode,
      detected,
    };
  }

  if (detected === 'amplify') {
    return {
      apiBase:
        normalizeBaseUrl(env.VITE_API_URL_AMPLIFY) ||
        normalizeBaseUrl(env.VITE_API_URL_INHOUSE) ||
        'http://localhost:3001',
      mode,
      detected,
    };
  }

  const protocol = window.location.protocol;
  if (protocol === 'https:') {
    return {
      apiBase:
        normalizeBaseUrl(env.VITE_API_URL_INHOUSE_HTTPS) ||
        normalizeBaseUrl(env.VITE_API_URL_INHOUSE) ||
        'http://localhost:3001',
      mode,
      detected,
    };
  }

  return {
    apiBase:
      normalizeBaseUrl(env.VITE_API_URL_INHOUSE_HTTP) ||
      normalizeBaseUrl(env.VITE_API_URL_INHOUSE) ||
      'http://localhost:3001',
    mode,
    detected,
  };
};

const resolvedApi = resolveApiBase();
export const API_BASE = resolvedApi.apiBase;

console.info(
  `[AuthAPI] Backend seleccionado: ${API_BASE} (modo=${resolvedApi.mode}, detectado=${resolvedApi.detected})`
);

const buildHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export type SessionUser = {
  id: string;
  email: string;
  name?: {
    first?: string;
    last?: string;
  };
};

export type SessionPayload = {
  success: boolean;
  token?: string;
  authType?: 'bearer' | 'browser';
  user?: SessionUser;
  expiresAt?: string;
  expires_at?: string;
  active?: boolean;
};

export const authApi = {
  async login(email: string, password: string): Promise<SessionPayload> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'No se pudo iniciar sesión');
    }

    return data;
  },

  async session(token?: string): Promise<SessionPayload> {
    const response = await fetch(`${API_BASE}/auth/session`, {
      method: 'GET',
      credentials: 'include',
      headers: buildHeaders(token),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Sesión inválida');
    }

    return data;
  },

  async logout(token?: string): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(token),
    });
  },
};
