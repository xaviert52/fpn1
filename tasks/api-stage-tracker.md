# Tareas API Primecore

## Estado general

- Proyecto arrancado por etapas a partir de `api_base`.
- Etapa activa: Login/Logout + sesión browser + base de invitaciones.

## Hecho

- [x] Crear carpeta `api` con estructura backend Express.
- [x] Configurar scripts de desarrollo, pruebas y migraciones (`start`, `dev`, `test`, `migrate`).
- [x] Replicar lógica base de auth browser proxy desde `api_base/src/services/auth-services.js` (líneas 8-47 como referencia funcional).
- [x] Exponer `POST /auth/login` para obtener `session_token` (`ory_st_...`) y usarlo en próximas etapas.
- [x] Exponer `GET /auth/session` y `POST /auth/logout`.
- [x] Integrar middleware `authenticate` para token/cookies.
- [x] Configurar DB con `knex`: sqlite (`dev`) y postgres (`prod`).
- [x] Crear migración inicial para `invite_validations` y `users`.
- [x] Ejecutar migraciones en desarrollo (`npm run migrate`).
- [x] Parametrizar credenciales admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) desde `.env` para generar invitaciones.
- [x] Crear cliente Kratos reutilizable para login por credenciales (`src/clients/kratos-client.js`).
- [x] Crear endpoint `POST /notifications/b2b/invitation` con login admin automático por `.env`.
- [x] Persistir invitación generada en DB con UUID local, correo, token y URL de verificación.
- [x] Crear endpoint `POST /notifications/b2b/invitation/validate` para validar UUID y retornar correo.
- [x] Crear endpoint `POST /notifications/b2b/invitation/enroll/validate` para prevalidación de datos.
- [x] Crear endpoint `POST /notifications/b2b/invitation/enroll` para registrar en Kratos y vincular invitación.
- [x] Añadir migración incremental para `invite_token`, `role` y `upstream_invite_url` en `invite_validations`.
- [x] Integrar notificación email al `notify-api` durante creación de invitación.
- [x] Registrar auditoría de notificación (`notify_status`, `notify_http_status`, `notify_response`, `notify_error`, `notified_at`).
- [x] Crear catalogo JSON de errores de Kratos en espanol para mostrar mensajes al usuario.
- [x] Marcar invitacion como `FAILED` cuando Kratos falla en enrolamiento o redencion.
- [x] Retornar leyenda en espanol de estado fallido al consultar UUID de invitacion.
- [x] Exponer Swagger en `/api-docs` y especificación en `/openapi.json` para pruebas de desarrollo.
- [x] Documentar endpoints de login/session/logout en Swagger (`/auth/login`, `/auth/session`, `/auth/logout`, `/auth/browser/*`).
- [x] Agregar pruebas base (`supertest` + `jest`) y validación de spec OpenAPI.
- [x] Ejecutar pruebas en `api` con resultado exitoso.

## Etapa 2 (invitación completa)

- [x] Persistir invitación generada en DB (`local_invite_id`, `email`, `verification_url`, estado).
- [x] Generar URL de verificación con UUID para frontend.
- [x] Integrar envío de notificación a `https://front.primecore.online/notify-api/api/v1/notify` usando token admin en runtime.
- [x] Registrar traza de envío (éxito/error) para auditoría de invitaciones.
- [x] Crear endpoint para validar UUID recibido desde front y comprobar existencia en DB.
- [x] Responder estado para pintar formulario cuando UUID sea válido.

## Etapa 3 (enrolamiento)

- [x] Implementar endpoint de enrolamiento basado en `subordinates-services` (líneas 813-842).
- [x] Tomar `invite_token` y datos precargados desde DB por `local_invite_id`.
- [x] Validar contraseña fuerte (mínimo 8, mayúscula, minúscula, número, símbolo).
- [x] Normalizar almacenamiento: nombres/apellidos en mayúsculas, correo en minúsculas.
- [x] Guardar usuario sin contraseña y con UUID de identidad Kratos.
- [x] Retornar payload de éxito esperado con `redemption`.
- [x] Integrar frontend de enrolamiento por UUID (`/invitacion?uuid=...`) con validación y envío al API.
- [x] Adaptar enrolamiento al flujo en `/registro?uuid=...` reutilizando el formulario de registro.
- [x] Integrar solicitud inicial de registro desde frontend (`/registro`) para crear invitación por correo.

## Pendiente etapa 4 (browser auth end-to-end)

- [x] Conectar front al flujo de login real del API (`/auth/login`) sin mock local.
- [x] Validar verificación de sesión en pantallas protegidas (`bootstrap` + `/auth/session`).
- [x] Implementar flujo de logout integrado al API (`/auth/logout`) y limpieza de sesión local.
- [x] Resolver conexión de frontend por entorno (`vercel`, `amplify`, `inhouse`) con variables `VITE_...`.
- [x] Configurar archivo principal de frontend `.env` como fuente de variables de conexión.
- [x] Generar URL de invitación con base del frontend de origen y ruta configurable de registro (`/registro`).

## Pendiente pruebas y calidad

- [ ] Añadir pruebas de integración para generación de invitación.
- [ ] Añadir pruebas de integración para validación UUID y enrolamiento.
- [ ] Añadir pruebas de reglas de normalización de datos.
- [ ] Añadir pruebas de política de contraseñas.
- [ ] Documentar colección de pruebas manuales desde Swagger.
