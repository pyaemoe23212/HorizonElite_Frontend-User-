import React from "react";
import { BadgeCheck, CircleHelp, Luggage, Plane } from "lucide-react";
import { Link } from "react-router";

const services = [
  {
    title: "Manage Booking",
    description: "Find your trip with PNR and last name to manage add-ons, e-ticket, and boarding pass.",
    action: "/manage-booking",
    icon: Luggage,
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
    title: "Help Desk",
    description: "Create and track support cases for your journey.",
    action: "/case-management",
    icon: CircleHelp,
  },
];

function Services(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14 text-slate-800">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">Horizon Elite</p>
            <h1 className="mt-2 text-5xl font-black text-[#073b70]">Services</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-slate-600">
              Manage your trip, check flight updates, and get support from one place.
            </p>
          </div>

          <Link
            to="/manage-booking"
            className="inline-flex h-12 items-center justify-center rounded bg-[#073b70] px-6 text-sm font-black text-white hover:bg-[#052f59]"
          >
            Find My Booking
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.title}
                to={service.action}
                className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#073b70] hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-50 text-[#073b70]">
                  <Icon size={25} strokeWidth={2.2} />
                </div>

                <h2 className="mt-6 text-2xl font-black text-[#073b70]">{service.title}</h2>
                <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-slate-600">{service.description}</p>
                <span className="mt-6 inline-block text-xs font-black uppercase tracking-widest text-cyan-700">Open</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Services;
