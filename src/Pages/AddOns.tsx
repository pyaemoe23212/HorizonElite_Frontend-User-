import React, { useEffect, useState } from 'react';
import { BadgeCheck, Plane } from 'lucide-react';
import { Link, useLocation } from 'react-router';

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

const BookingSummary = ({ compact = false }: { compact?: boolean }) => (
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
          <div><p className="text-sm font-semibold text-slate-600">Sun, 31 May 2024</p><p className="text-2xl font-black text-[#073b70]">06:00 <span className="text-sm">BKK</span></p></div>
          <div className="flex flex-col items-center gap-1 text-center text-xs font-bold text-slate-400"><Plane size={17} />4h 25m</div>
          <div className="text-right"><p className="text-sm font-semibold text-slate-600">Business Flex</p><p className="text-2xl font-black text-[#073b70]">11:25 <span className="text-sm">SIN</span></p></div>
        </div>
      </div>
      <div className="border-y border-slate-300 py-5">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Passengers & Contact</p>
        <p className="font-semibold text-slate-700">1 Adult (Mr. John Smith)</p>
      </div>
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-500">Selected Add-ons</p>
        <div className="space-y-2 text-sm font-semibold text-slate-700">
          <div className="flex justify-between"><span>Standard Seat (12A)</span><span className="text-cyan-600">Free</span></div>
          <div className="flex justify-between"><span>Chef's Special Meal</span><span className="text-cyan-600">Included</span></div>
          <div className="flex justify-between"><span>Extra Baggage (25kg)</span><span className="text-[#073b70]">THB 1,850</span></div>
        </div>
      </div>
      <div className="space-y-3 border-t border-slate-300 pt-5 text-sm font-semibold text-slate-700">
        <div className="flex justify-between"><span>Fare & Taxes</span><span>THB 32,590</span></div>
        <div className="flex justify-between"><span>Add-ons Total</span><span>THB 1,850</span></div>
        <div className="flex items-end justify-between pt-3">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Total Price</span>
          <span className="text-3xl font-black text-[#073b70]">THB 32,590</span>
        </div>
      </div>
      <Link to="/payment" className="flex h-14 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white">
        Continue to Payment
      </Link>
      <Link to="/passenger-information" className="flex h-12 items-center justify-center rounded border border-slate-300 text-sm font-black text-slate-600">
        Back
      </Link>
    </div>
  </aside>
);

const SeatContent = () => (
  <div className="border-t border-slate-300 bg-slate-50 p-7">
    <div className="mx-auto grid max-w-xl grid-cols-5 gap-6 rounded-[3rem] bg-white p-12 shadow-inner">
      {['10A', '10E', '10F', '10L', '12A', '12E', '12F', '12L'].map((seat) => (
        <button key={seat} className={`h-14 w-14 font-black ${seat === '12A' ? 'bg-amber-300 text-white' : seat.endsWith('F') || seat.endsWith('L') || seat === '10A' || seat === '12E' ? 'bg-[#073b70] text-white' : 'bg-slate-200 text-slate-500'}`}>
          {seat}
        </button>
      ))}
    </div>
    <button className="mt-6 h-14 w-full rounded bg-[#073b70] text-sm font-black uppercase tracking-widest text-white">Confirm Seat 12A</button>
  </div>
);

const MealContent = () => (
  <div className="border-t border-slate-300 p-7">
    <p className="mb-5 text-xs font-black uppercase tracking-widest text-slate-500">Dietary & Medical</p>
    <div className="grid gap-4 md:grid-cols-3">
      {mealOptions.map(([name, desc], index) => (
        <button key={name} className={`min-h-24 rounded border p-4 text-left ${index === 1 ? 'border-[#073b70] bg-blue-50' : 'border-slate-300 bg-white'}`}>
          <span className="block text-sm font-black text-[#073b70]">{name}</span>
          <span className="mt-1 block text-xs font-semibold text-slate-500">{desc}</span>
        </button>
      ))}
    </div>
    <button className="mt-7 h-14 w-full rounded bg-[#073b70] text-sm font-black uppercase tracking-widest text-white">Confirm Selection</button>
  </div>
);

const BaggageContent = () => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-6 md:grid-cols-3">
      {[
        ['20 kg', 'Medium stays', '1,450 THB'],
        ['25 kg', 'Long trips', '1,850 THB'],
        ['30 kg', 'Comprehensive', '2,200 THB'],
      ].map(([weight, desc, price], index) => (
        <button key={weight} className={`h-36 border p-5 text-center ${index === 1 ? 'border-[#073b70] bg-blue-50' : 'border-slate-300 bg-white'}`}>
          <span className="block text-2xl font-black text-[#073b70]">{weight}</span>
          <span className="mt-2 block text-sm font-semibold text-slate-500">{desc}</span>
          <span className="mt-4 block text-sm font-black text-[#073b70]">{price}</span>
        </button>
      ))}
    </div>
    <div className="mt-6 rounded bg-[#073b70] p-4 text-sm font-semibold text-white">Elite Privilege: You receive a 15% discount on all pre-booked extra baggage weight.</div>
    <div className="mt-6 flex justify-end"><button className="h-12 rounded bg-[#073b70] px-10 text-sm font-black text-white">Confirm Selection</button></div>
  </div>
);

