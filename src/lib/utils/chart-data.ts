import { Event, Post, ParsedEvent, ParsedPost } from '../types';
import { formatDate } from './formatters';

// Chart data processing utilities

/**
 * Get top events by posts count for bar chart
 */
export function getTopEventsData(events: ParsedEvent[], limit: number = 12): Array<{
  event: string;
  posts_count: number;
  id: string;
}> {
  return events
    .sort((a, b) => b.posts_count - a.posts_count)
    .slice(0, limit)
    .map(event => ({
      event: event.event.length > 30 ? event.event.substring(0, 30) + '...' : event.event,
      posts_count: event.posts_count,
      id: event.id,
    }));
}

/**
 * Get category distribution for donut chart
 */
export function getCategoryData(events: ParsedEvent[]): Array<{
  category: string;
  count: number;
  percentage: number;
}> {
  const categoryCounts: Record<string, number> = {};
  
  events.forEach(event => {
    event.category.forEach(cat => {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
  });
  
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get top tags for horizontal bar chart
 */
export function getTopTagsData(events: ParsedEvent[], limit: number = 20): Array<{
  tag: string;
  count: number;
}> {
  console.log('getTopTagsData called with:', events.length, 'events');
  
  const tagCounts: Record<string, number> = {};
  
  events.forEach((event, index) => {
    console.log(`Event ${index}:`, {
      id: event.id,
      event: event.event,
      parsedTags: event.parsedTags
    });
    
    event.parsedTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  console.log('Tag counts:', tagCounts);
  
  const result = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
    
  console.log('getTopTagsData result:', result);
  
  return result;
}

/**
 * Get activity over time for line chart
 */
export function getActivityData(events: ParsedEvent[], timeBucket: 'hour' | 'day' = 'day'): Array<{
  date: string;
  count: number;
  formattedDate: string;
}> {
  const activityCounts: Record<string, number> = {};
  
  events.forEach(event => {
    const date = new Date(event.updated_at);
    let key: string;
    
    if (timeBucket === 'hour') {
      // Round to nearest hour
      date.setMinutes(0, 0, 0);
      key = date.toISOString();
    } else {
      // Round to day
      date.setHours(0, 0, 0, 0);
      key = date.toISOString().split('T')[0];
    }
    
    activityCounts[key] = (activityCounts[key] || 0) + 1;
  });
  
  return Object.entries(activityCounts)
    .map(([date, count]) => ({
      date,
      count,
      formattedDate: timeBucket === 'hour' 
        ? formatDate(date, 'MMM dd, HH:mm')
        : formatDate(date, 'MMM dd, yyyy'),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get posts by category for bar chart
 */
export function getPostsByCategoryData(posts: ParsedPost[]): Array<{
  category: string;
  count: number;
}> {
  const categoryCounts: Record<string, number> = {};
  
  posts.forEach(post => {
    if (post.category) {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    }
  });
  
  return Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get posts over time for line chart
 */
export function getPostsOverTimeData(posts: ParsedPost[], timeBucket: 'hour' | 'day' = 'day'): Array<{
  date: string;
  count: number;
  formattedDate: string;
}> {
  const activityCounts: Record<string, number> = {};
  
  posts.forEach(post => {
    const date = new Date(post.date_occurred || post.created_at);
    let key: string;
    
    if (timeBucket === 'hour') {
      // Round to nearest hour
      date.setMinutes(0, 0, 0);
      key = date.toISOString();
    } else {
      // Round to day
      date.setHours(0, 0, 0, 0);
      key = date.toISOString().split('T')[0];
    }
    
    activityCounts[key] = (activityCounts[key] || 0) + 1;
  });
  
  return Object.entries(activityCounts)
    .map(([date, count]) => ({
      date,
      count,
      formattedDate: timeBucket === 'hour' 
        ? formatDate(date, 'MMM dd, HH:mm')
        : formatDate(date, 'MMM dd, yyyy'),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get media type distribution for pie chart
 */
export function getMediaTypeData(posts: ParsedPost[]): Array<{
  type: string;
  count: number;
  percentage: number;
}> {
  const typeCounts: Record<string, number> = {
    'Photo': 0,
    'Video': 0,
    'None': 0,
  };
  
  posts.forEach(post => {
    if (post.media_type === 'photo') {
      typeCounts['Photo']++;
    } else if (post.media_type === 'video') {
      typeCounts['Video']++;
    } else {
      typeCounts['None']++;
    }
  });
  
  const total = posts.length;
  
  return Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .filter(item => item.count > 0);
}

/**
 * Get linked vs unlinked posts data
 */
export function getLinkedPostsData(posts: ParsedPost[]): Array<{
  status: string;
  count: number;
  percentage: number;
}> {
  const linkedCount = posts.filter(post => post.isLinked).length;
  const unlinkedCount = posts.length - linkedCount;
  const total = posts.length;
  
  return [
    {
      status: 'Linked to Event',
      count: linkedCount,
      percentage: total > 0 ? Math.round((linkedCount / total) * 100) : 0,
    },
    {
      status: 'Not Linked',
      count: unlinkedCount,
      percentage: total > 0 ? Math.round((unlinkedCount / total) * 100) : 0,
    },
  ];
}

/**
 * Get source statistics for bar chart
 */
export function getSourceStatsData(events: Event[], posts: ParsedPost[]): Array<{
  source: string;
  events: number;
  posts: number;
  total: number;
}> {
  const sourceStats: Record<string, { events: number; posts: number }> = {};
  
  // Count events by source
  events.forEach(event => {
    if (!sourceStats[event.source_name]) {
      sourceStats[event.source_name] = { events: 0, posts: 0 };
    }
    sourceStats[event.source_name].events++;
  });
  
  // Count posts by source (if we had source info in posts)
  // For now, we'll use a placeholder since posts don't have source_name
  posts.forEach(post => {
    const source = 'Unknown Source'; // Placeholder
    if (!sourceStats[source]) {
      sourceStats[source] = { events: 0, posts: 0 };
    }
    sourceStats[source].posts++;
  });
  
  return Object.entries(sourceStats)
    .map(([source, stats]) => ({
      source: source.length > 20 ? source.substring(0, 20) + '...' : source,
      events: stats.events,
      posts: stats.posts,
      total: stats.events + stats.posts,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Top 10 sources
}
