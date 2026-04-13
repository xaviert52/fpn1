# Primecore API (Etapa 1)

Base backend creada desde `api_base` para iniciar por etapas.

## Etapa actual

- Login browser orientado a front usando proxy Kratos (`/auth/browser/*`).
- Endpoint de login API para obtener token de sesión (`ory_st_...`) y preparar la etapa de creación de usuario.
- Verificación de sesión y logout base.
- Estructura DB lista para iterar: `sqlite` en desarrollo y `postgres` en producción con migraciones (`knex`).

## Comandos

```bash
npm install
npm run migrate
npm test
npm run dev
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

- `BASE_URL`
- `KRATOS_PATH`
- `DATABASE_CLIENT`
- `DATABASE_URL` (producción)
- `SQLITE_FILENAME` (desarrollo)
