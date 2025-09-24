'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, ExternalLink, Tag, Hash, FileText, Image as ImageIcon } from 'lucide-react';
import { ParsedEvent } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';

interface EventDetailDrawerProps {
  event: ParsedEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onViewRelatedPosts?: (eventId: string) => void;
}

export function EventDetailDrawer({ event, isOpen, onClose, onViewRelatedPosts }: EventDetailDrawerProps) {
  const [expandedSummaries, setExpandedSummaries] = useState<Set<number>>(new Set());

  if (!isOpen || !event) {
    return null;
  }

  const toggleSummary = (index: number) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSummaries(newExpanded);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-background shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold line-clamp-2">{event.event}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {event.posts_count} posts
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated {formatDate(event.updated_at)}
                </div>
              </div>

              {event.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              )}
            </div>

            {/* Image */}
            {event.image && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Event Image
                </h3>
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.event}
                    className="w-full h-48 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Categories */}
            {event.category.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-md"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.parsedTags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.parsedTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summaries */}
            {event.summary.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Summaries</h3>
                <div className="space-y-2">
                  {event.summary.map((summary, index) => (
                    <div key={index} className="border rounded-lg">
                      <button
                        onClick={() => toggleSummary(index)}
                        className="w-full p-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium">
                          Summary {index + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {expandedSummaries.has(index) ? 'Collapse' : 'Expand'}
                        </span>
                      </button>
                      {expandedSummaries.has(index) && (
                        <div className="px-3 pb-3">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {summary}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Headline Highlights */}
            {event.headline_highlights.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Headline Highlights</h3>
                <div className="space-y-1">
                  {event.headline_highlights.map((highlight, index) => (
                    <div key={index} className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                      • {highlight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Source</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{event.source_name}</span>
                {event.source_website_url && (
                  <a
                    href={event.source_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit Source
                  </a>
                )}
              </div>
            </div>

            {/* Event Relationships */}
            {(event.sub_event_id || event.super_event_id) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Event Relationships</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {event.sub_event_id && (
                    <div>Sub-event ID: {event.sub_event_id}</div>
                  )}
                  {event.super_event_id && (
                    <div>Super-event ID: {event.super_event_id}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-muted/30">
            <div className="flex gap-3">
              {onViewRelatedPosts && (
                <button
                  onClick={() => onViewRelatedPosts(event.id)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  View Related Posts ({event.posts_count})
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
