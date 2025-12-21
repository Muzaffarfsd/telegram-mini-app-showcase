import { memo } from 'react';
import { m } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface AnimatedBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

export const AnimatedBreadcrumbs = memo(function AnimatedBreadcrumbs({
  items,
  className = '',
  showHome = true,
  separator,
}: AnimatedBreadcrumbsProps) {
  const allItems = showHome 
    ? [{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> }, ...items]
    : items;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const separatorVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
      },
    },
  };

  return (
    <m.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-center gap-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-1">
              <m.div variants={itemVariants}>
                {item.href && !isLast ? (
                  <Link 
                    href={item.href}
                    className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
                      isLast 
                        ? 'text-white bg-white/10' 
                        : 'text-white/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </m.div>
              
              {!isLast && (
                <m.span 
                  variants={separatorVariants}
                  className="text-white/30"
                >
                  {separator || <ChevronRight className="w-4 h-4" />}
                </m.span>
              )}
            </li>
          );
        })}
      </ol>
    </m.nav>
  );
});
