// tests/e2e/health.test.js
import request from 'supertest';
import app from '../../src/app.js'; // Import our configured Express app

// `describe` is a Jest function to group related tests together.
describe('Health Check E2E', () => {
  // `it` or `test` defines an individual test case.
  it('should return 200 OK and a healthy status message for the health endpoint', async () => {
    // `request(app)` creates a test instance of our application.
    const response = await request(app)
      .get('/api/v1/health') // Make a GET request to our health endpoint.
      .expect('Content-Type', /json/) // Assert the response Content-Type header is JSON.
      .expect(200); // Assert the HTTP status code is 200.

    // `expect(response.body).toEqual(...)` is a Jest assertion.
    // We are checking that the response body matches our expected output exactly.
    expect(response.body).toEqual({
      status: 'ok',
      message: 'API is healthy',
    });
  });
});