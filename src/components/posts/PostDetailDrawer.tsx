'use client';

import { useState } from 'react';
import { ParsedPost } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Tag, 
  Image, 
  Video, 
  Play,
  Download,
  Eye
} from 'lucide-react';

interface PostDetailDrawerProps {
  post: ParsedPost | null;
  isOpen: boolean;
  onClose: () => void;
  onViewEvent?: (eventId: string) => void;
}

export function PostDetailDrawer({ post, isOpen, onClose, onViewEvent }: PostDetailDrawerProps) {
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (!isOpen || !post) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleViewEvent = () => {
    if (post.event && onViewEvent) {
      onViewEvent(post.event);
    }
  };

  const renderMedia = () => {
    if (!post.hasMedia || !post.media) {
      return null;
    }

    if (post.media_type === 'photo' && !imageError) {
      return (
        <div className="space-y-3">
          <div className="relative group">
            <img
              src={post.media}
              alt={post.title}
              className="w-full h-64 object-cover rounded-lg border"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Image className="h-4 w-4" />
            <span>Photo attached to this post</span>
            <a
              href={post.media}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-primary hover:underline"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      );
    }

    if (post.media_type === 'video' && !videoError) {
      return (
        <div className="space-y-3">
          <div className="relative group">
            <video
              src={post.media}
              className="w-full h-64 object-cover rounded-lg border"
              controls
              onError={() => setVideoError(true)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>Video attached to this post</span>
            <a
              href={post.media}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </a>
          </div>
        </div>
      );
    }

    // Fallback for media that failed to load
    return (
      <div className="bg-muted rounded-lg p-6 text-center">
        <div className="text-muted-foreground">
          {post.media_type === 'photo' ? (
            <Image className="h-12 w-12 mx-auto mb-2" />
          ) : (
            <Video className="h-12 w-12 mx-auto mb-2" />
          )}
          <p className="text-sm">Media could not be loaded</p>
          {post.media && (
            <a
              href={post.media}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
            >
              <ExternalLink className="h-4 w-4" />
              Try opening directly
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">{post.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.date_occurred || post.created_at)}
              </div>
              {post.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {post.location}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Media */}
            {renderMedia()}

            {/* Body */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Content</h3>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {post.body}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                {post.category && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-md">
                        {post.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Media Type */}
                {post.hasMedia && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Media Type</label>
                    <div className="flex items-center gap-2">
                      {post.media_type === 'photo' ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                      <span className="capitalize">{post.media_type}</span>
                    </div>
                  </div>
                )}

                {/* Event Link */}
                {post.isLinked && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Event Link</label>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm">Linked to event</span>
                      {onViewEvent && (
                        <button
                          onClick={handleViewEvent}
                          className="text-primary hover:underline text-sm"
                        >
                          View Event
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{formatDate(post.created_at)}</span>
                  </div>
                </div>

                {/* Updated Date */}
                {post.updated_at !== post.created_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Updated</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDate(post.updated_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Source Links */}
            {(post.source_url || post.external_url) && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Source Links</h3>
                <div className="space-y-2">
                  {post.source_url && (
                    <a
                      href={post.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{post.source_url}</span>
                    </a>
                  )}
                  {post.external_url && (
                    <a
                      href={post.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{post.external_url}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
