import { Event, Post, ApiResponse } from '../types';

// Data validation utilities

/**
 * Validate event data structure
 */
export function validateEvent(event: any): event is Event {
  if (!event || typeof event !== 'object') {
    return false;
  }

  const requiredFields = [
    'id', 'event', 'headline_highlights', 'tags', 'category', 
    'summary', 'posts_count', 'view_count', 'location', 
    'created_at', 'updated_at', 'source_name'
  ];

  for (const field of requiredFields) {
    if (!(field in event)) {
      console.warn(`Event missing required field: ${field}`);
      return false;
    }
  }

  // Type checks
  if (typeof event.id !== 'string' || event.id.length === 0) {
    console.warn('Event ID must be a non-empty string');
    return false;
  }

  if (typeof event.event !== 'string' || event.event.length === 0) {
    console.warn('Event title must be a non-empty string');
    return false;
  }

  if (!Array.isArray(event.headline_highlights)) {
    console.warn('Event headline_highlights must be an array');
    return false;
  }

  if (typeof event.tags !== 'string') {
    console.warn('Event tags must be a string');
    return false;
  }

  if (!Array.isArray(event.category)) {
    console.warn('Event category must be an array');
    return false;
  }

  if (!Array.isArray(event.summary)) {
    console.warn('Event summary must be an array');
    return false;
  }

  if (typeof event.posts_count !== 'number' || event.posts_count < 0) {
    console.warn('Event posts_count must be a non-negative number');
    return false;
  }

  if (typeof event.view_count !== 'number' || event.view_count < 0) {
    console.warn('Event view_count must be a non-negative number');
    return false;
  }

  if (typeof event.location !== 'string') {
    console.warn('Event location must be a string');
    return false;
  }

  if (typeof event.source_name !== 'string' || event.source_name.length === 0) {
    console.warn('Event source_name must be a non-empty string');
    return false;
  }

  // Date validation
  if (!isValidDate(event.created_at)) {
    console.warn('Event created_at must be a valid ISO date string');
    return false;
  }

  if (!isValidDate(event.updated_at)) {
    console.warn('Event updated_at must be a valid ISO date string');
    return false;
  }

  return true;
}

/**
 * Validate post data structure
 */
export function validatePost(post: any): post is Post {
  if (!post || typeof post !== 'object') {
    return false;
  }

  const requiredFields = [
    'id', 'title', 'body', 'created_at', 'updated_at'
  ];

  for (const field of requiredFields) {
    if (!(field in post)) {
      console.warn(`Post missing required field: ${field}`);
      return false;
    }
  }

  // Type checks
  if (typeof post.id !== 'string' || post.id.length === 0) {
    console.warn('Post ID must be a non-empty string');
    return false;
  }

  if (typeof post.title !== 'string' || post.title.length === 0) {
    console.warn('Post title must be a non-empty string');
    return false;
  }

  if (typeof post.body !== 'string') {
    console.warn('Post body must be a string');
    return false;
  }

  // Optional fields validation
  if (post.media_type && !['photo', 'video'].includes(post.media_type)) {
    console.warn('Post media_type must be "photo", "video", or null');
    return false;
  }

  if (post.category && typeof post.category !== 'string') {
    console.warn('Post category must be a string or null');
    return false;
  }

  if (post.event && typeof post.event !== 'string') {
    console.warn('Post event must be a string or null');
    return false;
  }

  // Date validation
  if (!isValidDate(post.created_at)) {
    console.warn('Post created_at must be a valid ISO date string');
    return false;
  }

  if (!isValidDate(post.updated_at)) {
    console.warn('Post updated_at must be a valid ISO date string');
    return false;
  }

  if (post.date_occurred && !isValidDate(post.date_occurred)) {
    console.warn('Post date_occurred must be a valid ISO date string or null');
    return false;
  }

  return true;
}

/**
 * Validate API response structure
 */
export function validateApiResponse<T>(response: any): response is ApiResponse<T> {
  if (!response || typeof response !== 'object') {
    return false;
  }

  if (typeof response.status !== 'number') {
    console.warn('API response status must be a number');
    return false;
  }

  if (!Array.isArray(response.data)) {
    console.warn('API response data must be an array');
    return false;
  }

  if (typeof response.hasMore !== 'boolean') {
    console.warn('API response hasMore must be a boolean');
    return false;
  }

  if (response.nextCursor !== null && typeof response.nextCursor !== 'string') {
    console.warn('API response nextCursor must be a string or null');
    return false;
  }

  return true;
}

/**
 * Validate and sanitize event data
 */
export function sanitizeEvent(event: any): Event | null {
  if (!validateEvent(event)) {
    return null;
  }

  return {
    id: event.id.trim(),
    event: event.event.trim(),
    description: event.description ? event.description.trim() : null,
    headline_highlights: Array.isArray(event.headline_highlights) 
      ? event.headline_highlights.map((h: any) => String(h).trim()).filter(Boolean)
      : [],
    tags: event.tags.trim(),
    category: Array.isArray(event.category) 
      ? event.category.map((c: any) => String(c).trim()).filter(Boolean)
      : [],
    summary: Array.isArray(event.summary) 
      ? event.summary.map((s: any) => String(s).trim()).filter(Boolean)
      : [],
    image: event.image ? event.image.trim() : null,
    sub_event_id: event.sub_event_id ? event.sub_event_id.trim() : null,
    super_event_id: event.super_event_id ? event.super_event_id.trim() : null,
    posts_count: Math.max(0, Number(event.posts_count) || 0),
    view_count: Math.max(0, Number(event.view_count) || 0),
    location: event.location.trim(),
    location_geom: event.location_geom ? event.location_geom.trim() : null,
    created_at: event.created_at,
    updated_at: event.updated_at,
    source_name: event.source_name.trim(),
    source_website_url: event.source_website_url ? event.source_website_url.trim() : null,
  };
}

/**
 * Validate and sanitize post data
 */
export function sanitizePost(post: any): Post | null {
  if (!validatePost(post)) {
    return null;
  }

  return {
    id: post.id.trim(),
    title: post.title.trim(),
    body: post.body.trim(),
    media: post.media ? post.media.trim() : null,
    media_type: post.media_type || null,
    location: post.location ? post.location.trim() : null,
    date_occurred: post.date_occurred || null,
    created_at: post.created_at,
    updated_at: post.updated_at,
    source_url: post.source_url ? post.source_url.trim() : null,
    external_url: post.external_url ? post.external_url.trim() : null,
    category: post.category ? post.category.trim() : null,
    event: post.event ? post.event.trim() : null,
  };
}

/**
 * Validate and sanitize API response
 */
export function sanitizeApiResponse<T>(
  response: any, 
  itemValidator: (item: any) => T | null
): ApiResponse<T> | null {
  if (!validateApiResponse(response)) {
    return null;
  }

  const sanitizedData = response.data
    .map(itemValidator)
    .filter((item): item is T => item !== null);

  return {
    status: response.status,
    data: sanitizedData,
    nextCursor: response.nextCursor,
    hasMore: response.hasMore,
  };
}

/**
 * Check if a string is a valid ISO date
 */
function isValidDate(dateString: string): boolean {
  if (typeof dateString !== 'string') {
    return false;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Handle dates with and without milliseconds
  const isoString = date.toISOString();
  const withoutMs = isoString.replace('.000', '');
  
  return isoString === dateString || withoutMs === dateString;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') {
    return '';
  }

  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 100); // Limit length
}
