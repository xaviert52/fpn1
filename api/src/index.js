const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const db = require('./db/knex');
const authServices = require('./services/auth-services');
const invitationServices = require('./services/invitation-services');

const app = express();
const PORT = process.env.PORT || 3001;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Primecore API',
      version: '0.2.0',
      description: 'API de autenticacion y onboarding (etapas)',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/index.js', './src/services/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use(authServices);
app.use(invitationServices);

app.get('/health', async (req, res) => {
  try {
    await db.raw('select 1');
    return res.json({ status: 'OK', timestamp: new Date().toISOString(), db: 'connected' });
  } catch (error) {
    return res.status(500).json({ status: 'ERROR', db: 'disconnected', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Primecore API running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
