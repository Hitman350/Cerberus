// src/services/auth.service.js
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { ConflictError, AuthenticationError } from '../utils/errors.js';

// --- User Registration ---
export async function register(
  { email, password },
  // We are "injecting" our dependencies here.
  { findUserByEmail, createUser }
) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('A user with this email address already exists.');
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const newUser = await createUser(email, passwordHash);
  return newUser;
}

// --- User Login ---
export async function login({ email, password }, { findUserByEmail }) {
  const user = await findUserByEmail(email);
  if (!user) { throw new AuthenticationError('Invalid email or password.'); }

  const isPasswordValid = await argon2.verify(user.password_hash, password);
  if (!isPasswordValid) { throw new AuthenticationError('Invalid email or password.'); }

  const accessTokenId = uuidv4();
  const refreshTokenId = uuidv4();
  const accessTokenPayload = { sub: user.id, jti: accessTokenId };
  const refreshTokenPayload = { sub: user.id, jti: refreshTokenId };

  const accessToken = jwt.sign(accessTokenPayload, config.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(refreshTokenPayload, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  const userResponse = { id: user.id, email: user.email };
  return { accessToken, refreshToken, user: userResponse };
}

// --- Session Management ---
export async function logout(jti, exp, { redis }) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const ttl = exp - nowInSeconds;
  if (ttl > 0) {
    await redis.setex(`blacklist:${jti}`, ttl, 'revoked');
  }
}

export async function refreshSession(token, { redis }) {
  try {
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    const isBlacklisted = await redis.get(`blacklist:${decoded.jti}`);
    if (isBlacklisted) { throw new AuthenticationError('Token has been revoked.'); }

    const newAccessTokenId = uuidv4();
    const accessTokenPayload = { sub: decoded.sub, jti: newAccessTokenId };
    const newAccessToken = jwt.sign(accessTokenPayload, config.JWT_SECRET, { expiresIn: '15m' });

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token.');
  }
}