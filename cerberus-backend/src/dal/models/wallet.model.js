// src/dal/models/wallet.model.js
import { query } from '../postgres.js';

/**
 * Associates a new wallet address with a user.
 * @param {string} userId - The UUID of the user.
 * @param {string} chainId - The identifier for the blockchain (e.g., 'ethereum').
 * @param {string} address - The public wallet address.
 * @param {string} [nickname] - An optional user-provided nickname for the wallet.
 * @returns {Promise<object>} The newly created wallet object.
 */
export async function addWallet(userId, chainId, address, nickname = null) {
  const sql = `
    INSERT INTO wallets (user_id, chain_id, address, nickname)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, chain_id, address, nickname, created_at;
  `;
  const params = [userId, chainId, address, nickname];
  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Finds all wallets associated with a given user ID.
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of wallet objects. The array will be empty if no wallets are found.
 */
export async function findWalletsByUserId(userId) {
  const sql = `SELECT * FROM wallets WHERE user_id = $1 ORDER BY created_at ASC;`;
  const params = [userId];
  const result = await query(sql, params);
  return result.rows; // Always return the array of rows.
}