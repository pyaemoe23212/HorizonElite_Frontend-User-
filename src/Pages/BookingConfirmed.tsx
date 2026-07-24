import React from 'react';
import { BadgeCheck, CalendarDays, CreditCard, Download, Home, Plane, Printer, TicketCheck, UserRound } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import PostBookingFlowSteps from '../components/PostBookingFlowSteps';

interface BookingConfirmedState {
  pnrReference?: string;
  payment?: any;
  payment_id?: string;
  paymentStatus?: string;
  duffelOrder?: any;
  duffelOrderId?: string;
  booking_id?: string;
  outboundFlight?: any;
  inboundFlight?: any;
  totalPaymentAmount?: number | string;
  currency_code?: string;
  booking?: any;
  passengers?: any[];
  passengerIds?: string[];
  ticketingStatus?: string;
  ticketingIssue?: string;
  postBookingAddonPayment?: boolean;
  personalizationComplete?: boolean;
  checkoutComplete?: boolean;
}

const PAYMENT_CHECKOUT_STATE_KEY = 'horizon_elite_checkout_state';
const confirmedFlowSteps = ['Payment', 'Confirmed', 'Manage'];
const addOnFlowSteps = ['Manage', 'Add-ons', 'Payment', 'Done'];

const formatPassengerName = (passenger: any) => [
  passenger?.pi_title,
  passenger?.pi_first_name,
  passenger?.pi_middle_name,
  passenger?.pi_last_name,
].filter(Boolean).join(' ');

const getPassengerTypeLabel = (typeCode?: string) => {
  if (typeCode === 'ADT') return 'Adult';
  if (typeCode === 'CHD') return 'Child';
  if (typeCode === 'INF') return 'Infant';
  return typeCode || 'Passenger';
};

