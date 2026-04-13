const path = require('path');
const knex = require('knex');

const env = process.env.NODE_ENV || 'development';
const config = require(path.resolve(__dirname, '../../knexfile'))[env];

module.exports = knex(config);
