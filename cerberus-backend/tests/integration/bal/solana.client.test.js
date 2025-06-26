// Path: tests/integration/bal/solana.client.test.js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { SolanaClient } from '../../../src/bal/connectors/solana.client.js';
import { config } from '../../../src/config/index.js';

// This integration test makes real network calls to the Solana Devnet.
describe('SolanaClient - Integration Tests (Devnet)', () => {
  let client;

  const testAddress = 'Cgr2G1yVqJTTGF8eagMapnq2vBSLUX2pQvCAUwjK1qyP';

  beforeAll(() => {
    client = new SolanaClient(config.SOLANA_RPC_URL);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  it('should throw an error for an invalid address', async () => {
    const invalidAddress = '0x123';
    await expect(client.getNativeBalance(invalidAddress)).rejects.toThrow(
      `Invalid Solana address: ${invalidAddress}`
    );
  });

  it(
    'should fetch the native SOL balance correctly',
    async () => {
      const nativeBalance = await client.getNativeBalance(testAddress);

      expect(nativeBalance).toBeDefined();
      expect(nativeBalance.assetId).toBe('solana');
      expect(nativeBalance.symbol).toBe('SOL');
      expect(nativeBalance.type).toBe('native');

      expect(typeof nativeBalance.balance).toBe('string');
      expect(parseFloat(nativeBalance.balance)).toBeGreaterThanOrEqual(1);
    },
    20000
  );

  it(
    'should fetch the balances of whitelisted SPL tokens correctly',
    async () => {
      // Execute the function we are testing.
      const tokenBalances = await client.getTokenBalances(testAddress);

      // Assertions
      expect(Array.isArray(tokenBalances)).toBe(true);
      
      // This test specifically looks for the Devnet USDC we got from the faucet.
      const usdcToken = tokenBalances.find(
        (token) => token.symbol === 'USDC'
      );
      
      // Verify that the USDC token was found in the returned array.
      expect(usdcToken).toBeDefined();

      if (usdcToken) {
        expect(usdcToken.assetId).toBe('usd-coin');
        expect(usdcToken.type).toBe('spl');
        expect(typeof usdcToken.balance).toBe('string');
        // We expect the balance to be greater than 0 since the faucet sent us some.
        expect(parseFloat(usdcToken.balance)).toBeGreaterThan(0);
      }
    },
    30000 // A longer timeout for this more complex RPC call.
  );
});