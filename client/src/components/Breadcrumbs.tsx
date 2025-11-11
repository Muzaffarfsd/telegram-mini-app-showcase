import { ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            {item.href && !isLast ? (
              <Link href={item.href}>
                <a 
                  className="text-white/60 hover:text-emerald-400 transition-colors"
                  data-testid={`breadcrumb-${index}`}
                >
                  {item.label}
                </a>
              </Link>
            ) : (
              <span 
                className={isLast ? 'text-white font-medium' : 'text-white/60'}
                aria-current={isLast ? 'page' : undefined}
                data-testid={`breadcrumb-${index}`}
              >
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-white/40" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
