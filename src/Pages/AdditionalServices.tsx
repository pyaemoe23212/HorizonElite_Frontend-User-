import React, { useEffect } from "react";
import { BadgeCheck, CircleHelp, Download, Luggage, Plane, Sparkles, TicketCheck } from "lucide-react";
import { Link, useLocation } from "react-router";
import PageHeader from "../components/PageHeader";
import PostBookingFlowSteps from "../components/PostBookingFlowSteps";

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
    <main className="min-h-screen bg-[#eef3f7] text-slate-800">
      <PageHeader rightLink={{ label: "Manage Booking", to: "/manage-booking" }} />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <PostBookingFlowSteps currentStep={2} />

        <div className="he-soft-card rounded-lg border border-slate-300 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-700">Step 2 of 3</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#073b70] sm:text-4xl">Choose Travel Services</h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-600 sm:text-base">
                Add only what you need now. You can skip this step and manage services later with your booking reference.
              </p>
            </div>

            <Link
              to="/personalized-services"
              state={routeState}
              className="inline-flex h-12 items-center justify-center rounded bg-[#073b70] px-6 text-sm font-semibold text-white hover:bg-[#052f59]"
            >
              Continue to Personalize
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#073b70]">Optional services</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">Pick a service to open it, or continue if you are finished.</p>
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

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-5 md:grid-cols-2">
            {postBookingServices.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  id={service.title.toLowerCase().replace(/\s+/g, "-")}
                  key={service.title}
                  to={service.action}
                  state={{ ...routeState, selectedService: service.title }}
                  className="he-soft-card rounded-lg border border-slate-300 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#073b70] hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-50 text-[#073b70]">
                    <Icon size={25} strokeWidth={2.2} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-[#073b70]">{service.title}</h2>
                  <p className="mt-3 min-h-12 text-sm font-semibold leading-6 text-slate-600">{service.description}</p>
                  <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-widest text-cyan-700">Open service</span>
                </Link>
              );
            })}

            <Link
              to="/personalized-services"
              state={routeState}
              className="he-soft-card rounded-lg border border-[#073b70] bg-[#073b70] p-5 text-white shadow-sm transition hover:-translate-y-1 hover:bg-[#052f59] hover:shadow-lg md:col-span-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded bg-white text-[#073b70]">
                <Sparkles size={25} strokeWidth={2.2} />
              </div>
              <h2 className="mt-5 text-xl font-semibold">Continue to Personalize</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-blue-100">
                Final step: choose reminders and travel updates for this booking.
              </p>
              <span className="mt-5 inline-block text-xs font-semibold uppercase tracking-widest text-cyan-100">Step 3</span>
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

            <section className="rounded-lg border border-[#073b70] bg-[#073b70] p-6 text-white shadow-sm">
              <h2 className="text-lg font-semibold">Next Step</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-blue-100">
                Continue when you are done choosing optional services.
              </p>
              <Link to="/personalized-services" state={routeState} className="mt-5 flex h-12 w-full items-center justify-center rounded bg-white text-sm font-semibold text-[#073b70] hover:bg-blue-50">
                Continue to Personalize
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
