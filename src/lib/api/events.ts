import { Event, ApiResponse } from '../types';
import { apiCache } from '../utils/cache';
import { fetchWithRetry } from '../utils/retry';

const BASE_URL = '/api';

export interface EventsParams {
  limit?: number;
  cursor?: string;
}

export interface EventsResponse extends ApiResponse<Event> {}

/**
 * Fetch events from the Stringer API
 */
export async function fetchEvents(params: EventsParams = {}): Promise<EventsResponse> {
  const { limit = 500, cursor } = params;
  
  // Generate cache key
  const cacheKey = apiCache.generateKey('events', { limit, cursor });
  
  // Check cache first
  const cachedData = apiCache.get<EventsResponse>(cacheKey);
  if (cachedData) {
    console.log('Returning cached events data');
    return cachedData;
  }
  
  const url = new URL(`${BASE_URL}/events`, window.location.origin);
  url.searchParams.set('limit', limit.toString());
  
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }

  try {
    const response = await fetchWithRetry(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header when API key is available
        // 'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data: EventsResponse = await response.json();
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format: missing or invalid data array');
    }

    // Cache the response for 5 minutes
    apiCache.set(cacheKey, data, 5 * 60 * 1000);
    
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Return mock data for development
    const mockData = getMockEventsResponse(params);
    
    // Cache mock data for shorter time (1 minute)
    apiCache.set(cacheKey, mockData, 60 * 1000);
    
    return mockData;
  }
}

/**
 * Fetch a single event by ID
 */
export async function fetchEventById(id: string): Promise<Event | null> {
  const cacheKey = apiCache.generateKey(`events/${id}`);
  
  // Check cache first
  const cachedEvent = apiCache.get<Event>(cacheKey);
  if (cachedEvent) {
    return cachedEvent;
  }

  try {
    // For individual events, we'll fetch from the events list and find by ID
    // since the API doesn't have a direct endpoint for individual events
    const url = new URL(`${BASE_URL}/events`, window.location.origin);
    url.searchParams.set('limit', '500');
    const response = await fetchWithRetry(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const events = data.data || [];
    const event = events.find((e: Event) => e.id === id);
    
    if (event) {
      // Cache the event for 10 minutes
      apiCache.set(cacheKey, event, 10 * 60 * 1000);
      return event;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    return null;
  }
}

/**
 * Mock data for development/fallback
 */
function getMockEventsResponse(params: EventsParams): EventsResponse {
  const mockEvents: Event[] = [
    {
      id: '1',
      event: 'Major Political Rally in Downtown',
      description: 'A large political gathering took place in the city center',
      headline_highlights: ['rally', 'political', 'downtown'],
      tags: '{"Politics","Rally","Downtown","Election"}',
      category: ['Politics', 'Public Events'],
      summary: [
        'Thousands of supporters gathered for a major political rally',
        'The event featured speeches from key political figures',
        'Security was tight with multiple checkpoints'
      ],
      image: null,
      sub_event_id: null,
      super_event_id: null,
      posts_count: 1247,
      view_count: 0,
      location: 'Downtown City Center',
      location_geom: null,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T18:45:00Z',
      source_name: 'City News Network',
      source_website_url: 'https://citynews.com'
    },
    {
      id: '2',
      event: 'Traffic Accident on Highway 101',
      description: 'Multi-vehicle collision causing major delays',
      headline_highlights: ['accident', 'highway', 'traffic'],
      tags: '{"Traffic","Accident","Highway","Emergency"}',
      category: ['Crime', 'Traffic'],
      summary: [
        'A multi-vehicle accident occurred on Highway 101',
        'Emergency services responded quickly to the scene',
        'Traffic was diverted for several hours'
      ],
      image: null,
      sub_event_id: null,
      super_event_id: null,
      posts_count: 89,
      view_count: 0,
      location: 'Highway 101, Mile Marker 45',
      location_geom: null,
      created_at: '2024-01-15T14:20:00Z',
      updated_at: '2024-01-15T16:30:00Z',
      source_name: 'Traffic Alert Service',
      source_website_url: 'https://trafficalerts.com'
    },
    {
      id: '3',
      event: 'Community Food Drive Success',
      description: 'Local community comes together to support food bank',
      headline_highlights: ['food drive', 'community', 'charity'],
      tags: '{"Community","Charity","Food Drive","Volunteer"}',
      category: ['Community', 'Charity'],
      summary: [
        'The annual community food drive exceeded expectations',
        'Over 500 volunteers participated in the event',
        'Thousands of pounds of food were collected'
      ],
      image: null,
      sub_event_id: null,
      super_event_id: null,
      posts_count: 234,
      view_count: 0,
      location: 'Community Center',
      location_geom: null,
      created_at: '2024-01-14T09:00:00Z',
      updated_at: '2024-01-14T17:00:00Z',
      source_name: 'Local Community News',
      source_website_url: 'https://localcommunity.com'
    }
  ];

  // Simulate pagination
  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const limit = params.limit || 50;
  const endIndex = startIndex + limit;
  
  const paginatedEvents = mockEvents.slice(startIndex, endIndex);
  const hasMore = endIndex < mockEvents.length;
  const nextCursor = hasMore ? endIndex.toString() : null;

  return {
    status: 200,
    data: paginatedEvents,
    nextCursor,
    hasMore
  };
}
