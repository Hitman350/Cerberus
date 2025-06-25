// tests/unit/bal/chain.factory.test.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Manually create a mock function.
const mockEVMClient = jest.fn();

// Use jest.unstable_mockModule to replace the real module with our mock.
// This is done once at the top level.
jest.unstable_mockModule('../../../src/bal/connectors/evm.client.js', () => ({
  EVMClient: mockEVMClient,
}));

describe('Chain Factory - getClient()', () => {
  // This hook runs before each `it` block.
  beforeEach(() => {
    // 1. Reset the call history of our mock function.
    mockEVMClient.mockClear();
    // 2. CRITICAL: Clear Jest's entire module cache. This ensures that the
    //    next `import()` will give us a fresh version of chain.factory.js
    //    with an empty internal `clientCache`.
    jest.resetModules();
  });

  it('should return an instance of the mocked EVMClient for "ethereum"', async () => {
    // Dynamically import the factory *inside the test* to get the fresh version.
    const { getClient } = await import('../../../src/bal/chain.factory.js');
    const client = getClient('ethereum');

    expect(mockEVMClient).toHaveBeenCalledTimes(1);
    expect(client).toBeInstanceOf(mockEVMClient);
  });

  it('should return the same cached instance on subsequent calls WITHIN the same test', async () => {
    const { getClient } = await import('../../../src/bal/chain.factory.js');

    const client1 = getClient('ethereum');
    const client2 = getClient('ethereum');

    expect(client1).toBe(client2);
    // The constructor should have only been called once for both gets.
    expect(mockEVMClient).toHaveBeenCalledTimes(1);
  });

  it('should throw an error for an unsupported chainId', async () => {
    const { getClient } = await import('../../../src/bal/chain.factory.js');
    const attemptToGetClient = () => getClient('cardano');
    expect(attemptToGetClient).toThrow(
      'Unsupported chain: cardano. No configuration found.'
    );
  });

  it('should throw an error for a configured but unimplemented chain', async () => {
    const { getClient } = await import('../../../src/bal/chain.factory.js');
    const attemptToGetClient = () => getClient('solana');
    expect(attemptToGetClient).toThrow(
      'Client for chain solana is not yet implemented.'
    );
  });
});