import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SortOption {
  value: string;
  label: string;
}

interface FiltersBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  categories?: FilterOption[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  showSearch?: boolean;
  showCategories?: boolean;
  showSort?: boolean;
  className?: string;
  debounceMs?: number;
}

export const FiltersBar = memo(function FiltersBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Поиск...',
  categories = [],
  selectedCategory = '',
  onCategoryChange,
  sortOptions = [],
  selectedSort = '',
  onSortChange,
  showSearch = true,
  showCategories = true,
  showSort = false,
  className = '',
  debounceMs = 300,
}: FiltersBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, debounceMs);
  }, [onSearchChange, debounceMs]);

  const clearSearch = useCallback(() => {
    setLocalSearch('');
    onSearchChange?.('');
  }, [onSearchChange]);

  const selectedSortLabel = sortOptions.find(o => o.value === selectedSort)?.label || 'Сортировка';

  return (
    <div className={`space-y-3 ${className}`}>
      {showSearch && (
        <div className="relative px-4">
          <Search 
            className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
            aria-hidden="true"
          />
          <Input
            type="search"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-10 pr-10 min-h-[44px] bg-muted/50 border-0 focus-visible:ring-1"
            aria-label={searchPlaceholder}
            data-testid="input-search"
          />
          {localSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-5 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSearch}
              aria-label="Очистить поиск"
              data-testid="button-clear-search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {(showCategories || showSort) && (
        <div className="flex items-center gap-2 px-4">
          {showCategories && categories.length > 0 && (
            <ScrollArea className="flex-1 -mx-4 px-4">
              <div className="flex gap-2 pb-1">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.value;
                  return (
                    <Button
                      key={category.value}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onCategoryChange?.(category.value)}
                      className={`min-h-[36px] whitespace-nowrap flex-shrink-0 ${
                        isSelected ? '' : 'bg-muted/50 border-0'
                      }`}
                      aria-pressed={isSelected}
                      data-testid={`button-category-${category.value}`}
                    >
                      {category.label}
                      {category.count !== undefined && (
                        <Badge 
                          variant="secondary" 
                          className="ml-1.5 px-1.5 py-0 text-xs min-w-[20px] justify-center"
                        >
                          {category.count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          )}

          {showSort && sortOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="min-h-[36px] bg-muted/50 border-0 gap-1.5 flex-shrink-0"
                  data-testid="button-sort"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">{selectedSortLabel}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => onSortChange?.(option.value)}
                    className={`min-h-[44px] ${selectedSort === option.value ? 'bg-accent' : ''}`}
                    data-testid={`sort-option-${option.value}`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
});

export default FiltersBar;
