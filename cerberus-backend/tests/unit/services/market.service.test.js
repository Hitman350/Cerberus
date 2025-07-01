// tests/unit/services/market.service.test.js
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getPrices } from '../../../src/services/market.service.js';
import { config } from '../../../src/config/index.js'; // We need the real config

describe('MarketService - getPrices()', () => {
  let mockRedis;
  let mockAxios;

  beforeEach(() => {
    // Before each test, create fresh mock objects for our dependencies.
    mockAxios = {
      get: jest.fn(),
    };
    mockRedis = {
      mget: jest.fn(),
      pipeline: jest.fn().mockReturnThis(), // .pipeline() returns itself for chaining
      setex: jest.fn().mockReturnThis(), // .setex() returns itself
      exec: jest.fn().mockResolvedValue([]), // .exec() returns a promise
    };
    // Make the pipeline() call on our mockRedis return the mockRedis itself,
    // which has the setex and exec methods we need.
    mockRedis.pipeline.mockReturnValue(mockRedis);
  });

  it('should return all prices from the cache when available', async () => {
    // Arrange
    const assetIds = ['bitcoin', 'ethereum'];
    mockRedis.mget.mockResolvedValue(['50000', '3000']);

    // Act: Call the function, injecting our mocks.
    const prices = await getPrices(assetIds, {
      redis: mockRedis,
      axios: mockAxios,
      config,
    });

    // Assert
    expect(prices.get('bitcoin')).toBe(50000);
    expect(prices.get('ethereum')).toBe(3000);
    expect(mockAxios.get).not.toHaveBeenCalled();
  });

  it('should fetch missing prices from the API and update the cache', async () => {
    // Arrange
    const assetIds = ['bitcoin', 'ethereum'];
    mockRedis.mget.mockResolvedValue(['50000', null]);
    mockAxios.get.mockResolvedValue({
      data: { ethereum: { usd: 3000 } },
    });

    // Act
    const prices = await getPrices(assetIds, {
      redis: mockRedis,
      axios: mockAxios,
      config,
    });

    // Assert
    expect(prices.get('bitcoin')).toBe(50000);
    expect(prices.get('ethereum')).toBe(3000);
    expect(mockAxios.get).toHaveBeenCalledTimes(1);
    expect(mockRedis.setex).toHaveBeenCalledWith('price:ethereum', 60, 3000);
    expect(mockRedis.exec).toHaveBeenCalledTimes(1);
  });

  it('should return only cached prices if the API call fails', async () => {
    // Arrange
    const assetIds = ['bitcoin', 'ethereum'];
    mockRedis.mget.mockResolvedValue(['50000', null]);
    mockAxios.get.mockRejectedValue(new Error('API Down'));

    // Act
    const prices = await getPrices(assetIds, {
      redis: mockRedis,
      axios: mockAxios,
      config,
    });

    // Assert
    expect(prices.size).toBe(1);
    expect(prices.get('bitcoin')).toBe(50000);
  });
});