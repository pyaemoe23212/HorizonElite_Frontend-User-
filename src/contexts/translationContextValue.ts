import { createContext, type Dispatch, type SetStateAction } from 'react';

export interface TranslationContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => Promise<void>;
  translate: (text: string) => Promise<string>;
  translateMany: (texts: string[]) => Promise<Map<string, string>>;
  isTranslating: boolean;
  setIsTranslating: Dispatch<SetStateAction<boolean>>;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);
