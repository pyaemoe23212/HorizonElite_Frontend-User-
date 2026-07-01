import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { Link, useLocation } from 'react-router';

type FlightPhase = 'outbound' | 'inbound';

interface SearchState {
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
  passengers?: string;
}

const flights = [
  { id: 1, time: '14:40', arrival: '15:50', code: 'HE 1209', duration: '1h 10m', economy: 282, business: 660, tag: 'Lowest Price', refundable: true },
  { id: 2, time: '20:55', arrival: '22:05', code: 'HE 1253', duration: '1h 10m', economy: 282, business: 660, tag: '7 Seats Left', refundable: false },
];

const returnFlights = [
  { id: 3, time: '14:40', arrival: '15:50', code: 'HE 1209', duration: '1h 10m', economy: 300, business: 760, tag: 'Lowest Price', refundable: true },
  { id: 4, time: '20:55', arrival: '22:05', code: 'HE 1253', duration: '1h 10m', economy: 282, business: 550, tag: '7 Seats Left', refundable: false },
];

const fareTypes = [
  { name: 'Economy Value', price: 282, active: false, perks: ['Cabin baggage 7kg', 'Check-in baggage 20kg', 'Complimentary snacks / meals & beverages', 'Child discount 10%', 'Rebooking with a fee and fare difference', 'Refund available at a fee'] },
  { name: 'Economy Basic', price: 425, active: false, perks: ['Cabin baggage 7kg', 'Check-in baggage 25kg', 'Complimentary snacks / meals & beverages', 'Child discount 15%', 'Complimentary rebooking with fare difference', 'Free standard seat selection'] },
  { name: 'Economy Flex', price: 550, active: true, perks: ['Cabin baggage 7kg', 'Check-in baggage 30kg', 'Complimentary snacks / meals & beverages', 'Child discount 25%', 'Unlimited rebooking with fare difference', 'Free standard seat selection', 'Priority check-in, boarding & baggage'] },
];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

const inputClass = 'h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm font-bold text-[#073b70] outline-none focus:border-blue-600';

