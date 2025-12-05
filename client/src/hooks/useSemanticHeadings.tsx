import { createContext, useContext, useMemo, useCallback } from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingContextValue {
  level: HeadingLevel;
}

const HeadingContext = createContext<HeadingContextValue>({ level: 1 });

export const useHeadingLevel = () => {
  const context = useContext(HeadingContext);
  return context.level;
};

export const useSemanticHeadings = () => {
  const currentLevel = useHeadingLevel();

  const nextLevel = useMemo((): HeadingLevel => {
    return Math.min(currentLevel + 1, 6) as HeadingLevel;
  }, [currentLevel]);

  const getHeadingComponent = useCallback((level: HeadingLevel = currentLevel) => {
    const components = {
      1: 'h1',
      2: 'h2',
      3: 'h3',
      4: 'h4',
      5: 'h5',
      6: 'h6',
    } as const;
    return components[level];
  }, [currentLevel]);

  const HeadingLevelProvider = useMemo(() => {
    return ({ children, level }: { children: React.ReactNode; level?: HeadingLevel }) => {
      const value = useMemo(() => ({ level: level ?? nextLevel }), [level]);
      return (
        <HeadingContext.Provider value={value}>
          {children}
        </HeadingContext.Provider>
      );
    };
  }, [nextLevel]);

  return {
    currentLevel,
    nextLevel,
    getHeadingComponent,
    HeadingLevelProvider,
    HeadingContext,
  };
};

export const Heading = ({
  children,
  className,
  level,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  level?: HeadingLevel;
  [key: string]: any;
}) => {
  const currentLevel = useHeadingLevel();
  const actualLevel = level ?? currentLevel;
  const Tag = `h${actualLevel}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag className={className} {...props}>
      {children}
    </Tag>
  );
};

export const Section = ({
  children,
  heading,
  headingClassName,
  headingLevel,
  ...props
}: {
  children: React.ReactNode;
  heading?: React.ReactNode;
  headingClassName?: string;
  headingLevel?: HeadingLevel;
  [key: string]: any;
}) => {
  const { nextLevel, HeadingLevelProvider } = useSemanticHeadings();
  const level = headingLevel ?? nextLevel;
  
  return (
    <section {...props}>
      {heading && (
        <Heading level={level} className={headingClassName}>
          {heading}
        </Heading>
      )}
      <HeadingLevelProvider level={level}>
        {children}
      </HeadingLevelProvider>
    </section>
  );
};

export { HeadingContext };
