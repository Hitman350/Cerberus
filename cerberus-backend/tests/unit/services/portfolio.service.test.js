// tests/unit/services/portfolio.service.test.js
import { jest, describe, it, expect } from '@jest/globals';

// The service we are testing
import { getAggregatedPortfolio } from '../../../src/services/portfolio.service.js';

describe('PortfolioService - getAggregatedPortfolio()', () => {
  const testUserId = 'user-id-123';

  // Test Case 1: The "happy path" where all external services succeed.
  it('should correctly aggregate a portfolio with assets from multiple chains', async () => {
    // --- Arrange ---
    // Define all the mock functions and their return values for this specific test.

    const mockFindWallets = jest.fn().mockResolvedValue([
      { chainId: 'ethereum', address: '0x123' },
      { chainId: 'solana', address: 'So123' },
    ]);

    const mockEthClient = {
      // The mock asset object now correctly includes the chainId.
      getNativeBalance: jest.fn().mockResolvedValue({
        assetId: 'ethereum',
        balance: '2.0',
        chainId: 'ethereum',
      }),
      getTokenBalances: jest.fn().mockResolvedValue([]), // No ERC-20 tokens for simplicity
    };

    const mockSolClient = {
      // The mock asset object now correctly includes the chainId.
      getNativeBalance: jest.fn().mockResolvedValue({
        assetId: 'solana',
        balance: '10.0',
        chainId: 'solana',
      }),
      getTokenBalances: jest.fn().mockResolvedValue([]), // No SPL tokens for simplicity
    };

    const mockGetClient = jest.fn((chainId) => {
      if (chainId === 'ethereum') return mockEthClient;
      if (chainId === 'solana') return mockSolClient;
    });

    const mockGetPrices = jest.fn().mockResolvedValue(
      new Map([
        ['ethereum', 3000], // 1 ETH = $3000
        ['solana', 150],    // 1 SOL = $150
      ])
    );

    // --- Act ---
    // Call the service, injecting our complete set of mock dependencies.
    const portfolio = await getAggregatedPortfolio(testUserId, {
      dal: { findWalletsByUserId: mockFindWallets },
      bal: { getClient: mockGetClient },
      market: { getPrices: mockGetPrices },
      // Pass empty objects for dependencies needed by the inner getPrices call
      config: {},
      redis: {},
      axios: {},
    });

    // --- Assert ---
    // 1. Verify all dependencies were called as expected.
    expect(mockFindWallets).toHaveBeenCalledWith(testUserId);
    expect(mockGetClient).toHaveBeenCalledWith('ethereum');
    expect(mockGetClient).toHaveBeenCalledWith('solana');
    expect(mockGetPrices).toHaveBeenCalledWith(['ethereum', 'solana'], expect.any(Object));
    
    // 2. Verify the final calculations are correct.
    // (2 ETH * 3000) + (10 SOL * 150) = 6000 + 1500 = 7500
    expect(portfolio.totalValue).toBe('7500.00');
    
    // 3. Verify the response structure is correct.
    expect(portfolio.warnings.length).toBe(0);
    expect(portfolio.chains.length).toBe(2);
    const ethChain = portfolio.chains.find((c) => c.chainId === 'ethereum');
    expect(ethChain.totalValue).toBe('6000');
  });

  // Test Case 2: The "partial failure" path where one blockchain is unreachable.
  it('should handle partial failures gracefully when one chain RPC fails', async () => {
    // --- Arrange ---
    const mockFindWallets = jest.fn().mockResolvedValue([
      { chainId: 'ethereum', address: '0x123' },
      { chainId: 'solana', address: 'So123' }, // This chain will fail
    ]);

    const mockEthClient = {
      // The successful client still provides a complete asset object.
      getNativeBalance: jest.fn().mockResolvedValue({
        assetId: 'ethereum',
        balance: '2.0',
        chainId: 'ethereum',
      }),
      getTokenBalances: jest.fn().mockResolvedValue([]),
    };

    // The Solana client will have its methods reject, simulating an RPC failure.
    const mockSolClient = {
      getNativeBalance: jest.fn().mockRejectedValue(new Error('Solana RPC is down')),
      getTokenBalances: jest.fn().mockRejectedValue(new Error('Solana RPC is down')),
    };

    const mockGetClient = jest.fn((chainId) => {
      if (chainId === 'ethereum') return mockEthClient;
      if (chainId === 'solana') return mockSolClient;
    });

    // The market service will only be asked for the price of the successful asset ('ethereum').
    const mockGetPrices = jest.fn().mockResolvedValue(new Map([['ethereum', 3000]]));

    // --- Act ---
    const portfolio = await getAggregatedPortfolio(testUserId, {
      dal: { findWalletsByUserId: mockFindWallets },
      bal: { getClient: mockGetClient },
      market: { getPrices: mockGetPrices },
      config: {},
      redis: {},
      axios: {},
    });

    // --- Assert ---
    // 1. The total value should only reflect the successful chain (2 ETH * 3000 = 6000).
    expect(portfolio.totalValue).toBe('6000.00');
    
    // 2. The warnings array should contain two entries, one for each failed promise from the Solana client.
    expect(portfolio.warnings.length).toBe(2);
    expect(portfolio.warnings[0].reason).toBe('Solana RPC is down');
    
    // 3. The final structure should only contain the successful chain's data.
    expect(portfolio.chains.length).toBe(1);
    expect(portfolio.chains[0].chainId).toBe('ethereum');
  });
});