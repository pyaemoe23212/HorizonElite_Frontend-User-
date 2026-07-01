import React, { useState } from 'react';
import { BadgeCheck, Bell, CalendarDays, CheckSquare, ClipboardList, Mail, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router';

const steps = ['Flight', 'Passenger', 'Review', 'Payment', 'Services', 'Personalized'];

const services = [
  {
    title: 'Calendar Reminder',
    description: 'Automatically sync flight details and important milestones to your primary digital calendar.',
    icons: [CalendarDays],
  },
  {
    title: 'Check in Reminder - Email and WhatsApp',
    description: 'A detailed check-in guide and boarding pass prompt sent to your inbox and WhatsApp 4 days before departure.',
    icons: [Mail, MessageSquare],
  },
  {
    title: 'Arrival Card Reminder',
    description: "Notification sent 3 days before arrival with necessary digital immigration forms for your destination.",
    icons: [ClipboardList],
  },
  {
    title: 'Travel Checklist',
    description: 'A curated list of essential including baggage policies, passport validity checks, and visa requirements.',
    icons: [CheckSquare],
  },
  {
    title: 'Flight Updates',
    description: 'Real-time notifications regarding gate changes, departure times, and baggage carousel assignments.',
    icons: [Bell],
  },
  {
    title: 'Upcoming Feature',
    description: "Let's keep it open, we will add in something important for the user's travel.",
    icons: [Star],
    muted: true,
  },
];

function PersonalizedServices(): React.JSX.Element {
  const [enabled, setEnabled] = useState(() => services.map((_, index) => index !== 5));

  return (
    <main className="min-h-screen border-4 border-blue-600 bg-slate-100 text-slate-800">
      <header className="bg-white py-7 text-center">
        <Link to="/" className="text-3xl font-black tracking-wide text-[#073b70]">HORIZON<span className="text-amber-500">ELITE</span></Link>
      </header>

      <Stepper />

      <section className="mx-auto max-w-4xl px-6 pb-24 pt-20">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#073b70]">Personalized Flight Services</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-600">Enhance your travel experience with our automated notification and reminder suite. Horizon Elite ensures you're prepared at every step of your journey.</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.title} className={`min-h-52 border bg-white p-8 shadow-sm ${service.muted ? 'border-dashed border-slate-300' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-2">
                  {service.icons.map((Icon) => (
                    <span key={Icon.displayName ?? Icon.name} className="flex h-9 w-9 items-center justify-center bg-slate-100 text-[#073b70]">
                      <Icon size={18} />
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled((items) => items.map((item, itemIndex) => itemIndex === index ? !item : item))}
                  className={`relative h-6 w-11 rounded-full transition ${enabled[index] ? 'bg-cyan-700' : 'bg-slate-300'}`}
                  aria-label={`Toggle ${service.title}`}
                >
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled[index] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <h2 className="mt-9 text-2xl font-black text-[#073b70]">{service.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{service.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-5">
          <Link to="/booking-confirmed" className="flex h-14 w-56 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white shadow-lg shadow-blue-950/20">Finish Booking</Link>
          <Link to="/booking-confirmed" className="text-sm font-semibold text-slate-600 underline">Skip for now</Link>
        </div>
      </section>
    </main>
  );
}

const Stepper = () => (
  <div className="mx-auto grid max-w-4xl grid-cols-6 items-start gap-2 px-4 py-10">
    {steps.map((step, index) => {
      const complete = index < 5;
      const active = index === 5;
      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-cyan-700" />}
          <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${complete ? 'bg-cyan-700 text-white' : active ? 'border-4 border-[#073b70] bg-slate-700 text-amber-300' : 'bg-slate-200 text-slate-500'}`}>
            {complete ? <BadgeCheck size={16} /> : index + 1}
          </span>
          <span className={`text-[9px] font-black uppercase ${active ? 'text-[#073b70]' : 'text-cyan-700'}`}>{step}</span>
        </div>
      );
    })}
  </div>
);

export default PersonalizedServices;
