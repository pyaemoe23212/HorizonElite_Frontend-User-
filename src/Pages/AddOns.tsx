import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Plane } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { addonApi, bookingApi, mealApi, seatApi, type CreateBookingRequest } from '../Services/api';
import { useAuth } from '../contexts/AuthContext';

type AddOnKey = 'seat' | 'meal' | 'baggage' | 'assistance' | 'lounge' | 'insurance';

interface AddOnItem {
  key: AddOnKey;
  title: string;
  subtitle: string;
  price: string;
  image?: string;
}

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
    price: 'Included',
    image: 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?q=80&w=500&auto=format&fit=crop',
  },
  {
    key: 'baggage',
    title: 'Extra Baggage',
    subtitle: '2 carry-on bag(s), 30kg checked bag(s) included.',
    price: 'From THB 1,450',
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
    price: 'From THB 1,800',
    image: 'https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=500&auto=format&fit=crop',
  },
  {
    key: 'insurance',
    title: 'Travel Insurance',
    subtitle: 'Comprehensive coverage for a worry-free trip.',
    price: 'From THB 850',
  },
];

const mealOptions = [
  ['AVML: Asian Vegetarian', 'Indian style vegetarian, no meat/fish/egg.'],
  ['BLML: Bland Meal', 'Less fiber, non-spicy preparation.'],
  ['DBML: Diabetic Meal', 'Low sugar, low fat formulation.'],
  ['GFML: Gluten-Free Meal', 'No gluten-containing ingredients used.'],
  ['LFML: Low Fat Meal', 'Low fat / low cholesterol levels.'],
  ['NLML: Non-Lactose Meal', 'Dairy-free alternatives only.'],
  ['HNML: Hindu Meal', 'No beef or pork products used.'],
  ['KSML: Kosher Meal', 'Prepared under rabbinical supervision.'],
  ['MOML: Muslim Meal', 'Halal, no pork/alcohol used.'],
  ['VLML: Vegetarian Lacto-Ovo', 'Contains dairy/eggs, no meat.'],
  ['VGML: Vegetarian Vegan', 'Strict plant-based ingredients.'],
  ['RVML: Raw Vegetarian', 'Uncooked fruit and vegetables.'],
];

const baggageOptions = [
  { code: 'BG20', name: 'Extra Baggage 20 kg', weight: '20 kg', desc: 'Medium stays', price: 1450 },
  { code: 'BG25', name: 'Extra Baggage 25 kg', weight: '25 kg', desc: 'Long trips', price: 1850 },
  { code: 'BG30', name: 'Extra Baggage 30 kg', weight: '30 kg', desc: 'Comprehensive', price: 2200 },
];

const assistanceOptions = [
  { code: 'WCHR', name: 'Wheelchair Assistance' },
  { code: 'SENSORY', name: 'Sensory Support' },
  { code: 'MEDICAL', name: 'Medical Clearance' },
  { code: 'ACCESS', name: 'Visual/Hearing Assistance' },
];

