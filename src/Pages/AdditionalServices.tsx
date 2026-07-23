import React, { useEffect } from "react";
import { BadgeCheck, CircleHelp, Download, Luggage, Plane, Sparkles, TicketCheck } from "lucide-react";
import { Link, useLocation } from "react-router";
import PageHeader from "../components/PageHeader";

const postBookingServices = [
  {
    title: "Manage Add-ons",
    description: "Add baggage, meals, assistance, lounge access, or insurance.",
    action: "/add-ons",
    icon: Luggage,
  },
  {
    title: "Manage Booking",
    description: "Use your PNR and last name to review or update your trip.",
    action: "/manage-booking",
    icon: CircleHelp,
  },
  {
    title: "Flight Status",
    description: "Check the latest departure and arrival information.",
    action: "/flight-status",
    icon: Plane,
  },
  {
    title: "Online Check-in",
    description: "Prepare for departure and access check-in services.",
    action: "/check-in",
    icon: BadgeCheck,
  },
  {
    title: "Download E-ticket",
    description: "Download or email your confirmed e-ticket.",
    action: "/download-e-ticket",
    icon: TicketCheck,
  },
  {
    title: "Download Boarding Pass",
    description: "Access your digital boarding pass after check-in.",
    action: "/download-boarding-pass",
    icon: Download,
  },
  {
    title: "Case Management",
    description: "Create or track support cases for this booking.",
    action: "/case-management",
    icon: CircleHelp,
  },
];

function AdditionalServices(): React.JSX.Element {
  const { hash, state } = useLocation();
  const routeState = (state ?? {}) as Record<string, any>;
  const booking = routeState.booking || {};
  const outbound = routeState.outboundFlight || routeState.selectedFlight || {};
  const passengers = routeState.passengers || booking.passengers || [];
  const primaryPassenger = passengers[0] || {};
  const pnr = routeState.pnrReference || booking.pnr_reference || "Not available";
  const origin = outbound.origin_airport_code || outbound.departure_airport || "--";
  const destination = outbound.destination_airport_code || outbound.arrival_airport || "--";
  const hasBookingContext = Boolean(routeState.pnrReference || booking.pnr_reference || routeState.booking_id || routeState.bookingId || booking.booking_id);

  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.replace("#", ""));
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hash]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <PageHeader rightLink={{ label: "Manage Booking", to: "/manage-booking" }} />
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">Post-booking services</p>
            <h1 className="mt-2 text-5xl font-semibold text-[#073b70]">Additional Services</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-slate-600">
              Continue after payment with trip management, check-in, travel documents, and support.
            </p>
          </div>

          <Link
            to="/booking-confirmed"
            state={routeState}
            className="inline-flex h-12 items-center justify-center rounded border border-[#073b70] px-6 text-sm font-semibold text-[#073b70] hover:bg-white"
          >
            Back to Booking
          </Link>
        </div>

        {!hasBookingContext && (
          <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
            This post-booking page works best from a confirmed booking. Use Manage Booking if you need to find a trip by PNR first.
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5 md:grid-cols-2">
            {postBookingServices.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  id={service.title.toLowerCase().replace(/\s+/g, "-")}
                  key={service.title}
                  to={service.action}
                  state={{ ...routeState, selectedService: service.title }}
                  className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#073b70] hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-50 text-[#073b70]">
                    <Icon size={25} strokeWidth={2.2} />
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold text-[#073b70]">{service.title}</h2>
                  <p className="mt-3 min-h-12 text-sm font-semibold leading-6 text-slate-600">{service.description}</p>
                  <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-widest text-cyan-700">Open</span>
                </Link>
              );
            })}

            <Link
              to="/personalized-services"
              state={routeState}
              className="rounded-lg border border-purple-300 bg-purple-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple-700 hover:shadow-lg md:col-span-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded bg-white text-purple-700">
                <Sparkles size={25} strokeWidth={2.2} />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-purple-800">Continue to Personalized Services</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-purple-900/75">
                Finish with travel reminders, flight updates, check-in notifications, and personalized recommendations for this booking.
              </p>
              <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-widest text-purple-700">Final step</span>
            </Link>
          </div>

          <aside className="space-y-6">
            <section className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
              <div className="bg-[#073b70] px-6 py-4 text-white">
                <h2 className="text-lg font-semibold uppercase">Trip Summary</h2>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div>
                    <p className="text-3xl font-semibold text-[#073b70]">{origin}</p>
                    <p className="text-sm font-semibold text-slate-500">From</p>
                  </div>
                  <Plane size={18} className="text-slate-400" />
                  <div className="text-right">
                    <p className="text-3xl font-semibold text-[#073b70]">{destination}</p>
                    <p className="text-sm font-semibold text-slate-500">To</p>
                  </div>
                </div>

                <hr />

                <Info label="PNR" value={pnr} />
                <Info label="Flight" value={outbound.flight_number || "Not available"} />
                <Info label="Passenger" value={`${primaryPassenger.pi_first_name || primaryPassenger.first_name || ""} ${primaryPassenger.pi_last_name || primaryPassenger.last_name || ""}`.trim() || "Not available"} />
                <Info label="Status" value={booking.booking_status || routeState.bookingStatus || "Not available"} />

                <Link
                  to="/manage-booking"
                  className="flex h-12 w-full items-center justify-center rounded bg-[#073b70] text-sm font-semibold text-white hover:bg-[#052f59]"
                >
                  Manage With PNR
                </Link>
              </div>
            </section>

            <section className="rounded-lg border border-purple-200 bg-purple-50 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-purple-800">Next Step</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-purple-900/75">
                After choosing any needed post-booking services, continue to Personalized Services to set reminders and recommendations.
              </p>
              <Link to="/personalized-services" state={routeState} className="mt-5 flex h-12 w-full items-center justify-center rounded bg-purple-700 text-sm font-semibold text-white hover:bg-purple-800">
                Continue to Personalized
              </Link>
            </section>

            <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#073b70]">Need Help?</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Our support team can help with booking, baggage, and service requests.
              </p>
              <Link to="/case-management" className="mt-5 inline-block font-semibold text-cyan-700 hover:underline">
                Open Help Desk
              </Link>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-right font-medium text-[#073b70]">{value}</span>
    </div>
  );
}

export default AdditionalServices;
