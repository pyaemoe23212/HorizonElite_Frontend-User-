import React from 'react';
import { BadgeCheck, Download, Home, Plane, Printer } from 'lucide-react';
import { Link, useLocation } from 'react-router';

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
}

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
  const bookingState = (state ?? {}) as BookingConfirmedState;

  const pnrReference = bookingState.pnrReference || bookingState.booking?.pnr_reference || 'Not available';
  const totalPaid = bookingState.totalPaymentAmount || bookingState.payment?.total_payment_amount || 0;
  const currencyCode = bookingState.currency_code || bookingState.payment?.currency_code || 'USD';
  const paymentStatus = bookingState.paymentStatus || bookingState.payment?.payment_status_code || 'PENDING';
  const ticketingStatus = bookingState.ticketingStatus || (bookingState.duffelOrderId ? 'ORDER_CREATED' : 'ORDER_PENDING');
  const isPostBookingAddonPayment = Boolean(bookingState.postBookingAddonPayment);
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

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
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

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-xl border border-slate-300 bg-white p-8 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#073b70] shadow-lg shadow-blue-950/10">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#073b70]">
                  <BadgeCheck size={23} strokeWidth={2.5} />
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-normal text-[#073b70] sm:text-5xl">
                  {isPostBookingAddonPayment ? 'Add-ons Confirmed' : 'Booking Confirmed'}
                </h1>
                <p className="mt-3 text-lg font-semibold text-slate-600">
                  {isPostBookingAddonPayment ? 'Your additional services have been added to your booking.' : 'Thank you for choosing Horizon Elite. Your journey awaits.'}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-300 bg-slate-50 px-6 py-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Booking Reference</span>
              <span className="mt-1 block text-3xl font-semibold tracking-widest text-[#073b70]">{pnrReference}</span>
            </div>
          </div>

          {!hasBookingDetails && (
            <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-5 text-left text-sm font-semibold text-amber-800">
              Booking details were not passed to this page. Open your trip from Manage Booking to view the confirmed itinerary, passengers, e-ticket, and boarding pass actions.
            </div>
          )}

          {paymentStatus === 'PAID' && !isPostBookingAddonPayment && ticketingStatus !== 'ORDER_CREATED' && (
            <div className={`mx-auto mt-6 max-w-3xl rounded-lg border p-5 text-left ${ticketingStatus === 'ORDER_FAILED' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
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
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-[#073b70] px-8 py-5 text-white">
              <h2 className="text-3xl font-semibold">Flight Itinerary</h2>
              <span className="rounded bg-cyan-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-100">Confirmed</span>
            </div>

            <div className="space-y-8 px-8 py-10">
              {flights.length === 0 && (
                <div className="rounded border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
                  Flight itinerary details are unavailable for this confirmation.
                </div>
              )}

              {flights.map(([title, flight]) => (
                <div key={title} className="grid items-start gap-8 border-b border-slate-200 pb-8 last:border-b-0 last:pb-0 md:grid-cols-[1fr_1.2fr_1fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title} Origin</p>
                    <p className="mt-4 text-4xl font-semibold text-[#073b70]">{getAirportCode(flight, 'origin')}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-700">{getAirportName(flight, 'origin')}</p>
                    <p className="mt-3 text-base font-semibold text-slate-500">{formatDateTime(flight.departure_datetime)}</p>
                  </div>

                  <div className="flex flex-col items-center pt-12 text-center">
                    <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-5">
                      <span className="h-px bg-slate-300" />
                      <Plane className="text-[#073b70]" size={34} strokeWidth={2.4} />
                      <span className="h-px bg-slate-300" />
                    </div>
                    <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-cyan-600">
                      {flight.total_stop_count === 0 ? 'Non-stop' : flight.total_stop_count != null ? `${flight.total_stop_count} Stop(s)` : 'Stops unavailable'} {flight.duration ? `- ${flight.duration}` : ''}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Destination</p>
                    <p className="mt-4 text-4xl font-semibold text-[#073b70]">{getAirportCode(flight, 'destination')}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-700">{getAirportName(flight, 'destination')}</p>
                    <p className="mt-3 text-base font-semibold text-slate-500">{formatDateTime(flight.arrival_datetime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-8">
            <section className="rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
              <h2 className="border-b border-slate-200 pb-4 text-sm font-semibold uppercase tracking-widest text-slate-600">Passenger Details</h2>
              {passengers.length > 0 ? (
                <div className="mt-6 space-y-5">
                  {passengers.map((passenger: any, index: number) => (
                    <div key={passenger.passenger_id || passenger.passengerId || index} className="rounded border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Passenger {index + 1} - {getPassengerTypeLabel(passenger.pi_passenger_type_code)}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[#073b70]">{formatPassengerName(passenger) || 'Name not provided'}</p>
                      <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{cabinClass}</p>
                      <div className="mt-4 grid gap-4 text-sm font-semibold text-slate-600 sm:grid-cols-2">
                        <Info label="Date of Birth" value={formatDate(passenger.pi_date_of_birth)} />
                        <Info label="Nationality" value={passenger.pi_nationality || 'Not provided'} />
                        <Info label="Passport" value={passenger.pi_passport_number || 'Not provided'} />
                        <Info label="Passport Expiry" value={formatDate(passenger.pi_passport_expiry_date)} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  Passenger details were not included in this confirmation state.
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
              <h2 className="border-b border-slate-200 pb-4 text-sm font-semibold uppercase tracking-widest text-slate-600">Payment Summary</h2>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-500">Total Paid</p>
                  <p className="mt-2 text-3xl font-semibold text-[#073b70]">{formatMoney(totalPaid, currencyCode)}</p>
                </div>
                <span className={`text-sm font-semibold uppercase ${paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                  {paymentStatus === 'PAID' ? 'Paid' : paymentStatus}
                </span>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-500">Duffel Order ID</p>
                <p className="mt-2 break-all text-sm font-semibold text-[#073b70]">{duffelOrderId || 'Not created yet'}</p>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-8 rounded-xl border border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-500">
            {userEmail ? `The e-ticket and payment receipt have been sent to ${userEmail}.` : 'Your e-ticket and receipt are available from Manage Booking once details are loaded.'}
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Link to="/" className="flex h-14 items-center justify-center gap-2 rounded bg-[#073b70] text-base font-semibold text-white">
              <Home size={20} />
              Home
            </Link>
            <Link to="/additional-services?flow=booking" state={{ ...bookingState, bookingId }} className="flex h-14 items-center justify-center gap-2 rounded bg-[#073b70] text-base font-semibold text-white">
              <BadgeCheck size={20} />
              Services
            </Link>
            <Link to="/download-e-ticket" state={{ ...bookingState, bookingId }} className="flex h-14 items-center justify-center gap-2 rounded border border-[#073b70] bg-white text-base font-semibold text-[#073b70]">
              <Download size={20} />
              E-Ticket
            </Link>
            <Link to="/manage-booking" state={{ ...bookingState, bookingId }} className="flex h-14 items-center justify-center rounded border border-amber-300 bg-white text-base font-semibold text-amber-600">Manage</Link>
            <button type="button" onClick={() => window.print()} className="flex h-14 items-center justify-center gap-2 rounded border border-slate-300 bg-white text-base font-semibold text-[#073b70]">
              <Printer size={20} />
              Print
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-700">{value}</p>
    </div>
  );
}

export default BookingConfirmed;
