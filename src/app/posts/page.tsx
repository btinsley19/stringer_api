'use client';

import { useState } from 'react';
import { usePosts } from '@/lib/hooks/use-posts';
import { useFilters } from '@/lib/hooks/use-filters';
import { useEvents } from '@/lib/hooks/use-events';
import { filterPosts } from '@/lib/utils/filters';
import { formatDate } from '@/lib/utils/formatters';
import { PostFilters } from '@/components/posts/PostFilters';
import { PostCard } from '@/components/posts/PostCard';
import { PostDetailDrawer } from '@/components/posts/PostDetailDrawer';
import { ParsedPost } from '@/lib/types';

export default function PostsPage() {
  const { data: posts, loading, error, loadMore, hasMore } = usePosts({ limit: 50 });
  const { filters } = useFilters();
  const { data: events } = useEvents({ limit: 1000 }); // Get events to find event name by ID
  
  // Local post filters state
  const [postFilters, setPostFilters] = useState({
    search: '',
    categories: [] as string[],
    hasMedia: null as boolean | null,
    isLinked: null as boolean | null,
    dateRange: { start: null as Date | null, end: null as Date | null },
  });
  
  // Post detail drawer state
  const [selectedPost, setSelectedPost] = useState<ParsedPost | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Posts</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  // Combine global and local filters
  const combinedFilters = {
    search: postFilters.search || filters.search,
    category: postFilters.categories.length > 0 ? postFilters.categories : filters.categories,
    hasMedia: postFilters.hasMedia,
    isLinked: postFilters.isLinked,
    dateRange: postFilters.dateRange.start || postFilters.dateRange.end ? postFilters.dateRange : filters.dateRange,
    eventId: filters.eventId,
  };

  // Filter posts based on combined filters
  const filteredPosts = filterPosts(posts, combinedFilters);
  
  // Debug logging
  console.log('Posts page - Total posts:', posts.length);
  console.log('Posts page - Filtered posts:', filteredPosts.length);
  console.log('Posts page - Combined filters:', combinedFilters);
  
  // TEMPORARY: Use all posts without filtering for debugging
  const displayPosts = posts.length > 0 ? posts : filteredPosts;

  // Find event name if filtering by event
  const filteredEvent = filters.eventId ? events.find(e => e.id === filters.eventId) : null;

  // Get unique categories from posts for filter options
  const categoryStrings = posts.map(p => p.category).filter((cat): cat is string => Boolean(cat));
  const availableCategories = Array.from(new Set(categoryStrings)).sort();

  const handlePostClick = (post: ParsedPost) => {
    setSelectedPost(post);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPost(null);
  };

  const handleViewEvent = (eventId: string) => {
    // Navigate to events page with this event selected
    window.location.href = `/events?event=${eventId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          {filteredEvent && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing posts for event: <span className="font-medium">{filteredEvent.event}</span>
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {displayPosts.length} of {posts.length} posts
        </div>
      </div>

      {/* Post Filters */}
      <PostFilters
        filters={postFilters}
        onFiltersChange={setPostFilters}
        availableCategories={availableCategories}
        posts={posts}
      />

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.length === 0 ? (
          <div className="col-span-full bg-card border rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {posts.length === 0 
                ? 'No posts have been loaded yet.' 
                : 'Try adjusting your filters to see more posts.'
              }
            </p>
          </div>
        ) : (
          displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={handlePostClick}
              showThumbnail={true}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}

      {/* Post Detail Drawer */}
      <PostDetailDrawer
        post={selectedPost}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onViewEvent={handleViewEvent}
      />
    </div>
  );
}
