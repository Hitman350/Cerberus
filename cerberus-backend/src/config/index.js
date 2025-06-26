// Path: src/config/index.js

// This file is responsible for loading and validating environment variables

import dotenv from 'dotenv';
import { z } from 'zod';

// Define a schema for your environment variables using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  ETHEREUM_RPC_URL: z.string().url().startsWith('https://'), // Validate ETHEREUM_RPC_URL
  SOLANA_RPC_URL: z.string().url().startsWith('https://'),
});

// Parse and validate the environment variables
const parseResult = envSchema.safeParse(process.env);

// If validation fails, log the errors and exit the process.
// This is a "fail-fast" approach, preventing the app from running with a bad config.
if (!parseResult.success) {
  console.error(
    'Invalid environment variables:',
    parseResult.error.flatten().fieldErrors
  );
  throw new Error('Invalid environment variables.');
}

// Export the validated and typed configuration object, making it immutable.
export const config = Object.freeze(parseResult.data);