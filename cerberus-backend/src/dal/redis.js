// src/dal/redis.js
import Redis from 'ioredis';
import { config } from '../config/index.js';

// Create a new Redis client instance using the REDIS_URL from our config.
// `ioredis` is a robust client with built-in support for retries and other features.
const redisClient = new Redis(config.REDIS_URL, {
  // A modern best practice: enable lazy connection.
  // The client will only attempt to connect when a command is first issued,
  // rather than immediately on instantiation.
  lazyConnect: true,
  // Recommended: Set a max number of retries to prevent infinite loops.
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  console.log('Connected to Redis!');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// We default export the client instance so it can be used as a singleton
// throughout our application.
export default redisClient;