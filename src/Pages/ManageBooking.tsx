import React from "react";
import { CircleHelp, Download, Luggage as Suitcase, Mail, Plane } from "lucide-react";
import { Link } from "react-router";

const onlineServices = [
  {
    title: "Seat Selection",
    description:
      "Choose your preferred seat or upgrade to extra legroom in our premium cabins.",
    icon: Suitcase,
  },
  {
    title: "Meal Preferences",
    description:
      "Pre-order gourmet meals or manage dietary requirements for your flight.",
    icon: Mail,
  },
  {
    title: "Instant Upgrades",
    description:
      "Check availability for First and Business Class upgrades with your Elite miles.",
    icon: Plane,
  },
  {
    title: "Change Flight",
    description:
      "Easily modify your travel dates or destinations with flexible Elite terms.",
    icon: CircleHelp,
  },
];

function ManageBooking(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          to="/services"
          className="mb-8 inline-flex items-center gap-2 text-slate-500 hover:text-[#073b70]"
        >
          ← Back
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">

          {/* Left */}
          <section>

            <h1 className="text-5xl font-black text-[#073b70]">
              Manage My Booking
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Retrieve your itinerary to select seats, upgrade your cabin,
              or update your travel information.
            </p>

            <div className="mt-10 rounded-lg border border-slate-300 bg-white p-8 shadow-sm">

              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#073b70]">
                    Booking Reference (PNR)
                  </label>

                  <input
                    type="text"
                    placeholder="E.g. HZN7XL"
                    className="h-12 w-full rounded border border-slate-300 px-4 outline-none focus:border-[#073b70]"
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    Found on your ticket or confirmation email.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-[#073b70]">
                    Passenger Last Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your last name"
                    className="h-12 w-full rounded border border-slate-300 px-4 outline-none focus:border-[#073b70]"
                  />
                </div>
              </div>

              <hr className="my-8" />

              <div className="flex flex-wrap items-center gap-6">

                <button className="rounded bg-[#073b70] px-8 py-3 font-bold text-white transition hover:bg-[#052f59]">
                  Find My Booking →
                </button>

                <button className="text-[#073b70] hover:underline">
                  Where can I find my PNR?
                </button>
              </div>

              <hr className="my-8" />

              <p className="mb-5 text-slate-500">
                Already checked in or confirmed your booking? Quickly download
                your travel documents below.
              </p>

              <div className="flex flex-wrap gap-4">

                <button className="flex-1 rounded border border-[#073b70] py-3 font-semibold text-[#073b70] hover:bg-slate-50">
                  <span className="inline-flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download Boarding Pass
                  </span>
                </button>

                <button className="flex-1 rounded border border-[#073b70] py-3 font-semibold text-[#073b70] hover:bg-slate-50">
                  <span className="inline-flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download E-ticket
                  </span>
                </button>

              </div>

            </div>

          </section>

          {/* Right */}
          <aside>

            <h2 className="mb-6 text-3xl font-black text-[#073b70]">
              Online Services
            </h2>

            <div className="space-y-4">

              {onlineServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.title}
                    className="flex gap-4 rounded-lg border border-slate-300 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-[#073b70]">
                      <Icon size={24} strokeWidth={2.2} />
                    </div>

                    <div>
                      <h3 className="font-bold uppercase text-[#073b70]">
                        {service.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                )
              })}

            </div>

            <div className="mt-8 rounded-lg bg-[#073b70] p-8 text-white">

              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Elite Benefit
              </p>

              <h3 className="mt-2 text-3xl font-black">
                Priority Assistance
              </h3>

              <p className="mt-4 text-slate-200">
                Need help with your booking? Our dedicated Elite concierge is
                available 24/7 to assist you.
              </p>

              <button className="mt-8 w-full rounded border border-white py-3 font-bold hover:bg-white hover:text-[#073b70]">
                Contact Concierge
              </button>

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}

export default ManageBooking;
