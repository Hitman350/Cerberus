// src/bal/chain.factory.js
import { config } from '../config/index.js';
import { EVMClient } from './connectors/evm.client.js';
// We will import the SolanaClient here later.
// import { SolanaClient } from './connectors/solana.client.js';

// A private cache to store initialized client instances.
// Using a Map is a modern and efficient way to implement a cache.
const clientCache = new Map();

/**
 * A mapping of chain identifiers to their respective client classes and RPC URLs.
 * This acts as a configuration registry for our supported chains.
 */
const chainConfig = {
  ethereum: {
    Client: EVMClient,
    rpcUrl: config.ETHEREUM_RPC_URL,
  },
  solana: {
    // We'll uncomment this when the SolanaClient is ready.
    // Client: SolanaClient,
    rpcUrl: config.SOLANA_RPC_URL,
  },
  // We can easily add more chains here in the future, like Polygon or BSC.
  // polygon: {
  //   Client: EVMClient, // Re-uses the EVMClient with a different RPC
  //   rpcUrl: config.POLYGON_RPC_URL
  // }
};

/**
 * The Chain Factory function. Returns a memoized client instance for a given chainId.
 * This is the single entry point for the rest of the application to interact with the BAL.
 *
 * @param {keyof typeof chainConfig} chainId - The identifier of the chain (e.g., 'ethereum', 'solana').
 * @returns {EVMClient /* | SolanaClient /*}- The initialized client instance for the requested chain.
 * @throws {Error} If the chainId is not supported.
 */
export function getClient(chainId) {
  // 1. Check if we already have an initialized client for this chain in our cache.
  if (clientCache.has(chainId)) {
    return clientCache.get(chainId);
  }

  // 2. Check if the requested chain is configured.
  const config = chainConfig[chainId];
  if (!config) {
    throw new Error(`Unsupported chain: ${chainId}. No configuration found.`);
  }
  
  // 3. If the client class itself is not defined (e.g., SolanaClient is commented out), throw an error.
  if (!config.Client) {
    throw new Error(`Client for chain ${chainId} is not yet implemented.`);
  }

  // 4. Create a new instance of the appropriate client.
  const client = new config.Client(config.rpcUrl);

  // 5. Store the newly created client in the cache for future requests.
  clientCache.set(chainId, client);

  // 6. Return the new client.
  return client;
}