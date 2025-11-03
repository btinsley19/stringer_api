import { Event, Post, GlobalFilters, ParsedEvent, ParsedPost } from '../types';

/**
 * Filter events based on global filters
 */
export function filterEvents(events: ParsedEvent[], filters: GlobalFilters): ParsedEvent[] {
  return events.filter(event => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        event.event,
        event.description || '',
        event.location,
        event.source_name,
        ...event.category,
        ...event.parsedTags
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (filters.categories.length > 0) {
      const hasMatchingCategory = event.category.some(cat => 
        filters.categories.includes(cat)
      );
      if (!hasMatchingCategory) {
        return false;
      }
    }

    // Min posts filter
    if (filters.minPosts > 0 && event.posts_count < filters.minPosts) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const eventDate = new Date(event.updated_at);
      
      if (filters.dateRange.start && eventDate < filters.dateRange.start) {
        return false;
      }
      
      if (filters.dateRange.end && eventDate > filters.dateRange.end) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = event.parsedTags.some(tag => 
        filters.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Event ID filter (for posts)
    if (filters.eventId && event.id !== filters.eventId) {
      return false;
    }

    return true;
  });
}

/**
 * Filter posts based on filters
 */
export function filterPosts(posts: ParsedPost[], filters: {
  search?: string;
  category?: string[];
  hasMedia?: boolean | null;
  isLinked?: boolean | null;
  dateRange?: { start: Date | null; end: Date | null };
  eventId?: string;
}): ParsedPost[] {
  return posts.filter(post => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        post.title,
        post.body,
        post.location || '',
        post.category || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Category filter
    if (filters.category && filters.category.length > 0 && post.category) {
      if (!filters.category.includes(post.category)) {
        return false;
      }
    }

    // Media filter
    if (filters.hasMedia !== null && filters.hasMedia !== undefined) {
      if (post.hasMedia !== filters.hasMedia) {
        return false;
      }
    }

    // Linked filter
    if (filters.isLinked !== null && filters.isLinked !== undefined) {
      if (post.isLinked !== filters.isLinked) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const postDate = new Date(post.date_occurred || post.created_at);
      
      if (filters.dateRange.start && postDate < filters.dateRange.start) {
        return false;
      }
      
      if (filters.dateRange.end && postDate > filters.dateRange.end) {
        return false;
      }
    }

    // Event ID filter
    if (filters.eventId && post.event !== filters.eventId) {
      return false;
    }

    return true;
  });
}

/**
 * Get all unique categories from events
 */
export function getAllCategories(events: ParsedEvent[]): string[] {
  const allCategories = events.flatMap(event => event.category);
  return [...new Set(allCategories)].sort();
}

/**
 * Get all unique sources from events
 */
export function getAllSources(events: Event[]): string[] {
  const allSources = events.map(event => event.source_name);
  return [...new Set(allSources)].sort();
}


/**
 * Normalize source URL to a consistent format
 */
function normalizeSourceUrl(sourceUrl: string | null | undefined): string {
  if (!sourceUrl) return 'Unknown Source';
  
  // Remove protocol and www, extract just the domain
  const cleaned = sourceUrl
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0] // Get just the domain part
    .toLowerCase()
    .trim();
  
  return cleaned || 'Unknown Source';
}

/**
 * Create source aggregation data with bias analytics
 */
export function createSourceData(events: Event[], posts: Post[]): Array<{
  source_name: string;
  event_count: number;
  post_count: number;
  average_bias_score: number;
  bias_label_counts: Record<string, number>;
  bias_labels: string[];
}> {
  const eventCounts: Record<string, number> = {};
  const postCounts: Record<string, number> = {};
  const biasScores: Record<string, number[]> = {};
  const biasLabelCounts: Record<string, Record<string, number>> = {};

  // Count events by source
  events.forEach(event => {
    eventCounts[event.source_name] = (eventCounts[event.source_name] || 0) + 1;
  });

  // Count posts by source and aggregate bias data
  posts.forEach(post => {
    const source = normalizeSourceUrl(post.source_url);
    postCounts[source] = (postCounts[source] || 0) + 1;
    
    // Aggregate bias scores
    if (post.bias_score) {
      const score = parseFloat(post.bias_score);
      if (!isNaN(score)) {
        if (!biasScores[source]) {
          biasScores[source] = [];
        }
        biasScores[source].push(score);
      }
    }
    
    // Aggregate bias labels
    if (post.bias_labels && Array.isArray(post.bias_labels) && post.bias_labels.length > 0) {
      if (!biasLabelCounts[source]) {
        biasLabelCounts[source] = {};
      }
      post.bias_labels.forEach(label => {
        biasLabelCounts[source][label] = (biasLabelCounts[source][label] || 0) + 1;
      });
    }
  });

  const allSources = new Set([...Object.keys(eventCounts), ...Object.keys(postCounts)]);

  return Array.from(allSources).map(source => {
    const scores = biasScores[source] || [];
    const avgBiasScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;
    
    const labelCounts = biasLabelCounts[source] || {};
    
    // Get unique labels sorted by frequency
    const uniqueLabels = Object.keys(labelCounts).sort((a, b) => 
      labelCounts[b] - labelCounts[a]
    );

    return {
      source_name: source,
      event_count: eventCounts[source] || 0,
      post_count: postCounts[source] || 0,
      average_bias_score: avgBiasScore,
      bias_label_counts: labelCounts,
      bias_labels: uniqueLabels
    };
  }).sort((a, b) => b.post_count - a.post_count);
}
