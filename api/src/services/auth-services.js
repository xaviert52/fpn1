const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const authenticate = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticacion API y navegador
 */

/**
 * @swagger
 * /auth/browser/*:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Proxy browser hacia Kratos
 *     description: Reenvia cookies del navegador para login/logout browser con Kratos.
 *     responses:
 *       200:
 *         description: Respuesta del flujo browser de Kratos
 *   post:
 *     tags:
 *       - Auth
 *     summary: Proxy browser hacia Kratos
 *     description: Reenvia cookies del navegador para login/logout browser con Kratos.
 *     responses:
 *       200:
 *         description: Respuesta del flujo browser de Kratos
 */
router.use('/auth/browser', createProxyMiddleware({
  target: process.env.BASE_URL,
  changeOrigin: true,
  secure: true,
  pathRewrite: { '^/auth/browser': process.env.KRATOS_PATH },
  onProxyReq: (proxyReq, req) => {
    if (req.headers.cookie) {
      proxyReq.setHeader('Cookie', req.headers.cookie);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    const cookies = proxyRes.headers['set-cookie'];
    if (cookies) {
      res.setHeader('Set-Cookie', cookies);
    }
  },
  onError: (err, req, res) => {
    console.error('Browser auth proxy error:', err);
    res.status(500).json({ error: 'Browser authentication proxy error' });
  },
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login API con email y password
 *     description: Devuelve token de sesion `ory_st_...` para consumo backend.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Datos faltantes
 *       401:
 *         description: Credenciales invalidas
 */
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const flowResponse = await fetch(`${process.env.BASE_URL}${process.env.KRATOS_PATH}/self-service/login/api`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!flowResponse.ok) {
      throw new Error(`Failed to get login flow: ${flowResponse.statusText}`);
    }

    const flowData = await flowResponse.json();
    const loginResponse = await fetch(
      `${process.env.BASE_URL}${process.env.KRATOS_PATH}/self-service/login?flow=${flowData.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          method: 'password',
          password,
          identifier: email.toLowerCase().trim(),
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      return res.status(loginResponse.status).json(loginData);
    }

    return res.json({
      success: true,
      token: loginData.session_token,
      expiresAt: loginData.session?.expires_at,
      user: {
        id: loginData.session?.identity?.id,
        email: loginData.session?.identity?.traits?.email,
        name: loginData.session?.identity?.traits?.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * @swagger
 * /auth/session:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Verificar estado de sesion
 *     description: Valida sesion por Bearer token o cookies browser.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesion valida
 *       401:
 *         description: Sesion invalida o expirada
 */
router.get('/auth/session', authenticate, (req, res) => {
  const expiresAt = new Date(req.session.expires_at);
  const now = new Date();
  const remainingMs = expiresAt - now;

  return res.json({
    success: true,
    active: remainingMs > 0,
    expiresAt: req.session.expires_at,
    remainingMinutes: Math.floor(remainingMs / 1000 / 60),
    authType: req.authType,
    user: {
      id: req.session.identity.id,
      email: req.session.identity.traits.email,
      name: req.session.identity.traits.name,
    },
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout de sesion
 *     description: Confirma cierre para token y navegador.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout confirmado
 *       401:
 *         description: No autenticado
 */
router.post('/auth/logout', authenticate, async (req, res) => {
  return res.json({
    success: true,
    message: 'Logout confirmado. En navegador usa flujo browser y limpia estado local del front.',
    authType: req.authType,
  });
});

module.exports = router;
