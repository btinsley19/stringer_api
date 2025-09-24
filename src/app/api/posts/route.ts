import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const cursor = searchParams.get('cursor');
    const event = searchParams.get('event');

    const url = new URL('https://stringer.news/api/posts');
    url.searchParams.set('limit', limit);
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }
    if (event) {
      url.searchParams.set('event', event);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle the actual Stringer API response structure
    let postsData = [];
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        postsData = data;
      } else if (data.data && Array.isArray(data.data)) {
        postsData = data.data;
      }
    }
    
    console.log('Fetched posts from Stringer API:', postsData.length);
    
    // Log the actual data structure for debugging
    if (postsData.length > 0) {
      console.log('Sample post structure:', JSON.stringify(postsData[0], null, 2));
    }
    
    // Transform the response to match our expected format
    const transformedResponse = {
      status: 200,
      data: postsData,
      nextCursor: null, // Stringer API doesn't seem to provide cursor info
      hasMore: false
    };
    
    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Return error response instead of mock data
    return NextResponse.json(
      { 
        status: 500, 
        error: 'Failed to fetch posts from Stringer API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
