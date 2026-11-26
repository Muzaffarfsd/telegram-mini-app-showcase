import { createContext } from 'react';

/** Return to the actual place from which the project was opened. */
export const DemoReturnContext = createContext<(() => void) | null>(null);
