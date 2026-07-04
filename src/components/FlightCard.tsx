import React from 'react';
import { Plane, ArrowRight } from 'lucide-react';
import type { FlightResultItem } from '../Services/api';

interface FlightCardProps {
  flight: FlightResultItem;
  selected?: boolean;
  onSelect: () => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({ flight, selected, onSelect }) => {
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
  const isDirect = flight.total_stop_count === 0;

  return (
    <div 
      onClick={onSelect}
      className={`group relative border bg-white rounded-2xl p-6 shadow-sm hover:shadow transition-all cursor-pointer ${selected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}`}
    >
      {/* Airline Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <Plane size={24} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">{flight.airline_name}</p>
          <p className="text-sm text-slate-500 font-mono">{flight.airline_code}</p>
        </div>
        <div className="ml-auto px-4 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
          STANDARD
        </div>
      </div>

      {/* Times & Duration */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-4xl font-bold text-slate-900">
            {new Date(flight.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-slate-600 mt-1">{flight.departure_airport}</p>
        </div>

        <div className="text-center">
          <div className="text-sm text-slate-500">{calculateDuration()}</div>
          <div className="flex justify-center my-2">
            <ArrowRight className="text-slate-400" size={20} />
          </div>
          <p className="text-xs font-bold text-blue-600 tracking-widest">{isDirect ? 'DIRECT' : `${flight.total_stop_count} STOP`}</p>
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold text-slate-900">
            {new Date(flight.arrival_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-slate-600 mt-1">{flight.arrival_airport}</p>
        </div>
      </div>

      {/* Price Options */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {/* Economy */}
        <div 
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`border rounded-2xl p-5 cursor-pointer transition-all ${selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}
        >
          <p className="text-xs font-bold text-blue-600 mb-1">ECONOMY</p>
          <p className="text-2xl font-bold text-slate-900">
            {flight.currency_code} {priceValue.toFixed(2)}
          </p>
          <p className="text-xs text-emerald-600 mt-2">BAGGAGE INCLUDED</p>
        </div>

        {/* Business - Dimmed */}
        <div className="border border-slate-200 rounded-2xl p-5 opacity-60 pointer-events-none">
          <p className="text-xs font-bold text-amber-600 mb-1">BUSINESS</p>
          <p className="text-2xl font-bold text-slate-400">
            {flight.currency_code} {(priceValue * 2.4).toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-2">PREMIUM EXPERIENCE</p>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <span className="font-medium">20KG INCLUDED</span>
          <span className={`font-medium ${flight.refundable_status ? 'text-emerald-600' : 'text-red-500'}`}>
            {flight.refundable_status ? 'REFUNDABLE' : 'NON-REFUNDABLE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;