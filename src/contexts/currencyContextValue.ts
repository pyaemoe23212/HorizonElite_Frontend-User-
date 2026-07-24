import { createContext } from 'react';
import type { ExchangeRates, SupportedCurrency } from '../utils/currency';

export interface CurrencyContextType {
  selectedCurrency: SupportedCurrency;
  setSelectedCurrency: (currency: SupportedCurrency) => void;
  currencies: SupportedCurrency[];
  exchangeRates?: ExchangeRates;
  status: 'loading' | 'live' | 'fallback';
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
