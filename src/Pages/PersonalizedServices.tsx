import React, { useState } from 'react';
import { Bell, CalendarDays, CheckSquare, ClipboardList, Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import PageHeader from '../components/PageHeader';
import { checkInApi, type SelectedFlightResponse } from '../Services/api';

const services = [
  {
    title: 'Calendar Reminder',
    description: 'Automatically sync flight details and important milestones to your primary digital calendar.',
    icons: [CalendarDays],
  },
  {
    title: 'Check-in Reminder - Email',
    description: 'A detailed check-in guide and boarding pass prompt sent to your inbox 4 days before departure. WhatsApp reminders are coming later.',
    icons: [Mail],
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

type SelectedFlight = SelectedFlightResponse['selectedFlight'];

interface PersonalizedServicesState {
  selectedFlight?: SelectedFlight;
  returnFlight?: SelectedFlight | null;
  outboundFlight?: SelectedFlight;
  inboundFlight?: SelectedFlight | null;
  bookingId?: string;
  booking_id?: string;
  booking?: {
    booking_id?: string;
    pnr_reference?: string;
    passengers?: PassengerContact[];
  };
  pnrReference?: string;
  pnr_reference?: string;
  passengers?: PassengerContact[];
}

interface PassengerContact {
  pi_title?: string;
  pi_first_name?: string;
  pi_middle_name?: string;
  pi_last_name?: string;
  first_name?: string;
  last_name?: string;
  pi_contact_phone?: string;
  phone?: string;
}

const escapeIcsText = (value?: string | number | null) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');

const formatIcsDateTime = (value?: string) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => String(part).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
};

const formatUtcStamp = (date = new Date()) =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

const buildCalendarEvent = (flight: SelectedFlight, index: number, timezone: string, bookingReference: string) => {
  const start = formatIcsDateTime(flight.departure_datetime);
  const end = formatIcsDateTime(flight.arrival_datetime);
  const airline = flight.airline_name || 'Horizon Elite';
  const flightNumber = flight.flight_number || 'Flight';
  const route = `${flight.origin_airport_code} to ${flight.destination_airport_code}`;
  const uidParts = [
    bookingReference,
    flight.selected_flight_id,
    flight.flight_number,
    index,
    '@horizonelite.local',
  ].filter(Boolean);

  return [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uidParts.join('-'))}`,
    `DTSTAMP:${formatUtcStamp()}`,
    `DTSTART;TZID=${escapeIcsText(timezone)}:${start}`,
    `DTEND;TZID=${escapeIcsText(timezone)}:${end || start}`,
    `SUMMARY:${escapeIcsText(`${airline} ${flightNumber} - ${route}`)}`,
    `DESCRIPTION:${escapeIcsText(`Flight ${flightNumber} from ${flight.origin_airport_code} to ${flight.destination_airport_code}. Cabin: ${flight.cabin_class || 'N/A'}. Booking reference: ${bookingReference}.`)}`,
    `LOCATION:${escapeIcsText(`${flight.origin_airport_code} Airport`)}`,
    'PRIORITY:1',
    'CATEGORIES:Important,Flight',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`Reminder: ${flightNumber} departs from ${flight.origin_airport_code}`)}`,
    'END:VALARM',
    'END:VEVENT',
  ].join('\r\n');
};

const buildFlightCalendar = (flights: SelectedFlight[], bookingReference: string) => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const events = flights.map((flight, index) => buildCalendarEvent(flight, index + 1, timezone, bookingReference));

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Horizon Elite//Flight Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
};

const downloadIcsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const safeFilenamePart = (value: string) => value.replace(/[^a-z0-9-_]/gi, '-');

function PersonalizedServices(): React.JSX.Element {
  const { state } = useLocation();
  const navigate = useNavigate();
  const routeState = (state ?? {}) as PersonalizedServicesState;
  const [enabled, setEnabled] = useState(() => services.map(() => true));
  const [calendarMessage, setCalendarMessage] = useState('');
  const [checkInReminderMessage, setCheckInReminderMessage] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);

  const flights = [
    routeState.selectedFlight || routeState.outboundFlight,
    routeState.returnFlight || routeState.inboundFlight,
  ].filter(Boolean) as SelectedFlight[];
  const bookingReference = routeState.pnrReference || routeState.pnr_reference || routeState.booking?.pnr_reference || routeState.bookingId || routeState.booking_id || routeState.booking?.booking_id || 'HorizonElite';

  const finishBooking = async () => {
    setIsFinishing(true);
    setCalendarMessage('');
    setCheckInReminderMessage('');

    if (enabled[0]) {
      if (flights.length === 0) {
        setCalendarMessage('Calendar reminder could not be created because flight details are missing.');
        setIsFinishing(false);
        return;
      }

      const calendar = buildFlightCalendar(flights, bookingReference);
      downloadIcsFile(calendar, `horizon-elite-flight-${safeFilenamePart(bookingReference)}.ics`);
      setCalendarMessage('Calendar reminder downloaded. Open the .ics file to add it to your calendar.');
    }

    if (enabled[1]) {
      const bookingId = routeState.bookingId || routeState.booking_id || routeState.booking?.booking_id;

      if (!bookingId) {
        setCheckInReminderMessage('Email reminder could not be scheduled because the booking ID is missing.');
        setIsFinishing(false);
        return;
      }

      try {
        await checkInApi.scheduleEmailReminder(bookingId);
        setCheckInReminderMessage('Check-in reminder email scheduled for 4 days before departure.');
      } catch (error) {
        setCheckInReminderMessage(error instanceof Error ? error.message : 'Email reminder could not be scheduled.');
        setIsFinishing(false);
        return;
      }
    }

    setIsFinishing(false);
    navigate('/booking-confirmed', { state });
  };

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
          {calendarMessage && (
            <p className={`max-w-md text-center text-sm font-semibold ${calendarMessage.includes('could not') ? 'text-red-600' : 'text-emerald-700'}`}>
              {calendarMessage}
            </p>
          )}
          {checkInReminderMessage && (
            <p className={`max-w-md text-center text-sm font-semibold ${checkInReminderMessage.includes('could not') ? 'text-red-600' : 'text-emerald-700'}`}>
              {checkInReminderMessage}
            </p>
          )}
          <button
            type="button"
            onClick={finishBooking}
            disabled={isFinishing}
            className="flex h-14 w-56 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white shadow-lg shadow-blue-950/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFinishing ? 'Setting Reminders...' : 'Finish Booking'}
          </button>
          <Link to="/booking-confirmed" state={state} className="text-sm font-semibold text-slate-600 underline">Skip for now</Link>
        </div>
      </section>
    </main>
  );
}

export default PersonalizedServices;
