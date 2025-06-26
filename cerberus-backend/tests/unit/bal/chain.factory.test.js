// tests/unit/bal/chain.factory.test.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Manually create mock functions for both of our client classes.
const mockEVMClient = jest.fn();
const mockSolanaClient = jest.fn();

// Use jest.unstable_mockModule to replace the real modules with our mocks.
// This is the definitive way to handle ESM mocking in Jest.
jest.unstable_mockModule('../../../src/bal/connectors/evm.client.js', () => ({
  EVMClient: mockEVMClient,
}));
jest.unstable_mockModule('../../../src/bal/connectors/solana.client.js', () => ({
  SolanaClient: mockSolanaClient,
}));

describe('Chain Factory - getClient()', () => {
  // This hook runs before each `it` block, ensuring perfect test isolation.
  beforeEach(() => {
    // Clear mock call history.
    mockEVMClient.mockClear();
    mockSolanaClient.mockClear();
    // Clear Jest's module cache to get a fresh `chain.factory.js` every time.
    jest.resetModules();
  });

  it('should return an instance of the mocked EVMClient for "ethereum"', async () => {
    // Dynamically import the factory inside the test to get the fresh, uncached version.
    const { getClient } = await import('../../../src/bal/chain.factory.js');
    const client = getClient('ethereum');

    expect(mockEVMClient).toHaveBeenCalledTimes(1);
    expect(client).toBeInstanceOf(mockEVMClient);
  });

  it('should return an instance of the mocked SolanaClient for "solana"', async () => {
    // This test now follows the exact same pattern for consistency and reliability.
    const { getClient } = await import('../../../src/bal/chain.factory.js');
    const client = getClient('solana');

    expect(mockSolanaClient).toHaveBeenCalledTimes(1);
    expect(client).toBeInstanceOf(mockSolanaClient);
  });

  it('should return the same cached instance on subsequent calls within the same test', async () => {
    const { getClient } = await import('../../../src/bal/chain.factory.js');

    const client1 = getClient('ethereum');
    const client2 = getClient('ethereum');

    expect(client1).toBe(client2);
    // The constructor should have only been called once for both gets.
    expect(mockEVMClient).toHaveBeenCalledTimes(1);
  });

  it('should throw an error for an unsupported chainId', async () => {
    const { getClient } = await import('../../../src/bal/chain.factory.js');
    const attemptToGetClient = () => getClient('cardano'); // An unsupported chain
    expect(attemptToGetClient).toThrow(
      'Unsupported chain: cardano. No configuration found.'
    );
  });
});