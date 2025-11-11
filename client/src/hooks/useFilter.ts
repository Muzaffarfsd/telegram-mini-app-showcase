import { useState, useMemo, useCallback } from 'react';

interface UseFilterOptions<T> {
  items: T[];
  searchFields?: (keyof T)[];
  categoryField?: keyof T;
}

export function useFilter<T extends Record<string, any>>({ 
  items, 
  searchFields = [], 
  categoryField 
}: UseFilterOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      const categoryMatch = !categoryField || 
        selectedCategory === 'all' || 
        item[categoryField] === selectedCategory;

      // Search filter
      const searchMatch = searchQuery === '' || 
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        });

      return categoryMatch && searchMatch;
    });
  }, [items, searchQuery, selectedCategory, searchFields, categoryField]);

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

  return {
    filteredItems,
    searchQuery,
    selectedCategory,
    handleSearch,
    handleCategoryChange,
    resetFilters
  };
}
