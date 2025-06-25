// src/bal/connectors/evm.client.js
import { ethers } from 'ethers';
import erc20Abi from '../../data/abis/erc20.json' assert { type: 'json' };
import ethereumTokens from '../../data/token-lists/ethereum.json' assert { type: 'json' };

/**
 * A client for interacting with any EVM-compatible blockchain.
 */
export class EVMClient {
  /**
   * @type {ethers.JsonRpcProvider}
   * @private
   */
  #provider;
  #chainId = 'ethereum'; // Hardcoded for now, can be made dynamic later

  /**
   * @param {string} rpcUrl - The JSON-RPC endpoint URL for the EVM chain.
   */
  constructor(rpcUrl) {
    this.#provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log(`EVMClient initialized for RPC: ${rpcUrl}`);
  }

  /**
   * Fetches the native asset balance for a given address.
   * @param {string} address - The EVM address to check.
   * @returns {Promise<import('../types.js').AssetBalance>} The balance data in our standard format.
   */
  async getNativeBalance(address) {
    if (!ethers.isAddress(address)) {
      throw new Error(`Invalid EVM address: ${address}`);
    }
    const balanceBigInt = await this.#provider.getBalance(address);
    return {
      assetId: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: ethers.formatUnits(balanceBigInt, 18),
      logoUri:
        'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
      type: 'native',
      chainId: this.#chainId,
      contractAddress: null,
    };
  }

  /**
   * Fetches the balances for a predefined list of ERC-20 tokens.
   * @param {string} address - The EVM address to check.
   * @returns {Promise<Array<import('../types.js').AssetBalance>>} An array of token balances.
   */
  async getTokenBalances(address) {
    if (!ethers.isAddress(address)) {
      throw new Error(`Invalid EVM address: ${address}`);
    }

    // Create an array of promises, one for each token balance check.
    const promises = ethereumTokens.map(async (token) => {
      const contract = new ethers.Contract(
        token.contractAddress,
        erc20Abi,
        this.#provider
      );
      try {
        const balanceBigInt = await contract.balanceOf(address);
        const balance = ethers.formatUnits(balanceBigInt, token.decimals);

        // We only return tokens the user actually has a balance of.
        if (parseFloat(balance) > 0) {
          return {
            assetId: token.assetId,
            symbol: token.symbol,
            name: token.name,
            balance: balance,
            logoUri: token.logoUri,
            type: 'erc20',
            chainId: this.#chainId,
            contractAddress: token.contractAddress,
          };
        }
      } catch (error) {
        console.error(
          `Failed to fetch balance for ${token.symbol} (${token.contractAddress})`,
          error
        );
      }
      return null; // Return null for tokens with no balance or on error.
    });

    // Execute all promises in parallel for maximum performance.
    const results = await Promise.all(promises);

    // Filter out the null results to get our final array of assets.
    return results.filter((result) => result !== null);
  }
}