// WooCommerce specific type utilities
// Clean Architecture: Infrastructure Layer

export interface WooCommerceProductData {
  id: number;
  name: string;
  stock_quantity?: number;
  price?: string;
  category?: string;
  title?: string;
  src?: string;
  alt?: string;
  date?: string;
  modified?: string;
}

export interface WooCommerceOrderData {
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

export interface WooCommerceVariationData {
  id: number;
  name: string;
  stock_quantity?: number;
}

// Type assertion utilities for WooCommerce data
export function assertWooCommerceProduct(obj: unknown): WooCommerceProductData {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid product data');
  }
  
  const product = obj as Record<string, unknown>;
  
  return {
    id: Number(product.id) || 0,
    name: String(product.name || ''),
    stock_quantity: product.stock_quantity ? Number(product.stock_quantity) : undefined,
    price: product.price ? String(product.price) : undefined,
    category: product.category ? String(product.category) : undefined,
    title: product.title ? String(product.title) : undefined,
    src: product.src ? String(product.src) : undefined,
    alt: product.alt ? String(product.alt) : undefined,
    date: product.date ? String(product.date) : undefined,
    modified: product.modified ? String(product.modified) : undefined,
  };
}

export function assertWooCommerceOrder(obj: unknown): WooCommerceOrderData {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid order data');
  }
  
  const order = obj as Record<string, unknown>;
  
  return {
    id: Number(order.id) || 0,
    number: String(order.number || ''),
    status: String(order.status || ''),
    total: String(order.total || ''),
    currency: String(order.currency || ''),
    customer_id: Number(order.customer_id) || 0,
    billing: (order.billing as Record<string, unknown>) || {},
    shipping: (order.shipping as Record<string, unknown>) || {},
    line_items: Array.isArray(order.line_items) ? order.line_items : [],
    payment_method: String(order.payment_method || ''),
    payment_method_title: String(order.payment_method_title || ''),
    date_created: String(order.date_created || ''),
    date_modified: String(order.date_modified || ''),
    customer_note: String(order.customer_note || ''),
    meta_data: Array.isArray(order.meta_data) ? order.meta_data : [],
  };
}

export function assertWooCommerceVariation(obj: unknown): WooCommerceVariationData {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid variation data');
  }
  
  const variation = obj as Record<string, unknown>;
  
  return {
    id: Number(variation.id) || 0,
    name: String(variation.name || ''),
    stock_quantity: variation.stock_quantity ? Number(variation.stock_quantity) : undefined,
  };
}

// Safe property access utilities
export function getProductProperty<T>(product: unknown, property: string, defaultValue: T): T {
  if (!product || typeof product !== 'object') {
    return defaultValue;
  }
  
  const productObj = product as Record<string, unknown>;
  return (productObj[property] as T) ?? defaultValue;
}

export function getOrderProperty<T>(order: unknown, property: string, defaultValue: T): T {
  if (!order || typeof order !== 'object') {
    return defaultValue;
  }
  
  const orderObj = order as Record<string, unknown>;
  return (orderObj[property] as T) ?? defaultValue;
}

export function getVariationProperty<T>(variation: unknown, property: string, defaultValue: T): T {
  if (!variation || typeof variation !== 'object') {
    return defaultValue;
  }
  
  const variationObj = variation as Record<string, unknown>;
  return (variationObj[property] as T) ?? defaultValue;
}
