const express = require('express');
const crypto = require('crypto');

const db = require('../db/knex');
const { extractCompanyIdFromSession, loginAsAdminFromEnv } = require('../clients/kratos-client');
const { translateKratosMessage } = require('../utils/kratos-error-translator');

const router = express.Router();

const INVITES_GENERATE_PATH = process.env.INVITES_GENERATE_PATH || '/notifications/core/invites/generate';
const INVITES_REDEEM_PATH = process.env.INVITES_REDEEM_PATH || '/notifications/core/invites/redeem';
const INVITATION_FRONT_URL = process.env.INVITATION_FRONT_URL || 'https://front.primecore.online/invitacion';
const INVITATION_FRONT_REGISTER_PATH = process.env.INVITATION_FRONT_REGISTER_PATH || '/registro';
const NOTIFY_API_URL = process.env.NOTIFY_API_URL || 'https://front.primecore.online/notify-api/api/v1/notify';
const NOTIFY_SUBJECT = process.env.NOTIFY_SUBJECT || 'Enlace de verificacion Primecore';
const NOTIFY_TYPE = process.env.NOTIFY_TYPE || 'email';
const NOTIFY_BODY_TEMPLATE = process.env.NOTIFY_BODY_TEMPLATE || 'El enlace para validacion de correo electronica de primecore es {{url_UUID}}';

const WEAK_PASSWORD_PATTERNS = [
  /123456/i,
  /password/i,
  /qwerty/i,
  /admin/i,
  /123123/i,
  /abc123/i,
  /q1w2e3r4/i,
];

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizeUpper = (value = '') => String(value).trim().toUpperCase();
const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const extractInviteUrl = (payload) => {
  if (!payload) return null;

  if (typeof payload === 'string' && /^https?:\/\//i.test(payload)) {
    return payload;
  }

  return (
    payload.invite_link ||
    payload.invite_url ||
    payload.invitation_url ||
    payload.url ||
    payload.link ||
    payload.data?.invite_link ||
    payload.data?.invite_url ||
    payload.data?.invitation_url ||
    payload.data?.url ||
    payload.data?.link ||
    null
  );
};

const extractInviteToken = (payload) => {
  if (!payload) return '';

  return (
    payload.invite_token ||
    payload.token ||
    payload.data?.invite_token ||
    payload.data?.token ||
    ''
  );
};

const readResponseBody = async (response) => {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch (error) {
    return raw;
  }
};

const sendInvitationNotification = async ({ token, recipient, verificationUrl }) => {
  const messageBody = NOTIFY_BODY_TEMPLATE.replace('{{url_UUID}}', verificationUrl);

  const response = await fetch(NOTIFY_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      body: messageBody,
      recipient,
      subject: NOTIFY_SUBJECT,
      type: NOTIFY_TYPE,
    }),
  });

  const payload = await readResponseBody(response);

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
};

const resolveFrontendBaseUrl = (req) => {
  const headerOrigin = String(req.headers.origin || '').trim();
  const headerReferer = String(req.headers.referer || '').trim();

  const pick = (value) => {
    if (!value) return '';
    try {
      const parsed = new URL(value);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return `${parsed.protocol}//${parsed.host}`;
      }
      return '';
    } catch {
      return '';
    }
  };

  return pick(headerOrigin) || pick(headerReferer) || String(INVITATION_FRONT_URL).trim();
};

const validatePasswordStrength = (password) => {
  const pwd = String(password || '');
  const errors = [];

  if (pwd.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(pwd)) {
    errors.push('La contraseña debe incluir al menos una mayúscula');
  }
  if (!/[a-z]/.test(pwd)) {
    errors.push('La contraseña debe incluir al menos una minúscula');
  }
  if (!/[0-9]/.test(pwd)) {
    errors.push('La contraseña debe incluir al menos un número');
  }
  if (!/[^A-Za-z0-9]/.test(pwd)) {
    errors.push('La contraseña debe incluir al menos un símbolo');
  }

  const weak = WEAK_PASSWORD_PATTERNS.some((pattern) => pattern.test(pwd));
  if (weak) {
    errors.push('La contraseña es demasiado predecible');
  }

  return errors;
};

