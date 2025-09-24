'use client';

import { ParsedPost } from '@/lib/types';
import { formatDate } from '@/lib/utils/formatters';
import { Image, Video, ExternalLink, Calendar, MapPin, Tag } from 'lucide-react';

interface PostCardProps {
  post: ParsedPost;
  onClick: (post: ParsedPost) => void;
  showThumbnail?: boolean;
}

export function PostCard({ post, onClick, showThumbnail = true }: PostCardProps) {
  const handleClick = () => {
    onClick(post);
  };

  return (
    <div 
      className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="space-y-3">
        {/* Header with title and media indicator */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold line-clamp-2 flex-1">{post.title}</h3>
          {post.hasMedia && (
            <div className="flex-shrink-0">
              {post.media_type === 'photo' ? (
                <Image className="h-5 w-5 text-blue-500" />
              ) : post.media_type === 'video' ? (
                <Video className="h-5 w-5 text-red-500" />
              ) : null}
            </div>
          )}
        </div>
        
        {/* Body preview */}
        <p className="text-muted-foreground text-sm line-clamp-3">
          {post.body}
        </p>

        {/* Tags and badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {post.hasMedia && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md flex items-center gap-1">
              {post.media_type === 'photo' ? (
                <>
                  <Image className="h-3 w-3" />
                  Photo
                </>
              ) : (
                <>
                  <Video className="h-3 w-3" />
                  Video
                </>
              )}
            </span>
          )}
          {post.isLinked && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Linked Event
            </span>
          )}
          {post.category && (
            <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
              {post.category}
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          {post.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {post.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(post.date_occurred || post.created_at)}
          </div>
          {post.source_url && (
            <div className="flex items-center gap-1 truncate">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{post.source_url}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
