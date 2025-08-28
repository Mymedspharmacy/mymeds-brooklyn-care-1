import request from 'supertest';
import { app } from '../../index';
import { 
  createTestUser, 
  createTestAdmin, 
  generateTestToken,
  setupTestDatabase,
  teardownTestDatabase 
} from '../../test/utils/test-utils';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.id).toBe(user.id);
    });

    it('should reject invalid credentials', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'testpassword123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        name: 'New User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      await createTestUser({
        email: 'duplicate@example.com',
        password: 'testpassword123'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'newpassword123',
          name: 'Duplicate User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).toHaveProperty('name', user.name);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const user = await createTestUser();
      const refreshToken = generateTestToken(user, 'refresh');

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});




