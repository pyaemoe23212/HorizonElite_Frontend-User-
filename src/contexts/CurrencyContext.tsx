import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../Services/api';
import { CurrencyContext } from './currencyContextValue';
import { displayCurrencies, normalizeCurrencyCode, type ExchangeRates, type SupportedCurrency } from '../utils/currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [selectedCurrency, setSelectedCurrencyState] = useState<SupportedCurrency>(() => (
    normalizeCurrencyCode(localStorage.getItem('selected_currency') || 'USD')
  ));
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | undefined>();
  const [status, setStatus] = useState<'loading' | 'live' | 'fallback'>('loading');

  useEffect(() => {
    let cancelled = false;

    const loadRates = async () => {
      try {
        setStatus('loading');
        const response = await api.getCurrencyRates('USD');

        if (!cancelled) {
          setExchangeRates(response.data.rates);
          setStatus('live');
        }
      } catch {
        if (!cancelled) {
          setExchangeRates(undefined);
          setStatus('fallback');
        }
      }
    };

    loadRates();

    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedCurrency = (currency: SupportedCurrency) => {
    const normalized = normalizeCurrencyCode(currency);
    setSelectedCurrencyState(normalized);
    localStorage.setItem('selected_currency', normalized);
  };

  const currencies = useMemo(() => {
    const liveCurrencies = new Set(['USD', ...Object.keys(exchangeRates || {})]);
    return displayCurrencies.filter((currency) => liveCurrencies.has(currency));
  }, [exchangeRates]);

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, currencies, exchangeRates, status }}>
      {children}
    </CurrencyContext.Provider>
  );
}
