import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Plane } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { addonApi, bookingApi, mealApi, seatApi, type BookingAddon, type CreateBookingRequest } from '../Services/api';
import { useAuth } from '../contexts/useAuth';

type AddOnKey = 'seat' | 'meal' | 'baggage' | 'assistance' | 'lounge' | 'insurance';

interface AddOnItem {
  key: AddOnKey;
  title: string;
  subtitle: string;
  price: string;
  image?: string;
}

const PRIMARY_CURRENCY_CODE = 'USD';
const PAYMENT_CHECKOUT_STATE_KEY = 'horizon_elite_checkout_state';

const savePaymentCheckoutState = (state: AddOnsRouteState & Record<string, any>) => {
  window.sessionStorage.setItem(PAYMENT_CHECKOUT_STATE_KEY, JSON.stringify(state));
};

const addOns: AddOnItem[] = [
  {
    key: 'seat',
    title: 'Seat Selection',
    subtitle: 'Grab your favorite spot when you fly.',
    price: 'Free of charge',
    image: 'https://images.unsplash.com/photo-1608023136037-626dad6c6188?q=80&w=500&auto=format&fit=crop',
  },
  {
    key: 'meal',
    title: 'Meal Selection',
    subtitle: 'Pre-order your meals and get your preferred choice.',
    price: 'From USD 12',
    image: 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?q=80&w=500&auto=format&fit=crop',
  },
  {
    key: 'baggage',
    title: 'Extra Baggage',
    subtitle: '2 carry-on bag(s), 30kg checked bag(s) included.',
    price: 'From USD 40',
    image: 'https://images.unsplash.com/photo-1553531889-e6cf4d692b1b?q=80&w=500&auto=format&fit=crop',
  },
  {
    key: 'assistance',
    title: 'Special Assistance',
    subtitle: 'Need special assistance during travel?',
    price: 'Free of charge',
  },
  {
    key: 'lounge',
    title: 'Elite Lounge Access',
    subtitle: 'Relax at our award-winning Skyview lounges.',
    price: 'From USD 60',
    image: 'https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=500&auto=format&fit=crop',
  },
  {
    key: 'insurance',
    title: 'Travel Insurance',
    subtitle: 'Comprehensive coverage for a worry-free trip.',
    price: 'From USD 20',
  },
];

const formatUsd = (amount: number) =>
  `${PRIMARY_CURRENCY_CODE} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const mealOptions = [
  { code: 'AVML', name: 'AVML: Asian Vegetarian', desc: 'Indian style vegetarian, no meat/fish/egg.', price: 12 },
  { code: 'BLML', name: 'BLML: Bland Meal', desc: 'Less fiber, non-spicy preparation.', price: 12 },
  { code: 'DBML', name: 'DBML: Diabetic Meal', desc: 'Low sugar, low fat formulation.', price: 12 },
  { code: 'GFML', name: 'GFML: Gluten-Free Meal', desc: 'No gluten-containing ingredients used.', price: 14 },
  { code: 'LFML', name: 'LFML: Low Fat Meal', desc: 'Low fat / low cholesterol levels.', price: 12 },
  { code: 'NLML', name: 'NLML: Non-Lactose Meal', desc: 'Dairy-free alternatives only.', price: 14 },
  { code: 'HNML', name: 'HNML: Hindu Meal', desc: 'No beef or pork products used.', price: 12 },
  { code: 'KSML', name: 'KSML: Kosher Meal', desc: 'Prepared under rabbinical supervision.', price: 18 },
  { code: 'MOML', name: 'MOML: Muslim Meal', desc: 'Halal, no pork/alcohol used.', price: 12 },
  { code: 'VLML', name: 'VLML: Vegetarian Lacto-Ovo', desc: 'Contains dairy/eggs, no meat.', price: 12 },
  { code: 'VGML', name: 'VGML: Vegetarian Vegan', desc: 'Strict plant-based ingredients.', price: 14 },
  { code: 'RVML', name: 'RVML: Raw Vegetarian', desc: 'Uncooked fruit and vegetables.', price: 14 },
];

const baggageOptions = [
  { code: 'BAG10', name: 'Extra Baggage 10 kg', weight: '10 kg', desc: 'Small top-up', price: 20 },
  { code: 'BAG20', name: 'Extra Baggage 20 kg', weight: '20 kg', desc: 'Medium stays', price: 40 },
  { code: 'BAG25', name: 'Extra Baggage 25 kg', weight: '25 kg', desc: 'Long trips', price: 50 },
  { code: 'BAG30', name: 'Extra Baggage 30 kg', weight: '30 kg', desc: 'Comprehensive', price: 60 },
];

const assistanceOptions = [
  { code: 'WCHR', name: 'Wheelchair Assistance' },
  { code: 'SENSORY', name: 'Sensory Support' },
  { code: 'MEDICAL', name: 'Medical Clearance' },
  { code: 'ACCESS', name: 'Visual/Hearing Assistance' },
];

const loungeOptions = [
  { code: 'SLV-WING', name: 'The Silver Wing', meta: 'Flagship lounge - BKK', price: 95, image: 'https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=900&auto=format&fit=crop' },
  { code: 'ZENITH', name: 'Zenith Club', meta: 'Boutique lounge - BKK', price: 60, image: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?q=80&w=900&auto=format&fit=crop' },
];

const insuranceOptions = [
  { code: 'INS-BASIC', name: 'Basic', desc: 'Essential medical and luggage coverage for your journey.', price: 20 },
  { code: 'INS-PREMIUM', name: 'Premium', desc: 'Comprehensive protection including flight delay and trip cancellation.', price: 35 },
  { code: 'INS-ULTIMATE', name: 'Ultimate', desc: 'Maximum peace of mind with 24/7 global concierge and unlimited medical.', price: 55 },
];

interface SelectedAddon {
  type: 'SEAT' | 'MEAL' | 'BAGGAGE' | 'ASSISTANCE' | 'LOUNGE' | 'INSURANCE';
  code: string;
  name: string;
  price: number;
  currencyCode?: string;
  quantity?: number;
}

interface SeatOption {
  id: string;
  code: string;
  name: string;
  cabin?: string;
  price: number;
  currencyCode?: string;
}

interface PricedMealOption {
  code: string;
  name: string;
  desc: string;
  price: number;
  currencyCode?: string;
}

interface PricedBaggageOption {
  code: string;
  name: string;
  weight: string;
  desc: string;
  price: number;
  currencyCode?: string;
}

const steps = ['Flight', 'Passenger', 'Services', 'Payment', 'Confirm'];

const Stepper = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-5 items-start gap-2 px-4 py-8">
    {steps.map((step, index) => {
      const complete = index < 2;
      const active = index === 2;
      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
          <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${complete ? 'border-blue-600 bg-blue-600 text-white' : active ? 'border-amber-400 bg-[#073b70] text-white' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
            {complete ? <BadgeCheck size={18} /> : index + 1}
          </span>
          <span className={`text-[10px] font-semibold uppercase ${complete || active ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
        </div>
      );
    })}
  </div>
);

