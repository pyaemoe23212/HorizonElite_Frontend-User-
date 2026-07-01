import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../Services/api';
import type { TranslateRequest } from '../Services/api';

interface TranslationContextType {
  currentLanguage: string;  // Always lowercase: 'en', 'th', 'es', etc.
  setLanguage: (lang: string) => Promise<void>;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
  setIsTranslating: React.Dispatch<React.SetStateAction<boolean>>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Normalize language code to lowercase for consistency
const normalizeLanguage = (lang: string): string => lang.toLowerCase();

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Load language from localStorage on mount (only once)
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      const normalized = normalizeLanguage(savedLanguage);
      setCurrentLanguageState(normalized);
    }
  }, []);

  // Set language and save to localStorage
  const setLanguage = async (lang: string): Promise<void> => {
    const normalized = normalizeLanguage(lang);

    if (normalized === currentLanguage) return;

    setIsTranslating(true);

    setCurrentLanguageState(normalized);
    localStorage.setItem('selectedLanguage', normalized);
  };

  // Translate text to current language
  const translate = async (text: string): Promise<string> => {
    if (!text || currentLanguage === 'en') {
      return text;
    }

    try {
      const request: TranslateRequest = {
        text,
        target_language: currentLanguage,
        source_language: 'en',
      };

      const response = await api.translateText(request);

      return response.translated_text || text;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  };

  // Always wrap children with Provider - initialization logic in useEffect still works
  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, translate, isTranslating, setIsTranslating }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}