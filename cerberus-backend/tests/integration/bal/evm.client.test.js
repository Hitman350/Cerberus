// Path: tests/integration/bal/evm.client.test.js
import { describe, it, expect, beforeAll } from '@jest/globals';
import { EVMClient } from '../../../src/bal/connectors/evm.client.js';
import { config } from '../../../src/config/index.js';

// This test suite will make real network calls to the Sepolia testnet.
// It is an integration test, not a unit test.
describe('EVMClient - Integration Tests (Sepolia)', () => {
  let client;
  
  // A known public address on the Sepolia testnet that holds test assets.
  // IDEALLY, you should replace this with your own Sepolia address after funding it.
  const testAddress = '0x91A774c43a1ffE4604770FF505F364a53E8e8422';

  // The `beforeAll` hook runs once before any tests in this file.
  // We use it to initialize our client.
  beforeAll(() => {
    // We use the Ethereum RPC URL from our configuration.
    // Ensure this is pointed to a Sepolia testnet endpoint in your .env file.
    client = new EVMClient(config.ETHEREUM_RPC_URL);
  });

  // Jest will wait for this async test to complete.
  // We are setting a longer timeout because network calls can be slow.
  it(
    'should fetch the native ETH balance correctly',
    async () => {
      const nativeBalance = await client.getNativeBalance(testAddress);

      // Assertions
      expect(nativeBalance).toBeDefined();
      expect(nativeBalance.assetId).toBe('ethereum');
      expect(nativeBalance.symbol).toBe('ETH');
      expect(nativeBalance.type).toBe('native');

      // The balance will change over time, so we can't assert an exact value.
      // Instead, we assert that the balance is a string representing a non-negative number.
      expect(typeof nativeBalance.balance).toBe('string');
      expect(parseFloat(nativeBalance.balance)).toBeGreaterThanOrEqual(0);
    },
    20000 // 20-second timeout for this test
  );

  it(
    'should fetch the balances of whitelisted ERC-20 tokens correctly',
    async () => {
      const tokenBalances = await client.getTokenBalances(testAddress);

      // Assertions
      expect(Array.isArray(tokenBalances)).toBe(true);
      
      // Check if any token balance is returned
      const hasTokenBalance = tokenBalances.length > 0;
      expect(hasTokenBalance).toBe(true);

      if (hasTokenBalance) {
        const linkToken = tokenBalances.find((token) => token.symbol === 'LINK');
        if (linkToken) {
          expect(linkToken.assetId).toBe('chainlink');
          expect(linkToken.type).toBe('erc20');
          expect(typeof linkToken.balance).toBe('string');
          expect(parseFloat(linkToken.balance)).toBeGreaterThan(0);
        } else {
          console.log('No LINK token balance found for the test address. Consider funding it with LINK on Sepolia.');
        }
      }
    },
    30000 // 30-second timeout for this test
  );
  
  it('should throw an error for an invalid address', async () => {
    const invalidAddress = '0x123'; // Not a valid EVM address
    
    // We expect the promise to be rejected with an error.
    await expect(client.getNativeBalance(invalidAddress)).rejects.toThrow(
      `Invalid EVM address: ${invalidAddress}`
    );
  });
});