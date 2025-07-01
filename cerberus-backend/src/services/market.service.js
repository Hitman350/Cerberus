// src/services/market.service.js
// No more direct imports of axios or redisClient!

const CACHE_TTL_SECONDS = 60;

/**
 * Fetches prices, using a "cache-first" strategy.
 * This function is decoupled and receives its dependencies as arguments.
 *
 * @param {string[]} assetIds - An array of asset IDs.
 * @param {object} dependencies - The external dependencies required by the service.
 * @param {import('ioredis').Redis} dependencies.redis - The Redis client instance.
 * @param {import('axios').AxiosStatic} dependencies.axios - The Axios instance.
 * @param {object} dependencies.config - The application configuration object.
 * @returns {Promise<Map<string, number>>} A map of asset IDs to their USD price.
 */
export async function getPrices(
  assetIds,
  { redis, axios, config }
) {
  if (!assetIds || assetIds.length === 0) {
    return new Map();
  }

  const cacheKeys = assetIds.map((id) => `price:${id}`);
  const cachedPrices = await redis.mget(cacheKeys);

  const prices = new Map();
  const missingAssetIds = [];

  cachedPrices.forEach((price, index) => {
    if (price) {
      prices.set(assetIds[index], parseFloat(price));
    } else {
      missingAssetIds.push(assetIds[index]);
    }
  });

  if (missingAssetIds.length > 0) {
    console.log(`Cache miss for: ${missingAssetIds.join(', ')}. Fetching from API...`);
    try {
      const apiUrl = `${config.COINGECKO_API_BASE_URL}/simple/price`;
      const response = await axios.get(apiUrl, {
        params: {
          ids: missingAssetIds.join(','),
          vs_currencies: 'usd',
        },
      });

      const fetchedPrices = response.data;
      const pipeline = redis.pipeline();

      for (const assetId of missingAssetIds) {
        if (fetchedPrices[assetId] && fetchedPrices[assetId].usd) {
          const price = fetchedPrices[assetId].usd;
          prices.set(assetId, price);
          pipeline.setex(`price:${assetId}`, CACHE_TTL_SECONDS, price);
        }
      }
      await pipeline.exec();
    } catch (error) {
      console.error('Failed to fetch prices from CoinGecko API:', error.message);
    }
  }

  return prices;             
}