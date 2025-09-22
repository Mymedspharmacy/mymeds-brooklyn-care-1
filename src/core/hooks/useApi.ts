// Custom Hook for API Operations
// Clean Architecture: Presentation Layer

import { useState, useCallback } from 'react';
import { ApiResponse } from '../types';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiFunction(...args);
      
      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null
        });
        return response.data;
      } else {
        const errorMessage = response.error || 'Operation failed';
        setState({
          data: null,
          loading: false,
          error: errorMessage
        });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage
      });
      return null;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Hook for paginated data
export interface UsePaginatedApiState<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

export interface UsePaginatedApiReturn<T> extends UsePaginatedApiState<T> {
  loadPage: (page: number, limit?: number) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function usePaginatedApi<T>(
  apiFunction: (page: number, limit: number) => Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>,
  initialPage: number = 1,
  initialLimit: number = 10
): UsePaginatedApiReturn<T> {
  const [state, setState] = useState<UsePaginatedApiState<T>>({
    data: [],
    total: 0,
    page: initialPage,
    limit: initialLimit,
    totalPages: 0,
    loading: false,
    error: null
  });

  const loadPage = useCallback(async (page: number, limit: number = state.limit) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiFunction(page, limit);
      setState({
        data: response.data,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [apiFunction, state.limit]);

  const refresh = useCallback(async () => {
    await loadPage(state.page, state.limit);
  }, [loadPage, state.page, state.limit]);

  const reset = useCallback(() => {
    setState({
      data: [],
      total: 0,
      page: initialPage,
      limit: initialLimit,
      totalPages: 0,
      loading: false,
      error: null
    });
  }, [initialPage, initialLimit]);

  return {
    ...state,
    loadPage,
    refresh,
    reset
  };
}