interface AddOnsRouteState {
  booking?: any;
  booking_id?: string;
  bookingId?: string;
  pnrReference?: string;
  managedBooking?: boolean;
  selectedFlight?: any;
  selectedFlightId?: string;
  returnFlight?: any | null;
  flightSearchId?: string;
  tripType?: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
  searchData?: any;
  passengers?: any[];
  passengerIds?: string[];
  outboundFlight?: any;
  inboundFlight?: any | null;
  existingAddons?: BookingAddon[];
}

const getBaggageWeightFromCode = (code?: string): number => {
  const match = String(code || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const getBaggageWeightFromAddon = (addon: Pick<BookingAddon, 'addon_code' | 'addon_detail'>): number => {
  const fromCode = getBaggageWeightFromCode(addon.addon_code);
  if (fromCode > 0) return fromCode;

  const match = String(addon.addon_detail || '').match(/(\d+)\s*kg/i);
  return match ? Number(match[1]) : 0;
};

const flattenSeatOptions = (seatMapPayload: any): SeatOption[] => {
  const root = seatMapPayload?.data?.data || seatMapPayload?.data || seatMapPayload;
  const seats: SeatOption[] = [];
  const seen = new Set<string>();

  const visit = (value: any, cabin?: string) => {
    if (!value || typeof value !== 'object') return;

    const maybeSeat = value.type === 'seat' || value.designator || value.seat_number || value.seat_name;
    const id = value.id || value.seat_id;
    const code = value.designator || value.seat_number || value.seat_name || value.name;
    const available = value.available !== false && value.is_available !== false;

    if (maybeSeat && id && code && available && !seen.has(id)) {
      const amount = Number(value.total_amount || value.amount || value.price || value.fee || 0);
      seats.push({
        id,
        code: String(code),
        name: `Seat ${code}`,
        cabin: cabin || value.cabin_class || value.cabin || value.section,
        price: Number.isFinite(amount) ? amount : 0,
        currencyCode: value.total_currency || value.currency || value.currency_code,
      });
      seen.add(id);
    }

    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, cabin));
      return;
    }

    const nextCabin = value.cabin_class || value.cabin || value.name || cabin;
    Object.values(value).forEach((item) => visit(item, typeof item === 'object' ? nextCabin : cabin));
  };

  visit(root);

  return seats.slice(0, 48);
};

