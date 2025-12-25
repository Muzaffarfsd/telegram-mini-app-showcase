import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock } from 'lucide-react';

interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
}

interface SmartSearchProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: SearchSuggestion[];
  placeholder?: string;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  className?: string;
}

export function SmartSearch({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Поиск...',
  onSuggestionClick,
  className = ''
}: SmartSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  // Debounced onChange
  const handleInputChange = useCallback((newValue: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  }, [onChange]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    
    // Save to recent searches
    const updated = [
      suggestion.text,
      ...recentSearches.filter(s => s !== suggestion.text)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
    
    setIsFocused(false);
  };

  const handleRecentSearchClick = (search: string) => {
    onChange(search);
    setIsFocused(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const showDropdown = isFocused && (suggestions.length > 0 || recentSearches.length > 0);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative glass-medium rounded-2xl overflow-hidden">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-white/40 focus:outline-none text-base"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            handleInputChange(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          data-testid="input-smart-search"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            data-testid="button-clear-search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown with Suggestions */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-2xl p-2 max-h-80 overflow-y-auto z-50">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-2 text-white/60 text-xs font-medium">
                Предложения
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-3 text-left hover-elevate active-elevate-2 rounded-xl transition-colors"
                  data-testid={`suggestion-${suggestion.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {suggestion.text}
                      </div>
                      {suggestion.category && (
                        <div className="text-white/50 text-xs">
                          {suggestion.category}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-white/60 text-xs font-medium">
                  Недавние поиски
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-white/40 hover:text-white text-xs"
                  data-testid="button-clear-recent"
                >
                  Очистить
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full px-3 py-3 text-left hover-elevate active-elevate-2 rounded-xl transition-colors"
                  data-testid={`recent-search-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-white/40" />
                    <div className="text-white text-sm">
                      {search}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
