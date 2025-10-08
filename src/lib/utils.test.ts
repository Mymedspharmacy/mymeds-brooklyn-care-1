import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn (classnames utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4', 'py-2');
      expect(result).toBeTruthy();
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', false && 'conditional-class');
      expect(result).toBe('base-class');
    });

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should merge conflicting tailwind classes', () => {
      // The cn function uses tailwind-merge to handle conflicts
      const result = cn('px-2', 'px-4');
      // Should keep only px-4 (the last one)
      expect(result).toBe('px-4');
    });
  });
});