const formatDate = (value?: string) => {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${formatDate(value)} - ${parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};

const formatMoney = (amount: unknown, currencyCode: string) => {
  const parsed = Number(amount);
  return `${currencyCode} ${Number.isFinite(parsed) ? parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}`;
};

const getFlightClass = (bookingState: BookingConfirmedState) => (
  bookingState.outboundFlight?.cabin_class ||
  bookingState.inboundFlight?.cabin_class ||
  bookingState.booking?.cabin_class ||
  'Not provided'
);

const airportNames: Record<string, string> = {
  BKK: 'Suvarnabhumi Airport',
  DMK: 'Don Mueang International Airport',
  RGN: 'Yangon International Airport',
  MDL: 'Mandalay International Airport',
  SIN: 'Singapore Changi Airport',
  KUL: 'Kuala Lumpur International Airport',
  SGN: 'Tan Son Nhat International Airport',
  HAN: 'Noi Bai International Airport',
  PNH: 'Phnom Penh International Airport',
  SAI: 'Siem Reap Angkor International Airport',
  VTE: 'Wattay International Airport',
  CGK: 'Soekarno-Hatta International Airport',
  DPS: 'Ngurah Rai International Airport',
  MNL: 'Ninoy Aquino International Airport',
  HKG: 'Hong Kong International Airport',
  HND: 'Tokyo Haneda Airport',
  NRT: 'Narita International Airport',
  ICN: 'Incheon International Airport',
  DXB: 'Dubai International Airport',
  DOH: 'Hamad International Airport',
  LHR: 'Heathrow Airport',
  JFK: 'John F. Kennedy International Airport',
  LAX: 'Los Angeles International Airport',
  SYD: 'Sydney Kingsford Smith Airport',
};

const getAirportCode = (flight: any, side: 'origin' | 'destination') => (
  side === 'origin'
    ? flight.origin_airport_code || flight.departure_airport || '--'
    : flight.destination_airport_code || flight.arrival_airport || '--'
);

const getAirportName = (flight: any, side: 'origin' | 'destination') => {
  const rawName = side === 'origin'
    ? flight.departure_airport_name || flight.origin_airport_name || flight.departure_airport
    : flight.arrival_airport_name || flight.destination_airport_name || flight.arrival_airport;
  const code = getAirportCode(flight, side);

  if (rawName && rawName !== code) return rawName;
  return airportNames[code] || 'Airport details pending';
};

function BookingConfirmed(): React.JSX.Element {
  const { state } = useLocation();
  const navigate = useNavigate();
  const bookingState = (state ?? {}) as BookingConfirmedState;

  const pnrReference = bookingState.pnrReference || bookingState.booking?.pnr_reference || 'Not available';
  const totalPaid = bookingState.totalPaymentAmount || bookingState.payment?.total_payment_amount || 0;
  const currencyCode = bookingState.currency_code || bookingState.payment?.currency_code || 'USD';
  const paymentStatus = bookingState.paymentStatus || bookingState.payment?.payment_status_code || 'PENDING';
  const ticketingStatus = bookingState.ticketingStatus || (bookingState.duffelOrderId ? 'ORDER_CREATED' : 'ORDER_PENDING');
  const isPostBookingAddonPayment = Boolean(bookingState.postBookingAddonPayment);
  const personalizationComplete = Boolean(bookingState.personalizationComplete);
  const bookingId = bookingState.booking_id || bookingState.booking?.booking_id;
  const duffelOrderId = bookingState.duffelOrderId || bookingState.duffelOrder?.duffel_order?.data?.id;
  const passengers = bookingState.passengers || bookingState.booking?.passengers || [];
  const primaryPassenger = passengers[0];
  const userEmail = bookingState.payment?.user_email_address || primaryPassenger?.pi_contact_email || bookingState.booking?.user_email_address || '';
  const cabinClass = getFlightClass(bookingState);
  const flights = [
    ['Outbound Flight', bookingState.outboundFlight],
    ['Return Flight', bookingState.inboundFlight],
  ].filter(([, flight]) => Boolean(flight)) as Array<[string, any]>;
  const hasBookingDetails = pnrReference !== 'Not available' || flights.length > 0 || passengers.length > 0;

  React.useEffect(() => {
    window.sessionStorage.removeItem(PAYMENT_CHECKOUT_STATE_KEY);
    window.history.replaceState({ checkoutComplete: true }, '', window.location.href);
    window.history.pushState({ checkoutComplete: true }, '', window.location.href);

    const handleBackNavigation = () => {
      navigate('/manage-booking', { replace: true, state: { ...bookingState, bookingId } });
    };

    window.addEventListener('popstate', handleBackNavigation);

    return () => {
      window.removeEventListener('popstate', handleBackNavigation);
    };
  }, [bookingId, bookingState, navigate]);

  return (
    <main className="min-h-screen bg-[#eef3f7] text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-2xl font-semibold tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
          <Link to="/" className="inline-flex h-11 items-center gap-2 rounded border border-[#073b70] px-4 text-sm font-semibold text-[#073b70] hover:bg-slate-50">
            <Home size={18} />
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {isPostBookingAddonPayment ? (
          <ConfirmationFlowSteps steps={addOnFlowSteps} activeIndex={3} />
        ) : personalizationComplete ? (
          <PostBookingFlowSteps currentStep={3} />
        ) : (
          <ConfirmationFlowSteps steps={confirmedFlowSteps} activeIndex={1} />
        )}

        <div className="he-soft-card overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg shadow-slate-300/40">
          <div className="bg-[#073b70] px-5 py-6 text-white sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-white text-[#073b70]">
                  <BadgeCheck size={30} strokeWidth={2.4} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-100">
                    {paymentStatus === 'PAID' ? 'Payment verified' : 'Booking status'}
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                    {personalizationComplete ? 'Trip Ready' : isPostBookingAddonPayment ? 'Add-ons Confirmed' : 'Booking Confirmed'}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-100 sm:text-base">
                    {personalizationComplete
                      ? 'Your booking, services, and travel preferences are ready.'
                        : isPostBookingAddonPayment
                          ? 'Your additional services are paid and attached to this trip.'
                          : 'You are all set. Next, choose any travel services you need.'}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                <SummaryStat label="PNR" value={pnrReference} strong />
                <SummaryStat label="Paid" value={formatMoney(totalPaid, currencyCode)} />
                <SummaryStat label="Status" value={paymentStatus === 'PAID' ? 'Paid' : paymentStatus} />
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            <section className="p-5 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded bg-green-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-green-700">
                  <TicketCheck size={16} />
                  Confirmed
                </span>
                <span className="inline-flex items-center gap-2 rounded bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[#073b70]">
                  <UserRound size={16} />
                  {passengers.length || 0} Passenger{passengers.length === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-2 rounded bg-amber-50 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-amber-700">
                  <Plane size={16} />
                  {flights.length > 1 ? 'Round Trip' : 'One Way'}
                </span>
              </div>

              {flights.length === 0 && (
                <div className="rounded border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
                  Flight itinerary details are unavailable for this confirmation.
                </div>
              )}

              <div className="space-y-4">
                {flights.map(([title, flight]) => (
                  <article key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">{title}</p>
                        <h2 className="mt-1 text-xl font-semibold text-[#073b70]">
                          {flight.flight_number || 'Flight number pending'}
                        </h2>
                      </div>
                      <span className="rounded bg-white px-3 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
                        {cabinClass}
                      </span>
                    </div>

                    <div className="mt-5 grid items-center gap-5 md:grid-cols-[1fr_150px_1fr]">
                      <FlightPoint
                        code={getAirportCode(flight, 'origin')}
                        name={getAirportName(flight, 'origin')}
                        time={formatDateTime(flight.departure_datetime)}
                        align="left"
                      />

                      <div className="flex items-center justify-center gap-3 text-[#073b70] md:flex-col">
                        <span className="hidden h-px w-16 bg-slate-300 md:block" />
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                          <Plane size={24} strokeWidth={2.3} />
                        </div>
                        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
                          {flight.total_stop_count === 0 ? 'Non-stop' : flight.total_stop_count != null ? `${flight.total_stop_count} Stop(s)` : 'Stops pending'}
                          {flight.duration ? <span className="block normal-case tracking-normal text-slate-600">{flight.duration}</span> : null}
                        </p>
                      </div>

                      <FlightPoint
                        code={getAirportCode(flight, 'destination')}
                        name={getAirportName(flight, 'destination')}
                        time={formatDateTime(flight.arrival_datetime)}
                        align="right"
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="border-t border-slate-200 bg-white p-5 sm:p-8 lg:border-l lg:border-t-0">
              <section>
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
                  <UserRound size={18} />
                  Traveler
                </h2>
                <div className="mt-4 space-y-3">
                  {passengers.length > 0 ? passengers.map((passenger: any, index: number) => (
                    <div key={passenger.passenger_id || passenger.passengerId || index} className="rounded border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Passenger {index + 1} - {getPassengerTypeLabel(passenger.pi_passenger_type_code)}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#073b70]">{formatPassengerName(passenger) || 'Name not provided'}</p>
                    </div>
                  )) : (
                    <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                      Passenger details were not included.
                    </div>
                  )}
                </div>
              </section>

              <section className="mt-7 border-t border-slate-200 pt-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
                  <CreditCard size={18} />
                  Payment
                </h2>
                <div className="mt-4 space-y-3">
                  <Info label="Total paid" value={formatMoney(totalPaid, currencyCode)} />
                  <Info label="Payment status" value={paymentStatus === 'PAID' ? 'Paid' : paymentStatus} />
                  <Info label={isPostBookingAddonPayment ? 'Add-ons' : 'Order'} value={isPostBookingAddonPayment ? 'Paid' : duffelOrderId || 'Pending'} />
                </div>
              </section>

              <section className="mt-7 border-t border-slate-200 pt-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-500">
                  <CalendarDays size={18} />
                  What next
                </h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  {personalizationComplete
                      ? 'You can reopen your booking or download travel documents anytime.'
                      : isPostBookingAddonPayment
                        ? 'Return to Manage Booking to review your updated trip and paid add-ons.'
                        : userEmail
                          ? `E-ticket and receipt sent to ${userEmail}. Continue to services when you are ready.`
                          : 'Continue to services, or use Manage Booking later to reopen this trip.'}
                </p>
                <div className="mt-5 grid gap-3">
                  {!personalizationComplete && !isPostBookingAddonPayment && (
                    <Link to="/additional-services?flow=booking" state={{ ...bookingState, bookingId }} className="flex h-12 items-center justify-center gap-2 rounded bg-[#073b70] text-sm font-semibold text-white hover:bg-[#052f59]">
                      <BadgeCheck size={18} />
                      Continue to Services
                    </Link>
                  )}
                  {isPostBookingAddonPayment && (
                    <Link to="/manage-booking" state={{ ...bookingState, bookingId }} className="flex h-12 items-center justify-center gap-2 rounded bg-[#073b70] text-sm font-semibold text-white hover:bg-[#052f59]">
                      <BadgeCheck size={18} />
                      Back to Manage Booking
                    </Link>
                  )}
                  <Link to="/download-e-ticket" state={{ ...bookingState, bookingId }} className="flex h-12 items-center justify-center gap-2 rounded bg-[#073b70] text-sm font-semibold text-white hover:bg-[#052f59]">
                    <Download size={18} />
                    E-Ticket
                  </Link>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/manage-booking" state={{ ...bookingState, bookingId }} className="flex h-11 items-center justify-center rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">Manage</Link>
                    <button type="button" onClick={() => window.print()} className="flex h-11 items-center justify-center gap-2 rounded border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
                      <Printer size={17} />
                      Print
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>

        {!hasBookingDetails && (
          <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
              Booking details were not passed to this page. Open your trip from Manage Booking to view the confirmed itinerary, passengers, e-ticket, and boarding pass actions.
          </div>
        )}

        {paymentStatus === 'PAID' && !isPostBookingAddonPayment && ticketingStatus !== 'ORDER_CREATED' && (
          <div className={`mt-5 rounded-lg border p-5 ${ticketingStatus === 'ORDER_FAILED' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
            <p className={`text-sm font-semibold uppercase tracking-widest ${ticketingStatus === 'ORDER_FAILED' ? 'text-red-700' : 'text-amber-700'}`}>
              {ticketingStatus === 'ORDER_FAILED' ? 'Payment received, ticketing failed' : 'Payment received, ticketing pending'}
            </p>
            <p className={`mt-2 text-sm font-semibold ${ticketingStatus === 'ORDER_FAILED' ? 'text-red-800' : 'text-amber-800'}`}>
              Please contact support with booking reference {pnrReference}. Your payment status is preserved.
            </p>
            {bookingState.ticketingIssue && (
              <p className={`mt-2 text-xs font-semibold ${ticketingStatus === 'ORDER_FAILED' ? 'text-red-700' : 'text-amber-700'}`}>{bookingState.ticketingIssue}</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function SummaryStat({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="rounded border border-white/20 bg-white/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-100">{label}</p>
      <p className={`mt-1 truncate font-semibold text-white ${strong ? 'text-2xl tracking-widest' : 'text-base'}`}>{value}</p>
    </div>
  );
}

function ConfirmationFlowSteps({ steps, activeIndex }: { steps: string[]; activeIndex: number }) {
  return (
    <div className={`mx-auto mb-8 grid max-w-3xl items-start gap-2 ${steps.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {steps.map((step, index) => {
        const complete = index < activeIndex;
        const active = index === activeIndex;

        return (
          <div key={step} className="relative flex flex-col items-center gap-2 text-center">
            {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
            <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${complete || active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-400'}`}>
              {complete || active ? <BadgeCheck size={18} /> : index + 1}
            </span>
            <span className={`text-[10px] font-semibold uppercase ${complete || active ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}

function FlightPoint({ code, name, time, align }: { code: string; name: string; time: string; align: 'left' | 'right' }) {
  return (
    <div className={align === 'right' ? 'text-left md:text-right' : 'text-left'}>
      <p className="text-4xl font-semibold text-[#073b70]">{code}</p>
      <p className="mt-2 text-base font-semibold text-slate-700">{name}</p>
      <p className="mt-2 text-sm font-semibold text-slate-500">{time}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="max-w-[170px] break-words text-right text-sm font-semibold text-[#073b70]">{value}</span>
    </div>
  );
}

export default BookingConfirmed;
