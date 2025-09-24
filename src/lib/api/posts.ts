import { Post, ApiResponse } from '../types';
import { apiCache } from '../utils/cache';
import { fetchWithRetry } from '../utils/retry';

const BASE_URL = '/api';

export interface PostsParams {
  limit?: number;
  cursor?: string;
  event?: string; // Filter by event ID
}

export interface PostsResponse extends ApiResponse<Post> {}

/**
 * Fetch posts from the Stringer API
 */
export async function fetchPosts(params: PostsParams = {}): Promise<PostsResponse> {
  const { limit = 50, cursor, event } = params;
  
  // Generate cache key
  const cacheKey = apiCache.generateKey('posts', { limit, cursor, event });
  
  // Check cache first
  const cachedData = apiCache.get<PostsResponse>(cacheKey);
  if (cachedData) {
    console.log('Returning cached posts data');
    return cachedData;
  }
  
  const url = new URL(`${BASE_URL}/posts`, window.location.origin);
  url.searchParams.set('limit', limit.toString());
  
  if (cursor) {
    url.searchParams.set('cursor', cursor);
  }
  
  if (event) {
    url.searchParams.set('event', event);
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

    const data: PostsResponse = await response.json();
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format: missing or invalid data array');
    }

    // Cache the response for 5 minutes
    apiCache.set(cacheKey, data, 5 * 60 * 1000);
    
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error; // Re-throw the error instead of returning mock data
  }
}

/**
 * Fetch a single post by ID
 */
export async function fetchPostById(id: string): Promise<Post | null> {
  const cacheKey = apiCache.generateKey(`posts/${id}`);
  
  // Check cache first
  const cachedPost = apiCache.get<Post>(cacheKey);
  if (cachedPost) {
    return cachedPost;
  }

  try {
    // For individual posts, we'll fetch from the posts list and find by ID
    // since the API doesn't have a direct endpoint for individual posts
    const url = new URL(`${BASE_URL}/posts`, window.location.origin);
    url.searchParams.set('limit', '1000');
    const response = await fetchWithRetry(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    const posts = data.data || [];
    const post = posts.find((p: Post) => p.id === id);
    
    if (post) {
      // Cache the post for 10 minutes
      apiCache.set(cacheKey, post, 10 * 60 * 1000);
      return post;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
}

/**
 * Mock data for development/fallback
 */
function getMockPostsResponse(params: PostsParams): PostsResponse {
  const mockPosts: Post[] = [
    {
      id: '1',
      title: 'Political Rally Draws Thousands Downtown',
      body: 'A massive political rally took place in the downtown area today, drawing thousands of supporters from across the region. The event featured speeches from key political figures and was marked by enthusiastic participation from the crowd.',
      media: null,
      media_type: null,
      location: 'Downtown City Center',
      date_occurred: '2024-01-15T10:30:00Z',
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:00Z',
      source_url: 'https://citynews.com/rally-coverage',
      external_url: null,
      category: 'Politics',
      event: '1' // Linked to event 1
    },
    {
      id: '2',
      title: 'Highway 101 Accident Causes Major Delays',
      body: 'A multi-vehicle accident on Highway 101 has caused significant traffic delays during the afternoon rush hour. Emergency services are on the scene and traffic is being diverted to alternate routes.',
      media: null,
      media_type: null,
      location: 'Highway 101, Mile Marker 45',
      date_occurred: '2024-01-15T14:20:00Z',
      created_at: '2024-01-15T14:30:00Z',
      updated_at: '2024-01-15T14:30:00Z',
      source_url: 'https://trafficalerts.com/accident-101',
      external_url: null,
      category: 'Traffic',
      event: '2' // Linked to event 2
    },
    {
      id: '3',
      title: 'Community Food Drive Exceeds Expectations',
      body: 'The annual community food drive has exceeded all expectations, with over 500 volunteers participating and thousands of pounds of food collected for the local food bank. The event was a tremendous success.',
      media: null,
      media_type: null,
      location: 'Community Center',
      date_occurred: '2024-01-14T09:00:00Z',
      created_at: '2024-01-14T10:00:00Z',
      updated_at: '2024-01-14T10:00:00Z',
      source_url: 'https://localcommunity.com/food-drive-success',
      external_url: null,
      category: 'Community',
      event: '3' // Linked to event 3
    },
    {
      id: '4',
      title: 'Local Business Opens New Location',
      body: 'A popular local business has opened a new location in the shopping district, bringing additional jobs and services to the community. The grand opening celebration attracted hundreds of customers.',
      media: null,
      media_type: null,
      location: 'Shopping District',
      date_occurred: '2024-01-13T12:00:00Z',
      created_at: '2024-01-13T13:00:00Z',
      updated_at: '2024-01-13T13:00:00Z',
      source_url: 'https://businessnews.com/new-location',
      external_url: null,
      category: 'Business',
      event: null // Not linked to any event
    },
    {
      id: '5',
      title: 'Weather Alert: Severe Storm Approaching',
      body: 'The National Weather Service has issued a severe weather alert for the region. A powerful storm system is approaching and residents are advised to take necessary precautions.',
      media: null,
      media_type: null,
      location: 'Regional Area',
      date_occurred: '2024-01-12T16:00:00Z',
      created_at: '2024-01-12T16:15:00Z',
      updated_at: '2024-01-12T16:15:00Z',
      source_url: 'https://weatherservice.gov/alerts',
      external_url: null,
      category: 'Weather',
      event: null // Not linked to any event
    }
  ];

  // Filter by event if specified
  let filteredPosts = mockPosts;
  if (params.event) {
    filteredPosts = mockPosts.filter(post => post.event === params.event);
  }

  // Simulate pagination
  const startIndex = params.cursor ? parseInt(params.cursor) : 0;
  const limit = params.limit || 50;
  const endIndex = startIndex + limit;
  
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  const hasMore = endIndex < filteredPosts.length;
  const nextCursor = hasMore ? endIndex.toString() : null;

  return {
    status: 200,
    data: paginatedPosts,
    nextCursor,
    hasMore
  };
}
