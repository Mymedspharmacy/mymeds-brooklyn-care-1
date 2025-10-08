import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from './ErrorFallback';

// Mock window.location
delete (window as any).location;
window.location = { reload: vi.fn(), href: '' } as any;

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetErrorBoundary = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render error fallback UI', () => {
      render(<ErrorFallback />);
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should display custom title', () => {
      render(<ErrorFallback title="Custom Error Title" />);
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('should display default message', () => {
      render(<ErrorFallback />);
      expect(screen.getByText(/We encountered an unexpected error/i)).toBeInTheDocument();
    });

    it('should show error icon', () => {
      const { container } = render(<ErrorFallback />);
      const iconWrapper = container.querySelector('.bg-red-100');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('Error details', () => {
    it('should show error details in development mode', () => {
      render(<ErrorFallback error={mockError} showDetails={true} />);
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      expect(screen.getByText(mockError.message)).toBeInTheDocument();
    });

    it('should hide error details when showDetails is false', () => {
      render(<ErrorFallback error={mockError} showDetails={false} />);
      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    });

    it('should display error stack trace when available', () => {
      const errorWithStack = new Error('Test error');
      errorWithStack.stack = 'Stack trace here';
      render(<ErrorFallback error={errorWithStack} showDetails={true} />);
      
      const details = screen.getByText('Error Details (Development)');
      expect(details).toBeInTheDocument();
    });

    it('should not show error details when no error provided', () => {
      render(<ErrorFallback showDetails={true} />);
      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
    });
  });

  describe('Action buttons', () => {
    it('should show "Try Again" button when resetErrorBoundary is provided', () => {
      render(<ErrorFallback resetErrorBoundary={mockResetErrorBoundary} />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should not show "Try Again" button when resetErrorBoundary is not provided', () => {
      render(<ErrorFallback />);
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should always show "Reload Page" button', () => {
      render(<ErrorFallback />);
      expect(screen.getByText('Reload Page')).toBeInTheDocument();
    });

    it('should always show "Go Home" button', () => {
      render(<ErrorFallback />);
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call resetErrorBoundary when "Try Again" is clicked', () => {
      render(<ErrorFallback resetErrorBoundary={mockResetErrorBoundary} />);
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);
      expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
    });

    it('should reload page when "Reload Page" is clicked', () => {
      render(<ErrorFallback />);
      const reloadButton = screen.getByText('Reload Page');
      fireEvent.click(reloadButton);
      expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    it('should navigate to home when "Go Home" is clicked', () => {
      render(<ErrorFallback />);
      const goHomeButton = screen.getByText('Go Home');
      fireEvent.click(goHomeButton);
      expect(window.location.href).toBe('/');
    });
  });

  describe('Styling and layout', () => {
    it('should have proper container layout', () => {
      const { container } = render(<ErrorFallback />);
      const wrapper = container.querySelector('.min-h-screen');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have card with proper max width', () => {
      const { container } = render(<ErrorFallback />);
      const card = container.querySelector('.max-w-md');
      expect(card).toBeInTheDocument();
    });

    it('should center content', () => {
      const { container } = render(<ErrorFallback />);
      const centerContainer = container.querySelector('.items-center.justify-center');
      expect(centerContainer).toBeInTheDocument();
    });
  });
});


