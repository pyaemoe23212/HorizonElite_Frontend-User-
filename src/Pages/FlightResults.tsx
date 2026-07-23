import React, { useMemo, useState } from 'react';
import { Plane } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import type { FlightResultItem, SelectedFlightResponse, SelectFlightRequest } from '../Services/api';
import type { FlightSegment, SearchFlightRequest } from '../Services/api';
import { api } from '../Services/api';
import { FlightCard } from '../components/FlightCard';
import { Stepper } from '../components/Stepper';
import { ModifySearch, type ModifySearchValues } from '../components/ModifySearch';

type FlightPhase = 'outbound' | 'inbound';
type TripType = 'ONE_WAY' | 'ROUND_TRIP';
type SelectedFlight = SelectedFlightResponse['selectedFlight'];
type SortOption = 'recommended' | 'cheapest' | 'fastest' | 'earliest';

interface SearchData {
  tripType?: string;
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
  passengers?: string;
  cabinClass?: string;
}

interface SearchState {
  searchData?: SearchData;
  flightSearchId?: string;
  flightResults?: FlightResultItem[];
}

const cabinClassMap: Record<string, string> = {
  ECONOMY: 'ECONOMY',
  PREMIUM_ECONOMY: 'PREMIUM_ECONOMY',
  PREMIUMECONOMY: 'PREMIUM_ECONOMY',
  BUSINESS: 'BUSINESS',
  FIRST: 'FIRST_CLASS',
  FIRST_CLASS: 'FIRST_CLASS',
  FIRSTCLASS: 'FIRST_CLASS',
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDisplayDate = (value?: string) => {
  if (!value) return 'Date not selected';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeCabinClass = (value?: string) => {
  const normalized = value?.trim().toUpperCase().replace(/[\s-]+/g, '_');
  return cabinClassMap[normalized || ''] || 'ECONOMY';
};

const getFlightDurationMinutes = (flight: FlightResultItem) => {
  const departure = new Date(flight.departure_datetime).getTime();
  const arrival = new Date(flight.arrival_datetime).getTime();
  if (Number.isNaN(departure) || Number.isNaN(arrival)) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.round((arrival - departure) / 60000));
};

function FlightResults(): React.JSX.Element {
  const { state } = useLocation();
  const navigate = useNavigate();
  const searchState = (state ?? {}) as SearchState;

  const flightSearchId = searchState.flightSearchId || '';
  const flightResults = searchState.flightResults || [];
  const searchData = searchState.searchData || {};

  const [phase, setPhase] = useState<FlightPhase>('outbound');
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState<FlightResultItem | null>(null);
  const [savedOutboundFlight, setSavedOutboundFlight] = useState<SelectedFlight | null>(null);
  const [selectedInboundFlight, setSelectedInboundFlight] = useState<FlightResultItem | null>(null);
  const [isSavingSelection, setIsSavingSelection] = useState(false);
  const [isModifyingSearch, setIsModifyingSearch] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modifySearchError, setModifySearchError] = useState('');
  const [showModify, setShowModify] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [stopsFilter, setStopsFilter] = useState<'all' | 'direct'>('all');
  const [refundableOnly, setRefundableOnly] = useState(false);

  const isRoundTrip = searchData.tripType === 'Return';
  const tripType: TripType = isRoundTrip ? 'ROUND_TRIP' : 'ONE_WAY';
  const currentFlight = phase === 'outbound' ? selectedOutboundFlight : selectedInboundFlight;
  const totalPrice =
    (selectedOutboundFlight ? Number(selectedOutboundFlight.total_price) : 0) +
    (selectedInboundFlight ? Number(selectedInboundFlight.total_price) : 0);
  const visibleFlights = useMemo(() => {
    const filtered = flightResults.filter((flight) => {
      if (stopsFilter === 'direct' && flight.total_stop_count !== 0) return false;
      if (refundableOnly && !flight.refundable_status) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'cheapest') return Number(a.total_price || 0) - Number(b.total_price || 0);
      if (sortBy === 'fastest') return getFlightDurationMinutes(a) - getFlightDurationMinutes(b);
      if (sortBy === 'earliest') return new Date(a.departure_datetime).getTime() - new Date(b.departure_datetime).getTime();
      return 0;
    });
  }, [flightResults, refundableOnly, sortBy, stopsFilter]);

  const selectFlight = (flight: FlightResultItem) => {
    setErrorMessage('');

    if (phase === 'outbound') {
      setSelectedOutboundFlight(flight);
      setSavedOutboundFlight(null);
      return;
    }

    setSelectedInboundFlight(flight);
  };

  const buildSelectFlightRequest = (flight: FlightResultItem): SelectFlightRequest => ({
    flight_search_id: flightSearchId,
    flight_result_id: flight.flight_result_id,
    flight_offer_id: flight.flight_offer_id,
    selected_trip_type: phase === 'outbound' ? 'OUTBOUND' : 'RETURN',
    airline_name: flight.airline_name,
    flight_number: flight.flight_number || flight.airline_code,
    origin_airport_code: flight.departure_airport,
    destination_airport_code: flight.arrival_airport,
    departure_datetime: flight.departure_datetime,
    arrival_datetime: flight.arrival_datetime,
    cabin_class: normalizeCabinClass(flight.cabin_class || searchData.cabinClass),
    selected_fare_price: Number(flight.total_price),
    currency_code: flight.currency_code,
    baggage_allowance: flight.baggage_allowance || '20kg',
    refundable_status: flight.refundable_status ?? false,
  });

  const extractAirportCode = (location?: string): string => {
    const match = String(location || '').match(/\(([A-Z]{3})\)/);
    return match ? match[1] : '';
  };

  const getPassengerCounts = () => {
    const passengerCount = Number(String(searchData.passengers || '1').match(/\d+/)?.[0] || 1);
    return {
      adult_passenger_count: Math.max(1, passengerCount),
      child_passenger_count: 0,
      infant_passenger_count: 0,
    };
  };

  const handleModifySearch = async (values: ModifySearchValues) => {
    const originCode = extractAirportCode(values.from);
    const destinationCode = extractAirportCode(values.to);

    if (!originCode || !destinationCode || !values.departDate) {
      setModifySearchError('Please use airport values with IATA codes, and select a departure date.');
      return;
    }

    if (originCode === destinationCode) {
      setModifySearchError('From and To airports must be different.');
      return;
    }

    try {
      setIsModifyingSearch(true);
      setModifySearchError('');
      setErrorMessage('');

      const isReturnSearch = Boolean(values.returnDate);
      const segments: FlightSegment[] = [
        {
          origin_airport_code: originCode,
          destination_airport_code: destinationCode,
          departure_date: values.departDate,
        },
      ];

      if (isReturnSearch) {
        segments.push({
          origin_airport_code: destinationCode,
          destination_airport_code: originCode,
          departure_date: values.returnDate,
        });
      }

      const passengerCounts = getPassengerCounts();
      const searchRequest: SearchFlightRequest = {
        trip_type: isReturnSearch ? 'ROUND_TRIP' : 'ONE_WAY',
        ...passengerCounts,
        cabin_class: (searchData.cabinClass || 'Economy').toLowerCase(),
        currency_code: 'USD',
        segments,
      };

      const response = await api.searchFlights(searchRequest);

      setSelectedOutboundFlight(null);
      setSavedOutboundFlight(null);
      setSelectedInboundFlight(null);
      setPhase('outbound');
      setShowModify(false);

      navigate('/flight-results', {
        replace: true,
        state: {
          searchData: {
            ...searchData,
            tripType: isReturnSearch ? 'Return' : 'One-way',
            from: values.from,
            to: values.to,
            departDate: values.departDate,
            returnDate: values.returnDate || null,
            passengers: `${passengerCounts.adult_passenger_count} Passenger${passengerCounts.adult_passenger_count !== 1 ? 's' : ''}`,
          },
          flightSearchId: response.flight_search_id,
          flightResults: response.results,
        },
      });
    } catch (error) {
      setModifySearchError(error instanceof Error ? error.message : 'Failed to search flights. Please try again.');
    } finally {
      setIsModifyingSearch(false);
    }
  };

  const goToPassengerInformation = (savedFlight: SelectedFlight, returnFlight: SelectedFlight | null) => {
    navigate('/passenger-information', {
      state: {
        selectedFlight: savedFlight,
        selectedFlightId: savedFlight.selected_flight_id,
        returnFlight,
        selectedReturnFlightId: returnFlight?.selected_flight_id ?? null,
        flightSearchId,
        tripType,
        searchData,
        outboundFlight: selectedOutboundFlight,
        inboundFlight: returnFlight ? selectedInboundFlight : null,
      },
    });
  };

  const continueToNextStep = async () => {
    if (!currentFlight) {
      setErrorMessage('Please select a flight before continuing.');
      return;
    }

    try {
      setIsSavingSelection(true);
      setErrorMessage('');

      const response = await api.selectFlight(buildSelectFlightRequest(currentFlight));
      const savedFlight = response.selectedFlight;

      if (isRoundTrip && phase === 'outbound') {
        setSavedOutboundFlight(savedFlight);
        setSelectedInboundFlight(null);
        setPhase('inbound');
        return;
      }

      const outboundFlight = isRoundTrip ? savedOutboundFlight : savedFlight;

      if (!outboundFlight) {
        setErrorMessage('Selected flight data missing. Please choose the flight again.');
        return;
      }

      goToPassengerInformation(outboundFlight, isRoundTrip ? savedFlight : null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to select flight. Please try again.');
    } finally {
      setIsSavingSelection(false);
    }
  };

  if (!flightSearchId || flightResults.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-800">
        <header className="bg-[#073b70] text-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link to="/" className="text-2xl font-semibold tracking-wide">
              HORIZON<span className="text-amber-400">ELITE</span>
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-8 text-center">
            <p className="mb-4 text-lg font-semibold text-amber-800">No Flight Data Found</p>
            <p className="mb-6 text-sm text-amber-700">
              It looks like you navigated directly to this page. Please search for flights from the home page.
            </p>
            <Link
              to="/"
              className="inline-block rounded-lg bg-[#073b70] px-6 py-3 font-semibold text-white transition hover:bg-[#0a2d51]"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#eef4fb] text-slate-800">
      <header className="border-b border-blue-100 bg-white text-[#073b70]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-2xl font-semibold tracking-wide">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <span>
              {searchData.from} to {searchData.to}
            </span>
            <span>{searchData.departDate}</span>
            <span>{searchData.passengers ?? '1 Passenger'}</span>
          </div>
        </div>
      </header>

      <Stepper currentStep={1} />

      <div className="mx-auto max-w-7xl px-5 pb-24">
        {showModify && (
          <ModifySearch
            onClose={() => setShowModify(false)}
            onSearch={handleModifySearch}
            isSearching={isModifyingSearch}
            errorMessage={modifySearchError}
            from={searchData.from}
            to={searchData.to}
            departDate={searchData.departDate}
            returnDate={searchData.returnDate}
          />
        )}

        <section className="mb-8 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
                {phase === 'outbound' ? 'Departure flights' : 'Return flights'}
              </p>
              <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-semibold text-[#073b70]">
                <span>{searchData.from || '--'}</span>
                <Plane size={22} className="text-amber-500" />
                <span>{searchData.to || '--'}</span>
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {formatDisplayDate(phase === 'inbound' ? searchData.returnDate : searchData.departDate)} · {searchData.passengers ?? '1 Passenger'} · {searchData.cabinClass || 'Economy'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowModify(true)}
              className="rounded-xl border border-[#073b70] bg-white px-5 py-3 text-sm font-semibold text-[#073b70] transition hover:bg-blue-50"
            >
              Modify search
            </button>
          </div>
        </section>

        {phase === 'inbound' && selectedOutboundFlight && (
          <section className="mx-auto mb-8 max-w-5xl border-t-4 border-[#073b70] bg-white p-6">
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Your selected outbound flight <span className="float-right text-blue-600">Confirmed</span>
            </p>
            <div className="grid gap-5 md:grid-cols-4 md:items-center">
              <p className="text-3xl font-semibold text-[#073b70]">
                {formatTime(selectedOutboundFlight.departure_datetime)}
                <span className="block text-xs font-medium text-slate-500">{selectedOutboundFlight.departure_airport}</span>
              </p>
              <p className="flex flex-col items-center gap-1 text-center text-sm font-medium text-slate-500">
                <Plane size={18} />
                {selectedOutboundFlight.duration || '~'}
              </p>
              <p className="text-3xl font-semibold text-[#073b70]">
                {formatTime(selectedOutboundFlight.arrival_datetime)}
                <span className="block text-xs font-medium text-slate-500">{selectedOutboundFlight.arrival_airport}</span>
              </p>
              <p className="text-sm font-medium text-slate-600">
                {normalizeCabinClass(selectedOutboundFlight.cabin_class || searchData.cabinClass)}
                <br />
                {selectedOutboundFlight.currency_code} {Number(selectedOutboundFlight.total_price).toFixed(2)}
              </p>
            </div>
          </section>
        )}

        {errorMessage && (
          <div className="mx-auto mb-6 max-w-5xl rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {isSavingSelection && (
          <div className="mx-auto mb-6 max-w-5xl rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            Saving your flight selection...
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="flex flex-col gap-6">
            <div className="mb-2 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Showing {visibleFlights.length} of {flightResults.length}</p>
                <h2 className="mt-1 text-xl font-semibold text-[#073b70]">
                  Select your {phase === 'outbound' ? 'departure' : 'return'} flight
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="h-10 rounded-xl border border-blue-100 bg-blue-50 px-3 text-sm font-medium text-[#073b70]"
                >
                  <option value="recommended">Recommended</option>
                  <option value="cheapest">Cheapest</option>
                  <option value="fastest">Fastest</option>
                  <option value="earliest">Earliest departure</option>
                </select>
                <button
                  type="button"
                  onClick={() => setStopsFilter(current => current === 'direct' ? 'all' : 'direct')}
                  className={`h-10 rounded-xl border px-4 text-sm font-medium ${stopsFilter === 'direct' ? 'border-[#073b70] bg-[#073b70] text-white' : 'border-blue-100 bg-white text-slate-600'}`}
                >
                  Direct only
                </button>
                <button
                  type="button"
                  onClick={() => setRefundableOnly(current => !current)}
                  className={`h-10 rounded-xl border px-4 text-sm font-medium ${refundableOnly ? 'border-[#073b70] bg-[#073b70] text-white' : 'border-blue-100 bg-white text-slate-600'}`}
                >
                  Refundable
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {visibleFlights.length === 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-sm font-semibold text-amber-800">
                  No flights match the selected filters. Clear a filter to see more options.
                </div>
              )}
              {visibleFlights.map((flight) => {
                const selected = currentFlight?.flight_result_id === flight.flight_result_id;

                return (
                  <div key={flight.flight_result_id}>
                    <FlightCard
                      flight={flight}
                      selected={selected}
                      onSelect={() => selectFlight(flight)}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="mb-5 rounded-2xl bg-blue-50 p-4 text-xs font-semibold text-slate-600">
              {!currentFlight && (phase === 'outbound' ? 'Select your departure flight' : 'Select your return flight')}
              {currentFlight && (phase === 'outbound' ? 'Departure ready' : 'Return ready')}
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total Price</p>
            <p className="mb-8 border-b border-slate-200 pb-6 text-3xl font-semibold text-[#073b70]">
              {flightResults[0]?.currency_code || 'USD'} {totalPrice.toFixed(2)}
            </p>

            <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-[#073b70]">Trip Summary</p>

            <FlightSummaryItem
              title="Outbound"
              flight={selectedOutboundFlight}
            />

            {isRoundTrip && (
              <FlightSummaryItem
                title="Return"
                flight={selectedInboundFlight}
              />
            )}

            <button
              disabled={isSavingSelection || !currentFlight}
              onClick={continueToNextStep}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-[#073b70] text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#0a2d51] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingSelection ? 'Processing...' : phase === 'outbound' && isRoundTrip ? 'Continue to Return Flight' : 'Continue to Passenger Info'}
            </button>
          </aside>
        </div>

        <footer className="pt-24 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
          (C) 2026 Horizon Elite. Elevating global standards.
        </footer>
      </div>
    </main>
  );
}

function FlightSummaryItem({
  title,
  flight,
}: {
  title: string;
  flight: FlightResultItem | null;
}) {
  return (
    <div className="mb-4 bg-slate-50 p-4">
      <p className="text-[10px] font-semibold uppercase text-slate-400">{title}</p>
      {flight ? (
        <p className="mt-2 text-sm font-semibold text-[#073b70]">
          {flight.departure_airport} to {flight.arrival_airport}
          <span className="block text-xs font-normal text-slate-500">
            {new Date(flight.departure_datetime).toLocaleDateString()}
          </span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Not selected</p>
      )}
    </div>
  );
}

export default FlightResults;