const validateEnrollmentInput = (input = {}) => {
  const errors = [];

  if (!input.uuid) errors.push({ field: 'uuid', message: 'uuid es obligatorio' });
  if (!input.first_name) errors.push({ field: 'first_name', message: 'first_name es obligatorio' });
  if (!input.last_name) errors.push({ field: 'last_name', message: 'last_name es obligatorio' });
  if (!input.telefono) errors.push({ field: 'telefono', message: 'telefono es obligatorio' });
  if (!input.dni) errors.push({ field: 'dni', message: 'dni es obligatorio' });
  if (!input.password) errors.push({ field: 'password', message: 'password es obligatorio' });

  const passwordErrors = validatePasswordStrength(input.password);
  for (const msg of passwordErrors) {
    errors.push({ field: 'password', message: msg });
  }

  return errors;
};

const getStatusLegend = (invite) => {
  if (invite.status === 'FAILED') {
    return invite.failure_reason_es || 'Invitacion fallida por error de validacion en Kratos.';
  }
  if (invite.status === 'ENROLLED') {
    return 'Invitacion completada exitosamente.';
  }
  if (invite.status === 'VALIDATED') {
    return 'Invitacion validada, pendiente de enrolamiento.';
  }
  return 'Invitacion pendiente de validacion.';
};

const markInviteFailed = async ({ uuid, reasonEs, origin }) => {
  await db('invite_validations').where({ id: uuid }).update({
    status: 'FAILED',
    failure_reason_es: reasonEs,
    failure_origin: origin,
    failed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
};

const extractKratosValidationErrors = (kratosPayload) => {
  const nodes = kratosPayload?.ui?.nodes || [];
  const errors = [];

  for (const node of nodes) {
    const field = node?.attributes?.name || 'unknown';
    const messages = Array.isArray(node?.messages) ? node.messages : [];

    for (const message of messages) {
      errors.push({
        field,
        code: message?.id || null,
        message: translateKratosMessage({ id: message?.id, text: message?.text }),
        original_message: message?.text || 'Validation error',
      });
    }
  }

  return errors;
};

const registerUserInKratos = async ({ inviteToken, email, firstName, lastName, telefono, dni, password }) => {
  const flowResponse = await fetch(`${process.env.BASE_URL}${process.env.KRATOS_PATH}/self-service/registration/api`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!flowResponse.ok) {
    throw new Error(`No se pudo crear flujo de registro: ${flowResponse.status} ${flowResponse.statusText}`);
  }

  const flowData = await flowResponse.json();
  const registerResponse = await fetch(
    `${process.env.BASE_URL}${process.env.KRATOS_PATH}/self-service/registration?flow=${flowData.id}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'password',
        traits: {
          email,
          telefono,
          dni,
          invite_token: inviteToken,
          name: {
            first: firstName,
            last: lastName,
          },
        },
        password,
      }),
    }
  );

  const payload = await readResponseBody(registerResponse);

  return {
    ok: registerResponse.ok,
    status: registerResponse.status,
    payload,
  };
};

const redeemInvite = async ({ newUserId, inviteToken }) => {
  const response = await fetch(`${process.env.BASE_URL}${INVITES_REDEEM_PATH}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      new_user_id: newUserId,
      invite_token: inviteToken,
    }),
  });

  const payload = await readResponseBody(response);

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
};

/**
 * @swagger
 * tags:
 *   - name: Invitations
 *     description: Flujo de invitaciones B2B
 */

/**
 * @swagger
 * /notifications/b2b/invitation:
 *   post:
 *     tags:
 *       - Invitations
 *     summary: Generar invitación, crear UUID local y registrar en base de datos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               target_email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 example: auditor
 *             required:
 *               - target_email
 *     responses:
 *       200:
 *         description: Invitación generada y persistida
 */
