// src/dal/models/user.model.js

import { query } from '../postgres.js';

/**
 * Creates a new user in the database with their email and hashed password.
 * This function is the single source of truth for user creation.
 *
 * @param {string} email - The user's email address. Must be pre-validated.
 * @param {string} passwordHash - The Argon2id hash of the user's password.
 * @returns {Promise<{id: string, email: string, created_at: Date}>} A promise that resolves to the newly created user object, containing only safe-to-return fields.
 */
export async function createUser(email, passwordHash) {
  // SQL statement to insert a new user and return key fields.
  // Using RETURNING is highly efficient as it avoids a second query to fetch the new user's data.
  const sql = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at;
  `;

  // Use parameterized queries to prevent SQL injection. The pg library handles sanitization.
  const params = [email.toLowerCase(), passwordHash];

  const result = await query(sql, params);

  // result.rows[0] contains the user object returned by the RETURNING clause.
  return result.rows[0];
}

/**
 * Finds a single user by their unique email address.
 * This is the primary lookup method for authentication and checking for existing users.
 *
 * @param {string} email - The email address to search for.
 * @returns {Promise<object|null>} A promise that resolves to the full user object (including password_hash) if found, otherwise resolves to `null`.
 */
export async function findUserByEmail(email) {
  // Selects all fields for the specified user.
  const sql = `SELECT * FROM users WHERE email = $1;`;

  // Ensure the email is lowercased to match the database's case-insensitive storage.
  const params = [email.toLowerCase()];

  const result = await query(sql, params);

  // If result.rows is empty, result.rows[0] will be `undefined`.
  // The `|| null` ensures we return a consistent `null` value for "not found" cases.
  return result.rows[0] || null;
}