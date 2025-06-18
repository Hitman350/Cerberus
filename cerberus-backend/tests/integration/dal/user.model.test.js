// Path: tests/integration/dal/user.model.test.js

import getPool from '../../../src/dal/postgres.js'; // Correct import
import {
  createUser,
  findUserByEmail,
} from '../../../src/dal/models/user.model.js';

const pool = getPool(); // Initialize pool before use

const generateTestEmail = () => `testuser_${Date.now()}@example.com`;

describe('User DAL Model - Integration Tests', () => {
  let createdUserEmail;

  afterAll(async () => {
    if (createdUserEmail) {
      await pool.query('DELETE FROM users WHERE email = $1', [createdUserEmail]);
    }
    await pool.end();
  });

  // --- Test Suite for `createUser` ---
  describe('createUser()', () => {
    it('should create a new user and return the correct user object', async () => {
      createdUserEmail = generateTestEmail(); // Generate a fresh email for this test
      const passwordHash = 'a_very_secure_hash';

      const newUser = await createUser(createdUserEmail, passwordHash);

      // Assertions to verify the function's output
      expect(newUser).toBeDefined();
      expect(newUser.email).toBe(createdUserEmail);
      expect(newUser).toHaveProperty('id');
      expect(newUser).toHaveProperty('created_at');
      // CRITICAL: Ensure the password hash is NOT returned on creation for security.
      expect(newUser).not.toHaveProperty('password_hash');
    });

    it('should throw an error when trying to create a user with a duplicate email', async () => {
      // This test expects an error to be thrown, verifying our UNIQUE constraint.
      const email = generateTestEmail();
      const passwordHash = 'another_hash';

      // Create the first user successfully.
      await createUser(email, passwordHash);

      // We wrap the second creation attempt in a Jest `expect.toThrow()` block.
      // This will cause the test to pass only if the code inside throws an error.
      await expect(createUser(email, passwordHash)).rejects.toThrow(
        // We can even assert that the error message contains specific text,
        // which proves it's the database constraint error we expect.
        'duplicate key value violates unique constraint "users_email_key"'
      );

      // Clean up the user created specifically for this test.
      await pool.query('DELETE FROM users WHERE email = $1', [email]);
    });
  });

  // --- Test Suite for `findUserByEmail` ---
  describe('findUserByEmail()', () => {
    it('should find an existing user by email and return all fields', async () => {
      // Setup: Create a user to find.
      const email = generateTestEmail();
      const passwordHash = 'a_findable_hash';
      await createUser(email, passwordHash);

      // Execute the function we are testing.
      const foundUser = await findUserByEmail(email);

      // Assertions
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(email);
      // For find operations, we DO expect the password hash to be returned.
      expect(foundUser.password_hash).toBe(passwordHash);

      // Clean up the user created for this test.
      await pool.query('DELETE FROM users WHERE email = $1', [email]);
    });

    it('should return null when trying to find a non-existent user', async () => {
      const nonExistentUser = await findUserByEmail('nonexistent@example.com');
      // Assert that the function correctly returns null when no record is found.
      expect(nonExistentUser).toBeNull();
    });

    it('should be case-insensitive when finding a user by email', async () => {
      const emailLower = generateTestEmail();
      const emailUpper = emailLower.toUpperCase();
      const passwordHash = 'case_insensitive_hash';

      // Setup: Create the user with a lowercase email.
      await createUser(emailLower, passwordHash);

      // Execute: Search for the user with an uppercase email.
      const foundUser = await findUserByEmail(emailUpper);

      // Assert: The user should still be found, proving our logic is case-insensitive.
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(emailLower);

      // Clean up.
      await pool.query('DELETE FROM users WHERE email = $1', [emailLower]);
    });
  });
});