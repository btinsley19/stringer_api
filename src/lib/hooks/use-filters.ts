import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalFilters } from '../types';

const DEFAULT_FILTERS: GlobalFilters = {
  search: '',
  categories: [],
  minPosts: 0,
  dateRange: {
    start: null,
    end: null,
  },
  tags: [],
  eventId: undefined,
};

export function useFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<GlobalFilters>(DEFAULT_FILTERS);

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: GlobalFilters = {
      search: searchParams.get('search') || '',
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
      minPosts: parseInt(searchParams.get('minPosts') || '0'),
      dateRange: {
        start: searchParams.get('dateStart') ? new Date(searchParams.get('dateStart')!) : null,
        end: searchParams.get('dateEnd') ? new Date(searchParams.get('dateEnd')!) : null,
      },
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      eventId: searchParams.get('eventId') || undefined,
    };

    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateFilters = useCallback((newFilters: Partial<GlobalFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    
    if (updatedFilters.search) {
      params.set('search', updatedFilters.search);
    }
    
    if (updatedFilters.categories.length > 0) {
      params.set('categories', updatedFilters.categories.join(','));
    }
    
    if (updatedFilters.minPosts > 0) {
      params.set('minPosts', updatedFilters.minPosts.toString());
    }
    
    if (updatedFilters.dateRange.start) {
      params.set('dateStart', updatedFilters.dateRange.start.toISOString());
    }
    
    if (updatedFilters.dateRange.end) {
      params.set('dateEnd', updatedFilters.dateRange.end.toISOString());
    }
    
    if (updatedFilters.tags.length > 0) {
      params.set('tags', updatedFilters.tags.join(','));
    }
    
    if (updatedFilters.eventId) {
      params.set('eventId', updatedFilters.eventId);
    }

    // Update URL without causing a page reload
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  // Add a category to filters
  const addCategory = useCallback((category: string) => {
    if (!filters.categories.includes(category)) {
      updateFilters({
        categories: [...filters.categories, category],
      });
    }
  }, [filters.categories, updateFilters]);

  // Remove a category from filters
  const removeCategory = useCallback((category: string) => {
    updateFilters({
      categories: filters.categories.filter(c => c !== category),
    });
  }, [filters.categories, updateFilters]);

  // Add a tag to filters
  const addTag = useCallback((tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({
        tags: [...filters.tags, tag],
      });
    }
  }, [filters.tags, updateFilters]);

  // Remove a tag from filters
  const removeTag = useCallback((tag: string) => {
    updateFilters({
      tags: filters.tags.filter(t => t !== tag),
    });
  }, [filters.tags, updateFilters]);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return (
      filters.search !== '' ||
      filters.categories.length > 0 ||
      filters.minPosts > 0 ||
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.tags.length > 0 ||
      filters.eventId !== undefined
    );
  }, [filters]);

  return {
    filters,
    updateFilters,
    clearFilters,
    addCategory,
    removeCategory,
    addTag,
    removeTag,
    hasActiveFilters: hasActiveFilters(),
  };
}
