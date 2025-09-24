'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, Tag, Hash, Image, Link, Unlink } from 'lucide-react';
import { ParsedPost } from '@/lib/types';

interface PostFilters {
  search: string;
  categories: string[];
  hasMedia: boolean | null; // null = all, true = has media, false = no media
  isLinked: boolean | null; // null = all, true = linked, false = unlinked
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface PostFiltersProps {
  filters: PostFilters;
  onFiltersChange: (filters: PostFilters) => void;
  availableCategories: string[];
  posts: ParsedPost[];
}

export function PostFilters({ filters, onFiltersChange, availableCategories, posts }: PostFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<PostFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      categories: [],
      hasMedia: null,
      isLinked: null,
      dateRange: { start: null, end: null },
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.categories.length > 0 || 
    filters.hasMedia !== null || 
    filters.isLinked !== null ||
    filters.dateRange.start || 
    filters.dateRange.end;

  // Get unique categories from posts
  const categoryStrings = posts.map(p => p.category).filter((cat): cat is string => Boolean(cat));
  const postCategories = Array.from(new Set(categoryStrings)).sort();

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Post Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search posts by title, body, location..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Hash className="h-4 w-4" />
              Categories
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
              {postCategories.map((category) => (
                <label key={category} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ categories: [...filters.categories, category] });
                      } else {
                        updateFilters({ 
                          categories: filters.categories.filter(c => c !== category) 
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="truncate">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Media Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Image className="h-4 w-4" />
              Media
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="hasMedia"
                  checked={filters.hasMedia === null}
                  onChange={() => updateFilters({ hasMedia: null })}
                  className="rounded"
                />
                <span>All Posts</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="hasMedia"
                  checked={filters.hasMedia === true}
                  onChange={() => updateFilters({ hasMedia: true })}
                  className="rounded"
                />
                <span>With Media</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="hasMedia"
                  checked={filters.hasMedia === false}
                  onChange={() => updateFilters({ hasMedia: false })}
                  className="rounded"
                />
                <span>No Media</span>
              </label>
            </div>
          </div>

          {/* Link Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Link className="h-4 w-4" />
              Event Link
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="isLinked"
                  checked={filters.isLinked === null}
                  onChange={() => updateFilters({ isLinked: null })}
                  className="rounded"
                />
                <span>All Posts</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="isLinked"
                  checked={filters.isLinked === true}
                  onChange={() => updateFilters({ isLinked: true })}
                  className="rounded"
                />
                <span>Linked to Event</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="isLinked"
                  checked={filters.isLinked === false}
                  onChange={() => updateFilters({ isLinked: false })}
                  className="rounded"
                />
                <span>Not Linked</span>
              </label>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Date Range
            </label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilters({ 
                  dateRange: { 
                    ...filters.dateRange, 
                    start: e.target.value ? new Date(e.target.value) : null 
                  } 
                })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilters({ 
                  dateRange: { 
                    ...filters.dateRange, 
                    end: e.target.value ? new Date(e.target.value) : null 
                  } 
                })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="End date"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {filters.search && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md flex items-center gap-1">
              Search: "{filters.search}"
              <button
                onClick={() => updateFilters({ search: '' })}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.categories.map((category) => (
            <span key={category} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md flex items-center gap-1">
              {category}
              <button
                onClick={() => updateFilters({ 
                  categories: filters.categories.filter(c => c !== category) 
                })}
                className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.hasMedia !== null && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md flex items-center gap-1">
              {filters.hasMedia ? 'With Media' : 'No Media'}
              <button
                onClick={() => updateFilters({ hasMedia: null })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.isLinked !== null && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md flex items-center gap-1">
              {filters.isLinked ? 'Linked' : 'Not Linked'}
              <button
                onClick={() => updateFilters({ isLinked: null })}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md flex items-center gap-1">
              {filters.dateRange.start?.toLocaleDateString()} - {filters.dateRange.end?.toLocaleDateString()}
              <button
                onClick={() => updateFilters({ 
                  dateRange: { start: null, end: null } 
                })}
                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
