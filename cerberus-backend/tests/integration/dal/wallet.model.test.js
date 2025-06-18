// tests/integration/dal/wallet.model.test.js
import getPool from '../../../src/dal/postgres.js';
import { createUser } from '../../../src/dal/models/user.model.js';
import {
  addWallet,
  findWalletsByUserId,
} from '../../../src/dal/models/wallet.model.js';

const pool = getPool();

// This describe block groups all tests for the Wallet DAL model.
describe('Wallet DAL Model - Integration Tests', () => {
  let testUser; // We will store our created test user here.

  // The `beforeAll` hook runs once before any tests in this file.
  // We use it to create a prerequisite user for all our wallet tests.
  beforeAll(async () => {
    const email = `wallet-test-user_${Date.now()}@example.com`;
    const passwordHash = 'password_for_wallet_tests';
    // We create a user and store the full user object to use its ID in tests.
    testUser = await createUser(email, passwordHash);
  });

  // The `afterAll` hook runs once after all tests are complete.
  // It's crucial for cleaning up our database state.
  afterAll(async () => {
    // Delete the test user. Because of the `ON DELETE CASCADE` constraint
    // we set up in our migration, this will automatically delete all wallets
    // associated with this user. This is a great example of our schema design working for us.
    if (testUser) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    }
    // End the pool to allow the Jest process to exit cleanly.
    await pool.end();
  });

  // --- Test Suite for `addWallet` ---
  describe('addWallet()', () => {
    it('should add a new wallet for a user and return the wallet object', async () => {
      const walletData = {
        userId: testUser.id,
        chainId: 'ethereum',
        address: `0x${'1'.repeat(40)}`, // A valid-looking placeholder address
        nickname: 'My Test Wallet',
      };

      const newWallet = await addWallet(
        walletData.userId,
        walletData.chainId,
        walletData.address,
        walletData.nickname
      );

      expect(newWallet).toBeDefined();
      expect(newWallet.user_id).toBe(walletData.userId);
      expect(newWallet.address).toBe(walletData.address);
      expect(newWallet.nickname).toBe(walletData.nickname);
      expect(newWallet).toHaveProperty('id');
    });

    it('should add a wallet without a nickname correctly', async () => {
      const walletData = {
        userId: testUser.id,
        chainId: 'solana',
        address: 'So11111111111111111111111111111111111111112',
      };

      // Call the function without the fourth `nickname` argument to test the default parameter.
      const newWallet = await addWallet(
        walletData.userId,
        walletData.chainId,
        walletData.address
      );

      expect(newWallet).toBeDefined();
      expect(newWallet.user_id).toBe(walletData.userId);
      // The database should store and return `null` for the nickname.
      expect(newWallet.nickname).toBeNull();
    });
  });

  // --- Test Suite for `findWalletsByUserId` ---
  describe('findWalletsByUserId()', () => {
    it('should find all wallets associated with a user', async () => {
      // Setup: Ensure at least two wallets exist for our test user.
      // The first was created in the `addWallet` test. Let's add another.
      await addWallet(
        testUser.id,
        'polygon',
        `0x${'2'.repeat(40)}`,
        'Polygon Wallet'
      );

      // Execute the function we are testing.
      const wallets = await findWalletsByUserId(testUser.id);

      // Assertions
      expect(Array.isArray(wallets)).toBe(true);
      // NOTE: The exact number might be 3 if tests run in a specific order.
      // A more robust check is to assert it's greater than or equal to 2.
      expect(wallets.length).toBeGreaterThanOrEqual(2);
      // Check that the data for one of the wallets is correct.
      expect(wallets.some((w) => w.chain_id === 'polygon')).toBe(true);
      expect(wallets.some((w) => w.nickname === 'My Test Wallet')).toBe(true);
    });

    it('should return an empty array for a user with no wallets', async () => {
      // Setup: Create a new, temporary user who will have no wallets.
      const userWithoutWallets = await createUser(
        `no-wallets-user_${Date.now()}@example.com`,
        'hash'
      );

      // Execute
      const wallets = await findWalletsByUserId(userWithoutWallets.id);

      // Assert
      expect(Array.isArray(wallets)).toBe(true);
      expect(wallets.length).toBe(0);

      // Cleanup
      await pool.query('DELETE FROM users WHERE id = $1', [
        userWithoutWallets.id,
      ]);
    });
  });
});