const BookingSummary = ({ 
  compact = false,
  routeState,
  selectedAddons,
  existingAddons = [],
  fareTotal,
  addOnsTotal,
  currencyCode,
  isCreatingBooking = false,
  errorMessage = '',
  onContinueToPayment,
}: { 
  compact?: boolean;
  routeState?: AddOnsRouteState;
  selectedAddons: SelectedAddon[];
  existingAddons?: BookingAddon[];
  fareTotal: number;
  addOnsTotal: number;
  currencyCode: string;
  isCreatingBooking?: boolean;
  errorMessage?: string;
  onContinueToPayment?: () => void;
}) => {
  const outboundFlight = routeState?.selectedFlight || routeState?.outboundFlight;
  const passengers = routeState?.passengers || [];
  const paidMeals = existingAddons.filter((addon) => addon.addon_type === 'MEAL');
  const paidBaggageWeight = existingAddons
    .filter((addon) => addon.addon_type === 'BAGGAGE')
    .reduce((total, addon) => total + getBaggageWeightFromAddon(addon), 0);
  const newBaggageWeight = selectedAddons
    .filter((addon) => addon.type === 'BAGGAGE')
    .reduce((total, addon) => total + getBaggageWeightFromCode(addon.code), 0);
  const passengerSummary = passengers.length
    ? passengers.map((passenger) => {
        const name = [passenger.pi_title, passenger.pi_first_name, passenger.pi_last_name].filter(Boolean).join(' ');
        const type = passenger.pi_passenger_type_code === 'CHD' ? 'Child' : passenger.pi_passenger_type_code === 'INF' ? 'Infant' : 'Adult';
        return `${type}${name ? ` (${name})` : ''}`;
      }).join(', ')
    : `${routeState?.passengerIds?.length || 0} passenger(s)`;
  const formatMoney = (amount: number) => `${currencyCode} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
  <aside className="h-fit rounded border border-slate-300 bg-white shadow-sm">
    <div className={`${compact ? 'bg-[#073b70] text-white' : 'bg-white'} border-b border-slate-300 px-7 py-6`}>
      <h2 className={`text-2xl font-semibold ${compact ? 'text-white' : 'text-[#073b70]'}`}>Booking Summary</h2>
      {compact && <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-blue-100">Reservation HE-202488</p>}
    </div>
    <div className="space-y-6 p-7">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Departing</span>
          <a href="#" className="text-xs font-semibold uppercase text-cyan-600 underline">Flight Details</a>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div><p className="text-sm font-semibold text-slate-600">{outboundFlight?.airline_name || 'Selected flight'}</p><p className="text-2xl font-semibold text-[#073b70]">{outboundFlight?.origin_airport_code || '--'} <span className="text-sm">{outboundFlight?.flight_number || ''}</span></p></div>
          <div className="flex flex-col items-center gap-1 text-center text-xs font-medium text-slate-400"><Plane size={17} />4h 25m</div>
          <div className="text-right"><p className="text-sm font-semibold text-slate-600">{outboundFlight?.cabin_class || 'Cabin'}</p><p className="text-2xl font-semibold text-[#073b70]">{outboundFlight?.destination_airport_code || '--'}</p></div>
        </div>
      </div>
      <div className="border-y border-slate-300 py-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Passengers & Contact</p>
        <p className="font-semibold text-slate-700">{passengerSummary}</p>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Add-ons</p>
        <div className="space-y-2 text-sm font-semibold text-slate-700">
          {existingAddons.length > 0 && (
            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600">
              Current paid add-ons: {paidMeals.length} meal(s)
              {paidBaggageWeight > 0 ? `, ${paidBaggageWeight}kg baggage` : ''}
              {newBaggageWeight > 0 ? ` -> ${paidBaggageWeight + newBaggageWeight}kg after payment` : ''}
            </div>
          )}
          {selectedAddons.length === 0 ? (
            <div className="text-slate-500">No add-ons selected</div>
          ) : selectedAddons.map((addon) => (
            <div key={`${addon.type}-${addon.code}`} className="flex justify-between gap-3">
              <span>{addon.name}</span>
              <span className={addon.price > 0 ? 'text-[#073b70]' : 'text-cyan-600'}>
                {addon.price > 0
                  ? `${addon.currencyCode || currencyCode} ${addon.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : 'Free'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 border-t border-slate-300 pt-5 text-sm font-semibold text-slate-700">
        <div className="flex justify-between"><span>Fare & Taxes</span><span>{formatMoney(fareTotal)}</span></div>
        <div className="flex justify-between"><span>Add-ons Total</span><span>{formatMoney(addOnsTotal)}</span></div>
        <div className="flex items-end justify-between pt-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Price</span>
          <span className="text-3xl font-semibold text-[#073b70]">{formatMoney(fareTotal + addOnsTotal)}</span>
        </div>
      </div>
      {errorMessage && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}
      <button
        onClick={onContinueToPayment}
        disabled={isCreatingBooking}
        className="flex h-14 w-full items-center justify-center rounded bg-[#073b70] text-sm font-semibold text-white transition hover:bg-[#0a2d51] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreatingBooking ? 'Creating Booking...' : 'Continue to Payment'}
      </button>
      <Link to="/passenger-information" state={routeState} className="flex h-12 items-center justify-center rounded border border-slate-300 text-sm font-semibold text-slate-600">
        Back
      </Link>
    </div>
  </aside>
  );
};

