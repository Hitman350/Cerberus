// src/services/portfolio.service.js
import BigNumber from '../utils/bigNumber.js';

export async function getAggregatedPortfolio(
  userId,
  { dal, bal, market, config, redis, axios }
) {
  const wallets = await dal.findWalletsByUserId(userId);

  // 1. Create a flat array of ALL balance-fetching promises.
  const allBalancePromises = wallets.flatMap((wallet) => {
    const client = bal.getClient(wallet.chainId);
    // Return an array of promises for each wallet
    return [
      client.getNativeBalance(wallet.address),
      client.getTokenBalances(wallet.address),
    ];
  });

  // 2. Settle all promises concurrently.
  const allResults = await Promise.allSettled(allBalancePromises);

  const allAssets = [];
  const warnings = [];

  allResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      // The result can be a single asset object or an array of them.
      if (Array.isArray(result.value)) {
        allAssets.push(...result.value);
      } else if (result.value) {
        allAssets.push(result.value);
      }
    } else {
      // If a promise was rejected, log it as a warning.
      warnings.push({
        message: `A balance fetch failed.`,
        reason: result.reason.message,
      });
    }
  });

  // 3. Compile a unique list of all asset IDs to fetch prices for.
  const uniqueAssetIds = [...new Set(allAssets.map((asset) => asset.assetId))].filter(Boolean);

  // 4. Fetch prices.
  const prices = await market.getPrices(uniqueAssetIds, { redis, axios, config });

  // 5. & 6. The aggregation logic remains the same.
  let totalValue = new BigNumber(0);
  const aggregatedChains = new Map();

  allAssets.forEach((asset) => {
    if (!asset || !asset.chainId) {
      console.warn('Skipping malformed asset without chainId:', asset);
      return;
    }
    const price = new BigNumber(prices.get(asset.assetId) || 0);
    const balance = new BigNumber(asset.balance);
    const value = balance.multipliedBy(price);
    asset.price = price.toString();
    asset.value = value.toString();
    totalValue = totalValue.plus(value);
    if (!aggregatedChains.has(asset.chainId)) {
      aggregatedChains.set(asset.chainId, {
        chainId: asset.chainId,
        chainName: asset.chainId.charAt(0).toUpperCase() + asset.chainId.slice(1),
        totalValue: '0',
        assets: [],
      });
    }
    const chain = aggregatedChains.get(asset.chainId);
    chain.assets.push(asset);
    chain.totalValue = new BigNumber(chain.totalValue).plus(value).toString();
  });

  // 7. Return the final, structured portfolio object.
  return {
    totalValue: totalValue.toFixed(2),
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
    chains: Array.from(aggregatedChains.values()),
    warnings,
  };
}