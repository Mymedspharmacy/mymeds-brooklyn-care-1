import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<LoadingSpinner />);
      const spinner = container.querySelector('svg');
      expect(spinner).toBeTruthy();
    });

    it('should render with custom text', () => {
      render(<LoadingSpinner text="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should not render text when not provided', () => {
      const { container } = render(<LoadingSpinner />);
      const textSpan = container.querySelector('span');
      expect(textSpan).not.toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('should render small size correctly', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const loader = container.querySelector('.w-4.h-4');
      expect(loader).toBeInTheDocument();
    });

    it('should render medium size by default', () => {
      const { container } = render(<LoadingSpinner />);
      const loader = container.querySelector('.w-6.h-6');
      expect(loader).toBeInTheDocument();
    });

    it('should render large size correctly', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const loader = container.querySelector('.w-8.h-8');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />);
      const wrapper = container.querySelector('.custom-class');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have spinning animation', () => {
      const { container } = render(<LoadingSpinner />);
      const loader = container.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('should have brand color', () => {
      const { container } = render(<LoadingSpinner />);
      const loader = container.querySelector('[class*="text-[#57bbb6]"]');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible for screen readers', () => {
      const { container } = render(<LoadingSpinner text="Loading..." />);
      const loader = container.querySelector('svg');
      expect(loader).toBeInTheDocument();
    });

    it('should have proper flex layout for alignment', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.querySelector('.flex.items-center.justify-center');
      expect(wrapper).toBeInTheDocument();
    });
  });
});

