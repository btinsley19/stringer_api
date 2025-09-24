'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, Tag, Hash } from 'lucide-react';
import { GlobalFilters } from '@/lib/types';

interface FilterBarProps {
  filters: GlobalFilters;
  onFiltersChange: (filters: GlobalFilters) => void;
  availableCategories: string[];
  availableTags: string[];
}

export function FilterBar({ filters, onFiltersChange, availableCategories, availableTags }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<GlobalFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      categories: [],
      minPosts: 0,
      dateRange: { start: null, end: null },
      tags: [],
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.categories.length > 0 || 
    filters.minPosts > 0 || 
    filters.dateRange.start || 
    filters.dateRange.end || 
    filters.tags.length > 0;

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Global Filters</h3>
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
          placeholder="Search events, descriptions, locations, sources..."
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
              {availableCategories.map((category) => (
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

          {/* Tags Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
              {availableTags.slice(0, 20).map((tag) => (
                <label key={tag} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.tags.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ tags: [...filters.tags, tag] });
                      } else {
                        updateFilters({ 
                          tags: filters.tags.filter(t => t !== tag) 
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="truncate">{tag}</span>
                </label>
              ))}
              {availableTags.length > 20 && (
                <div className="text-xs text-muted-foreground text-center pt-1">
                  Showing top 20 tags
                </div>
              )}
            </div>
          </div>

          {/* Min Posts Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Min Posts</label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minPosts}
                onChange={(e) => updateFilters({ minPosts: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm text-muted-foreground text-center">
                {filters.minPosts} posts minimum
              </div>
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
          {filters.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md flex items-center gap-1">
              {tag}
              <button
                onClick={() => updateFilters({ 
                  tags: filters.tags.filter(t => t !== tag) 
                })}
                className="ml-1 hover:bg-muted/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filters.minPosts > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md flex items-center gap-1">
              Min {filters.minPosts} posts
              <button
                onClick={() => updateFilters({ minPosts: 0 })}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md flex items-center gap-1">
              {filters.dateRange.start?.toLocaleDateString()} - {filters.dateRange.end?.toLocaleDateString()}
              <button
                onClick={() => updateFilters({ 
                  dateRange: { start: null, end: null } 
                })}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
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
