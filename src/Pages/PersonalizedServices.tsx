import React, { useState } from 'react';
import { Bell, CalendarDays, CheckSquare, ClipboardList, Mail, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import PageHeader from '../components/PageHeader';

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
];

function PersonalizedServices(): React.JSX.Element {
  const { state } = useLocation();
  const [enabled, setEnabled] = useState(() => services.map(() => true));

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <PageHeader rightLink={{ label: 'Services', to: '/additional-services' }} />

      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#073b70]">Personalized Flight Services</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-600">Enhance your travel experience with our automated notification and reminder suite. Horizon Elite ensures you're prepared at every step of your journey.</p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <article key={service.title} className="min-h-52 border border-slate-200 bg-white p-8 shadow-sm">
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
          <Link to="/booking-confirmed" state={state} className="flex h-14 w-56 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white shadow-lg shadow-blue-950/20">Finish Booking</Link>
          <Link to="/booking-confirmed" state={state} className="text-sm font-semibold text-slate-600 underline">Skip for now</Link>
        </div>
      </section>
    </main>
  );
}

export default PersonalizedServices;
