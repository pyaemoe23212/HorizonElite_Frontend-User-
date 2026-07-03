import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '../contexts/TranslationContext';
import type { SearchFlightRequest, FlightSegment } from '../Services/api';
import { api } from '../Services/api';

interface SearchData {
  tripType: string;
  passengers: string;
  cabinClass: string;
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
}

const PlaneIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-2 2 4.5 1.5 1.5 4.5 2-2-1-3 3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" />
  </svg>
);

const PinIcon = () => (
  <svg className="h-6 w-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 4.8-8 11-8 11S4 14.8 4 10a8 8 0 1 1 16 0z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const SwapIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m16 3 4 4-4 4" />
    <path d="M20 7H6" />
    <path d="m8 21-4-4 4-4" />
    <path d="M4 17h14" />
  </svg>
);

const formatDate = (date: string) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
};

const formatDay = (date: string) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
};

function Home(): React.JSX.Element {
  const navigate = useNavigate();
  const { currentLanguage, translate } = useTranslation();

  // ✅ ADD: Loading and error states for API call
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // State for translated text
  const [labels, setLabels] = useState({
    searchFlights: 'Search Flights',
    roundTrip: 'Round Trip',
    oneWay: 'One Way',
    from: 'From',
    to: 'To',
    passengers: 'Passengers',
    cabinClass: 'Cabin Class',
    departDate: 'Depart',
    returnDate: 'Return',
    economy: 'Economy',
    business: 'Business',
    firstClass: 'First Class',
  });

  const [searchData, setSearchData] = useState<SearchData>({
    tripType: 'Return',
    passengers: '1 Passenger',
    cabinClass: 'Economy',
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
  });

  // Translate all labels when language changes
  useEffect(() => {
    const translateLabels = async () => {
      try {
        const [
          searchFlights,
          roundTrip,
          oneWay,
          from,
          to,
          passengers,
          cabinClass,
          departDate,
          returnDate,
          economy,
          business,
          firstClass,
        ] = await Promise.all([
          translate('Search Flights'),
          translate('Round Trip'),
          translate('One Way'),
          translate('From'),
          translate('To'),
          translate('Passengers'),
          translate('Cabin Class'),
          translate('Depart'),
          translate('Return'),
          translate('Economy'),
          translate('Business'),
          translate('First Class'),
        ]);

        setLabels({
          searchFlights,
          roundTrip,
          oneWay,
          from,
          to,
          passengers,
          cabinClass,
          departDate,
          returnDate,
          economy,
          business,
          firstClass,
        });
      } catch (error) {
        console.error('Error translating labels:', error);
      }
    };

    translateLabels();
  }, [currentLanguage, translate]);

  const handleChange = (name: keyof SearchData, value: string) => {
    setSearchData((prev) => ({ ...prev, [name]: value }));
    setSearchError(''); // Clear error when user changes input
  };

  const handleSwapDestinations = () => {
    setSearchData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  /**
   * Extract airport code from "City (CODE)" format
   * Example: "New York (JFK)" → "JFK"
   */
  const extractAirportCode = (location: string): string => {
    const match = location.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : 'JFK';
  };

  /**
   * Convert trip type to API format
   * "Return" → "ROUND_TRIP", "One-way" → "ONE_WAY"
   */
  const getTripTypeForApi = (tripType: string): 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY' => {
    const tripTypeMap: Record<string, 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY'> = {
      'Return': 'ROUND_TRIP',
      'One-way': 'ONE_WAY',
      'Multi-city': 'MULTI_CITY',
    };
    return tripTypeMap[tripType] || 'ONE_WAY';
  };

  /**
   * ✅ NEW: Handle flight search with real API
   * Validates required fields and constructs proper request payload
   */
  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchError('');

    // ✅ Validate all required fields are filled
    if (!searchData.from || !searchData.to || !searchData.departDate) {
      setSearchError('Please fill in all required fields (From, To, Departure Date)');
      return;
    }

    if (searchData.tripType === 'Return' && !searchData.returnDate) {
      setSearchError('Please select a return date');
      return;
    }

    // ✅ Check if user is authenticated
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setSearchError('Please log in before searching for flights');
      return;
    }

    setIsSearching(true);

    try {
      // ✅ Extract airport codes from user input
      const originCode = extractAirportCode(searchData.from);
      const destinationCode = extractAirportCode(searchData.to);

      // Validate extraction
      if (!originCode || originCode === 'JFK' || !destinationCode || destinationCode === 'JFK') {
        if ((searchData.from && !searchData.from.includes('(')) || (searchData.to && !searchData.to.includes('('))) {
          setSearchError('Please use airport codes in format: City (CODE), e.g., "Bangkok (BKK)"');
          setIsSearching(false);
          return;
        }
      }

      // ✅ Build flight segments
      const segments: FlightSegment[] = [
        {
          origin_airport_code: originCode,
          destination_airport_code: destinationCode,
          departure_date: searchData.departDate,
        },
      ];

      // Add return segment for round-trip
      if (searchData.tripType === 'Return') {
        segments.push({
          origin_airport_code: destinationCode,
          destination_airport_code: originCode,
          departure_date: searchData.returnDate,
        });
      }

      // ✅ Build search request matching exact backend spec
      const searchRequest: SearchFlightRequest = {
        trip_type: getTripTypeForApi(searchData.tripType),
        adult_passenger_count: 1,
        child_passenger_count: 0,
        infant_passenger_count: 0,
        cabin_class: searchData.cabinClass.toLowerCase(),
        currency_code: 'USD',
        segments,
      };

      console.log('🔍 Sending flight search request:', searchRequest);

      // ✅ Call the real API
      const response = await api.searchFlights(searchRequest);

      console.log('✅ Flight search response:', response);

      // ✅ Navigate with API response data
      navigate('/flight-results', {
        state: {
          searchData,
          flightSearchId: response.flight_search_id,
          flightResults: response.results,
        },
      });
    } catch (error) {
      // Display friendly error message
      let errorText = 'Failed to search flights. Please try again.';
      
      if (error instanceof Error) {
        errorText = error.message;
        // Check for common API errors
        if (error.message.includes('401')) {
          errorText = 'Please log in to search for flights';
        } else if (error.message.includes('500')) {
          errorText = 'Server error. Please check your input and try again.';
        }
      }
      
      setSearchError(errorText);
      console.error('Flight search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-sky-100">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2200&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white/65 via-sky-200/25 to-sky-500/15" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.16)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="max-w-[520px] pt-8">
          <h1 className="text-4xl font-extrabold text-[#063b70]">{labels.searchFlights}</h1>
          <p className="mt-7 max-w-md text-lg font-medium leading-7 text-[#245a8d]">
            Search flights, compare fares, and book your next adventure with ease.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mt-24 rounded-2xl bg-white p-6 shadow-[0_18px_45px_rgba(15,50,85,.18)] ring-1 ring-slate-200/80 lg:p-7">
          {/* ✅ Authentication required message */}
          {!localStorage.getItem('jwt_token') && (
            <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              ℹ️ You must <a href="/signin" className="underline hover:text-amber-900">log in</a> before searching for flights.
            </div>
          )}

          {/* ✅ Error message display */}
          {searchError && (
            <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
              ⚠️ {searchError}
            </div>
          )}

          {/* ✅ Loading indicator */}
          {isSearching && (
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
              🔍 Searching flights...
            </div>
          )}

          <div className="mb-6 flex flex-wrap gap-8 text-sm font-semibold text-slate-500">
            {[
              { key: 'Return', label: labels.roundTrip },
              { key: 'One-way', label: labels.oneWay },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChange('tripType', key)}
                disabled={isSearching}
                className={`flex min-h-10 items-center gap-2 border-b-2 px-1 transition ${
                  searchData.tripType === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent hover:text-slate-800'
                } ${isSearching ? 'opacity-50' : ''}`}
              >
                {key === 'Return' && <PlaneIcon />}
                {label}
              </button>
            ))}
          </div>

          <div className="grid items-end gap-4 lg:grid-cols-[1.1fr_44px_1.1fr_1.1fr_1.1fr_1.1fr_70px]">
            <label className="block">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                {labels.from}
              </span>
              <span className="flex min-h-[64px] items-center gap-3 rounded-md bg-slate-100 px-4">
                <PinIcon />
                <span>
                  <input
                    value={searchData.from}
                    onChange={(event) => handleChange('from', event.target.value)}
                    disabled={isSearching}
                    className="w-full bg-transparent text-base font-extrabold text-slate-900 outline-none disabled:opacity-50"
                  />
                  <span className="block text-xs font-medium text-slate-500">City or Airport</span>
                </span>
              </span>
            </label>

            <button
              type="button"
              onClick={handleSwapDestinations}
              disabled={isSearching}
              className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-blue-600 disabled:opacity-50"
              aria-label="Swap departure and arrival"
            >
              <SwapIcon />
            </button>

            <label className="block">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                {labels.to}
              </span>
              <span className="flex min-h-[64px] items-center gap-3 rounded-md bg-slate-100 px-4">
                <PinIcon />
                <span>
                  <input
                    value={searchData.to}
                    onChange={(event) => handleChange('to', event.target.value)}
                    disabled={isSearching}
                    className="w-full bg-transparent text-base font-extrabold text-slate-900 outline-none disabled:opacity-50"
                  />
                  <span className="block text-xs font-medium text-slate-500">City or Airport</span>
                </span>
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                {labels.departDate}
              </span>
              <span className="flex min-h-[64px] items-center gap-3 rounded-md bg-slate-100 px-4">
                <CalendarIcon />
                <span>
                  <span className="block text-base font-extrabold text-slate-900">{formatDate(searchData.departDate)}</span>
                  <input
                    type="date"
                    value={searchData.departDate}
                    onChange={(event) => handleChange('departDate', event.target.value)}
                    disabled={isSearching}
                    className="block h-5 w-full bg-transparent text-xs font-medium text-slate-500 outline-none disabled:opacity-50"
                  />
                </span>
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                {labels.returnDate}
              </span>
              <span className="flex min-h-[64px] items-center gap-3 rounded-md bg-slate-100 px-4">
                <CalendarIcon />
                <span>
                  <span className="block text-base font-extrabold text-slate-900">{formatDate(searchData.returnDate)}</span>
                  <input
                    type="date"
                    value={searchData.returnDate}
                    onChange={(event) => handleChange('returnDate', event.target.value)}
                    disabled={searchData.tripType === 'One-way' || isSearching}
                    className="block h-5 w-full bg-transparent text-xs font-medium text-slate-500 outline-none disabled:opacity-40"
                  />
                </span>
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                {labels.passengers}
              </span>
              <span className="flex min-h-[64px] items-center gap-3 rounded-md bg-slate-100 px-4">
                <UserIcon />
                <span>
                  <select
                    value={searchData.passengers}
                    onChange={(event) => handleChange('passengers', event.target.value)}
                    disabled={isSearching}
                    className="block w-full bg-transparent text-base font-extrabold text-slate-900 outline-none disabled:opacity-50"
                  >
                    <option>1 Passenger</option>
                    <option>2 Passengers</option>
                    <option>3 Passengers</option>
                    <option>4 Passengers</option>
                  </select>
                  <select
                    value={searchData.cabinClass}
                    onChange={(event) => handleChange('cabinClass', event.target.value)}
                    disabled={isSearching}
                    className="block w-full bg-transparent text-xs font-medium text-slate-500 outline-none disabled:opacity-50"
                  >
                    <option>{labels.economy}</option>
                    <option>Premium Economy</option>
                    <option>{labels.business}</option>
                    <option>{labels.firstClass}</option>
                  </select>
                </span>
              </span>
            </label>

            <button
              type="submit"
              disabled={
                isSearching ||
                !searchData.from ||
                !searchData.to ||
                !searchData.departDate ||
                (searchData.tripType === 'Return' && !searchData.returnDate) ||
                !localStorage.getItem('jwt_token')
              }
              className="flex h-[64px] items-center justify-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={`Search flights departing ${formatDay(searchData.departDate)}`}
            >
              {isSearching ? '⏳' : <SearchIcon />}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Home;
