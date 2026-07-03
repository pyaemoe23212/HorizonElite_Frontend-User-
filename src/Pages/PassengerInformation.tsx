import React from 'react';
import { BadgeCheck, Mail, Plane } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import type { SelectedFlightResponse } from '../Services/api';

const steps = ['Flight', 'Passenger', 'Service', 'Payment', 'Additional Services', 'Personalized'];

const inputClass = 'h-12 w-full rounded-md border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#073b70] focus:bg-white';

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
      {label.includes('*') ? (
        <>
          {label.replace('*', '')}
          <span className="text-red-500">*</span>
        </>
      ) : label}
    </span>
    {children}
  </label>
);

const Panel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <section className="rounded-lg border border-slate-300 bg-white p-7 shadow-sm">
    <h2 className="mb-7 flex items-center gap-3 text-2xl font-black text-[#073b70]">
      <span className="text-lg text-[#073b70]">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

const Stepper = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-6 items-start gap-2 px-4 py-8">
    {steps.map((step, index) => {
      const complete = index === 0;
      const active = index === 1;

      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
          <span
            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${complete
                ? 'border-blue-600 bg-blue-600 text-white'
                : active
                  ? 'border-amber-400 bg-[#073b70] text-white'
                  : 'border-slate-300 bg-slate-100 text-slate-400'
              }`}
          >
            {complete ? <BadgeCheck size={18} /> : index + 1}
          </span>
          <span className={`text-[10px] font-black uppercase ${active || complete ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
        </div>
      );
    })}
  </div>
);

interface PassengerRouteState {
  selectedFlight?: SelectedFlightResponse['selectedFlight'];
  selectedFlightId?: string;
  returnFlight?: SelectedFlightResponse['selectedFlight'] | null;
  selectedReturnFlightId?: string | null;
  flightSearchId?: string;
  tripType?: 'ONE_WAY' | 'ROUND_TRIP';
  searchData?: {
    passengers?: string;
  };
}