const Stepper = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-6 items-start gap-2 px-4 py-7">
    {['Flight', 'Passenger', 'Service', 'Payment', 'Additional Services', 'Personalized'].map((step, index) => (
      <div key={step} className="relative flex flex-col items-center gap-2 text-center">
        {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
        <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${index === 0 ? 'border-amber-400 bg-[#073b70] text-white' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
          {index + 1}
        </span>
        <span className={`text-[10px] font-black uppercase ${index === 0 ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
      </div>
    ))}
  </div>
);

const DateStrip = ({ selectedReturn }: { selectedReturn: boolean }) => {
  const prices = selectedReturn
    ? ['Mon 12 THB 185.83', 'Tue 13 THB 264.72', 'Wed 14 THB 225.77', 'Thu 15 THB 300.00', 'Fri 16 THB 338.80', 'Sat 17 THB 238.80']
    : ['Mon 25 THB 185.83', 'Tue 26 THB 264.72', 'Wed 27 THB 225.77', 'Thu 28 THB 282.00', 'Fri 29 THB 238.80', 'Sat 30 THB 238.80'];
  return (
    <div className="mx-auto flex max-w-5xl items-center gap-3 overflow-x-auto px-4 pb-8">
      <button className="h-14 shrink-0 rounded-xl bg-blue-600 px-5 text-sm font-black text-white">&lt; - 2 days</button>
      {prices.map((price, index) => (
        <button key={price} className={`h-20 min-w-28 rounded-xl border px-3 text-center text-sm font-black ${index === 3 ? 'border-[#073b70] bg-[#073b70] text-white ring-4 ring-blue-200' : 'border-slate-300 bg-white text-slate-600'}`}>
          <span className="block text-xs font-bold opacity-70">{price.split(' ').slice(0, 2).join(' ')}</span>
          {price.split(' ').slice(2).join(' ')}
          {index === 0 && <span className="mt-1 block rounded border border-blue-600 text-[9px] uppercase text-blue-600">Lowest Price</span>}
        </button>
      ))}
      <button className="h-14 shrink-0 rounded-xl bg-blue-600 px-5 text-sm font-black text-white">+ 7 days &gt;</button>
    </div>
  );
};

const ModifySearch = () => (
  <section className="mx-auto mb-8 max-w-5xl rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-black text-[#073b70]">Modify Search</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">New York (JFK) &nbsp; | &nbsp; London (LHR) &nbsp; | &nbsp; 12 Oct 2024 - 24 Oct 2024</p>
      </div>
      <button className="text-xl text-slate-400">×</button>
    </div>
    <div className="mb-4 flex gap-2">
      <button className="rounded bg-slate-100 px-5 py-2 text-xs font-black text-slate-500">One way</button>
      <button className="rounded bg-blue-100 px-5 py-2 text-xs font-black text-blue-700">Round trip</button>
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_140px]">
      <Field label="From"><input className={inputClass} defaultValue="New York, John F. Kennedy Int..." /></Field>
      <Field label="To"><input className={inputClass} defaultValue="London, Heathrow Airport (LHR)" /></Field>
      <Field label="Depart"><input className={inputClass} defaultValue="12 Oct 2024" /></Field>
      <Field label="Return"><input className={inputClass} defaultValue="24 Oct 2024" /></Field>
      <button className="mt-6 h-11 rounded-lg bg-[#073b70] text-sm font-black text-white">Search</button>
    </div>
    <div className="mt-4 max-w-md">
      <Field label="Passengers and Class"><select className={inputClass} defaultValue="2 Adults, 1 Child, Business Class"><option>2 Adults, 1 Child, Business Class</option><option>1 Passenger, Economy</option></select></Field>
    </div>
  </section>
);

const FareSelection = () => (
  <section className="mb-8 grid gap-4 lg:grid-cols-3">
    {fareTypes.map((fare) => (
      <article key={fare.name} className={`rounded-lg border bg-white p-5 ${fare.active ? 'border-[#073b70] ring-4 ring-blue-100' : 'border-slate-300'}`}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-[#073b70]">{fare.name}</h3>
            {fare.active && <p className="text-[10px] font-black uppercase text-blue-600">Recommended</p>}
          </div>
          <span className={`h-5 w-5 rounded-full border ${fare.active ? 'border-[#073b70] bg-[#073b70]' : 'border-slate-300'}`} />
        </div>
        <p className="mb-5 text-2xl font-black text-[#073b70]">THB {fare.price.toFixed(2)}</p>
        <ul className="space-y-4 text-sm font-semibold text-slate-600">
          {fare.perks.map((perk) => <li key={perk}>□ {perk}</li>)}
        </ul>
      </article>
    ))}
  </section>
);

const FlightCard = ({ flight, selected, onSelect }: { flight: typeof flights[number]; selected?: boolean; onSelect: () => void }) => (
  <article className={`rounded-lg border bg-white p-5 shadow-sm ${selected ? 'border-blue-700 ring-1 ring-blue-700' : 'border-slate-300'}`}>
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr_1fr] lg:items-center">
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center bg-[#073b70] text-white"><Plane size={18} /></span>
          <div>
            <p className="font-black text-[#073b70]">Horizon Elite</p>
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Flight {flight.code}</p>
          </div>
          <span className={`ml-auto rounded-full px-3 py-1 text-[10px] font-black uppercase ${flight.tag === 'Lowest Price' ? 'border border-blue-500 text-blue-600' : 'bg-red-500 text-white'}`}>{flight.tag}</span>
        </div>
        <div className="grid grid-cols-[1fr_1.2fr_1fr] items-center gap-3">
          <div><p className="text-3xl font-black text-[#073b70]">{flight.time}</p><p className="text-xs font-bold text-slate-500">AOR<br />Alor Setar</p></div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500">{flight.duration}</p>
            <div className="my-2 h-px bg-slate-300" />
            <p className="text-xs font-black uppercase text-blue-600">Direct</p>
          </div>
          <div className="text-right"><p className="text-3xl font-black text-[#073b70]">{flight.arrival}</p><p className="text-xs font-bold text-slate-500">KUL (T1)<br />Kuala Lumpur</p></div>
        </div>
        <div className="mt-6 flex gap-6 text-[11px] font-black uppercase text-slate-500">
          <span>20kg Included</span>
          <span className={flight.refundable ? 'text-slate-500' : 'text-red-500'}>{flight.refundable ? 'Refundable' : 'Non-refundable'}</span>
        </div>
      </div>
      {(['Economy', 'Business'] as const).map((cabin) => (
        <button key={cabin} type="button" onClick={onSelect} className={`rounded-lg border p-5 text-left transition hover:border-blue-600 ${selected && cabin === 'Business' ? 'border-[#073b70]' : 'border-slate-200'}`}>
          <div className="mb-3 flex items-center justify-between">
            <p className={`text-xs font-black uppercase ${cabin === 'Economy' ? 'text-blue-600' : 'text-amber-500'}`}>{cabin}</p>
            <span className="h-4 w-4 rounded-full border border-slate-300" />
          </div>
          <p className="text-xl font-black text-[#073b70]">THB {(cabin === 'Economy' ? flight.economy : flight.business).toFixed(2)}</p>
          <p className="mt-2 text-[10px] font-black uppercase text-slate-500">Baggage Included</p>
        </button>
      ))}
    </div>
    <div className="mt-4 text-right text-xs font-black uppercase text-[#073b70]">View Details⌄</div>
  </article>
);

function FlightResults(): React.JSX.Element {
  const { state } = useLocation();
  const search = (state ?? {}) as SearchState;
  const [phase] = useState<FlightPhase>('outbound');
  const [showModify, setShowModify] = useState(false);
  const [showFares, setShowFares] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);

  const total = phase === 'outbound' ? 660 : 1210;
  const currentFlights = phase === 'outbound' ? flights : returnFlights;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-[#073b70] text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-2xl font-black tracking-wide">HORIZON<span className="text-amber-400">ELITE</span></Link>
          <div className="hidden items-center gap-8 text-sm font-bold md:flex">
            <span>AOR ↔ KUL</span>
            <span>Thu, 28 May - Thu, 15 Jun</span>
            <span>{search.passengers ?? '1 Passenger'}</span>
            <button onClick={() => setShowModify((value) => !value)} className="text-amber-300">Modify</button>
          </div>
        </div>
      </header>

      <Stepper />
      <DateStrip selectedReturn={phase === 'inbound'} />

      <div className="mx-auto max-w-7xl px-5 pb-24">
        {showModify && <ModifySearch />}

        {phase === 'inbound' && (
          <section className="mx-auto mb-8 max-w-5xl border-t-4 border-[#073b70] bg-white p-6">
            <p className="mb-6 text-xs font-black uppercase tracking-widest text-slate-500">Your selected outbound flight <span className="float-right text-blue-600">Selection Confirmed</span></p>
            <div className="grid gap-5 md:grid-cols-4 md:items-center">
              <p className="text-3xl font-black text-[#073b70]">14:40 <span className="block text-xs font-bold text-slate-500">JFK</span></p>
              <p className="flex flex-col items-center gap-1 text-center text-sm font-bold text-slate-500"><Plane size={18} />1h 10m</p>
              <p className="text-3xl font-black text-[#073b70]">15:50 <span className="block text-xs font-bold text-slate-500">LHR</span></p>
              <p className="text-sm font-bold text-slate-600">Mon, 12 Oct 2024<br />Business Class<br />Flight HE 1209 · Direct</p>
            </div>
          </section>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <section>
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-slate-600">
              Prices shown are estimated and may change at checkout. Select a flight to view details. Includes taxes for one adult on Horizon Elite flights only.
            </div>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="flex items-center gap-2 text-2xl font-black text-[#073b70]"><Plane size={24} /> Select your {phase === 'outbound' ? 'departure' : 'return'}</h1>
              <button className="rounded-xl bg-[#073b70] px-5 py-3 text-sm font-black text-white">Sort by</button>
            </div>
            <div className="space-y-5">
              {currentFlights.map((flight) => (
                <React.Fragment key={flight.id}>
                  <FlightCard
                    flight={flight}
                    selected={selectedFlightId === flight.id}
                    onSelect={() => {
                      setSelectedFlightId(flight.id);
                      setShowFares(true);
                    }}
                  />
                  {showFares && selectedFlightId === flight.id && <FareSelection />}
                </React.Fragment>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
            <div className="mb-5 rounded bg-blue-50 p-3 text-xs font-black text-slate-600">Please select your flight to view available details</div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Total Price</p>
            <p className="mb-8 border-b border-slate-200 pb-6 text-4xl font-black text-[#073b70]">THB {total.toFixed(2)}</p>
            <p className="mb-5 text-sm font-black uppercase tracking-wide text-[#073b70]">Trip Summary</p>
            {['Outbound AOR → KUL', 'Return KUL → AOR'].map((route) => (
              <div key={route} className="mb-4 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase text-slate-400">{route.split(' ')[0]}</p>
                <p className="mt-2 text-sm font-black text-[#073b70]">{route.replace(route.split(' ')[0], '')}</p>
              </div>
            ))}
            <Link to="/passenger-information" className="mt-5 flex h-16 w-full items-center justify-center rounded-xl bg-[#073b70] text-base font-black uppercase tracking-wide text-white">Confirm Selection</Link>
          </aside>
        </div>

        <footer className="pt-24 text-center text-xs font-black uppercase tracking-widest text-slate-400">© 2026 Horizon Elite. Elevating global standards.</footer>
      </div>
    </main>
  );
}

export default FlightResults;
