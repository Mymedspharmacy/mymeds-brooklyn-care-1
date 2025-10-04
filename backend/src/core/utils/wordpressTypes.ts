// WordPress specific type utilities
// Clean Architecture: Infrastructure Layer

export interface WordPressPostData {
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

export interface WordPressMediaData {
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

export interface WordPressCategoryData {
  id: number;
  name: string;
  count: number;
  description: string;
  slug: string;
}

// Type assertion utilities for WordPress data
export function assertWordPressPost(obj: unknown): WordPressPostData {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid WordPress post data');
  }
  
  const post = obj as Record<string, unknown>;
  
  return {
    id: Number(post.id) || 0,
    title: String(post.title || ''),
    content: String(post.content || ''),
    excerpt: String(post.excerpt || ''),
    status: String(post.status || ''),
    date: String(post.date || ''),
    modified: String(post.modified || ''),
    slug: String(post.slug || ''),
    link: String(post.link || ''),
    author: post.author ? Number(post.author) : undefined,
    featured_media: post.featured_media ? Number(post.featured_media) : undefined,
    categories: Array.isArray(post.categories) ? post.categories.map(Number) : undefined,
    tags: Array.isArray(post.tags) ? post.tags.map(Number) : undefined,
    _embedded: post._embedded as Record<string, unknown> || undefined,
  };
}

export function assertWordPressMedia(obj: unknown): WordPressMediaData {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid WordPress media data');
  }
  
  const media = obj as Record<string, unknown>;
  
  return {
    id: Number(media.id) || 0,
    title: String(media.title || ''),
    description: String(media.description || ''),
    caption: String(media.caption || ''),
    alt_text: String(media.alt_text || ''),
    media_type: String(media.media_type || ''),
    mime_type: String(media.mime_type || ''),
    source_url: String(media.source_url || ''),
    date: String(media.date || ''),
    modified: String(media.modified || ''),
    media_details: media.media_details as Record<string, unknown> || undefined,
  };
}

export function assertWordPressCategory(obj: unknown): WordPressCategoryData {
  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid WordPress category data');
  }
  
  const category = obj as Record<string, unknown>;
  
  return {
    id: Number(category.id) || 0,
    name: String(category.name || ''),
    count: Number(category.count) || 0,
    description: String(category.description || ''),
    slug: String(category.slug || ''),
  };
}

// Safe property access utilities
export function getPostProperty<T>(post: unknown, property: string, defaultValue: T): T {
  if (!post || typeof post !== 'object') {
    return defaultValue;
  }
  
  const postObj = post as Record<string, unknown>;
  return (postObj[property] as T) ?? defaultValue;
}

export function getMediaProperty<T>(media: unknown, property: string, defaultValue: T): T {
  if (!media || typeof media !== 'object') {
    return defaultValue;
  }
  
  const mediaObj = media as Record<string, unknown>;
  return (mediaObj[property] as T) ?? defaultValue;
}

export function getCategoryProperty<T>(category: unknown, property: string, defaultValue: T): T {
  if (!category || typeof category !== 'object') {
    return defaultValue;
  }
  
  const categoryObj = category as Record<string, unknown>;
  return (categoryObj[property] as T) ?? defaultValue;
}
