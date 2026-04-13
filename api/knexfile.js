require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';
const client = process.env.DATABASE_CLIENT || (isProd ? 'pg' : 'sqlite3');

const baseConfig = {
  migrations: {
    directory: './migrations',
  },
};

module.exports = {
  development: {
    client,
    connection: client === 'sqlite3'
      ? {
          filename: process.env.SQLITE_FILENAME || './data/dev.sqlite3',
        }
      : {
          connectionString: process.env.DATABASE_URL,
        },
    useNullAsDefault: client === 'sqlite3',
    pool: client === 'sqlite3' ? undefined : { min: 2, max: 10 },
    ...baseConfig,
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: './data/test.sqlite3',
    },
    useNullAsDefault: true,
    ...baseConfig,
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
    ...baseConfig,
  },
};
