import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router';
import { useTranslation } from '../contexts/useTranslation';
import type { SearchFlightRequest, FlightSegment } from '../Services/api';
import { api } from '../Services/api';

interface Airport {
  name: string;
  city: string;
  country: string;
  IATA: string;
  ICAO: string;
  lat: string;
  lon: string;
  timezone: string;
}

interface SearchData {
  tripType: 'Return' | 'One-way';
  adultCount: number;
  childCount: number;
  infantCount: number;
  cabinClass: string;
  from: string;
  to: string;
  departDate: Date | null;
  returnDate: Date | null;
}

interface PopularRouteCard {
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  searchCount?: number;
}

const AIRPORT_CACHE_KEY = 'horizon_elite_airports_v1';
const MAX_PASSENGERS = 9;

const fallbackAirports: Airport[] = [
  { city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport', IATA: 'BKK', ICAO: 'VTBS', lat: '13.6900', lon: '100.7501', timezone: 'Asia/Bangkok' },
  { city: 'Bangkok', country: 'Thailand', name: 'Don Mueang International Airport', IATA: 'DMK', ICAO: 'VTBD', lat: '13.9126', lon: '100.6070', timezone: 'Asia/Bangkok' },
  { city: 'Yangon', country: 'Myanmar', name: 'Yangon International Airport', IATA: 'RGN', ICAO: 'VYYY', lat: '16.9073', lon: '96.1332', timezone: 'Asia/Yangon' },
  { city: 'Mandalay', country: 'Myanmar', name: 'Mandalay International Airport', IATA: 'MDL', ICAO: 'VYMD', lat: '21.7022', lon: '95.9779', timezone: 'Asia/Yangon' },
  { city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport', IATA: 'SIN', ICAO: 'WSSS', lat: '1.3644', lon: '103.9915', timezone: 'Asia/Singapore' },
  { city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport', IATA: 'KUL', ICAO: 'WMKK', lat: '2.7456', lon: '101.7072', timezone: 'Asia/Kuala_Lumpur' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', name: 'Tan Son Nhat International Airport', IATA: 'SGN', ICAO: 'VVTS', lat: '10.8188', lon: '106.6519', timezone: 'Asia/Ho_Chi_Minh' },
  { city: 'Hanoi', country: 'Vietnam', name: 'Noi Bai International Airport', IATA: 'HAN', ICAO: 'VVNB', lat: '21.2212', lon: '105.8072', timezone: 'Asia/Ho_Chi_Minh' },
  { city: 'Phnom Penh', country: 'Cambodia', name: 'Phnom Penh International Airport', IATA: 'PNH', ICAO: 'VDPP', lat: '11.5466', lon: '104.8441', timezone: 'Asia/Phnom_Penh' },
  { city: 'Siem Reap', country: 'Cambodia', name: 'Siem Reap Angkor International Airport', IATA: 'SAI', ICAO: 'VDSA', lat: '13.3692', lon: '104.2230', timezone: 'Asia/Phnom_Penh' },
  { city: 'Vientiane', country: 'Laos', name: 'Wattay International Airport', IATA: 'VTE', ICAO: 'VLVT', lat: '17.9883', lon: '102.5633', timezone: 'Asia/Vientiane' },
  { city: 'Jakarta', country: 'Indonesia', name: 'Soekarno-Hatta International Airport', IATA: 'CGK', ICAO: 'WIII', lat: '-6.1256', lon: '106.6559', timezone: 'Asia/Jakarta' },
  { city: 'Bali', country: 'Indonesia', name: 'Ngurah Rai International Airport', IATA: 'DPS', ICAO: 'WADD', lat: '-8.7482', lon: '115.1670', timezone: 'Asia/Makassar' },
  { city: 'Manila', country: 'Philippines', name: 'Ninoy Aquino International Airport', IATA: 'MNL', ICAO: 'RPLL', lat: '14.5086', lon: '121.0194', timezone: 'Asia/Manila' },
  { city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International Airport', IATA: 'HKG', ICAO: 'VHHH', lat: '22.3080', lon: '113.9185', timezone: 'Asia/Hong_Kong' },
  { city: 'Tokyo', country: 'Japan', name: 'Tokyo Haneda Airport', IATA: 'HND', ICAO: 'RJTT', lat: '35.5494', lon: '139.7798', timezone: 'Asia/Tokyo' },
  { city: 'Tokyo', country: 'Japan', name: 'Narita International Airport', IATA: 'NRT', ICAO: 'RJAA', lat: '35.7720', lon: '140.3929', timezone: 'Asia/Tokyo' },
  { city: 'Seoul', country: 'South Korea', name: 'Incheon International Airport', IATA: 'ICN', ICAO: 'RKSI', lat: '37.4602', lon: '126.4407', timezone: 'Asia/Seoul' },
  { city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International Airport', IATA: 'DXB', ICAO: 'OMDB', lat: '25.2532', lon: '55.3657', timezone: 'Asia/Dubai' },
  { city: 'Doha', country: 'Qatar', name: 'Hamad International Airport', IATA: 'DOH', ICAO: 'OTHH', lat: '25.2731', lon: '51.6081', timezone: 'Asia/Qatar' },
  { city: 'London', country: 'United Kingdom', name: 'Heathrow Airport', IATA: 'LHR', ICAO: 'EGLL', lat: '51.4700', lon: '-0.4543', timezone: 'Europe/London' },
  { city: 'New York', country: 'United States', name: 'John F. Kennedy International Airport', IATA: 'JFK', ICAO: 'KJFK', lat: '40.6413', lon: '-73.7781', timezone: 'America/New_York' },
  { city: 'Los Angeles', country: 'United States', name: 'Los Angeles International Airport', IATA: 'LAX', ICAO: 'KLAX', lat: '33.9416', lon: '-118.4085', timezone: 'America/Los_Angeles' },
  { city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport', IATA: 'SYD', ICAO: 'YSSY', lat: '-33.9399', lon: '151.1753', timezone: 'Australia/Sydney' },
];

const fallbackPopularRoutes: PopularRouteCard[] = [
  { fromCity: 'Yangon', fromCode: 'RGN', toCity: 'Bangkok', toCode: 'BKK' },
  { fromCity: 'Yangon', fromCode: 'RGN', toCity: 'Mandalay', toCode: 'MDL' },
  { fromCity: 'Yangon', fromCode: 'RGN', toCity: 'Singapore', toCode: 'SIN' },
  { fromCity: 'Mandalay', fromCode: 'MDL', toCity: 'Bangkok', toCode: 'BKK' },
  { fromCity: 'Yangon', fromCode: 'RGN', toCity: 'Bagan', toCode: 'NYU' },
  { fromCity: 'Yangon', fromCode: 'RGN', toCity: 'Kuala Lumpur', toCode: 'KUL' },
];

const airportDisplayByCode: Record<string, string> = {
  RGN: 'Yangon, Myanmar (RGN)',
  BKK: 'Bangkok, Thailand (BKK)',
  MDL: 'Mandalay, Myanmar (MDL)',
  SIN: 'Singapore, Singapore (SIN)',
  NYU: 'Bagan, Myanmar (NYU)',
  KUL: 'Kuala Lumpur, Malaysia (KUL)',
};

const airportCityByCode: Record<string, string> = {
  RGN: 'Yangon',
  BKK: 'Bangkok',
  DMK: 'Bangkok',
  MDL: 'Mandalay',
  SIN: 'Singapore',
  NYU: 'Bagan',
  KUL: 'Kuala Lumpur',
};

const PlaneIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-2 2 4.5 1.5 1.5 4.5 2-2-1-3 3-3 5 6 1.2-.7c.4-.2.7-.6.6-1.1z" />
  </svg>
);

const PinIcon = () => (
  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 4.8-8 11-8 11S4 14.8 4 10a8 8 0 1 1 16 0z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

function Home(): React.JSX.Element {
  const navigate = useNavigate();
  const { currentLanguage, translate } = useTranslation();

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState(true);
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [popularRoutes, setPopularRoutes] = useState<PopularRouteCard[]>(fallbackPopularRoutes);

  const [labels, setLabels] = useState({
    searchFlights: 'Search Flights',
    roundTrip: 'Round Trip',
    oneWay: 'One Way',
    from: 'FROM',
    to: 'TO',
    passengers: 'PASSENGERS',
    cabinClass: 'Cabin Class',
    departDate: 'DEPART',
    returnDate: 'RETURN',
    economy: 'Economy',
    business: 'Business',
    firstClass: 'First Class',
  });

  const [searchData, setSearchData] = useState<SearchData>({
    tripType: 'Return',
    adultCount: 1,
    childCount: 0,
    infantCount: 0,
    cabinClass: 'Economy',
    from: '',
    to: '',
    departDate: null,
    returnDate: null,
  });

  const [fromSuggestions, setFromSuggestions] = useState<Airport[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Airport[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [activeFromIndex, setActiveFromIndex] = useState(-1);
  const [activeToIndex, setActiveToIndex] = useState(-1);
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const departDateRef = useRef<DatePicker | null>(null);
  const returnDateRef = useRef<DatePicker | null>(null);
  const passengerBoxRef = useRef<HTMLButtonElement>(null);

  const getValidAirports = (data: Airport[]) =>
    data.filter(a => a.IATA && a.IATA.length === 3 && a.IATA !== '\\N');

  // Fetch Airports
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
      .then(res => {
        if (!res.ok) {
          throw new Error(`Airport data request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data: Airport[]) => {
        const valid = getValidAirports(data);
        setAirports(valid);
        localStorage.setItem(AIRPORT_CACHE_KEY, JSON.stringify(valid));
      })
      .catch((error) => {
        console.warn('Airport data fetch failed, using local fallback:', error);
        setAirports(prev => (prev.length > 0 ? prev : fallbackAirports));
      })
      .finally(() => setIsLoadingAirports(false));
  }, []);

  useEffect(() => {
    let cancelled = false;

    api.getPopularRoutes(6)
      .then((response) => {
        if (cancelled || !Array.isArray(response.data) || response.data.length === 0) return;

        const routes = response.data.map((route) => {
          const fromCode = String(route.origin_airport_code || '').trim().toUpperCase();
          const toCode = String(route.destination_airport_code || '').trim().toUpperCase();

          return {
            fromCity: airportCityByCode[fromCode] || fromCode,
            fromCode,
            toCity: airportCityByCode[toCode] || toCode,
            toCode,
            searchCount: route.search_count,
          };
        }).filter(route => route.fromCode && route.toCode);

        if (routes.length > 0) {
          setPopularRoutes(routes);
        }
      })
      .catch((error) => {
        console.warn('Popular routes fetch failed, using fallback routes:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Translate labels
  useEffect(() => {
    const translateLabels = async () => {
      try {
        const [sf, rt, ow, fr, t, p, cc, dd, rd, eco, bus, fc] = await Promise.all([
          translate('Search Flights'), translate('Round Trip'), translate('One Way'),
          translate('From'), translate('To'), translate('Passengers'), translate('Cabin Class'),
          translate('Depart'), translate('Return'), translate('Economy'), translate('Business'), translate('First Class')
        ]);
        setLabels({ searchFlights: sf, roundTrip: rt, oneWay: ow, from: fr, to: t, passengers: p, cabinClass: cc, departDate: dd, returnDate: rd, economy: eco, business: bus, firstClass: fc });
      } catch (error) {
        console.error('Translation error:', error);
      }
    };
    translateLabels();
  }, [currentLanguage, translate]);

  const handleChange = (name: string, value: any) => {
    setSearchData(prev => ({ ...prev, [name]: value }));
    setSearchError('');
  };

  const handleTripTypeChange = (tripType: SearchData['tripType']) => {
    setSearchData(prev => ({
      ...prev,
      tripType,
      returnDate: tripType === 'One-way' ? null : prev.returnDate,
    }));
    setSearchError('');
  };

  const changePassengerCount = (name: 'adultCount' | 'childCount' | 'infantCount', value: number) => {
    setSearchData(prev => {
      const nextValue = Math.max(name === 'adultCount' ? 1 : 0, value);
      const next = { ...prev, [name]: nextValue };
      const total = next.adultCount + next.childCount + next.infantCount;

      if (name === 'infantCount' && next.infantCount > next.adultCount) {
        setSearchError('Infants cannot be more than adults.');
        return prev;
      }

      if (total > MAX_PASSENGERS) {
        setSearchError(`A maximum of ${MAX_PASSENGERS} passengers can be searched at once.`);
        return prev;
      }

      setSearchError('');
      return next;
    });
  };

  const handleSwapDestinations = () => {
    setSearchData(prev => ({ ...prev, from: prev.to, to: prev.from }));
    setFromSuggestions([]);
    setToSuggestions([]);
  };

  const getSuggestions = (query: string): Airport[] => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return airports.filter(a => 
      (a.city || '').toLowerCase().includes(q) || (a.name || '').toLowerCase().includes(q) ||
      (a.IATA || '').toLowerCase().includes(q) || (a.country || '').toLowerCase().includes(q)
    ).slice(0, 10);
  };

  const formatAirportDisplay = (a: Airport) => `${a.city}, ${a.country} (${a.IATA})`;

  const focusNext = (ref: any) => setTimeout(() => ref.current?.focus(), 80);
  const openDatePicker = (ref: React.RefObject<DatePicker | null>) => {
    window.setTimeout(() => ref.current?.setOpen(true), 120);
  };

  const handlePopularRoute = (route: PopularRouteCard) => {
    setSearchData(prev => ({
      ...prev,
      tripType: 'One-way',
      from: airportDisplayByCode[route.fromCode] || `${route.fromCity} (${route.fromCode})`,
      to: airportDisplayByCode[route.toCode] || `${route.toCity} (${route.toCode})`,
      returnDate: null,
    }));
    setSearchError('');
    setFromSuggestions([]);
    setToSuggestions([]);
    openDatePicker(departDateRef);
  };
  const openPassengers = () => {
    window.setTimeout(() => {
      passengerBoxRef.current?.focus();
      setShowPassengerModal(true);
    }, 120);
  };

  // From Handlers
  const handleFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange('from', value);
    setFromSuggestions(getSuggestions(value));
    setShowFromDropdown(true);
    setActiveFromIndex(-1);
  };

  const selectFromAirport = (airport: Airport) => {
    handleChange('from', formatAirportDisplay(airport));
    setFromSuggestions([]);
    setShowFromDropdown(false);
    focusNext(toRef);
  };

  const handleFromKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showFromDropdown || fromSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') setActiveFromIndex(i => Math.min(i + 1, fromSuggestions.length - 1));
    if (e.key === 'ArrowUp') setActiveFromIndex(i => Math.max(i - 1, 0));
    if (e.key === 'Enter' && activeFromIndex >= 0) selectFromAirport(fromSuggestions[activeFromIndex]);
    if (e.key === 'Escape') setShowFromDropdown(false);
  };

  // To Handlers
  const handleToInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleChange('to', value);
    setToSuggestions(getSuggestions(value));
    setShowToDropdown(true);
    setActiveToIndex(-1);
  };

  const selectToAirport = (airport: Airport) => {
    handleChange('to', formatAirportDisplay(airport));
    setToSuggestions([]);
    setShowToDropdown(false);
    openDatePicker(departDateRef);
  };

  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showToDropdown || toSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') setActiveToIndex(i => Math.min(i + 1, toSuggestions.length - 1));
    if (e.key === 'ArrowUp') setActiveToIndex(i => Math.max(i - 1, 0));
    if (e.key === 'Enter' && activeToIndex >= 0) selectToAirport(toSuggestions[activeToIndex]);
    if (e.key === 'Escape') setShowToDropdown(false);
  };

  const extractAirportCode = (location: string): string => {
    const match = location.match(/\(([A-Z]{3})\)/);
    return match ? match[1] : '';
  };

  const getTripTypeForApi = (tripType: string): 'ONE_WAY' | 'ROUND_TRIP' => {
    return tripType === 'Return' ? 'ROUND_TRIP' : 'ONE_WAY';
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchError('');

    if (!searchData.from || !searchData.to || !searchData.departDate) {
      setSearchError('Please fill in all required fields (From, To, Departure Date)');
      return;
    }
    if (searchData.tripType === 'Return' && !searchData.returnDate) {
      setSearchError('Please select a return date');
      return;
    }
    if (searchData.tripType === 'Return' && searchData.returnDate && searchData.departDate && searchData.returnDate < searchData.departDate) {
      setSearchError('Return date cannot be before departure date');
      return;
    }
    if (searchData.infantCount > searchData.adultCount) {
      setSearchError('Infants cannot be more than adults');
      return;
    }

    setIsSearching(true);

    try {
      const originCode = extractAirportCode(searchData.from);
      const destinationCode = extractAirportCode(searchData.to);

      if (!originCode || !destinationCode) {
        setSearchError('Please select valid airports from the dropdown');
        setIsSearching(false);
        return;
      }
      if (originCode === destinationCode) {
        setSearchError('From and To airports must be different.');
        setIsSearching(false);
        return;
      }

      const segments: FlightSegment[] = [{
        origin_airport_code: originCode,
        destination_airport_code: destinationCode,
        departure_date: searchData.departDate!.toISOString().split('T')[0],
      }];

      if (searchData.tripType === 'Return' && searchData.returnDate) {
        segments.push({
          origin_airport_code: destinationCode,
          destination_airport_code: originCode,
          departure_date: searchData.returnDate.toISOString().split('T')[0],
        });
      }

      const searchRequest: SearchFlightRequest = {
        trip_type: getTripTypeForApi(searchData.tripType),
        adult_passenger_count: searchData.adultCount,
        child_passenger_count: searchData.childCount,
        infant_passenger_count: searchData.infantCount,
        cabin_class: searchData.cabinClass.toLowerCase(),
        currency_code: 'USD',
        segments,
      };

      const response = await api.searchFlights(searchRequest);

      // Log the entire response to see its structure
      console.log('🔍 Flight Search Response:', response);
      console.log('📊 Total Results:', response.results?.length);
      console.log('🎫 First Flight Result:', response.results?.[0]);

      // Log each flight result for inspection
      response.results?.forEach((flight, index) => {
        console.log(`✈️ Flight ${index + 1}:`, flight);
      });

      // Convert Date objects to ISO strings for navigation state
      const totalPassengers = searchData.adultCount + searchData.childCount + searchData.infantCount;
      const searchDataForNavigation = {
        ...searchData,
        departDate: searchData.departDate?.toISOString().split('T')[0] || null,
        returnDate: searchData.returnDate?.toISOString().split('T')[0] || null,
        passengers: `${totalPassengers} Passenger${totalPassengers !== 1 ? 's' : ''}`,
      };

      navigate('/flight-results', {
        state: {
          searchData: searchDataForNavigation,
          flightSearchId: response.flight_search_id,
          flightResults: response.results,
        },
      });
    } catch (error) {
      setSearchError('Failed to search flights. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const totalPassengers = searchData.adultCount + searchData.childCount + searchData.infantCount;

  return (
    <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-sky-100">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2200&auto=format&fit=crop")' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/40" />

      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="max-w-lg">
          <h1 className="text-5xl font-medium text-white tracking-tight">Search Flights</h1>
          <p className="mt-4 text-lg text-white/90">Search flights, compare fares, and book your next adventure with ease.</p>
        </div>

        <form onSubmit={handleSearch} className="mt-10 bg-white rounded-3xl p-8 shadow-2xl">
          {searchError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {searchError}
            </div>
          )}

          <div className="flex gap-8 mb-8 border-b pb-6 text-sm font-medium">
            <button type="button" onClick={() => handleTripTypeChange('Return')} className={`flex items-center gap-2 pb-1 transition ${searchData.tripType === 'Return' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>
              <PlaneIcon /> {labels.roundTrip}
            </button>
            <button type="button" onClick={() => handleTripTypeChange('One-way')} className={`pb-1 transition ${searchData.tripType === 'One-way' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}>
              {labels.oneWay}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {isLoadingAirports && (
              <div className="lg:col-span-12 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
                Loading airport list...
              </div>
            )}

            {/* FROM */}
            <div className="lg:col-span-5 relative">
              <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">{labels.from}</label>
              <div className="flex h-16 items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-5 focus-within:border-blue-500 transition-all">
                <PinIcon />
                <input
                  ref={fromRef}
                  value={searchData.from}
                  onChange={handleFromInput}
                  onFocus={() => setShowFromDropdown(true)}
                  onKeyDown={handleFromKeyDown}
                  disabled={isSearching || isLoadingAirports}
                  className="flex-1 bg-transparent text-lg font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="City or Airport"
                />
              </div>
              {showFromDropdown && fromSuggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white py-2 shadow-xl border border-slate-100 max-h-80 overflow-auto">
                  {fromSuggestions.map((airport, index) => (
                    <div key={airport.IATA} onClick={() => selectFromAirport(airport)} className={`px-5 py-3.5 hover:bg-slate-50 cursor-pointer ${index === activeFromIndex ? 'bg-slate-100' : ''}`}>
                      <div className="font-semibold text-slate-900">{airport.city}{airport.country ? `, ${airport.country}` : ''} ({airport.IATA})</div>
                      <div className="text-sm text-slate-500">{airport.name}{airport.country ? ` • ${airport.country}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP */}
            <button type="button" onClick={handleSwapDestinations} disabled={isSearching} className="lg:col-span-1 flex justify-center mt-8">
              <div className="rounded-full bg-white p-3 border border-slate-200 hover:border-blue-200 transition shadow-sm">
                <SwapIcon />
              </div>
            </button>

            {/* TO */}
            <div className="lg:col-span-5 relative">
              <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">{labels.to}</label>
              <div className="flex h-16 items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-5 focus-within:border-blue-500 transition-all">
                <PinIcon />
                <input
                  ref={toRef}
                  value={searchData.to}
                  onChange={handleToInput}
                  onFocus={() => setShowToDropdown(true)}
                  onKeyDown={handleToKeyDown}
                  disabled={isSearching || isLoadingAirports}
                  className="flex-1 bg-transparent text-lg font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="City or Airport"
                />
              </div>
              {showToDropdown && toSuggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-2xl bg-white py-2 shadow-xl border border-slate-100 max-h-80 overflow-auto">
                  {toSuggestions.map((airport, index) => (
                    <div key={airport.IATA} onClick={() => selectToAirport(airport)} className={`px-5 py-3.5 hover:bg-slate-50 cursor-pointer ${index === activeToIndex ? 'bg-slate-100' : ''}`}>
                      <div className="font-semibold text-slate-900">{airport.city}{airport.country ? `, ${airport.country}` : ''} ({airport.IATA})</div>
                      <div className="text-sm text-slate-500">{airport.name}{airport.country ? ` • ${airport.country}` : ''}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DEPART DATE */}
            <div className={searchData.tripType === 'One-way' ? 'lg:col-span-6' : 'lg:col-span-3'}>
              <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">{labels.departDate}</label>
              <div className="flex h-16 items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-5 focus-within:border-blue-500 transition-all">
                <CalendarIcon />
                <DatePicker
                  ref={departDateRef}
                  selected={searchData.departDate}
                  onChange={(date: Date | null) => {
                    handleChange('departDate', date);
                    if (date && searchData.returnDate && searchData.returnDate < date) {
                      handleChange('returnDate', null);
                    }
                    if (date) {
                      if (searchData.tripType === 'Return') {
                        openDatePicker(returnDateRef);
                      } else {
                        openPassengers();
                      }
                    }
                  }}
                  className="bg-transparent text-lg font-medium text-slate-800 outline-none w-full cursor-pointer"
                  placeholderText="Select departure date"
                  dateFormat="dd MMM yyyy"
                  minDate={new Date()}
                />
              </div>
            </div>

            {/* RETURN DATE */}
            {searchData.tripType === 'Return' && (
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">{labels.returnDate}</label>
                <div className="flex h-16 items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-5 focus-within:border-blue-500 transition-all">
                  <CalendarIcon />
                  <DatePicker
                    ref={returnDateRef}
                    selected={searchData.returnDate}
                    onChange={(date: Date | null) => {
                      handleChange('returnDate', date);
                      if (date) {
                        openPassengers();
                      }
                    }}
                    className="bg-transparent text-lg font-medium text-slate-800 outline-none w-full cursor-pointer"
                    placeholderText="Select return date"
                    dateFormat="dd MMM yyyy"
                    minDate={searchData.departDate || new Date()}
                  />
                </div>
              </div>
            )}

            {/* PASSENGERS */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">PASSENGERS</label>
              <button ref={passengerBoxRef} type="button" onClick={() => setShowPassengerModal(true)} className="flex h-16 w-full items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-5 cursor-pointer text-left hover:border-blue-500 transition-all focus:border-blue-500 focus:outline-none">
                <UserIcon />
                <div>
                  <div className="text-lg font-medium text-slate-800">{totalPassengers} Passenger{totalPassengers !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-slate-500">{searchData.cabinClass}</div>
                </div>
              </button>
            </div>

            {/* SEARCH BUTTON */}
            <button
              type="submit"
              disabled={isSearching || !searchData.from || !searchData.to || !searchData.departDate || (searchData.tripType === 'Return' && !searchData.returnDate)}
              className="lg:col-span-2 h-16 rounded-2xl bg-blue-600 text-white font-semibold flex items-center justify-center gap-3 hover:bg-blue-700 transition disabled:opacity-60 shadow-lg mt-8 lg:mt-0"
            >
              {isSearching ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Searching
                </>
              ) : (
                <>
                  <SearchIcon />
                  <span>{labels.searchFlights}</span>
                </>
              )}
            </button>
          </div>

          {isSearching && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
              Searching available flights for your selected route and dates...
            </div>
          )}
        </form>

        <section className="mx-auto mt-14 max-w-5xl rounded-3xl border border-slate-200 bg-white/95 p-7 text-slate-900 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Quick access</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#073b70]">Popular routes</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">Tap a route to fill your search and see upcoming fares.</p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#073b70]">
              Based on searches
            </span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {popularRoutes.map((route) => (
              <button
                key={`${route.fromCode}-${route.toCode}`}
                type="button"
                onClick={() => handlePopularRoute(route)}
                className="group rounded-2xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg"
              >
                <span className="block text-base font-semibold text-[#073b70]">
                  {route.fromCity} <span className="text-amber-500 transition group-hover:text-orange-500">-&gt;</span> {route.toCity}
                </span>
                <span className="mt-1 block text-xs font-semibold text-slate-500">
                  {route.fromCode} {'->'} {route.toCode}
                  {route.searchCount ? ` · ${route.searchCount} searches` : ''}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {isSearching && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-lg font-semibold text-[#073b70]">Searching Flights</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">Comparing fares and schedules. This may take a moment.</p>
          </div>
        </div>
      )}

      {/* Passenger Modal */}
      {showPassengerModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8">
            <h3 className="text-xl font-semibold mb-6">Passengers</h3>

            {/* Adults */}
            <div className="flex justify-between items-center py-4 border-b">
              <div>
                <div className="font-medium">Adults</div>
                <div className="text-sm text-slate-500">18+</div>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => changePassengerCount('adultCount', searchData.adultCount - 1)} className="w-9 h-9 rounded-full border flex items-center justify-center text-xl">-</button>
                <span className="w-8 text-center text-xl font-medium">{searchData.adultCount}</span>
                <button type="button" onClick={() => changePassengerCount('adultCount', searchData.adultCount + 1)} className="w-9 h-9 rounded-full border flex items-center justify-center text-xl">+</button>
              </div>
            </div>

            {/* Children */}
            <div className="py-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-medium">Children</div>
                  <div className="text-sm text-slate-500">2-11</div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (searchData.childCount > 0) {
                        changePassengerCount('childCount', searchData.childCount - 1);
                      }
                    }}
                    className="w-9 h-9 rounded-full border flex items-center justify-center text-xl"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xl font-medium">{searchData.childCount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      changePassengerCount('childCount', searchData.childCount + 1);
                    }}
                    className="w-9 h-9 rounded-full border flex items-center justify-center text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Cabin Class */}
            <div className="flex justify-between items-center py-4 border-b">
              <div>
                <div className="font-medium">Infants</div>
                <div className="text-sm text-slate-500">Under 2</div>
              </div>
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => changePassengerCount('infantCount', searchData.infantCount - 1)} className="w-9 h-9 rounded-full border flex items-center justify-center text-xl">-</button>
                <span className="w-8 text-center text-xl font-medium">{searchData.infantCount}</span>
                <button type="button" onClick={() => changePassengerCount('infantCount', searchData.infantCount + 1)} className="w-9 h-9 rounded-full border flex items-center justify-center text-xl">+</button>
              </div>
            </div>

            {/* Cabin Class */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3">Cabin Class</label>
              <div className="grid grid-cols-2 gap-3">
                {['Economy', 'Premium Economy', 'Business', 'First'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => handleChange('cabinClass', cls)}
                    className={`py-3 rounded-2xl border text-sm font-medium transition ${searchData.cabinClass === cls ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowPassengerModal(false)} className="flex-1 py-4 border rounded-2xl font-medium">Cancel</button>
              <button onClick={() => setShowPassengerModal(false)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-medium">Done</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Home;
