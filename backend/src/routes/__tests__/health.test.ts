import request from 'supertest';
import { app } from '../../index';

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('checks');
      
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks).toHaveProperty('disk');
    });

    it('should return healthy status when all checks pass', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });

    it('should include response time', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('responseTime');
      expect(typeof response.body.responseTime).toBe('number');
      expect(response.body.responseTime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('connection');
      expect(response.body).toHaveProperty('responseTime');
      expect(response.body).toHaveProperty('tableCounts');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return healthy database status', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.connection).toBe('connected');
    });

    it('should include table counts', async () => {
      const response = await request(app)
        .get('/api/health/db')
        .expect(200);

      expect(response.body.tableCounts).toHaveProperty('users');
      expect(response.body.tableCounts).toHaveProperty('orders');
      expect(response.body.tableCounts).toHaveProperty('prescriptions');
      
      expect(typeof response.body.tableCounts.users).toBe('number');
      expect(typeof response.body.tableCounts.orders).toBe('number');
      expect(typeof response.body.tableCounts.prescriptions).toBe('number');
    });
  });

  describe('GET /api/status', () => {
    it('should return status monitor page', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);

      expect(response.text).toContain('MyMeds Pharmacy Status');
    });
  });
});





