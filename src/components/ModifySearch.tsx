import React, { useEffect, useState } from 'react';

interface ModifySearchProps {
  onClose?: () => void;
  onSearch?: (values: ModifySearchValues) => void;
  isSearching?: boolean;
  errorMessage?: string;
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
}

export interface ModifySearchValues {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
}

interface Airport {
  name: string;
  city: string;
  country: string;
  IATA: string;
  ICAO?: string;
  lat?: string;
  lon?: string;
  timezone?: string;
}

type AirportField = 'from' | 'to';

const AIRPORT_CACHE_KEY = 'horizon_elite_airports_v1';

const fallbackAirports: Airport[] = [
  { city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport', IATA: 'BKK' },
  { city: 'Bangkok', country: 'Thailand', name: 'Don Mueang International Airport', IATA: 'DMK' },
  { city: 'Yangon', country: 'Myanmar', name: 'Yangon International Airport', IATA: 'RGN' },
  { city: 'Mandalay', country: 'Myanmar', name: 'Mandalay International Airport', IATA: 'MDL' },
  { city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport', IATA: 'SIN' },
  { city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport', IATA: 'KUL' },
];

const getValidAirports = (data: Airport[]) =>
  data.filter((airport) => airport.IATA && airport.IATA.length === 3 && airport.IATA !== '\\N');

const formatAirportDisplay = (airport: Airport) =>
  `${airport.city}${airport.country ? `, ${airport.country}` : ''} (${airport.IATA})`;

export const ModifySearch: React.FC<ModifySearchProps> = ({
  onClose,
  onSearch,
  isSearching = false,
  errorMessage = '',
  from = 'Not selected',
  to = 'Not selected',
  departDate = 'Not selected',
  returnDate = 'Not selected',
}) => {
  const [values, setValues] = useState<ModifySearchValues>({
    from,
    to,
    departDate: departDate === 'Not selected' ? '' : departDate,
    returnDate: returnDate === 'Not selected' ? '' : returnDate,
  });
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState(true);
  const [fromSuggestions, setFromSuggestions] = useState<Airport[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Airport[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<AirportField | null>(null);

  useEffect(() => {
    const cachedAirports = localStorage.getItem(AIRPORT_CACHE_KEY);
    if (cachedAirports) {
      try {
        const parsed = JSON.parse(cachedAirports) as Airport[];
        const validCached = getValidAirports(parsed);
        if (validCached.length > 0) {
          setAirports(validCached);
          setIsLoadingAirports(false);
        }
      } catch {
        localStorage.removeItem(AIRPORT_CACHE_KEY);
      }
    }

    fetch('https://raw.githubusercontent.com/konsalex/airport-autocomplete-js/master/src/data/airports.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Airport data request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data: Airport[]) => {
        const valid = getValidAirports(data);
        setAirports(valid);
        localStorage.setItem(AIRPORT_CACHE_KEY, JSON.stringify(valid));
      })
      .catch((error) => {
        console.warn('Airport data fetch failed, using local fallback:', error);
        setAirports((current) => (current.length > 0 ? current : fallbackAirports));
      })
      .finally(() => setIsLoadingAirports(false));
  }, []);

  const getSuggestions = (query: string): Airport[] => {
    if (query.trim().length < 2) return [];
    const normalizedQuery = query.toLowerCase();
    return airports.filter((airport) => (
      (airport.city || '').toLowerCase().includes(normalizedQuery) ||
      (airport.name || '').toLowerCase().includes(normalizedQuery) ||
      (airport.IATA || '').toLowerCase().includes(normalizedQuery) ||
      (airport.country || '').toLowerCase().includes(normalizedQuery)
    )).slice(0, 8);
  };

  const updateValue = (name: keyof ModifySearchValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (name === 'from') {
      setFromSuggestions(getSuggestions(value));
      setActiveDropdown('from');
    }
    if (name === 'to') {
      setToSuggestions(getSuggestions(value));
      setActiveDropdown('to');
    }
  };

  const selectAirport = (field: AirportField, airport: Airport) => {
    const displayValue = formatAirportDisplay(airport);
    setValues((current) => ({ ...current, [field]: displayValue }));
    if (field === 'from') {
      setFromSuggestions([]);
    } else {
      setToSuggestions([]);
    }
    setActiveDropdown(null);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(values);
  };

  return (
    <section className="mx-auto mb-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#073b70]">Modify Search</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Update your route or dates and search again.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xl text-slate-400 transition hover:text-slate-700"
          aria-label="Close modify search"
        >
          x
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={submitSearch}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="relative block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">From</span>
            <input
              value={values.from}
              onChange={(event) => updateValue('from', event.target.value)}
              onFocus={() => {
                setFromSuggestions(getSuggestions(values.from));
                setActiveDropdown('from');
              }}
              disabled={isLoadingAirports || isSearching}
              className="h-12 w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 text-sm font-semibold text-[#073b70] outline-none focus:border-[#073b70]"
              placeholder="Bangkok, Thailand (BKK)"
            />
            {activeDropdown === 'from' && fromSuggestions.length > 0 && (
              <AirportSuggestions
                airports={fromSuggestions}
                onSelect={(airport) => selectAirport('from', airport)}
              />
            )}
          </label>
          <label className="relative block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">To</span>
            <input
              value={values.to}
              onChange={(event) => updateValue('to', event.target.value)}
              onFocus={() => {
                setToSuggestions(getSuggestions(values.to));
                setActiveDropdown('to');
              }}
              disabled={isLoadingAirports || isSearching}
              className="h-12 w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 text-sm font-semibold text-[#073b70] outline-none focus:border-[#073b70]"
              placeholder="Singapore, Singapore (SIN)"
            />
            {activeDropdown === 'to' && toSuggestions.length > 0 && (
              <AirportSuggestions
                airports={toSuggestions}
                onSelect={(airport) => selectAirport('to', airport)}
              />
            )}
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Depart</span>
            <input
              type="date"
              value={values.departDate}
              onChange={(event) => updateValue('departDate', event.target.value)}
              className="h-12 w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 text-sm font-semibold text-[#073b70] outline-none focus:border-[#073b70]"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Return</span>
            <input
              type="date"
              value={values.returnDate}
              onChange={(event) => updateValue('returnDate', event.target.value)}
              className="h-12 w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 text-sm font-semibold text-[#073b70] outline-none focus:border-[#073b70]"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {isLoadingAirports && (
            <p className="mr-auto text-xs font-semibold text-slate-500">Loading airport codes...</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-blue-100 px-5 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#073b70] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSearching ? 'Searching...' : 'Search Flights'}
          </button>
        </div>
      </form>
    </section>
  );
};

const AirportSuggestions = ({
  airports,
  onSelect,
}: {
  airports: Airport[];
  onSelect: (airport: Airport) => void;
}) => (
  <div className="absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-blue-100 bg-white py-2 shadow-xl">
    {airports.map((airport) => (
      <button
        key={`${airport.IATA}-${airport.name}`}
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onSelect(airport)}
        className="block w-full px-4 py-3 text-left transition hover:bg-blue-50"
      >
        <span className="block text-sm font-semibold text-slate-900">
          {airport.city}{airport.country ? `, ${airport.country}` : ''} ({airport.IATA})
        </span>
        <span className="mt-1 block truncate text-xs font-semibold text-slate-500">
          {airport.name}
        </span>
      </button>
    ))}
  </div>
);

export default ModifySearch;