const formatFlightDate = (value?: string) => {
  if (!value) return 'Date unavailable';
  return new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const TripSummary = ({
  selectedFlight,
  returnFlight,
  nextState,
}: {
  selectedFlight: SelectedFlightResponse['selectedFlight'];
  returnFlight?: SelectedFlightResponse['selectedFlight'] | null;
  nextState: PassengerRouteState;
}) => {
  const flights: Array<[string, SelectedFlightResponse['selectedFlight']]> = [
    ['Outbound Flight', selectedFlight],
    ...(returnFlight ? [['Return Flight', returnFlight] as [string, SelectedFlightResponse['selectedFlight']]] : []),
  ];
  const total = flights.reduce((sum, [, flight]) => sum + Number(flight.selected_fare_price || 0), 0);
  const currencyCode = selectedFlight.currency_code || returnFlight?.currency_code || 'USD';

  return (
  <aside className="h-fit rounded border border-slate-300 bg-white shadow-sm">
    <div className="flex items-center justify-between bg-[#073b70] px-6 py-5 text-white">
      <h2 className="text-2xl font-black text-amber-300">Horizon Elite</h2>
      <Plane size={24} />
    </div>

    <div className="space-y-6 p-6">
      {flights.map(([title, flight]) => (
        <div key={title} className="border-b border-dashed border-slate-300 pb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#073b70]"><Plane size={15} /> {title}</h3>
            <span className="rounded bg-slate-200 px-2 py-1 text-[10px] font-black uppercase text-[#073b70]">{flight.cabin_class}</span>
          </div>
          <p className="text-base font-black text-[#073b70]">{flight.origin_airport_code} to {flight.destination_airport_code}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{formatFlightDate(flight.departure_datetime)}</p>
        </div>
      ))}

      <div className="space-y-3 bg-slate-100 p-4 text-sm font-bold text-slate-600">
        <div className="flex justify-between"><span>Base Fare</span><span>{currencyCode} {total.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Taxes & Fees</span><span>Included</span></div>
        <div className="flex justify-between border-t border-slate-300 pt-3 font-black text-[#073b70]"><span>Total</span><span>{currencyCode} {total.toFixed(2)}</span></div>
      </div>

      <Link to="/add-ons" state={nextState} className="flex h-14 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white shadow-md shadow-blue-950/15">
        Continue to Add-ons
      </Link>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Checkout</div>
    </div>
  </aside>
  );
};

function PassengerInformation(): React.JSX.Element {
  const { state } = useLocation();
  const {
    selectedFlight,
    selectedFlightId,
    returnFlight = null,
    selectedReturnFlightId = null,
    flightSearchId,
    tripType = 'ONE_WAY',
    searchData,
  } = (state ?? {}) as PassengerRouteState;

  if (!selectedFlight || !selectedFlightId) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-800">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
            <Link to="/" className="text-2xl font-black tracking-wide text-[#073b70]">
              HORIZON<span className="text-amber-500">ELITE</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-8">
            <h1 className="mb-3 text-2xl font-black text-amber-800">No Flight Selected</h1>
            <p className="mb-6 text-sm font-semibold text-amber-700">Please select a flight before entering passenger information.</p>
            <Link to="/" className="inline-flex h-12 items-center justify-center rounded bg-[#073b70] px-6 text-sm font-black text-white">
              Back to Search
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const nextState = {
    selectedFlight,
    selectedFlightId,
    returnFlight,
    selectedReturnFlightId,
    flightSearchId,
    tripType,
    searchData,
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
          <Link to="/" className="text-2xl font-black tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
        </div>
      </header>

      <Stepper />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-7">
            <h1 className="text-4xl font-black tracking-normal text-[#073b70]">Passenger Information</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Please enter passenger details for {selectedFlight.origin_airport_code} to {selectedFlight.destination_airport_code}.
            </p>
          </div>

          <div className="mb-8 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wide text-[#073b70]">Select Saved Passenger</h2>
              <Link to="/profile" className="text-xs font-black text-blue-600">Manage Profile</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['John Doe', 'Elite Platinum Member', true],
                ['Jane Smith', 'Family Member', false],
              ].map(([name, status, active]) => (
                <button key={name as string} className={`flex min-h-20 items-center gap-4 rounded border p-4 text-left ${active ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded text-xs font-black ${active ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>ID</span>
                  <span>
                    <span className="block text-sm font-black text-[#073b70]">{name}</span>
                    <span className="text-xs font-semibold text-slate-500">{status}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <Panel title="Personal Information" icon={<BadgeCheck size={20} />}>
              <div className="grid gap-5 md:grid-cols-3">
                <Label label="Title*"><select className={inputClass}><option>Select</option><option>Mr.</option><option>Ms.</option></select></Label>
                <Label label="First Name*"><input className={inputClass} placeholder="As per passport" /></Label>
                <Label label="Middle Name"><input className={inputClass} placeholder="Optional" /></Label>
                <Label label="Last Name*"><input className={inputClass} placeholder="As per passport" /></Label>
                <Label label="Gender*">
                  <div className="flex h-12 items-center gap-5 text-sm font-semibold text-slate-600">
                    <label className="flex items-center gap-2"><input type="radio" name="gender" /> Male</label>
                    <label className="flex items-center gap-2"><input type="radio" name="gender" /> Female</label>
                    <label className="flex items-center gap-2"><input type="radio" name="gender" /> Other</label>
                  </div>
                </Label>
                <span className="hidden md:block" />
                <Label label="Date of Birth*"><input className={inputClass} placeholder="mm/dd/yyyy" /></Label>
                <Label label="Nationality*"><select className={inputClass}><option>Select Country</option><option>United Kingdom</option><option>Thailand</option></select></Label>
                <Label label="Passenger Type"><input className={inputClass} value="ADULT" readOnly /></Label>
              </div>
            </Panel>

            <Panel title="Passport Information" icon={<BadgeCheck size={20} />}>
              <div className="grid gap-5 md:grid-cols-3">
                <Label label="Passport Number*"><input className={inputClass} placeholder="Enter number" /></Label>
                <Label label="Issuing Country*"><select className={inputClass}><option>Select Country</option><option>United Kingdom</option><option>Thailand</option></select></Label>
                <Label label="Expiry Date*"><input className={inputClass} placeholder="mm/dd/yyyy" /></Label>
              </div>
            </Panel>

            <Panel title="Travel Program Information" icon={<Plane size={20} />}>
              <div className="grid gap-5 md:grid-cols-2">
                <Label label="Known Traveler Number (KTN)"><input className={inputClass} placeholder="Optional" /></Label>
                <Label label="Frequent Flyer Number"><input className={inputClass} placeholder="Optional" /></Label>
              </div>
            </Panel>

            <Panel title="Contact Information" icon={<Mail size={20} />}>
              <div className="grid gap-5 md:grid-cols-2">
                <Label label="Email Address*"><input className={inputClass} placeholder="example@email.com" /></Label>
                <Label label="Phone Number*">
                  <div className="grid grid-cols-[110px_1fr] gap-3">
                    <select className={inputClass}><option>+1 US</option><option>+66 TH</option><option>+44 UK</option></select>
                    <input className={inputClass} placeholder="012 345 6789" />
                  </div>
                </Label>
              </div>
              <label className="mt-5 flex items-center gap-3 text-sm font-semibold text-slate-500">
                <input type="checkbox" className="accent-[#073b70]" />
                Save this passenger to my profile for future bookings
              </label>
            </Panel>
          </div>

          <div className="mt-10 flex justify-center">
            <button type="button" className="h-12 rounded border-2 border-[#073b70] px-8 text-sm font-black uppercase tracking-wide text-[#073b70]">
              Add Passenger
            </button>
          </div>

          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/flight-results" className="flex h-12 w-48 items-center justify-center rounded border border-[#073b70] text-sm font-black text-[#073b70]">
              ← Back to Flights
            </Link>
            <Link to="/add-ons" state={nextState} className="flex h-12 w-60 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white shadow-md shadow-blue-950/20">
              Save & Continue →
            </Link>
          </div>
        </section>

        <TripSummary selectedFlight={selectedFlight} returnFlight={returnFlight} nextState={nextState} />
      </div>
    </main>
  );
}

export default PassengerInformation;