const SeatContent = ({
  selectedCode,
  options,
  loading,
  error,
  currencyCode,
  onSelect,
}: {
  selectedCode?: string;
  options: SeatOption[];
  loading: boolean;
  error: string;
  currencyCode: string;
  onSelect: (addon: SelectedAddon) => void;
}) => (
  <div className="border-t border-slate-300 bg-slate-50 p-7">
    {loading && (
      <div className="rounded border border-slate-300 bg-white p-6 text-center text-sm font-semibold text-slate-600">
        Loading available seats...
      </div>
    )}

    {!loading && error && (
      <div className="rounded border border-amber-300 bg-amber-50 p-6 text-center">
        <p className="text-lg font-semibold text-amber-800">Seat map unavailable</p>
        <p className="mt-2 text-sm font-semibold text-amber-700">{error}</p>
      </div>
    )}

    {!loading && !error && options.length === 0 && (
      <div className="rounded border border-slate-300 bg-white p-6 text-center">
        <p className="text-lg font-semibold text-[#073b70]">No selectable seats returned</p>
        <p className="mt-2 text-sm font-semibold text-slate-600">Seats may be assigned during check-in for this booking.</p>
      </div>
    )}

    {!loading && !error && options.length > 0 && (
      <div>
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-500">Available Seats</p>
        <div className="grid gap-3 sm:grid-cols-4 md:grid-cols-6">
          {options.map((seat) => (
            <button
              key={seat.id}
              type="button"
              onClick={() => onSelect({
                type: 'SEAT',
                code: seat.id,
                name: seat.name,
                price: seat.price,
                currencyCode: seat.currencyCode || currencyCode,
              })}
              className={`min-h-24 rounded border bg-white p-3 text-center ${selectedCode === seat.id ? 'border-[#073b70] bg-blue-50' : 'border-slate-300'}`}
            >
              <span className="block text-xl font-semibold text-[#073b70]">{seat.code}</span>
              {seat.cabin && <span className="mt-1 block truncate text-[11px] font-medium text-slate-500">{seat.cabin}</span>}
              <span className="mt-2 block text-xs font-semibold uppercase text-cyan-700">
                {seat.price > 0 ? `${seat.currencyCode || currencyCode} ${seat.price.toLocaleString()}` : 'Free'}
              </span>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

const MealContent = ({
  selectedCode,
  options,
  currencyCode,
  onSelect,
}: {
  selectedCode?: string;
  options: PricedMealOption[];
  currencyCode: string;
  onSelect: (addon: SelectedAddon) => void;
}) => (
  <div className="border-t border-slate-300 p-7">
    <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-500">Dietary & Medical</p>
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => {
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => onSelect({ type: 'MEAL', code: option.code, name: option.name, price: option.price, currencyCode: option.currencyCode })}
            className={`min-h-24 rounded border p-4 text-left ${selectedCode === option.code ? 'border-[#073b70] bg-blue-50' : 'border-slate-300 bg-white'}`}
          >
            <span className="block text-sm font-semibold text-[#073b70]">{option.name}</span>
            <span className="mt-1 block text-xs font-semibold text-slate-500">{option.desc}</span>
            <span className="mt-3 block text-xs font-semibold uppercase text-cyan-600">
              {option.price > 0 ? `${option.currencyCode || currencyCode} ${option.price.toLocaleString()}` : 'Free of charge'}
            </span>
            {selectedCode === option.code && <span className="mt-3 block text-xs font-semibold uppercase text-[#073b70]">Selected - click again to remove</span>}
          </button>
        );
      })}
    </div>
  </div>
);

const BaggageContent = ({
  selectedCode,
  options,
  currencyCode,
  onSelect,
}: {
  selectedCode?: string;
  options: PricedBaggageOption[];
  currencyCode: string;
  onSelect: (addon: SelectedAddon) => void;
}) => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-6 md:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => onSelect({ type: 'BAGGAGE', code: option.code, name: option.name, price: option.price, currencyCode: option.currencyCode })}
          className={`h-36 border p-5 text-center ${selectedCode === option.code ? 'border-[#073b70] bg-blue-50' : 'border-slate-300 bg-white'}`}
        >
          <span className="block text-2xl font-semibold text-[#073b70]">{option.weight}</span>
          <span className="mt-2 block text-sm font-semibold text-slate-500">{option.desc}</span>
          <span className="mt-4 block text-sm font-semibold text-[#073b70]">{option.currencyCode || currencyCode} {option.price.toLocaleString()}</span>
          {selectedCode === option.code && <span className="mt-2 block text-xs font-semibold uppercase text-[#073b70]">Selected</span>}
        </button>
      ))}
    </div>
    <div className="mt-6 rounded bg-[#073b70] p-4 text-sm font-semibold text-white">Elite Privilege: You receive a 15% discount on all pre-booked extra baggage weight.</div>
  </div>
);

