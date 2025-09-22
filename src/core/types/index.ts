// Core Type Definitions
// Clean Architecture: Domain Layer

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER' | 'PATIENT';
  phone?: string;
  permissions?: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  sku?: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: number;
  userId: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: OrderItem[];
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Form Types
export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  preferredContact: 'email' | 'phone';
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  serviceType: string;
  bestTimeToContact: string;
  agreeToTerms: boolean;
  allowMarketing: boolean;
}

export interface AppointmentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
  agreeToTerms: boolean;
}

// Notification Types
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: string;
  createdAt: string;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: string;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}
