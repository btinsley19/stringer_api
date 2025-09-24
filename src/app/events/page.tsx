'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/lib/hooks/use-events';
import { useFilters } from '@/lib/hooks/use-filters';
import { filterEvents, getAllCategories } from '@/lib/utils/filters';
import { parseEvents, getAllUniqueTags } from '@/lib/utils/tag-parser';
import { formatDate } from '@/lib/utils/formatters';
import { sortEvents, EventSortOption } from '@/lib/utils/sorting';
import { FilterBar } from '@/components/filters/FilterBar';
import { SortSelector } from '@/components/filters/SortSelector';
import { EventDetailDrawer } from '@/components/events/EventDetailDrawer';
import { ParsedEvent } from '@/lib/types';

export default function EventsPage() {
  const router = useRouter();
  const { data: events, loading, error, loadMore, hasMore } = useEvents({ limit: 50 });
  const { filters, updateFilters } = useFilters();
  const [sortOption, setSortOption] = useState<EventSortOption>('posts_desc');
  const [selectedEvent, setSelectedEvent] = useState<ParsedEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Events</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const parsedEvents = parseEvents(events);
  const filteredEvents = filterEvents(parsedEvents, filters);
  const sortedEvents = sortEvents(filteredEvents, sortOption);
  
  // Get available options for filters
  const categories = getAllCategories(parsedEvents);
  const tags = getAllUniqueTags(parsedEvents);

  const handleEventClick = (event: ParsedEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  };

  const handleViewRelatedPosts = (eventId: string) => {
    // Navigate to posts page with event filter
    updateFilters({ eventId });
    router.push('/posts');
    handleCloseDrawer();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex items-center gap-4">
          <SortSelector
            currentSort={sortOption}
            onSortChange={setSortOption}
          />
          <div className="text-sm text-muted-foreground">
            {sortedEvents.length} of {parsedEvents.length} events
          </div>
        </div>
      </div>

      {/* Global Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={updateFilters}
        availableCategories={categories}
        availableTags={tags}
      />

      {/* Events List */}
      <div className="space-y-4">
        {sortedEvents.length === 0 ? (
          <div className="bg-card border rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {parsedEvents.length === 0 
                ? 'No events have been loaded yet.' 
                : 'Try adjusting your filters to see more events.'
              }
            </p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{event.event}</h3>
                  {event.description && (
                    <p className="text-muted-foreground mb-3">{event.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.category.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.parsedTags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {event.parsedTags.length > 5 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        +{event.parsedTags.length - 5} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{event.posts_count} posts</span>
                    <span>{event.location}</span>
                    <span>{event.source_name}</span>
                    <span>Updated {formatDate(event.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
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
            {loading ? 'Loading...' : 'Load More Events'}
          </button>
        </div>
      )}

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onViewRelatedPosts={handleViewRelatedPosts}
      />
    </div>
  );
}
