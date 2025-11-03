'use client';

import { useEvents } from '@/lib/hooks/use-events';
import { useFilters } from '@/lib/hooks/use-filters';
import { getAllCategories, filterEvents } from '@/lib/utils/filters';
import { getAllUniqueTags, parseEvents } from '@/lib/utils/tag-parser';
import { getTopEventsData, getCategoryData, getTopTagsData, getActivityData } from '@/lib/utils/chart-data';
import { KPICardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { TopEventsChart } from '@/components/charts/TopEventsChart';
import { CategoriesChart } from '@/components/charts/CategoriesChart';
import { TopTagsChart } from '@/components/charts/TopTagsChart';
import { ActivityChart } from '@/components/charts/ActivityChart';
import { FilterBar } from '@/components/filters/FilterBar';

export default function DashboardPage() {
  const { data: events, loading, error } = useEvents({ limit: 500 });
  const { filters, updateFilters } = useFilters();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Data</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  // Parse events and apply filters
  const parsedEvents = parseEvents(events);
  const filteredEvents = filterEvents(parsedEvents, filters);
  
  // Get available options for filters (from all events, not filtered)
  const categories = getAllCategories(parsedEvents);
  const tags = getAllUniqueTags(parsedEvents);
  
  // Calculate totals from filtered events
  const totalPosts = filteredEvents.reduce((sum, event) => sum + event.posts_count, 0);

  // Generate chart data from filtered events
  const topEventsData = getTopEventsData(filteredEvents, 12);
  const categoryData = getCategoryData(filteredEvents);
  const topTagsData = getTopTagsData(filteredEvents, 20);
  const activityData = getActivityData(filteredEvents, 'day');
  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {filteredEvents.length} of {parsedEvents.length} events
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
          <p className="text-2xl font-bold">{filteredEvents.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Posts</h3>
          <p className="text-2xl font-bold">{totalPosts.toLocaleString()}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Unique Categories</h3>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Unique Tags</h3>
          <p className="text-2xl font-bold">{tags.length}</p>
        </div>
      </div>

      {/* Charts with Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Events by Posts</h3>
          {topEventsData.length > 0 ? (
            <TopEventsChart data={topEventsData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No events data available
            </div>
          )}
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Categories Share</h3>
          {categoryData.length > 0 ? (
            <CategoriesChart data={categoryData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No categories data available
            </div>
          )}
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Tags</h3>
          {topTagsData.length > 0 ? (
            <TopTagsChart data={topTagsData.slice(0, 10)} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No tags data available
            </div>
          )}
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Over Time</h3>
          {activityData.length > 0 ? (
            <ActivityChart data={activityData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No activity data available
            </div>
          )}
        </div>
      </div>

      {/* Global Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={updateFilters}
        availableCategories={categories}
        availableTags={tags}
      />
    </div>
  );
}
