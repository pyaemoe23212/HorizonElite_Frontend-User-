import React from 'react';
import { Plane } from 'lucide-react';
import type { FlightResultItem } from '../Services/api';

interface FlightCardProps {
  flight: FlightResultItem;
  selected?: boolean;
  onSelect: () => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, selected, onSelect }) => {
  // Calculate duration from departure and arrival times if not provided
  const calculateDuration = (): string => {
    if (flight.duration) return flight.duration;
    
    const departure = new Date(flight.departure_datetime);
    const arrival = new Date(flight.arrival_datetime);
    const diffMinutes = Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Convert total_price from string to number
  const priceValue = parseFloat(flight.total_price);

  // Determine stops text
  const stopsText = flight.total_stop_count === 0 ? 'Direct' : `${flight.total_stop_count} Stop${flight.total_stop_count !== 1 ? 's' : ''}`;

  return (
    <article className={`rounded-lg border bg-white p-5 shadow-sm ${selected ? 'border-blue-700 ring-2 ring-blue-700' : 'border-slate-300'}`}>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr_1fr] lg:items-center">
        {/* Flight details section */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center bg-[#073b70] text-white">
              <Plane size={18} />
            </span>
            <div>
              <p className="font-black text-[#073b70]">{flight.airline_name}</p>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                {flight.airline_code} {flight.flight_number || ''}
              </p>
            </div>
            <span className="ml-auto rounded-full border border-blue-500 px-3 py-1 text-[10px] font-black uppercase text-blue-600">
              {flight.baggage_allowance || 'Standard'}
            </span>
          </div>

          {/* Timeline: departure → duration → arrival */}
          <div className="grid grid-cols-[1fr_1.2fr_1fr] items-center gap-3">
            <div>
              <p className="text-3xl font-black text-[#073b70]">
                {new Date(flight.departure_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs font-bold text-slate-500">{flight.departure_airport}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500">{calculateDuration()}</p>
              <div className="my-2 h-px bg-slate-300" />
              <p className="text-xs font-black uppercase text-blue-600">{stopsText}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-[#073b70]">
                {new Date(flight.arrival_datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs font-bold text-slate-500">{flight.arrival_airport}</p>
            </div>
          </div>

          {/* Baggage and refund info */}
          <div className="mt-6 flex gap-6 text-[11px] font-black uppercase text-slate-500">
            <span>{flight.baggage_allowance || '20kg'} Included</span>
            <span className={flight.refundable_status ? 'text-slate-500' : 'text-red-500'}>
              {flight.refundable_status ? 'Refundable' : 'Non-refundable'}
            </span>
          </div>
        </div>

        {/* Price and selection button */}
        <button
          type="button"
          onClick={onSelect}
          className={`rounded-lg border p-5 text-left transition hover:border-blue-600 ${
            selected ? 'border-[#073b70] bg-blue-50' : 'border-slate-200'
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase text-blue-600">{flight.cabin_class}</p>
            <span className={`h-4 w-4 rounded-full border-2 ${selected ? 'border-[#073b70] bg-[#073b70]' : 'border-slate-300'}`} />
          </div>
          <p className="text-2xl font-black text-[#073b70]">
            {flight.currency_code} {priceValue.toFixed(2)}
          </p>
          <p className="mt-2 text-[10px] font-black uppercase text-slate-500">Baggage Included</p>
        </button>
      </div>
    </article>
  );
};

export default FlightCard;