const loungeOptions = [
  { code: 'SLV-WING', name: 'The Silver Wing', meta: 'Flagship lounge - BKK', price: 2800, image: 'https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=900&auto=format&fit=crop' },
  { code: 'ZENITH', name: 'Zenith Club', meta: 'Boutique lounge - BKK', price: 1800, image: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?q=80&w=900&auto=format&fit=crop' },
];

const insuranceOptions = [
  { code: 'INS-BASIC', name: 'Basic', desc: 'Essential medical and luggage coverage for your journey.', price: 850 },
  { code: 'INS-PREMIUM', name: 'Premium', desc: 'Comprehensive protection including flight delay and trip cancellation.', price: 1420 },
  { code: 'INS-ULTIMATE', name: 'Ultimate', desc: 'Maximum peace of mind with 24/7 global concierge and unlimited medical.', price: 2450 },
];

interface SelectedAddon {
  type: 'MEAL' | 'BAGGAGE' | 'ASSISTANCE' | 'LOUNGE' | 'INSURANCE';
  code: string;
  name: string;
  price: number;
  currencyCode?: string;
  quantity?: number;
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

const steps = ['Flight', 'Passenger', 'Service', 'Payment', 'Additional Services', 'Personalized'];

const Stepper = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-6 items-start gap-2 px-4 py-8">
    {steps.map((step, index) => {
      const complete = index < 2;
      const active = index === 2;
      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
          <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${complete ? 'border-blue-600 bg-blue-600 text-white' : active ? 'border-amber-400 bg-[#073b70] text-white' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
            {complete ? <BadgeCheck size={18} /> : index + 1}
          </span>
          <span className={`text-[10px] font-black uppercase ${complete || active ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
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
}

const BookingSummary = ({ 
  compact = false,
  routeState,
  selectedAddons,
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
  fareTotal: number;
  addOnsTotal: number;
  currencyCode: string;
  isCreatingBooking?: boolean;
  errorMessage?: string;
  onContinueToPayment?: () => void;
}) => {
  const outboundFlight = routeState?.selectedFlight || routeState?.outboundFlight;
  const passengers = routeState?.passengers || [];
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
      <h2 className={`text-2xl font-black ${compact ? 'text-white' : 'text-[#073b70]'}`}>Booking Summary</h2>
      {compact && <p className="mt-1 text-xs font-black uppercase tracking-widest text-blue-100">Reservation HE-202488</p>}
    </div>
    <div className="space-y-6 p-7">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Departing</span>
          <a href="#" className="text-xs font-black uppercase text-cyan-600 underline">Flight Details</a>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div><p className="text-sm font-semibold text-slate-600">{outboundFlight?.airline_name || 'Selected flight'}</p><p className="text-2xl font-black text-[#073b70]">{outboundFlight?.origin_airport_code || '--'} <span className="text-sm">{outboundFlight?.flight_number || ''}</span></p></div>
          <div className="flex flex-col items-center gap-1 text-center text-xs font-bold text-slate-400"><Plane size={17} />4h 25m</div>
          <div className="text-right"><p className="text-sm font-semibold text-slate-600">{outboundFlight?.cabin_class || 'Cabin'}</p><p className="text-2xl font-black text-[#073b70]">{outboundFlight?.destination_airport_code || '--'}</p></div>
        </div>
      </div>
      <div className="border-y border-slate-300 py-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Passengers & Contact</p>
        <p className="font-semibold text-slate-700">{passengerSummary}</p>
      </div>
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Selected Add-ons</p>
        <div className="space-y-2 text-sm font-semibold text-slate-700">
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
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Total Price</span>
          <span className="text-3xl font-black text-[#073b70]">{formatMoney(fareTotal + addOnsTotal)}</span>
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
        className="flex h-14 w-full items-center justify-center rounded bg-[#073b70] text-sm font-black text-white transition hover:bg-[#0a2d51] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isCreatingBooking ? 'Creating Booking...' : 'Continue to Payment'}
      </button>
      <Link to="/passenger-information" state={routeState} className="flex h-12 items-center justify-center rounded border border-slate-300 text-sm font-black text-slate-600">
        Back
      </Link>
    </div>
  </aside>
  );
};

const SeatContent = () => (
  <div className="border-t border-slate-300 bg-slate-50 p-7">
    <div className="rounded border border-slate-300 bg-white p-6 text-center">
      <p className="text-lg font-black text-[#073b70]">Seat selection is currently unavailable</p>
      <p className="mt-2 text-sm font-semibold text-slate-600">Seats will be assigned during check-in for this booking.</p>
    </div>
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
    <p className="mb-5 text-xs font-black uppercase tracking-widest text-slate-500">Dietary & Medical</p>
    <div className="grid gap-4 md:grid-cols-3">
      {options.map((option) => {
        return (
        <button
          key={option.code}
          type="button"
          onClick={() => onSelect({ type: 'MEAL', code: option.code, name: option.name, price: option.price, currencyCode: option.currencyCode })}
          className={`min-h-24 rounded border p-4 text-left ${selectedCode === option.code ? 'border-[#073b70] bg-blue-50' : 'border-slate-300 bg-white'}`}
        >
          <span className="block text-sm font-black text-[#073b70]">{option.name}</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">{option.desc}</span>
          <span className="mt-3 block text-xs font-black uppercase text-cyan-600">
            {option.price > 0 ? `${option.currencyCode || currencyCode} ${option.price.toLocaleString()}` : 'Free of charge'}
          </span>
        </button>
      )})}
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
          <span className="block text-2xl font-black text-[#073b70]">{option.weight}</span>
          <span className="mt-2 block text-sm font-semibold text-slate-500">{option.desc}</span>
          <span className="mt-4 block text-sm font-black text-[#073b70]">{option.currencyCode || currencyCode} {option.price.toLocaleString()}</span>
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
          <span className="block text-lg font-black text-[#073b70]">{service.name}</span>
          <span className="mt-2 block text-sm font-semibold text-slate-500">Personalized care during your journey.</span>
          <span className="mt-4 block text-xs font-black uppercase text-cyan-600">Free of charge</span>
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
            <h3 className="text-3xl font-black text-[#073b70]">{option.name}</h3>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{option.meta}</p>
            <p className="mt-4 min-h-20 text-base font-semibold leading-7 text-slate-600">A quiet sanctuary with premium dining, work spaces, and calm pre-flight service.</p>
            <button type="button" onClick={() => onSelect({ type: 'LOUNGE', code: option.code, name: option.name, price: option.price })} className="mt-5 h-12 w-full border border-[#073b70] bg-[#073b70] text-sm font-black tracking-widest text-white">THB {option.price.toLocaleString()}</button>
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
          {index === 1 && <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-amber-300 px-4 py-1 text-[10px] font-black uppercase text-white">Recommended</span>}
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">{option.name}</h3>
          <p className="mt-5 min-h-20 text-base font-semibold text-slate-600">{option.desc}</p>
          <p className="mt-4 text-sm text-slate-500">THB <span className="text-4xl font-black text-[#073b70]">{option.price.toLocaleString()}</span></p>
          <button type="button" onClick={() => onSelect({ type: 'INSURANCE', code: option.code, name: `${option.name} Insurance`, price: option.price })} className={`mt-5 h-11 w-full border border-[#073b70] text-sm font-black ${selectedCode === option.code || index === 1 ? 'bg-[#073b70] text-white' : 'text-[#073b70]'}`}>Select</button>
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
  const currencyCode = routeState.selectedFlight?.currency_code || routeState.outboundFlight?.currency_code || 'USD';

  const getBackendPrice = (item: any): number => (
    toNumberOrZero(item?.price ?? item?.addon_price ?? item?.meal_price ?? item?.amount ?? item?.extra_price)
  );

  const getBackendCurrency = (item: any): string | undefined => (
    item?.currency_code || item?.currency || item?.currencyCode
  );

  const mealDisplayOptions: PricedMealOption[] = backendMeals.length > 0
    ? backendMeals
    : mealOptions.map(([name, desc]) => {
        const [code] = name.split(':');
        return { code, name, desc, price: 0, currencyCode };
      });

  const baggageDisplayOptions: PricedBaggageOption[] = backendBaggage.length > 0
    ? backendBaggage
    : baggageOptions.map((option) => ({ ...option, currencyCode: 'THB' }));

  const selectAddon = (addon: SelectedAddon) => {
    setSelectedAddons((current) => [...current.filter((item) => item.type !== addon.type), addon]);
  };

  const getSelectedCode = (type: SelectedAddon['type']) => selectedAddons.find((addon) => addon.type === type)?.code;

  const renderContent = (key: AddOnKey) => {
    switch (key) {
      case 'seat':
        return <SeatContent />;
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
    void seatApi.getSeatMap(outboundFlight?.flight_offer_id || '').then((seatMap) => {
      if (seatMap === false) return;
    });
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

      // Get user email from authenticated user context
      const userEmail = user?.email_address || 'user@example.com';

      console.log('👤 Using authenticated email for booking:', userEmail);

      if (routeState.managedBooking && existingBookingId) {
        let currentAddonWarning = '';

        if (selectedAddons.length > 0) {
          const firstPassengerId = routeState.passengerIds[0];
          const selectedFlightId = routeState.selectedFlightId;

          try {
            await Promise.all(selectedAddons.map(async (addon) => {
              if (addon.type === 'BAGGAGE') {
                await addonApi.selectBaggage({
                  booking_id: existingBookingId,
                  passenger_id: firstPassengerId,
                  selected_flight_id: selectedFlightId,
                  baggage_code: addon.code,
                });
              }

              await addonApi.addAddon({
                booking_id: existingBookingId,
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
            console.warn('Could not save add-ons for managed booking:', addonError);
            currentAddonWarning = 'Your booking was found, but the backend could not save one or more add-ons.';
            setAddonWarning(currentAddonWarning);
          }
        }

        navigate(addOnsTotal > 0 ? '/payment' : '/booking-confirmed', {
          state: {
            ...routeState,
            booking_id: existingBookingId,
            selectedAddons,
            fareTotal: 0,
            addOnsTotal,
            totalPaymentAmount: addOnsTotal,
            currency_code: currencyCode,
            outboundFlight,
            inboundFlight,
            addonWarning: currentAddonWarning,
          },
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

      // Navigate to payment with booking data
      navigate('/payment', {
        state: {
          ...routeState,
          booking: response.booking,
          booking_id: bookingId,
          pnrReference: response.booking.pnr_reference,
          bookingStatus: response.booking.booking_status,
          totalPaymentAmount: totalPrice,  // Use calculated total, not backend response
          currency_code: currencyCode,
          outboundFlight,
          inboundFlight,
          selectedAddons,
          fareTotal,
          addOnsTotal,
          addonWarning: currentAddonWarning,
        },
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
          <Link to="/" className="text-3xl font-black tracking-wide text-[#073b70]">HORIZON<span className="text-amber-500">ELITE</span></Link>
        </div>
      </header>
      <Stepper />

      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 lg:grid-cols-[1fr_390px]">
        <section>
          <div className="mb-8">
            <h1 className="text-4xl font-black tracking-normal text-[#073b70]">{personalized ? 'Personalize Your Journey' : 'Elevate your travel experience'}</h1>
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
                      <span className="flex h-16 w-16 items-center justify-center rounded bg-slate-100 text-2xl font-black text-[#073b70]">{item.title.slice(0, 1)}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-2xl font-black text-[#073b70]">{item.title}</span>
                      <span className="mt-1 block text-sm font-semibold text-slate-600">{item.subtitle}</span>
                      <span className="mt-1 block text-xs font-black uppercase text-cyan-600">{getAddOnPriceLabel(item.key, item.price)}</span>
                    </span>
                    <span className="text-2xl font-black text-[#073b70]">{open ? '^' : '+'}</span>
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
          fareTotal={fareTotal}
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
