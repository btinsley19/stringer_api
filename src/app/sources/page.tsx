'use client';

import { useEvents } from '@/lib/hooks/use-events';
import { usePosts } from '@/lib/hooks/use-posts';
import { createSourceData } from '@/lib/utils/filters';

/**
 * Get color for bias score visualization
 * Lower scores (closer to 0) are more neutral, higher scores indicate more bias
 */
function getBiasScoreColor(score: number): string {
  if (score < 0.2) return 'text-green-600 dark:text-green-400';
  if (score < 0.4) return 'text-yellow-600 dark:text-yellow-400';
  if (score < 0.6) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Get background color for bias score badge
 */
function getBiasScoreBgColor(score: number): string {
  if (score < 0.2) return 'bg-green-100 dark:bg-green-900/30';
  if (score < 0.4) return 'bg-yellow-100 dark:bg-yellow-900/30';
  if (score < 0.6) return 'bg-orange-100 dark:bg-orange-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

/**
 * Get background color for progress bar
 */
function getBiasScoreProgressColor(score: number): string {
  if (score < 0.2) return 'bg-green-600 dark:bg-green-400';
  if (score < 0.4) return 'bg-yellow-600 dark:bg-yellow-400';
  if (score < 0.6) return 'bg-orange-600 dark:bg-orange-400';
  return 'bg-red-600 dark:bg-red-400';
}

export default function SourcesPage() {
  const { data: events, loading: eventsLoading, error: eventsError } = useEvents({ limit: 100 });
  const { data: posts, loading: postsLoading, error: postsError } = usePosts({ limit: 100 });

  const loading = eventsLoading || postsLoading;
  const error = eventsError || postsError;

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sources & Bias Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Sources & Bias Analytics</h1>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Sources</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const sourceData = createSourceData(events, posts);
  const sourcesWithPosts = sourceData.filter(s => s.post_count > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sources & Bias Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze bias scores and labels across news sources
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {sourcesWithPosts.length} sources with posts
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sourcesWithPosts.length === 0 ? (
          <div className="col-span-full bg-card border rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No sources found</h3>
            <p className="text-muted-foreground">
              No sources with posts have been loaded yet.
            </p>
          </div>
        ) : (
          sourcesWithPosts.map((source) => (
            <div key={source.source_name} className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{source.source_name}</h3>
                  {source.post_count > 0 && source.average_bias_score > 0 && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getBiasScoreBgColor(source.average_bias_score)} ${getBiasScoreColor(source.average_bias_score)}`}>
                      <span>Bias Score:</span>
                      <span className="font-bold">{source.average_bias_score.toFixed(3)}</span>
                    </div>
                  )}
                </div>
                
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

                {/* Bias Score Visualization */}
                {source.post_count > 0 && source.average_bias_score > 0 && (
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Average Bias Score</span>
                      <span className={getBiasScoreColor(source.average_bias_score)}>
                        {source.average_bias_score.toFixed(3)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getBiasScoreProgressColor(source.average_bias_score)}`}
                        style={{ width: `${Math.min(source.average_bias_score * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Bias Labels */}
                {source.bias_labels.length > 0 && (
                  <div className="pt-3 border-t space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Bias Labels</div>
                    <div className="flex flex-wrap gap-1.5">
                      {source.bias_labels.slice(0, 5).map((label) => {
                        const count = source.bias_label_counts[label] || 0;
                        const percentage = source.post_count > 0 
                          ? ((count / source.post_count) * 100).toFixed(0)
                          : '0';
                        return (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                            title={`${count} posts (${percentage}%)`}
                          >
                            <span>{label}</span>
                            <span className="text-muted-foreground">({count})</span>
                          </span>
                        );
                      })}
                      {source.bias_labels.length > 5 && (
                        <span className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                          +{source.bias_labels.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

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

      {/* Summary Statistics */}
      {sourcesWithPosts.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Bias Analytics Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {sourcesWithPosts.length}
              </div>
              <div className="text-sm text-muted-foreground">Sources Analyzed</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {sourcesWithPosts.reduce((sum, s) => sum + s.post_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {sourcesWithPosts.length > 0
                  ? (sourcesWithPosts.reduce((sum, s) => sum + s.average_bias_score, 0) / sourcesWithPosts.length).toFixed(3)
                  : '0.000'}
              </div>
              <div className="text-sm text-muted-foreground">Overall Avg Bias Score</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
