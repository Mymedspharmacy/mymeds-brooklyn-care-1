// Type Guards for handling unknown types
// Clean Architecture: Infrastructure Layer

export interface ErrorWithMessage {
  message: string;
  code?: string;
  name?: string;
  errors?: unknown[];
}

export interface ErrorWithCode {
  code: string;
  message?: string;
  name?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  stock_quantity?: number;
  price?: string;
  category?: string;
}

export interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  customer_id: number;
  billing: Record<string, unknown>;
  shipping: Record<string, unknown>;
  line_items: unknown[];
  payment_method: string;
  payment_method_title: string;
  date_created: string;
  date_modified: string;
  customer_note: string;
  meta_data: unknown[];
}

export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  date: string;
  modified: string;
  slug: string;
  link: string;
  author?: number;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
  _embedded?: Record<string, unknown>;
}

export interface WordPressMedia {
  id: number;
  title: string;
  description: string;
  caption: string;
  alt_text: string;
  media_type: string;
  mime_type: string;
  source_url: string;
  date: string;
  modified: string;
  media_details?: Record<string, unknown>;
}

export interface WordPressCategory {
  id: number;
  name: string;
  count: number;
  description: string;
  slug: string;
}

export interface OpenFDASearchResult {
  meta: Record<string, unknown>;
  results: unknown[];
}

export interface OpenFDADrug {
  openfda: Record<string, unknown>;
  products: unknown[];
}

export interface ValidationError {
  name: string;
  errors: unknown[];
}

// Type Guards
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorWithMessage).message === 'string'
  );
}

export function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as ErrorWithCode).code === 'string'
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    'errors' in error &&
    typeof (error as ValidationError).name === 'string' &&
    Array.isArray((error as ValidationError).errors)
  );
}

export function isWooCommerceProduct(obj: unknown): obj is WooCommerceProduct {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as WooCommerceProduct).id === 'number' &&
    typeof (obj as WooCommerceProduct).name === 'string'
  );
}

export function isWooCommerceOrder(obj: unknown): obj is WooCommerceOrder {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'number' in obj &&
    'status' in obj &&
    'total' in obj &&
    'currency' in obj
  );
}

export function isWordPressPost(obj: unknown): obj is WordPressPost {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'content' in obj &&
    'status' in obj
  );
}

export function isWordPressMedia(obj: unknown): obj is WordPressMedia {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'media_type' in obj &&
    'mime_type' in obj
  );
}

export function isWordPressCategory(obj: unknown): obj is WordPressCategory {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'count' in obj &&
    'slug' in obj
  );
}

export function isOpenFDASearchResult(obj: unknown): obj is OpenFDASearchResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'meta' in obj &&
    'results' in obj &&
    Array.isArray((obj as OpenFDASearchResult).results)
  );
}

export function isOpenFDADrug(obj: unknown): obj is OpenFDADrug {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'openfda' in obj &&
    'products' in obj
  );
}

export function isApiResponse<T = unknown>(obj: unknown): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('data' in obj || 'message' in obj || 'error' in obj || 'status' in obj)
  );
}

export function hasProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    prop in obj
  );
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
