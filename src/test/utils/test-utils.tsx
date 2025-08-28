import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'CUSTOMER' as const,
  createdAt: new Date().toISOString(),
  ...overrides
});

export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 29.99,
  stock: 100,
  categoryId: 1,
  category: { name: 'Test Category' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockOrder = (overrides = {}) => ({
  id: 1,
  orderNumber: 'ORD-001',
  total: 29.99,
  status: 'pending',
  paymentStatus: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockAppointment = (overrides = {}) => ({
  id: 1,
  date: new Date().toISOString(),
  time: '10:00 AM',
  type: 'consultation',
  status: 'scheduled',
  createdAt: new Date().toISOString(),
  ...overrides
});

// Mock functions
export const mockConsoleError = () => {
  const originalError = console.error;
  const mockError = jest.fn();
  console.error = mockError;
  return {
    mockError,
    restore: () => {
      console.error = originalError;
    }
  };
};

export const mockConsoleWarn = () => {
  const originalWarn = console.warn;
  const mockWarn = jest.fn();
  console.warn = mockWarn;
  return {
    mockWarn,
    restore: () => {
      console.warn = originalWarn;
    }
  };
};

// Wait for async operations
export const waitForElementToBeRemoved = (element: Element | null) => {
  return new Promise<void>((resolve) => {
    if (!element) {
      resolve();
      return;
    }
    
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
};




