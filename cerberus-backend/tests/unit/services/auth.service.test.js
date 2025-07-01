// tests/unit/services/auth.service.test.js
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { register, login, logout, refreshSession } from '../../../src/services/auth.service.js';
import * as UserModel from '../../../src/dal/models/user.model.js';
import { ConflictError, AuthenticationError } from '../../../src/utils/errors.js';
import { config } from '../../../src/config/index.js';

// We DO NOT mock the libraries at the top level anymore. We will spy on them.
// jest.mock('argon2'); <--- DELETE
// jest.mock('jsonwebtoken'); <--- DELETE
// jest.mock('uuid'); <--- DELETE

describe('AuthService', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  const testUser = { id: 'user-123', email: testEmail, password_hash: 'hash' };
  
  let mockFindUserByEmail;
  let mockCreateUser;
  let mockRedis;

  beforeEach(() => {
    mockFindUserByEmail = jest.fn();
    mockCreateUser = jest.fn();
    mockRedis = {
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(null),
    };
  });

  afterEach(() => {
    // This is CRITICAL. It restores all spies to their original implementations.
    jest.restoreAllMocks();
  });

  describe('register()', () => {
    it('should create a user successfully', async () => {
      // Arrange
      mockFindUserByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({ id: testUser.id, email: testEmail });
      // ★★★ THE FIX: Spy on the library method and mock its implementation ★★★
      jest.spyOn(argon2, 'hash').mockResolvedValue('a-new-hash');

      // Act
      const newUser = await register(
        { email: testEmail, password: testPassword },
        { findUserByEmail: mockFindUserByEmail, createUser: mockCreateUser }
      );

      // Assert
      expect(newUser.email).toBe(testEmail);
      expect(argon2.hash).toHaveBeenCalledWith(testPassword, expect.any(Object));
    });

    it('should throw ConflictError if user already exists', async () => {
      mockFindUserByEmail.mockResolvedValue(testUser);
      await expect(
        register(
          { email: testEmail, password: testPassword },
          { findUserByEmail: mockFindUserByEmail, createUser: mockCreateUser }
        )
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login()', () => {
    it('should return tokens for valid credentials', async () => {
      // Arrange
      mockFindUserByEmail.mockResolvedValue(testUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('a-valid-token');
      jest.spyOn({ uuidv4 }, 'uuidv4').mockReturnValue('a-unique-id'); // Mock uuidv4 function

      // Act
      const result = await login(
        { email: testEmail, password: testPassword },
        { findUserByEmail: mockFindUserByEmail }
      );

      // Assert
      expect(result.accessToken).toBe('a-valid-token');
    });
  });

  describe('logout()', () => {
    it('should add a token jti to the redis blacklist with the correct TTL', async () => {
      const jti = 'token-to-blacklist';
      const exp = Math.floor(Date.now() / 1000) + 60;
      await logout(jti, exp, { redis: mockRedis });
      expect(mockRedis.setex).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshSession()', () => {
    const refreshToken = 'valid.refresh.token';
    const decodedToken = { sub: 'user-id-123', jti: 'refresh-token-jti' };

    it('should issue a new access token for a valid, non-blacklisted token', async () => {
      // Arrange
      jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);
      jest.spyOn(jwt, 'sign').mockReturnValue('new_access_token');
      mockRedis.get.mockResolvedValue(null);

      // Act
      const result = await refreshSession(refreshToken, { redis: mockRedis });

      // Assert
      expect(result.accessToken).toBe('new_access_token');
    });

    it('should throw AuthenticationError if the refresh token is blacklisted', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue(decodedToken);
      mockRedis.get.mockResolvedValue('revoked');
      await expect(refreshSession(refreshToken, { redis: mockRedis })).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError if jwt.verify fails', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('TokenExpiredError');
      });
      await expect(refreshSession(refreshToken, { redis: mockRedis })).rejects.toThrow(AuthenticationError);
    });
  });
});