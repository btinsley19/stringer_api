// Core data interfaces matching the Stringer API

export interface Event {
  id: string;
  event: string;
  description: string | null;
  headline_highlights: string[];
  tags: string; // Stringified set: "{\"tag1\",\"tag2\"}"
  category: string[];
  summary: string[];
  image: string | null;
  sub_event_id: string | null;
  super_event_id: string | null;
  posts_count: number;
  view_count: number;
  location: string;
  location_geom: string | null;
  created_at: string;
  updated_at: string;
  source_name: string;
  source_website_url: string | null;
}

export interface Post {
  id: string;
  user_id: string;
  media: string | null;
  media_type: "photo" | "video" | null;
  title: string;
  body: string;
  location: string | null;
  date_occurred: string | null;
  user_involved: boolean;
  event: string | null; // Linked event ID
  bias_score: string;
  embeddings_id: string;
  created_at: string;
  updated_at: string;
  location_is_address: boolean;
  external_source: boolean;
  source_url: string | null;
  source_id: string;
  external_url: string | null;
  location_geom: string | null;
  formatted_address: string | null;
  bias_score_sentences: string[];
  bias_score_sentence_scores: number[];
  organization: string | null;
  category: string | null;
  processed: boolean;
  bias_labels: string[];
  paragraph_time_indexes: any | null;
  bias_label_percentages: number[];
  content_html: string | null;
  content_json: any | null;
  embedded_images: any | null;
  content_version: number;
  authors: string[] | null;
}

// API response wrapper
export interface ApiResponse<T> {
  status: number;
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Global filter state
export interface GlobalFilters {
  search: string;
  categories: string[];
  minPosts: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  tags: string[];
  eventId?: string; // For filtering posts by specific event
}

// Chart data interfaces
export interface TopEventData {
  event: string;
  posts_count: number;
  id: string;
}

export interface CategoryData {
  category: string;
  count: number;
}

export interface TagData {
  tag: string;
  count: number;
}

export interface ActivityData {
  date: string;
  count: number;
}

// Source aggregation
export interface SourceData {
  source_name: string;
  event_count: number;
  post_count: number;
}

// Parsed event with processed tags
export interface ParsedEvent extends Event {
  parsedTags: string[];
}

// Parsed post with processed data
export interface ParsedPost extends Post {
  hasMedia: boolean;
  isLinked: boolean;
}

// API configuration
export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

// Loading and error states
export interface DataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: string | null;
}
