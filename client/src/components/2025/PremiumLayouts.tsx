import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// === BENTO GRID ===
interface BentoGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className,
  columns = 3
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  
  return (
    <div className={cn(
      'grid gap-4',
      gridCols[columns],
      className
    )}>
      {children}
    </div>
  );
};

// === BENTO GRID ITEM ===
interface BentoGridItemProps {
  children: ReactNode;
  className?: string;
  span?: {
    cols?: 1 | 2 | 3 | 4;
    rows?: 1 | 2 | 3;
  };
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  children,
  className,
  span = { cols: 1, rows: 1 }
}) => {
  const colSpan = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4'
  };
  
  const rowSpan = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3'
  };
  
  return (
    <motion.div
      className={cn(
        'glass-card-medium rounded-xl p-6',
        span.cols && colSpan[span.cols],
        span.rows && rowSpan[span.rows],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// === MASONRY GRID ===
interface MasonryGridProps {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4;
  gap?: number;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  children,
  className,
  columns = 3,
  gap = 16
}) => {
  const childrenArray = React.Children.toArray(children);
  const columnWrappers: ReactNode[][] = Array.from({ length: columns }, () => []);
  
  childrenArray.forEach((child, index) => {
    const columnIndex = index % columns;
    columnWrappers[columnIndex].push(child);
  });
  
  return (
    <div 
      className={cn('flex', className)}
      style={{ gap: `${gap}px` }}
    >
      {columnWrappers.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-1 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {column.map((item, itemIndex) => (
            <motion.div
              key={itemIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

// === STAGGERED CONTAINER (for animated lists) ===
interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  className,
  staggerDelay = 0.1
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

// === SPLIT LAYOUT (for hero/feature sections) ===
interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  reverse?: boolean;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  left,
  right,
  className,
  reverse = false
}) => {
  return (
    <div className={cn(
      'grid grid-cols-1 lg:grid-cols-2 gap-8 items-center',
      reverse && 'lg:grid-flow-dense',
      className
    )}>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={reverse ? 'lg:col-start-2' : ''}
      >
        {left}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: reverse ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={reverse ? 'lg:col-start-1 lg:row-start-1' : ''}
      >
        {right}
      </motion.div>
    </div>
  );
};

// === CARD STACK (layered cards effect) ===
interface CardStackProps {
  children: ReactNode;
  className?: string;
}

export const CardStack: React.FC<CardStackProps> = ({
  children,
  className
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={cn('relative', className)} style={{ minHeight: '200px' }}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          className="absolute w-full"
          initial={{ 
            y: index * 20, 
            scale: 1 - index * 0.05,
            opacity: 1 - index * 0.2
          }}
          whileHover={{ y: index * 30 }}
          style={{ zIndex: childrenArray.length - index }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};
