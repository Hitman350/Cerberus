// src/bal/connectors/solana.client.js
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Agent } from 'http';
import solanaTokens from '../../data/token-lists/solana.json' assert { type: 'json' };

// Create a lookup map for efficient access to token metadata by mint address.
// This is more performant than searching the array every time.
const tokenMap = new Map(solanaTokens.map((token) => [token.mintAddress, token]));

/**
 * A client for interacting with the Solana blockchain.
 */
export class SolanaClient {
  /**
   * @type {Connection}
   * @private
   */
  #connection;
  #chainId = 'solana';

  /**
   * @param {string} rpcUrl - The JSON-RPC endpoint URL for the Solana network.
   */
  constructor(rpcUrl) {
    // Create a connection configuration object with a custom fetch implementation.
    const connectionConfig = {
      fetch: (input, init) => {
        // Create a new Agent with keepAlive: false to prevent holding TCP connections open.
        const agent = new Agent({ keepAlive: false });
        return fetch(input, { ...init, agent });
      },
    };

    // Initialize the Connection with the custom fetch configuration.
    this.#connection = new Connection(rpcUrl, 'confirmed', connectionConfig);
    console.log(`SolanaClient initialized for RPC: ${rpcUrl}`);
  }

  /**
   * Validates if a string is a valid Solana public key.
   * @private
   * @param {string} address - The address to validate.
   * @returns {boolean}
   */
  #isValidAddress(address) {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetches the native SOL balance for a given address.
   * @param {string} address - The Solana public key address to check.
   * @returns {Promise<import('../types.js').AssetBalance>} The balance data in our standard format.
   */
  async getNativeBalance(address) {
    if (!this.#isValidAddress(address)) {
      throw new Error(`Invalid Solana address: ${address}`);
    }

    const publicKey = new PublicKey(address);
    const lamports = await this.#connection.getBalance(publicKey);
    const balance = (lamports / LAMPORTS_PER_SOL).toString();
    console.log(`Balance for ${address}: ${balance} SOL`); 

    return {
      assetId: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      balance: balance,
      logoUri:
        'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
      type: 'native',
      chainId: this.#chainId,
      contractAddress: null,
    };
  }

  /**
   * Fetches the balances for a predefined list of SPL tokens.
   * @param {string} address - The main user wallet address to check.
   * @returns {Promise<Array<import('../types.js').AssetBalance>>} An array of token balances.
   */
  async getTokenBalances(address) {
    if (!this.#isValidAddress(address)) {
      throw new Error(`Invalid Solana address: ${address}`);
    }
    const ownerPublicKey = new PublicKey(address);

    // This is the key RPC call. We ask for all token accounts owned by the user's main address.
    const allTokenAccounts = await this.#connection.getParsedTokenAccountsByOwner(
      ownerPublicKey,
      {
        // We specify the program ID for the SPL Token Program. This filters the results
        // to only include accounts that are token accounts.
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      }
    );

    const tokenBalances = allTokenAccounts.value
      .map((accountInfo) => {
        // The parsed data contains the mint address and the balance.
        const parsedInfo = accountInfo.account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const balance = parsedInfo.tokenAmount.uiAmountString;

        // We only care about tokens that are in our whitelisted map.
        const tokenMetadata = tokenMap.get(mintAddress);
        if (!tokenMetadata) {
          return null; // This is not a token we track.
        }

        // We only return tokens the user actually has a balance of.
        if (parseFloat(balance) > 0) {
          // We normalize the Solana-specific data into our standard AssetBalance object.
          return {
            assetId: tokenMetadata.assetId,
            symbol: tokenMetadata.symbol,
            name: tokenMetadata.name,
            balance: balance,
            logoUri: tokenMetadata.logoUri,
            type: 'spl', // The token type for Solana is 'spl'.
            chainId: this.#chainId,
            contractAddress: mintAddress, // For SPL tokens, this is the "mint address".
          };
        }
        return null;
      })
      .filter((result) => result !== null); // Filter out any null entries.

    return tokenBalances;
  }

  /**
   * Closes the underlying Connection to free up resources.
   * @returns {Promise<void>}
   */
  async close() {
    // @solana/web3.js does not provide a direct close method.
    // Nullifying the connection releases the reference, relying on GC.
    this.#connection = null;
  }
}