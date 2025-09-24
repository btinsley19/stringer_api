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
 * Create source aggregation data
 */
export function createSourceData(events: Event[], posts: Post[]): Array<{
  source_name: string;
  event_count: number;
  post_count: number;
}> {
  const eventCounts: Record<string, number> = {};
  const postCounts: Record<string, number> = {};

  // Count events by source
  events.forEach(event => {
    eventCounts[event.source_name] = (eventCounts[event.source_name] || 0) + 1;
  });

  // Count posts by source (if we have source info in posts)
  posts.forEach(post => {
    // Note: posts might not have source_name, so we'll use a placeholder
    // This would need to be adjusted based on actual post data structure
    const source = 'Unknown Source'; // Placeholder
    postCounts[source] = (postCounts[source] || 0) + 1;
  });

  const allSources = new Set([...Object.keys(eventCounts), ...Object.keys(postCounts)]);

  return Array.from(allSources).map(source => ({
    source_name: source,
    event_count: eventCounts[source] || 0,
    post_count: postCounts[source] || 0
  })).sort((a, b) => b.event_count - a.event_count);
}
