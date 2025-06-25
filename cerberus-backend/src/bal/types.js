// src/bal/types.js

/**
 * A standardized object representing the balance of a single asset.
 * All chain connectors MUST return data in this format.
 * @typedef {object} AssetBalance
 * @property {string} assetId - A unique identifier for the asset (e.g., 'ethereum', 'chainlink', 'wrapped-solana').
 * @property {string} symbol - The common symbol for the asset (e.g., 'ETH', 'LINK', 'SOL').
 * @property {string} name - The full name of the asset (e.g., 'Ethereum', 'Chainlink').
 * @property {string} balance - The user's balance of this asset, formatted as a string to preserve precision.
 * @property {string} [value] - The calculated USD value of the user's balance (balance * price). Optional.
 * @property {string} [price] - The current market price of a single unit in USD. Optional.
 * @property {string} logoUri - A URI pointing to the asset's logo.
 * @property {'native' | 'erc20' | 'spl'} type - The token standard type.
 * @property {string} chainId - The identifier of the chain this asset is on (e.g., 'ethereum').
 * @property {string | null} contractAddress - The token's contract address, or null for native assets.
 */

// We export an empty object just to make this a valid module that can be imported.
// The real value is in the @typedef comment above, which our tools will read.
export const types = {};