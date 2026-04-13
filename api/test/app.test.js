const request = require('supertest');

const app = require('../src/index');

describe('Primecore API bootstrap', () => {
  test('GET / should return running message', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Primecore API running' });
  });

  test('GET /openapi.json should expose swagger spec', async () => {
    const response = await request(app).get('/openapi.json');
    expect(response.statusCode).toBe(200);
    expect(response.body.openapi).toBe('3.0.0');
    expect(response.body.paths['/notifications/b2b/invitation']).toBeDefined();
    expect(response.body.paths['/auth/login']).toBeDefined();
    expect(response.body.paths['/auth/session']).toBeDefined();
    expect(response.body.paths['/auth/logout']).toBeDefined();
  });

  test('unknown routes return 404', async () => {
    const response = await request(app).get('/missing-route');
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Not found');
  });
});