const AssistanceContent = () => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-6 md:grid-cols-2">
      {['Wheelchair Assistance', 'Sensory Support', 'Medical Clearance', 'Visual/Hearing Assistance'].map((service) => (
        <button key={service} className="min-h-36 border border-slate-300 bg-white p-6 text-center">
          <span className="block text-lg font-black text-[#073b70]">{service}</span>
          <span className="mt-2 block text-sm font-semibold text-slate-500">Personalized care during your journey.</span>
          <span className="mt-4 block text-xs font-black uppercase text-cyan-600">Free of charge</span>
        </button>
      ))}
    </div>
    <div className="mt-6 rounded bg-[#073b70] p-4 text-sm font-semibold text-white">Elite Service: Our crew will be notified of your specific requirements to ensure your comfort.</div>
    <div className="mt-6 flex justify-end"><button className="h-12 rounded bg-[#073b70] px-10 text-sm font-black text-white">Confirm Selection</button></div>
  </div>
);

const LoungeContent = () => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-8 md:grid-cols-2">
      {[
        ['The Silver Wing', 'Flagship lounge - BKK', 'THB 2,800', 'https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=900&auto=format&fit=crop'],
        ['Zenith Club', 'Boutique lounge - BKK', 'THB 1,800', 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?q=80&w=900&auto=format&fit=crop'],
      ].map(([name, meta, price, image]) => (
        <article key={name} className="border border-slate-300 bg-white">
          <img src={image} alt={name} className="h-56 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-3xl font-black text-[#073b70]">{name}</h3>
            <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-500">{meta}</p>
            <p className="mt-4 min-h-20 text-base font-semibold leading-7 text-slate-600">A quiet sanctuary with premium dining, work spaces, and calm pre-flight service.</p>
            <button className="mt-5 h-12 w-full border border-[#073b70] bg-[#073b70] text-sm font-black tracking-widest text-white">{price}</button>
          </div>
        </article>
      ))}
    </div>
  </div>
);

const InsuranceContent = () => (
  <div className="border-t border-slate-300 p-7">
    <div className="grid gap-6 md:grid-cols-3">
      {[
        ['Basic', 'Essential medical and luggage coverage for your journey.', '850'],
        ['Premium', 'Comprehensive protection including flight delay and trip cancellation.', '1,420'],
        ['Ultimate', 'Maximum peace of mind with 24/7 global concierge and unlimited medical.', '2,450'],
      ].map(([name, desc, price], index) => (
        <article key={name} className={`relative border p-6 text-center ${index === 1 ? 'border-amber-400' : 'border-slate-300'}`}>
          {index === 1 && <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-amber-300 px-4 py-1 text-[10px] font-black uppercase text-white">Recommended</span>}
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">{name}</h3>
          <p className="mt-5 min-h-20 text-base font-semibold text-slate-600">{desc}</p>
          <p className="mt-4 text-sm text-slate-500">THB <span className="text-4xl font-black text-[#073b70]">{price}</span></p>
          <button className={`mt-5 h-11 w-full border border-[#073b70] text-sm font-black ${index === 1 ? 'bg-[#073b70] text-white' : 'text-[#073b70]'}`}>Select</button>
        </article>
      ))}
    </div>
  </div>
);

const contentMap: Record<AddOnKey, React.ReactNode> = {
  seat: <SeatContent />,
  meal: <MealContent />,
  baggage: <BaggageContent />,
  assistance: <AssistanceContent />,
  lounge: <LoungeContent />,
  insurance: <InsuranceContent />,
};

function AddOns(): React.JSX.Element {
  const { hash } = useLocation();
  const [openSection, setOpenSection] = useState<AddOnKey | null>(null);
  const personalized = openSection === 'assistance';

  useEffect(() => {
    const requestedSection = hash.replace('#', '') as AddOnKey;
    if (addOns.some((item) => item.key === requestedSection)) {
      setOpenSection(requestedSection);
    }
  }, [hash]);

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
                      <span className="mt-1 block text-xs font-black uppercase text-cyan-600">{item.price}</span>
                    </span>
                    <span className="text-2xl font-black text-[#073b70]">{open ? '^' : '+'}</span>
                  </button>
                  {open && contentMap[item.key]}
                </article>
              );
            })}
          </div>
        </section>

        <BookingSummary compact={personalized} />
      </div>
      <footer className="pb-8 text-center text-xs font-semibold text-slate-400">© 2024 Horizon Elite Airways. All data transmitted is encrypted using the highest industry standards.</footer>
    </main>
  );
}

export default AddOns;
