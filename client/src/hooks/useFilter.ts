import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

interface UseFilterOptions<T> {
  items: T[];
  searchFields?: (keyof T)[];
  categoryField?: keyof T;
  debounceMs?: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useFilter<T extends Record<string, any>>({ 
  items, 
  searchFields = [], 
  categoryField,
  debounceMs = 300
}: UseFilterOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

  const normalizedSearchQuery = useMemo(
    () => debouncedSearchQuery.toLowerCase().trim(),
    [debouncedSearchQuery]
  );

  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    return items.filter(item => {
      const categoryMatch = !categoryField || 
        selectedCategory === 'all' || 
        item[categoryField] === selectedCategory;

      if (!categoryMatch) return false;

      if (normalizedSearchQuery === '') return true;

      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(normalizedSearchQuery);
        }
        if (typeof value === 'number') {
          return String(value).includes(normalizedSearchQuery);
        }
        return false;
      });
    });
  }, [items, normalizedSearchQuery, selectedCategory, searchFields, categoryField]);

  const categories = useMemo(() => {
    if (!categoryField || !items || items.length === 0) return [];
    
    const categorySet = new Set<string>();
    items.forEach(item => {
      const category = item[categoryField];
      if (typeof category === 'string' && category) {
        categorySet.add(category);
      }
    });
    
    return Array.from(categorySet).sort();
  }, [items, categoryField]);

  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All' },
      ...categories.map(cat => ({ value: cat, label: cat }))
    ];
  }, [categories]);

  const filterCounts = useMemo(() => {
    if (!categoryField || !items) return {};
    
    const counts: Record<string, number> = { all: items.length };
    
    items.forEach(item => {
      const category = item[categoryField];
      if (typeof category === 'string') {
        counts[category] = (counts[category] || 0) + 1;
      }
    });
    
    return counts;
  }, [items, categoryField]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || selectedCategory !== 'all';
  }, [searchQuery, selectedCategory]);

  const isSearching = searchQuery !== debouncedSearchQuery;

  return {
    filteredItems,
    searchQuery,
    selectedCategory,
    handleSearch,
    handleCategoryChange,
    resetFilters,
    categories,
    categoryOptions,
    filterCounts,
    hasActiveFilters,
    isSearching,
  };
}
