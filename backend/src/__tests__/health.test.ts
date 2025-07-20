import request from 'supertest';
import express from 'express';
import healthRoute from '../index';

describe('Health Check', () => {
  it('should return status ok', async () => {
    const app = express();
    app.use('/', healthRoute);
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
}); 