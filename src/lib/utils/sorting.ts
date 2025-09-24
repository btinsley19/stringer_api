import { ParsedEvent } from '../types';

export type EventSortOption = 'posts_desc' | 'updated_desc' | 'alphabetical';

export interface SortConfig {
  field: EventSortOption;
  direction: 'asc' | 'desc';
}

/**
 * Sort events based on the specified criteria
 */
export function sortEvents(events: ParsedEvent[], sortOption: EventSortOption): ParsedEvent[] {
  const sortedEvents = [...events];
  
  switch (sortOption) {
    case 'posts_desc':
      return sortedEvents.sort((a, b) => b.posts_count - a.posts_count);
    
    case 'updated_desc':
      return sortedEvents.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    
    case 'alphabetical':
      return sortedEvents.sort((a, b) => a.event.localeCompare(b.event));
    
    default:
      return sortedEvents;
  }
}

/**
 * Get sort option display name
 */
export function getSortDisplayName(sortOption: EventSortOption): string {
  switch (sortOption) {
    case 'posts_desc':
      return 'Posts (High to Low)';
    case 'updated_desc':
      return 'Recently Updated';
    case 'alphabetical':
      return 'Alphabetical (A-Z)';
    default:
      return 'Default';
  }
}

/**
 * Get all available sort options
 */
export function getSortOptions(): Array<{ value: EventSortOption; label: string }> {
  return [
    { value: 'posts_desc', label: 'Posts (High to Low)' },
    { value: 'updated_desc', label: 'Recently Updated' },
    { value: 'alphabetical', label: 'Alphabetical (A-Z)' },
  ];
}
