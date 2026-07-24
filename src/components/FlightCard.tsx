import React from 'react';
import { Briefcase, Luggage, Plane } from 'lucide-react';
import type { FlightResultItem } from '../Services/api';
import { formatConvertedCurrency, normalizeCurrencyCode, type ExchangeRates, type SupportedCurrency } from '../utils/currency';

interface FlightCardProps {
  flight: FlightResultItem;
  selected?: boolean;
  onSelect: () => void;
  displayCurrency?: SupportedCurrency;
  exchangeRates?: ExchangeRates;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, selected, onSelect, displayCurrency, exchangeRates }) => {
  const calculateDuration = (): string => {
    if (flight.duration) return flight.duration;
    const dep = new Date(flight.departure_datetime);
    const arr = new Date(flight.arrival_datetime);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const priceValue = parseFloat(flight.total_price || '0');
  const sourceCurrency = normalizeCurrencyCode(flight.currency_code);
  const targetCurrency = displayCurrency || sourceCurrency;
  const isDirect = flight.total_stop_count === 0;
  const flightNumber = flight.flight_number || flight.airline_code || 'Flight';
  const travelDate = new Date(flight.departure_datetime).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <article
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`he-soft-card group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${selected ? 'border-[#073b70] ring-2 ring-blue-100' : 'border-blue-100 hover:border-blue-200'}`}
    >
      <div className="grid gap-6 lg:grid-cols-[180px_1fr_150px] lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#073b70]">
            <Plane size={23} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{flight.airline_name || 'Airline'}</p>
            <p className="text-sm font-semibold text-slate-500">{flightNumber}</p>
            <p className="text-xs font-medium text-[#073b70]">{travelDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-[84px_1fr_84px] items-center gap-3">
          <div>
            <p className="text-2xl font-semibold text-slate-950">
              {new Date(flight.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs font-medium text-slate-500">{flight.departure_airport}</p>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-500">{calculateDuration()}</p>
            <div className="my-2 flex items-center gap-2">
              <span className="h-px flex-1 border-t border-dashed border-blue-200" />
              <Plane size={15} className="text-amber-500" />
              <span className="h-px flex-1 border-t border-dashed border-blue-200" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#073b70]">{isDirect ? 'Non-stop' : `${flight.total_stop_count} stop${flight.total_stop_count === 1 ? '' : 's'}`}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-semibold text-slate-950">
              {new Date(flight.arrival_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs font-medium text-slate-500">{flight.arrival_airport}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 lg:block lg:text-right">
          <div>
            <p className="text-2xl font-semibold text-[#073b70]">
              {formatConvertedCurrency(priceValue, sourceCurrency, targetCurrency, exchangeRates)}
            </p>
            {targetCurrency !== sourceCurrency && (
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Original {flight.currency_code} {priceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500">
              <p className="flex items-center gap-1 lg:justify-end"><Briefcase size={12} /> Cabin 7 kg</p>
              <p className="flex items-center gap-1 lg:justify-end"><Luggage size={12} /> Checked {flight.baggage_allowance || '20kg'}</p>
              <p className={flight.refundable_status ? 'text-emerald-600' : 'text-red-500'}>
                {flight.refundable_status ? 'Refundable' : 'Non-refundable'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect();
            }}
            className={`he-action mt-0 h-11 rounded-2xl px-5 text-sm font-semibold text-white transition lg:mt-4 ${selected ? 'bg-[#073b70]' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default FlightCard;