const AssistanceContent = ({
  selectedCode,
  onSelect,
}: {
  selectedCode?: string;
  onSelect: (addon: SelectedAddon) => void;
}) => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-6 md:grid-cols-2">
      {assistanceOptions.map((service) => (
        <button
          key={service.code}
          type="button"
          onClick={() => onSelect({ type: 'ASSISTANCE', code: service.code, name: service.name, price: 0 })}
          className={`min-h-36 border p-6 text-center ${selectedCode === service.code ? 'border-[#073b70] bg-blue-50' : 'border-slate-300 bg-white'}`}
        >
          <span className="block text-lg font-semibold text-[#073b70]">{service.name}</span>
          <span className="mt-2 block text-sm font-semibold text-slate-500">Personalized care during your journey.</span>
          <span className="mt-4 block text-xs font-semibold uppercase text-cyan-600">Free of charge</span>
          {selectedCode === service.code && <span className="mt-2 block text-xs font-semibold uppercase text-[#073b70]">Selected</span>}
        </button>
      ))}
    </div>
    <div className="mt-6 rounded bg-[#073b70] p-4 text-sm font-semibold text-white">Elite Service: Our crew will be notified of your specific requirements to ensure your comfort.</div>
  </div>
);

const LoungeContent = ({
  selectedCode,
  onSelect,
}: {
  selectedCode?: string;
  onSelect: (addon: SelectedAddon) => void;
}) => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-8 md:grid-cols-2">
      {loungeOptions.map((option) => (
        <article key={option.code} className={`border bg-white ${selectedCode === option.code ? 'border-[#073b70]' : 'border-slate-300'}`}>
          <img src={option.image} alt={option.name} className="h-56 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-3xl font-semibold text-[#073b70]">{option.name}</h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500">{option.meta}</p>
            <p className="mt-4 min-h-20 text-base font-semibold leading-7 text-slate-600">A quiet sanctuary with premium dining, work spaces, and calm pre-flight service.</p>
            <button type="button" onClick={() => onSelect({ type: 'LOUNGE', code: option.code, name: option.name, price: option.price })} className="mt-5 h-12 w-full border border-[#073b70] bg-[#073b70] text-sm font-semibold tracking-widest text-white">{selectedCode === option.code ? 'Selected - Click to Remove' : formatUsd(option.price)}</button>
          </div>
        </article>
      ))}
    </div>
  </div>
);

const InsuranceContent = ({
  selectedCode,
  onSelect,
}: {
  selectedCode?: string;
  onSelect: (addon: SelectedAddon) => void;
}) => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-6 md:grid-cols-3">
      {insuranceOptions.map((option, index) => (
        <article key={option.code} className={`relative border p-6 text-center ${selectedCode === option.code ? 'border-[#073b70] bg-blue-50' : index === 1 ? 'border-amber-400' : 'border-slate-300'}`}>
          {index === 1 && <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-amber-300 px-4 py-1 text-[10px] font-semibold uppercase text-white">Recommended</span>}
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">{option.name}</h3>
          <p className="mt-5 min-h-20 text-base font-semibold text-slate-600">{option.desc}</p>
          <p className="mt-4 text-sm text-slate-500">USD <span className="text-4xl font-semibold text-[#073b70]">{option.price.toLocaleString()}</span></p>
          <button type="button" onClick={() => onSelect({ type: 'INSURANCE', code: option.code, name: `${option.name} Insurance`, price: option.price })} className={`mt-5 h-11 w-full border border-[#073b70] text-sm font-semibold ${selectedCode === option.code || index === 1 ? 'bg-[#073b70] text-white' : 'text-[#073b70]'}`}>{selectedCode === option.code ? 'Selected - Remove' : 'Select'}</button>
        </article>
      ))}
    </div>
  </div>
);

