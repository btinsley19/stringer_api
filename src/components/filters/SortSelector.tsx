'use client';

import { ChevronDown } from 'lucide-react';
import { EventSortOption, getSortOptions, getSortDisplayName } from '@/lib/utils/sorting';

interface SortSelectorProps {
  currentSort: EventSortOption;
  onSortChange: (sort: EventSortOption) => void;
}

export function SortSelector({ currentSort, onSortChange }: SortSelectorProps) {
  const sortOptions = getSortOptions();

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted-foreground">Sort by:</label>
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as EventSortOption)}
          className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
