export const fallbackSupportedCurrencies = ['USD', 'THB', 'MMK', 'SGD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD'] as const;

export type SupportedCurrency = string;
export type ExchangeRates = Record<string, number>;

const usdExchangeRates: Record<SupportedCurrency, number> = {
  USD: 1,
  THB: 36.5,
  MMK: 2100,
  SGD: 1.35,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 157,
  KRW: 1380,
  CNY: 7.25,
  AUD: 1.52,
};

export const currencySymbols: Record<string, string> = {
  USD: '$',
  THB: '฿',
  MMK: 'K',
  SGD: 'S$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
};

export const currencyNames: Record<string, string> = {
  USD: 'US Dollar',
  THB: 'Thai Baht',
  MMK: 'Myanmar Kyat',
  SGD: 'Singapore Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  AUD: 'Australian Dollar',
};

export const displayCurrencies = [...fallbackSupportedCurrencies];

export const normalizeCurrencyCode = (currencyCode?: string): SupportedCurrency => {
  const normalized = String(currencyCode || 'USD').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : 'USD';
};

export const convertCurrency = (amount: unknown, fromCurrency = 'USD', toCurrency = 'USD', liveRates?: ExchangeRates): number => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return 0;

  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);
  const rates = liveRates && Object.keys(liveRates).length > 0 ? liveRates : usdExchangeRates;
  const fromRate = Number(rates[from] || usdExchangeRates[from] || 1);
  const toRate = Number(rates[to] || usdExchangeRates[to] || 1);
  const amountInUsd = numericAmount / fromRate;

  return amountInUsd * toRate;
};

export const formatCurrency = (amount: unknown, currencyCode = 'USD'): string => {
  const currency = normalizeCurrencyCode(currencyCode);
  const numericAmount = Number(amount);
  const symbol = currencySymbols[currency];

  return `${symbol ? `${symbol} ` : ''}${currency} ${Number.isFinite(numericAmount)
    ? numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00'}`;
};

export const formatConvertedCurrency = (amount: unknown, fromCurrency = 'USD', toCurrency = 'USD', liveRates?: ExchangeRates): string => (
  formatCurrency(convertCurrency(amount, fromCurrency, toCurrency, liveRates), toCurrency)
);

export const formatUsdExchangeRate = (currencyCode: string, liveRates?: ExchangeRates): string => {
  const currency = normalizeCurrencyCode(currencyCode);
  if (currency === 'USD') return 'Base currency';

  const rate = Number(liveRates?.[currency] || usdExchangeRates[currency]);
  const symbol = currencySymbols[currency];

  if (!Number.isFinite(rate)) return 'Rate unavailable';

  return `1 USD = ${symbol ? `${symbol} ` : ''}${rate.toLocaleString(undefined, {
    minimumFractionDigits: rate >= 100 ? 0 : 2,
    maximumFractionDigits: rate >= 100 ? 0 : 4,
  })} ${currency}`;
};