router.post('/notifications/b2b/invitation', async (req, res) => {
  const targetEmail = normalizeEmail(req.body?.target_email || '');
  const role = String(req.body?.role || 'empleado').trim();

  if (!targetEmail) {
    return res.status(400).json({ error: 'target_email es obligatorio' });
  }

  try {
    const { token, session } = await loginAsAdminFromEnv();
    const payload = {
      inviter_id: session?.identity?.id || '',
      company_id: extractCompanyIdFromSession(session),
      role,
      target_email: targetEmail,
    };

    const generateResponse = await fetch(`${process.env.BASE_URL}${INVITES_GENERATE_PATH}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const generateData = await readResponseBody(generateResponse);

    if (!generateResponse.ok) {
      return res.status(generateResponse.status).json({
        success: false,
        error: 'No se pudo generar la invitación',
        details: generateData,
      });
    }

    const upstreamInviteUrl = extractInviteUrl(generateData);
    let inviteToken = extractInviteToken(generateData);

    if (!inviteToken && upstreamInviteUrl) {
      const parsedUrl = new URL(upstreamInviteUrl);
      inviteToken = parsedUrl.searchParams.get('invite_token') || parsedUrl.searchParams.get('token') || '';
    }

    if (!inviteToken) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo extraer invite_token desde la invitacion generada',
        details: generateData,
      });
    }

    const uuid = crypto.randomUUID();
    const localInviteId = crypto.randomUUID();
    const frontendBaseUrl = resolveFrontendBaseUrl(req).replace(/\/$/, '');
    const registerPath = `/${String(INVITATION_FRONT_REGISTER_PATH).replace(/^\/+/, '')}`;
    const verificationUrl = `${frontendBaseUrl}${registerPath}?uuid=${uuid}`;

    await db('invite_validations').insert({
      id: uuid,
      local_invite_id: localInviteId,
      email: targetEmail,
      verification_url: verificationUrl,
      invite_token: inviteToken,
      role,
      upstream_invite_url: upstreamInviteUrl,
      status: 'PENDING',
      notify_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const notificationResult = await sendInvitationNotification({
      token,
      recipient: targetEmail,
      verificationUrl,
    });

    if (!notificationResult.ok) {
      await db('invite_validations').where({ id: uuid }).update({
        notify_status: 'FAILED',
        notify_http_status: notificationResult.status,
        notify_error: safeStringify(notificationResult.payload),
        updated_at: new Date().toISOString(),
      });

      return res.status(502).json({
        success: false,
        error: 'Invitacion creada, pero fallo el envio de notificacion',
        invitation: {
          uuid,
          local_invite_id: localInviteId,
          email: targetEmail,
          verification_url: verificationUrl,
          role,
        },
        notification: {
          status: 'FAILED',
          http_status: notificationResult.status,
          details: notificationResult.payload,
        },
      });
    }

    await db('invite_validations').where({ id: uuid }).update({
      notify_status: 'SENT',
      notify_http_status: notificationResult.status,
      notify_response: safeStringify(notificationResult.payload),
      notified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: 'Invitacion generada, registrada y notificada exitosamente',
      invitation: {
        uuid,
        local_invite_id: localInviteId,
        email: targetEmail,
        verification_url: verificationUrl,
        role,
      },
      notification: {
        status: 'SENT',
        http_status: notificationResult.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error al generar invitación',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /notifications/b2b/invitation/validate:
 *   post:
 *     tags:
 *       - Invitations
 *     summary: Validar UUID de invitación y retornar correo asociado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uuid:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - uuid
 *     responses:
 *       200:
 *         description: UUID válido
 *       404:
 *         description: UUID no encontrado
 */
router.post('/notifications/b2b/invitation/validate', async (req, res) => {
  const uuid = String(req.body?.uuid || '').trim();
  if (!uuid) {
    return res.status(400).json({ error: 'uuid es obligatorio' });
  }

  const invite = await db('invite_validations').where({ id: uuid }).first();
  if (!invite) {
    return res.status(404).json({ success: false, error: 'Invitación no encontrada' });
  }

  if (invite.status === 'FAILED') {
    return res.status(409).json({
      success: false,
      valid: false,
      error: 'La invitacion esta fallida y no puede validarse',
      invitation: {
        uuid: invite.id,
        local_invite_id: invite.local_invite_id,
        email: invite.email,
        status: 'FAILED',
        status_legend_es: invite.failure_reason_es || 'Invitacion fallida por error de validacion en Kratos.',
      },
    });
  }

  const nextStatus = invite.status === 'ENROLLED' || invite.status === 'FAILED' ? invite.status : 'VALIDATED';
  if (nextStatus !== invite.status) {
    await db('invite_validations').where({ id: uuid }).update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    });
  }

  return res.json({
    success: true,
    valid: nextStatus !== 'FAILED',
    invitation: {
      uuid: invite.id,
      local_invite_id: invite.local_invite_id,
      email: invite.email,
      status: nextStatus,
      status_legend_es: nextStatus === 'FAILED'
        ? (invite.failure_reason_es || 'Invitacion fallida por error de validacion en Kratos.')
        : getStatusLegend({ ...invite, status: nextStatus }),
    },
  });
});

/**
 * @swagger
 * /notifications/b2b/invitation/enroll/validate:
 *   post:
 *     tags:
 *       - Invitations
 *     summary: Validación local de datos de enrolamiento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.post('/notifications/b2b/invitation/enroll/validate', async (req, res) => {
  const input = {
    uuid: String(req.body?.uuid || '').trim(),
    first_name: String(req.body?.first_name || '').trim(),
    last_name: String(req.body?.last_name || '').trim(),
    telefono: String(req.body?.telefono || '').trim(),
    dni: String(req.body?.dni || '').trim(),
    password: String(req.body?.password || ''),
  };

  const validationErrors = validateEnrollmentInput(input);

  if (validationErrors.length > 0) {
    return res.json({ success: false, validation_errors: validationErrors });
  }

  const invite = await db('invite_validations').where({ id: input.uuid }).first();
  if (!invite) {
    return res.json({
      success: false,
      validation_errors: [{ field: 'uuid', message: 'uuid no existe' }],
    });
  }

  if (invite.status === 'FAILED') {
    return res.json({
      success: false,
      validation_errors: [{
        field: 'uuid',
        message: invite.failure_reason_es || 'La invitacion esta fallida y no puede validarse',
      }],
    });
  }

  return res.json({ success: true, validation_errors: [] });
});

/**
 * @swagger
 * /notifications/b2b/invitation/enroll:
 *   post:
 *     tags:
 *       - Invitations
 *     summary: Enrolar usuario usando UUID de invitación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uuid:
 *                 type: string
 *                 format: uuid
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               telefono:
 *                 type: string
 *               dni:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - uuid
 *               - first_name
 *               - last_name
 *               - telefono
 *               - dni
 *               - password
 *     responses:
 *       200:
 *         description: Usuario enrolado
 */
router.post('/notifications/b2b/invitation/enroll', async (req, res) => {
  const input = {
    uuid: String(req.body?.uuid || '').trim(),
    first_name: String(req.body?.first_name || '').trim(),
    last_name: String(req.body?.last_name || '').trim(),
    telefono: String(req.body?.telefono || '').trim(),
    dni: String(req.body?.dni || '').trim(),
    password: String(req.body?.password || ''),
  };

  const validationErrors = validateEnrollmentInput(input);
  if (validationErrors.length > 0) {
    return res.status(400).json({ success: false, validation_errors: validationErrors });
  }

  const invite = await db('invite_validations').where({ id: input.uuid }).first();
  if (!invite) {
    return res.status(404).json({ success: false, error: 'Invitación no encontrada' });
  }

  if (invite.status === 'FAILED') {
    return res.status(409).json({
      success: false,
      error: 'La invitacion esta fallida',
      status: invite.status,
      status_legend_es: getStatusLegend(invite),
    });
  }

  if (!invite.invite_token) {
    return res.status(400).json({
      success: false,
      error: 'La invitación no tiene invite_token para enrolamiento',
    });
  }

  try {
    const registration = await registerUserInKratos({
      inviteToken: invite.invite_token,
      email: normalizeEmail(invite.email),
      firstName: input.first_name,
      lastName: input.last_name,
      telefono: input.telefono,
      dni: input.dni,
      password: input.password,
    });

    if (!registration.ok) {
      const translatedErrors = extractKratosValidationErrors(registration.payload);
      const reasonEs = translatedErrors[0]?.message || 'Invitacion fallida por error de validacion en Kratos.';
      await markInviteFailed({
        uuid: input.uuid,
        reasonEs,
        origin: 'KRATOS_REGISTRATION',
      });

      return res.status(registration.status || 400).json({
        success: false,
        error: 'Invitacion marcada como fallida por error de Kratos',
        status: 'FAILED',
        status_legend_es: reasonEs,
        validation_errors: translatedErrors,
        details: registration.payload,
      });
    }

    const newUserId =
      registration.payload?.session?.identity?.id ||
      registration.payload?.identity?.id ||
      registration.payload?.user?.id;

    if (!newUserId) {
      await markInviteFailed({
        uuid: input.uuid,
        reasonEs: 'Invitacion fallida: Kratos no devolvio el UUID de identidad.',
        origin: 'KRATOS_IDENTITY',
      });

      return res.status(500).json({
        success: false,
        error: 'Invitacion marcada como fallida: Kratos no devolvio identidad',
        status: 'FAILED',
        status_legend_es: 'Invitacion fallida: Kratos no devolvio el UUID de identidad.',
      });
    }

    const redemption = await redeemInvite({
      newUserId,
      inviteToken: invite.invite_token,
    });

    if (!redemption.ok) {
      await markInviteFailed({
        uuid: input.uuid,
        reasonEs: 'Invitacion fallida al redimir token en Kratos.',
        origin: 'KRATOS_REDEMPTION',
      });

      return res.status(redemption.status || 400).json({
        success: false,
        error: 'Invitacion marcada como fallida durante redencion',
        status: 'FAILED',
        status_legend_es: 'Invitacion fallida al redimir token en Kratos.',
        details: redemption.payload,
      });
    }

    await db.transaction(async (trx) => {
      await trx('users').insert({
        id: crypto.randomUUID(),
        kratos_identity_id: newUserId,
        email: normalizeEmail(invite.email),
        first_name: normalizeUpper(input.first_name),
        last_name: normalizeUpper(input.last_name),
        dni: normalizeUpper(input.dni),
        telefono: input.telefono.trim(),
        invite_local_id: invite.local_invite_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await trx('invite_validations').where({ id: input.uuid }).update({
        status: 'ENROLLED',
        updated_at: new Date().toISOString(),
      });
    });

    return res.json({
      success: true,
      message: 'Usuario enrolado y vinculado correctamente',
      user: {
        id: newUserId,
        email: normalizeEmail(invite.email),
        name: {
          first: input.first_name,
          last: input.last_name,
        },
      },
      redemption: redemption.payload,
    });
  } catch (error) {
    await markInviteFailed({
      uuid: input.uuid,
      reasonEs: 'Invitacion fallida por error interno al procesar Kratos.',
      origin: 'KRATOS_EXCEPTION',
    });

    return res.status(500).json({
      success: false,
      error: 'Invitacion marcada como fallida por excepcion',
      status: 'FAILED',
      status_legend_es: 'Invitacion fallida por error interno al procesar Kratos.',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /notifications/errors/kratos/es:
 *   get:
 *     tags:
 *       - Invitations
 *     summary: Catalogo de errores de Kratos traducidos a espanol
 *     responses:
 *       200:
 *         description: Catalogo de errores
 */
router.get('/notifications/errors/kratos/es', (req, res) => {
  // eslint-disable-next-line global-require
  const catalog = require('../i18n/kratos-errors.es.json');
  return res.json({ success: true, catalog });
});
module.exports = router;



