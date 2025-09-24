import { Event, ParsedEvent } from '../types';

/**
 * Parse stringified tags from events
 * Handles the format: "{\"tag1\",\"tag2\",\"tag3\"}"
 */
export function parseTags(tagsString: string): string[] {
  console.log('parseTags input:', tagsString);
  
  if (!tagsString || tagsString.trim() === '') {
    console.log('parseTags: empty string, returning []');
    return [];
  }

  try {
    // Replace { } with [ ] and unescape quotes
    const jsonString = tagsString
      .replace(/^{/, '[')
      .replace(/}$/, ']')
      .replace(/\\"/g, '"');
    
    console.log('parseTags jsonString:', jsonString);
    
    const parsed = JSON.parse(jsonString);
    console.log('parseTags parsed:', parsed);
    
    // Ensure we have an array and filter out empty strings
    if (Array.isArray(parsed)) {
      const result = parsed.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
      console.log('parseTags result:', result);
      return result;
    }
    
    console.log('parseTags: not an array, returning []');
    return [];
  } catch (error) {
    // Fallback: split by comma and clean
    console.warn('Failed to parse tags as JSON, using fallback method:', error);
    
    const result = tagsString
      .replace(/[{}"]/g, '')
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    console.log('parseTags fallback result:', result);
    return result;
  }
}

/**
 * Parse an event and add parsed tags
 */
export function parseEvent(event: Event): ParsedEvent {
  return {
    ...event,
    parsedTags: parseTags(event.tags)
  };
}

/**
 * Parse multiple events
 */
export function parseEvents(events: Event[]): ParsedEvent[] {
  return events.map(parseEvent);
}

/**
 * Get all unique tags from a list of events
 */
export function getAllUniqueTags(events: ParsedEvent[]): string[] {
  const allTags = events.flatMap(event => event.parsedTags);
  return [...new Set(allTags)].sort();
}

/**
 * Count tag frequency across events
 */
export function getTagFrequency(events: Event[]): Record<string, number> {
  const frequency: Record<string, number> = {};
  
  events.forEach(event => {
    const tags = parseTags(event.tags);
    tags.forEach(tag => {
      frequency[tag] = (frequency[tag] || 0) + 1;
    });
  });
  
  return frequency;
}

/**
 * Get top N tags by frequency
 */
export function getTopTags(events: Event[], limit: number = 20): Array<{ tag: string; count: number }> {
  const frequency = getTagFrequency(events);
  
  return Object.entries(frequency)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