function AddOns(): React.JSX.Element {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { user } = useAuth();
  
  const routeState = (state ?? {}) as AddOnsRouteState;
  
  const [openSection, setOpenSection] = useState<AddOnKey | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addonWarning, setAddonWarning] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [backendMeals, setBackendMeals] = useState<PricedMealOption[]>([]);
  const [backendBaggage, setBackendBaggage] = useState<PricedBaggageOption[]>([]);
  const [seatOptions, setSeatOptions] = useState<SeatOption[]>([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const [seatError, setSeatError] = useState('');
  
  const personalized = openSection === 'assistance';

  const toNumberOrZero = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getFlightPrice = (flight: any): number => {
    if (!flight) return 0;
    return (
      toNumberOrZero(flight.selected_fare_price) ||
      toNumberOrZero(flight.total_price) ||
      toNumberOrZero(flight.total_amount) ||
      toNumberOrZero(flight.total_fare_price) ||
      0
    );
  };

  const outboundFlight = routeState.selectedFlight || routeState.outboundFlight;
  const inboundFlight = routeState.returnFlight || routeState.inboundFlight;
  const fareTotal = useMemo(() => getFlightPrice(outboundFlight) + getFlightPrice(inboundFlight), [outboundFlight, inboundFlight]);
  const addOnsTotal = useMemo(() => selectedAddons.reduce((total, addon) => total + addon.price * (addon.quantity || 1), 0), [selectedAddons]);
  const currencyCode = PRIMARY_CURRENCY_CODE;
  const contactEmail = routeState.passengers?.find(passenger => passenger.pi_contact_email)?.pi_contact_email;
  const existingAddons = routeState.existingAddons || [];
  const summaryFareTotal = routeState.managedBooking ? 0 : fareTotal;

  const getBackendPrice = (item: any): number => (
    toNumberOrZero(item?.price ?? item?.addon_price ?? item?.meal_price ?? item?.amount ?? item?.extra_price)
  );

  const getBackendCurrency = (item: any): string | undefined => (
    item?.currency_code || item?.currency || item?.currencyCode
  );

  const mealDisplayOptions: PricedMealOption[] = backendMeals.length > 0
    ? backendMeals
    : mealOptions.map((option) => {
        const [code] = option.code.split(':');
        return { code, name: option.name, desc: option.desc, price: 0, currencyCode };
      });

  const baggageDisplayOptions: PricedBaggageOption[] = backendBaggage.length > 0
    ? backendBaggage
    : baggageOptions.map((option) => ({ ...option, currencyCode }));

  const selectAddon = (addon: SelectedAddon) => {
    if (routeState.managedBooking && addon.type === 'MEAL') {
      setSelectedAddons((current) => {
        if (current.some((item) => item.type === 'MEAL' && item.code === addon.code)) {
          return current.filter((item) => !(item.type === 'MEAL' && item.code === addon.code));
        }
        return [...current, addon];
      });
      return;
    }

    setSelectedAddons((current) => {
      if (current.some((item) => item.type === addon.type && item.code === addon.code)) {
        return current.filter((item) => !(item.type === addon.type && item.code === addon.code));
      }

      return [...current.filter((item) => item.type !== addon.type), addon];
    });
  };

  const getSelectedCode = (type: SelectedAddon['type']) => selectedAddons.find((addon) => addon.type === type)?.code;

  const renderContent = (key: AddOnKey) => {
    switch (key) {
      case 'seat':
        return (
          <SeatContent
            selectedCode={getSelectedCode('SEAT')}
            options={seatOptions}
            loading={seatLoading}
            error={seatError}
            currencyCode={currencyCode}
            onSelect={selectAddon}
          />
        );
      case 'meal':
        return <MealContent selectedCode={getSelectedCode('MEAL')} options={mealDisplayOptions} currencyCode={currencyCode} onSelect={selectAddon} />;
      case 'baggage':
        return <BaggageContent selectedCode={getSelectedCode('BAGGAGE')} options={baggageDisplayOptions} currencyCode={currencyCode} onSelect={selectAddon} />;
      case 'assistance':
        return <AssistanceContent selectedCode={getSelectedCode('ASSISTANCE')} onSelect={selectAddon} />;
      case 'lounge':
        return <LoungeContent selectedCode={getSelectedCode('LOUNGE')} onSelect={selectAddon} />;
      case 'insurance':
        return <InsuranceContent selectedCode={getSelectedCode('INSURANCE')} onSelect={selectAddon} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const seatMapId = outboundFlight?.duffel_order_id || outboundFlight?.order_id || '';

    if (seatMapId) {
      setSeatLoading(true);
      setSeatError('');
      void seatApi.getSeatMap(seatMapId)
        .then((response) => {
          setSeatOptions(flattenSeatOptions(response));
        })
        .catch((error: Error) => {
          setSeatOptions([]);
          setSeatError(error.message || 'Seat selection is not available for this flight.');
        })
        .finally(() => setSeatLoading(false));
    } else {
      setSeatOptions([]);
      setSeatError('Seat maps are available after a Duffel order has been created for this booking.');
    }

    void mealApi.getMeals()
      .then((response) => {
        const meals = Array.isArray(response.data)
          ? response.data.map((item: any) => {
              const code = item?.meal_code || item?.code || item?.addon_code || '';
              const rawName = item?.meal_name || item?.name || item?.addon_detail || item?.description || code;
              const name = code && !String(rawName).startsWith(`${code}:`) ? `${code}: ${rawName}` : String(rawName);
              return {
                code,
                name,
                desc: item?.meal_description || item?.description || item?.desc || item?.meal_category || 'Pre-order this meal for your flight.',
                price: getBackendPrice(item),
                currencyCode: getBackendCurrency(item),
              };
            }).filter((item) => item.code)
          : [];
        setBackendMeals(meals);
      })
      .catch(() => setBackendMeals([]));
    void addonApi.getBaggageOptions()
      .then((response) => {
        const baggage = Array.isArray(response.data)
          ? response.data.map((item: any) => {
              const desc = item?.description || item?.addon_detail || item?.desc || 'Extra checked baggage';
              return {
                code: item?.code || item?.baggage_code || item?.addon_code || '',
                name: item?.name || desc,
                weight: item?.weight ? `${item.weight} kg` : item?.baggage_weight || item?.weight_label || '',
                desc,
                price: getBackendPrice(item),
                currencyCode: getBackendCurrency(item),
              };
            }).filter((item) => item.code)
          : [];
        setBackendBaggage(baggage);
      })
      .catch(() => setBackendBaggage([]));
  }, [outboundFlight?.flight_offer_id]);

  useEffect(() => {
    const requestedSection = hash.replace('#', '') as AddOnKey;
    if (addOns.some((item) => item.key === requestedSection)) {
      setOpenSection(requestedSection);
    }
  }, [hash]);

  const getAddOnPriceLabel = (key: AddOnKey, fallback: string): string => {
    const options = key === 'meal' ? mealDisplayOptions : key === 'baggage' ? baggageDisplayOptions : [];
    const paidOptions = options.filter((option) => option.price > 0);
    if (paidOptions.length === 0) return fallback;

    const lowest = paidOptions.reduce((currentLowest, option) => (
      option.price < currentLowest.price ? option : currentLowest
    ), paidOptions[0]);

    return `From ${lowest.currencyCode || currencyCode} ${lowest.price.toLocaleString()}`;
  };

  const handleContinueToPayment = async () => {
    try {
      setIsCreatingBooking(true);
      setErrorMessage('');
      setAddonWarning('');

      const toNumberOrZero = (value: unknown): number => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      };

      const getFlightPrice = (flight: any): number => {
        if (!flight) return 0;
        return (
          toNumberOrZero(flight.selected_fare_price) ||
          toNumberOrZero(flight.total_price) ||
          toNumberOrZero(flight.total_amount) ||
          0
        );
      };

      // Validate required data
      if (!routeState.selectedFlightId || !routeState.passengerIds || routeState.passengerIds.length === 0) {
        setErrorMessage('Missing flight or passenger information. Please try again.');
        setIsCreatingBooking(false);
        return;
      }

      // Get total price from all selected flights using all known backend field names.
      const outboundFlight = routeState.selectedFlight || routeState.outboundFlight;
      const inboundFlight = routeState.returnFlight || routeState.inboundFlight;
      const outboundPrice = getFlightPrice(outboundFlight);
      const inboundPrice = getFlightPrice(inboundFlight);
      
      const totalPrice = fareTotal + addOnsTotal;
      const existingBookingId = routeState.booking_id || routeState.bookingId || routeState.booking?.booking_id;

      console.log('💰 [AddOns] Price Calculation:');
      console.log('   - Outbound (selectedFlight):', outboundPrice);
      console.log('   - Inbound (returnFlight):', inboundPrice);
      console.log('   - Total:', totalPrice);

      const userEmail = user?.email_address || contactEmail;

      if (!userEmail) {
        setErrorMessage('Passenger contact email is required for guest booking.');
        setIsCreatingBooking(false);
        return;
      }

      console.log('👤 Using booking contact email:', userEmail);

      if (routeState.managedBooking && existingBookingId) {
        let currentAddonWarning = '';
        const pendingAddonIds: string[] = [];

        if (selectedAddons.length > 0) {
          const firstPassengerId = routeState.passengerIds[0];
          const selectedFlightId = routeState.selectedFlightId;

          try {
            await Promise.all(selectedAddons.map(async (addon) => {
              const response = await addonApi.addAddon({
                booking_id: existingBookingId,
                passenger_id: firstPassengerId,
                selected_flight_id: selectedFlightId,
                addon_type: addon.type,
                addon_code: addon.code,
                addon_detail: addon.name,
                quantity: addon.quantity || 1,
                addon_price: addon.price,
                currency_code: addon.currencyCode || currencyCode,
                addon_status: 'PENDING_PAYMENT',
              });

              if (response.data?.addon_id) {
                pendingAddonIds.push(response.data.addon_id);
              }
            }));
          } catch (addonError) {
            console.warn('Could not save add-ons for managed booking:', addonError);
            currentAddonWarning = 'Your booking was found, but the backend could not save one or more add-ons.';
            setAddonWarning(currentAddonWarning);
          }
        }

        const paymentState = {
          ...routeState,
          booking_id: existingBookingId,
          selectedAddons,
          pendingAddonIds,
          postBookingAddonPayment: true,
          fareTotal: 0,
          addOnsTotal,
          totalPaymentAmount: addOnsTotal,
          currency_code: currencyCode,
          outboundFlight,
          inboundFlight,
          user_email_address: userEmail,
          addonWarning: currentAddonWarning,
        };

        savePaymentCheckoutState(paymentState);

        navigate(addOnsTotal > 0 ? '/payment' : '/booking-confirmed', {
          state: paymentState,
        });
        return;
      }

      // Build booking request
      const bookingRequest: CreateBookingRequest = {
        user_email_address: userEmail,
        selected_flight_id: routeState.selectedFlightId,
        passenger_ids: routeState.passengerIds,
        total_payment_amount: totalPrice,
        currency_code: currencyCode,
        trip_type: routeState.tripType || 'ONE_WAY',
        cabin_class: routeState.selectedFlight?.cabin_class || routeState.outboundFlight?.cabin_class || 'ECONOMY',
      };

      console.log('📋 Creating Booking with request:', bookingRequest);

      // Call booking API
      const response = await bookingApi.createBooking(bookingRequest);

      console.log('✅ Booking created successfully!');
      console.log('🎫 PNR Reference:', response.booking.pnr_reference);
      console.log('📊 Booking Status:', response.booking.booking_status);

      const bookingId = response.booking.booking_id;
      let currentAddonWarning = '';

      if (bookingId && selectedAddons.length > 0) {
        const firstPassengerId = routeState.passengerIds[0];
        const selectedFlightId = routeState.selectedFlightId;
        try {
          await Promise.all(selectedAddons.map(async (addon) => {
            if (addon.type === 'BAGGAGE') {
              await addonApi.selectBaggage({
                booking_id: bookingId,
                passenger_id: firstPassengerId,
                selected_flight_id: selectedFlightId,
                baggage_code: addon.code,
              });
            }

            await addonApi.addAddon({
              booking_id: bookingId,
              passenger_id: firstPassengerId,
              selected_flight_id: selectedFlightId,
              addon_type: addon.type,
              addon_code: addon.code,
              addon_detail: addon.name,
              quantity: addon.quantity || 1,
              addon_price: addon.price,
              currency_code: addon.currencyCode || currencyCode,
            });
          }));
        } catch (addonError) {
          console.warn('Could not save add-ons, continuing to payment:', addonError);
          currentAddonWarning = 'Your add-ons were kept for checkout, but the backend could not save them yet.';
          setAddonWarning(currentAddonWarning);
        }
      }

      const paymentState = {
        ...routeState,
        booking: response.booking,
        booking_id: bookingId,
        pnrReference: response.booking.pnr_reference,
        bookingStatus: response.booking.booking_status,
        totalPaymentAmount: totalPrice,
        currency_code: currencyCode,
        outboundFlight,
        inboundFlight,
        selectedAddons,
        fareTotal,
        addOnsTotal,
        user_email_address: userEmail,
        addonWarning: currentAddonWarning,
      };

      savePaymentCheckoutState(paymentState);

      navigate('/payment', {
        state: paymentState,
      });
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-6">
          <Link to="/" className="text-3xl font-semibold tracking-wide text-[#073b70]">HORIZON<span className="text-amber-500">ELITE</span></Link>
        </div>
      </header>
      <Stepper />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 lg:grid-cols-[1fr_390px]">
        <section>
          <div className="mb-8">
            <h1 className="text-4xl font-semibold tracking-normal text-[#073b70]">{personalized ? 'Personalize Your Journey' : 'Elevate your travel experience'}</h1>
            <p className="mt-3 text-lg font-semibold text-slate-600">Personalize your journey with our premium selection of flight services.</p>
          </div>

          <div className="space-y-5">
            {addOns.map((item) => {
              const open = openSection === item.key;
              return (
                <article id={item.key} key={item.key} className={`border bg-white shadow-sm ${open ? 'border-[#073b70]' : 'border-slate-300'}`}>
                  <button type="button" onClick={() => setOpenSection(open ? null : item.key)} className="flex w-full items-center gap-6 p-6 text-left">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-16 w-16 rounded object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded bg-slate-100 text-2xl font-semibold text-[#073b70]">{item.title.slice(0, 1)}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-2xl font-semibold text-[#073b70]">{item.title}</span>
                      <span className="mt-1 block text-sm font-semibold text-slate-600">{item.subtitle}</span>
                      <span className="mt-1 block text-xs font-semibold uppercase text-cyan-600">{getAddOnPriceLabel(item.key, item.price)}</span>
                    </span>
                    <span className="text-2xl font-semibold text-[#073b70]">{open ? '^' : '+'}</span>
                  </button>
                  {open && renderContent(item.key)}
                </article>
              );
            })}
          </div>
        </section>

        <BookingSummary 
          compact={personalized} 
          routeState={routeState}
          selectedAddons={selectedAddons}
          existingAddons={existingAddons}
          fareTotal={summaryFareTotal}
          addOnsTotal={addOnsTotal}
          currencyCode={currencyCode}
          isCreatingBooking={isCreatingBooking}
          errorMessage={errorMessage || addonWarning}
          onContinueToPayment={handleContinueToPayment}
        />
      </div>
      <footer className="pb-8 text-center text-xs font-semibold text-slate-400">© 2024 Horizon Elite Airways. All data transmitted is encrypted using the highest industry standards.</footer>
    </main>
  );
}

export default AddOns;
