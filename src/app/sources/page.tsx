'use client';

import { useEvents } from '@/lib/hooks/use-events';
import { usePosts } from '@/lib/hooks/use-posts';
import { createSourceData } from '@/lib/utils/filters';

export default function SourcesPage() {
  const { data: events, loading: eventsLoading, error: eventsError } = useEvents({ limit: 100 });
  const { data: posts, loading: postsLoading, error: postsError } = usePosts({ limit: 100 });

  const loading = eventsLoading || postsLoading;
  const error = eventsError || postsError;

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sources</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sources</h1>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Sources</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const sourceData = createSourceData(events, posts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sources</h1>
        <div className="text-sm text-muted-foreground">
          {sourceData.length} sources
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sourceData.length === 0 ? (
          <div className="col-span-full bg-card border rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No sources found</h3>
            <p className="text-muted-foreground">
              No sources have been loaded yet.
            </p>
          </div>
        ) : (
          sourceData.map((source) => (
            <div key={source.source_name} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{source.source_name}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{source.event_count}</div>
                    <div className="text-sm text-muted-foreground">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{source.post_count}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                    View Content
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Source Detail Placeholder */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Source Detail</h3>
        <div className="text-muted-foreground text-sm">
          Source detail functionality will be implemented in Phase 6
        </div>
      </div>
    </div>
  );
}
