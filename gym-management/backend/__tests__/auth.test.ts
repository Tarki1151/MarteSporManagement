import request from 'supertest';
import app from '../src/index';

describe('Auth API', () => {
  it('should return 401 for invalid login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  // Not testing successful login here to avoid polluting DB with test users.
  // For full test, seed DB with a known user and test login.
});
