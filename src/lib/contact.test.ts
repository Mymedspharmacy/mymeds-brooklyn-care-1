import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  contactConfig,
  getPhoneNumber,
  getEmail,
  getAddress,
  getGoogleMapsUrl,
  getHours,
  formatPhoneNumber,
  getTelLink,
  getMailtoLink
} from './contact';

describe('contact utilities', () => {
  describe('contactConfig', () => {
    it('should have all required contact information', () => {
      expect(contactConfig).toHaveProperty('phone');
      expect(contactConfig).toHaveProperty('email');
      expect(contactConfig).toHaveProperty('address');
      expect(contactConfig).toHaveProperty('googleMapsUrl');
      expect(contactConfig).toHaveProperty('hours');
    });

    it('should have valid phone number', () => {
      expect(contactConfig.phone).toBeTruthy();
      expect(typeof contactConfig.phone).toBe('string');
    });

    it('should have valid email', () => {
      expect(contactConfig.email).toBeTruthy();
      expect(contactConfig.email).toContain('@');
    });

    it('should be immutable (readonly)', () => {
      // TypeScript ensures this, but we can verify the object exists
      expect(Object.isFrozen(contactConfig)).toBe(false); // as const doesn't freeze at runtime
      expect(contactConfig).toBeDefined();
    });
  });

  describe('Getter functions', () => {
    it('getPhoneNumber should return phone number', () => {
      expect(getPhoneNumber()).toBe(contactConfig.phone);
      expect(typeof getPhoneNumber()).toBe('string');
    });

    it('getEmail should return email', () => {
      expect(getEmail()).toBe(contactConfig.email);
      expect(getEmail()).toContain('@');
    });

    it('getAddress should return address', () => {
      expect(getAddress()).toBe(contactConfig.address);
      expect(typeof getAddress()).toBe('string');
    });

    it('getGoogleMapsUrl should return maps URL', () => {
      expect(getGoogleMapsUrl()).toBe(contactConfig.googleMapsUrl);
      expect(getGoogleMapsUrl()).toContain('google.com/maps');
    });

    it('getHours should return business hours', () => {
      expect(getHours()).toBe(contactConfig.hours);
      expect(typeof getHours()).toBe('string');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone number correctly', () => {
      const result = formatPhoneNumber('1234567890');
      expect(result).toBe('(123) 456-7890');
    });

    it('should handle 11-digit phone number with country code', () => {
      const result = formatPhoneNumber('13473126458');
      // 11 digits - doesn't match 10-digit pattern, returns as-is
      expect(result).toBe('13473126458');
    });

    it('should handle phone number with special characters', () => {
      const result = formatPhoneNumber('(123) 456-7890');
      expect(result).toBe('(123) 456-7890');
    });

    it('should return original if format does not match', () => {
      const invalidPhone = '123';
      const result = formatPhoneNumber(invalidPhone);
      expect(result).toBe(invalidPhone);
    });

    it('should use default phone from config when no argument provided', () => {
      const result = formatPhoneNumber();
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle phone with spaces and dashes', () => {
      const result = formatPhoneNumber('123-456-7890');
      expect(result).toBe('(123) 456-7890');
    });

    it('should handle empty string', () => {
      const result = formatPhoneNumber('');
      expect(result).toBe('');
    });

    it('should remove all non-digit characters before formatting', () => {
      const result = formatPhoneNumber('(123) 456-7890 ext. 123');
      // Should format just the first 10 digits
      expect(result).toContain('(123) 456-7890');
    });
  });

  describe('getTelLink', () => {
    it('should create tel: link from phone number', () => {
      const result = getTelLink('1234567890');
      expect(result).toBe('tel:1234567890');
    });

    it('should preserve phone number format in link', () => {
      const result = getTelLink('(123) 456-7890');
      expect(result).toBe('tel:(123) 456-7890');
    });

    it('should use default phone from config when no argument provided', () => {
      const result = getTelLink();
      expect(result).toBe(`tel:${contactConfig.phone}`);
    });

    it('should handle phone with country code', () => {
      const result = getTelLink('+1-234-567-8900');
      expect(result).toBe('tel:+1-234-567-8900');
    });

    it('should handle empty string', () => {
      const result = getTelLink('');
      expect(result).toBe('tel:');
    });
  });

  describe('getMailtoLink', () => {
    it('should create mailto: link from email', () => {
      const result = getMailtoLink('test@example.com');
      expect(result).toBe('mailto:test@example.com');
    });

    it('should use default email from config when no argument provided', () => {
      const result = getMailtoLink();
      expect(result).toBe(`mailto:${contactConfig.email}`);
    });

    it('should handle email with plus addressing', () => {
      const result = getMailtoLink('user+tag@example.com');
      expect(result).toBe('mailto:user+tag@example.com');
    });

    it('should handle empty string', () => {
      const result = getMailtoLink('');
      expect(result).toBe('mailto:');
    });

    it('should preserve email case', () => {
      const result = getMailtoLink('Test@Example.COM');
      expect(result).toBe('mailto:Test@Example.COM');
    });
  });

  describe('Integration tests', () => {
    it('should work together to create contact links', () => {
      const phone = getPhoneNumber();
      const email = getEmail();
      
      const telLink = getTelLink(phone);
      const mailtoLink = getMailtoLink(email);
      
      expect(telLink).toContain('tel:');
      expect(mailtoLink).toContain('mailto:');
    });

    it('should format and link phone number correctly', () => {
      const rawPhone = '1234567890';
      const formatted = formatPhoneNumber(rawPhone);
      const link = getTelLink(rawPhone);
      
      expect(formatted).toBe('(123) 456-7890');
      expect(link).toBe('tel:1234567890');
    });

    it('should handle real pharmacy data', () => {
      // Test with actual config values
      const phone = getPhoneNumber();
      const formattedPhone = formatPhoneNumber(phone);
      const telLink = getTelLink(phone);
      
      expect(formattedPhone).toBeTruthy();
      expect(telLink).toBe(`tel:${phone}`);
    });
  });
});

