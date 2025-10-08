import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setAuthToken } from './api';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('api utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('setAuthToken', () => {
    it('should set token in localStorage', () => {
      const token = 'test-token-123';
      setAuthToken(token);
      
      expect(localStorage.getItem('admin-token')).toBe(token);
    });

    it('should remove token when null is provided', () => {
      // First set a token
      localStorage.setItem('admin-token', 'existing-token');
      
      // Then remove it
      setAuthToken(null);
      
      expect(localStorage.getItem('admin-token')).toBeNull();
    });

    it('should update existing token', () => {
      const oldToken = 'old-token';
      const newToken = 'new-token';
      
      setAuthToken(oldToken);
      expect(localStorage.getItem('admin-token')).toBe(oldToken);
      
      setAuthToken(newToken);
      expect(localStorage.getItem('admin-token')).toBe(newToken);
    });

    it('should remove token when empty string is provided', () => {
      // First set a token
      localStorage.setItem('admin-token', 'existing-token');
      
      // Empty string is falsy, so it removes the token (same as null)
      setAuthToken('');
      const result = localStorage.getItem('admin-token');
      expect(result).toBeNull();
    });

    it('should handle long token strings', () => {
      const longToken = 'a'.repeat(1000);
      setAuthToken(longToken);
      expect(localStorage.getItem('admin-token')).toBe(longToken);
    });

    it('should handle special characters in token', () => {
      const specialToken = 'token-with-special-chars!@#$%^&*()';
      setAuthToken(specialToken);
      expect(localStorage.getItem('admin-token')).toBe(specialToken);
    });
  });

  describe('Token persistence', () => {
    it('should persist token across function calls', () => {
      const token = 'persistent-token';
      setAuthToken(token);
      
      // Simulate page interaction
      const retrieved = localStorage.getItem('admin-token');
      expect(retrieved).toBe(token);
    });

    it('should clear token completely when set to null', () => {
      setAuthToken('some-token');
      setAuthToken(null);
      
      expect(localStorage.getItem('admin-token')).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle login flow', () => {
      // No token initially
      expect(localStorage.getItem('admin-token')).toBeNull();
      
      // User logs in
      const loginToken = 'login-token-abc123';
      setAuthToken(loginToken);
      expect(localStorage.getItem('admin-token')).toBe(loginToken);
    });

    it('should handle logout flow', () => {
      // User is logged in
      setAuthToken('active-session-token');
      expect(localStorage.getItem('admin-token')).toBe('active-session-token');
      
      // User logs out
      setAuthToken(null);
      expect(localStorage.getItem('admin-token')).toBeNull();
    });

    it('should handle token refresh', () => {
      const oldToken = 'expired-token';
      const newToken = 'refreshed-token';
      
      setAuthToken(oldToken);
      expect(localStorage.getItem('admin-token')).toBe(oldToken);
      
      // Token refresh
      setAuthToken(newToken);
      expect(localStorage.getItem('admin-token')).toBe(newToken);
    });
  });
});

