import { describe, it, expect } from 'vitest';
import { isApiError, getErrorMessage, getErrorStatus } from './errorUtils';

describe('errorUtils', () => {
  describe('isApiError', () => {
    it('should return true for valid API error', () => {
      const error = {
        response: {
          data: { error: 'Something went wrong' },
          status: 400
        }
      };
      expect(isApiError(error)).toBe(true);
    });

    it('should return true for error with message', () => {
      const error = { message: 'Error message' };
      expect(isApiError(error)).toBe(true);
    });

    it('should return true for error with both response and message', () => {
      const error = {
        message: 'Error message',
        response: { status: 500 }
      };
      expect(isApiError(error)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isApiError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isApiError(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isApiError('error string')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isApiError(42)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(isApiError({})).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract error message from response data', () => {
      const error = {
        response: {
          data: { error: 'API error message' }
        }
      };
      expect(getErrorMessage(error)).toBe('API error message');
    });

    it('should extract error message from message property', () => {
      const error = { message: 'Direct error message' };
      expect(getErrorMessage(error)).toBe('Direct error message');
    });

    it('should prioritize response.data.error over message', () => {
      const error = {
        response: {
          data: { error: 'Response error' }
        },
        message: 'Message error'
      };
      expect(getErrorMessage(error)).toBe('Response error');
    });

    it('should handle Error instances', () => {
      const error = new Error('Standard error');
      expect(getErrorMessage(error)).toBe('Standard error');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage('string error')).toBe('An error occurred');
      expect(getErrorMessage(123)).toBe('An error occurred');
      expect(getErrorMessage(null)).toBe('An error occurred');
    });

    it('should use custom default message', () => {
      const customDefault = 'Custom default message';
      expect(getErrorMessage(null, customDefault)).toBe(customDefault);
      expect(getErrorMessage({}, customDefault)).toBe(customDefault);
    });

    it('should handle partial API error structure', () => {
      const error = {
        response: {
          data: {}
        },
        message: 'Fallback message'
      };
      expect(getErrorMessage(error)).toBe('Fallback message');
    });

    it('should handle empty response data', () => {
      const error = {
        response: {
          data: { error: '' }
        },
        message: 'Fallback message'
      };
      expect(getErrorMessage(error)).toBe('Fallback message');
    });
  });

  describe('getErrorStatus', () => {
    it('should extract status code from API error', () => {
      const error = {
        response: {
          status: 404
        }
      };
      expect(getErrorStatus(error)).toBe(404);
    });

    it('should handle different status codes', () => {
      const testCases = [400, 401, 403, 404, 500, 502, 503];
      testCases.forEach(status => {
        const error = { response: { status } };
        expect(getErrorStatus(error)).toBe(status);
      });
    });

    it('should return undefined for non-API errors', () => {
      expect(getErrorStatus(new Error('Standard error'))).toBeUndefined();
      expect(getErrorStatus('string')).toBeUndefined();
      expect(getErrorStatus(null)).toBeUndefined();
      expect(getErrorStatus({})).toBeUndefined();
    });

    it('should return undefined when status is missing', () => {
      const error = {
        response: {
          data: { error: 'No status' }
        }
      };
      expect(getErrorStatus(error)).toBeUndefined();
    });

    it('should handle error with message but no response', () => {
      const error = { message: 'Error without response' };
      expect(getErrorStatus(error)).toBeUndefined();
    });
  });

  describe('Integration tests', () => {
    it('should handle typical axios error', () => {
      const axiosError = {
        response: {
          data: { error: 'Resource not found' },
          status: 404
        },
        message: 'Request failed with status code 404'
      };

      expect(isApiError(axiosError)).toBe(true);
      expect(getErrorMessage(axiosError)).toBe('Resource not found');
      expect(getErrorStatus(axiosError)).toBe(404);
    });

    it('should handle network error', () => {
      const networkError = {
        message: 'Network Error',
        code: 'ERR_NETWORK'
      };

      expect(isApiError(networkError)).toBe(true);
      expect(getErrorMessage(networkError)).toBe('Network Error');
      expect(getErrorStatus(networkError)).toBeUndefined();
    });

    it('should handle timeout error', () => {
      const timeoutError = {
        message: 'timeout of 5000ms exceeded',
        code: 'ECONNABORTED'
      };

      expect(isApiError(timeoutError)).toBe(true);
      expect(getErrorMessage(timeoutError)).toBe('timeout of 5000ms exceeded');
      expect(getErrorStatus(timeoutError)).toBeUndefined();
    });
  });
});


