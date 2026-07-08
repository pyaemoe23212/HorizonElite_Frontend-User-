import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../Services/api';
import type { BulkTranslateRequest, TranslateRequest } from '../Services/api';

interface TranslationContextType {
  currentLanguage: string;  // Always lowercase: 'en', 'th', 'es', etc.
  setLanguage: (lang: string) => Promise<void>;
  translate: (text: string) => Promise<string>;
  translateMany: (texts: string[]) => Promise<Map<string, string>>;
  isTranslating: boolean;
  setIsTranslating: React.Dispatch<React.SetStateAction<boolean>>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Normalize language code to lowercase for consistency
const normalizeLanguage = (lang: string): string => lang.toLowerCase();

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const cacheRef = useRef<Map<string, Map<string, string>>>(new Map());

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
    setIsTranslating(false);
  };

  // Translate text to current language
  const translate = useCallback(async (text: string): Promise<string> => {
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

      const translatedText = response.translated_text || text;
      const languageCache = cacheRef.current.get(currentLanguage) ?? new Map<string, string>();
      languageCache.set(text, translatedText);
      cacheRef.current.set(currentLanguage, languageCache);

      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  }, [currentLanguage]);

  const translateMany = useCallback(async (texts: string[]): Promise<Map<string, string>> => {
    const result = new Map<string, string>();
    const uniqueTexts = Array.from(new Set(texts.map((text) => text.trim()).filter(Boolean)));

    if (currentLanguage === 'en' || uniqueTexts.length === 0) {
      uniqueTexts.forEach((text) => result.set(text, text));
      return result;
    }

    const languageCache = cacheRef.current.get(currentLanguage) ?? new Map<string, string>();
    const missingTexts = uniqueTexts.filter((text) => !languageCache.has(text));

    if (missingTexts.length > 0) {
      try {
        const request: BulkTranslateRequest = {
          source_language: 'en',
          target_language: currentLanguage,
          texts: Object.fromEntries(missingTexts.map((text, index) => [`t${index}`, text])),
        };

        const response = await api.bulkTranslate(request);
        const translatedValues = response.translations || {};

        missingTexts.forEach((text, index) => {
          languageCache.set(text, translatedValues[`t${index}`] || text);
        });
        cacheRef.current.set(currentLanguage, languageCache);
      } catch (error) {
        console.error('Bulk translation failed:', error);
        missingTexts.forEach((text) => languageCache.set(text, text));
      }
    }

    uniqueTexts.forEach((text) => {
      result.set(text, languageCache.get(text) || text);
    });

    return result;
  }, [currentLanguage]);

  // Always wrap children with Provider - initialization logic in useEffect still works
  return (
    <TranslationContext.Provider value={{ currentLanguage, setLanguage, translate, translateMany, isTranslating, setIsTranslating }}>
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
