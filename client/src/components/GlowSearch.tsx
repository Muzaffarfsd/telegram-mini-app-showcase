import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface GlowSearchProps {
  onSearch?: (query: string) => void;
  onFilterClick?: () => void;
  placeholder?: string;
}

export function GlowSearch({ onSearch, onFilterClick, placeholder }: GlowSearchProps) {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const defaultPlaceholder = placeholder || t('searchDemos', 'Search demos...');

  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      <div className="relative">
        <input 
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={defaultPlaceholder}
          className="w-full h-12 pl-12 pr-14 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl text-white placeholder:text-[#666] focus:outline-none focus:border-[#10b981] transition-colors"
          data-testid="input-glow-search"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
        <button
          onClick={onFilterClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[#1a1a2e] hover:bg-[#252542] rounded-lg transition-colors"
          data-testid="button-filter"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#888]" />
        </button>
      </div>
    </div>
  );
}
