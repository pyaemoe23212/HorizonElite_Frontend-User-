import React from "react";
import { CircleHelp } from "lucide-react";
import { Link } from "react-router";

function CheckIn(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <Link
          to="/services"
          className="mb-10 inline-flex items-center text-slate-600 hover:text-[#073b70]"
        >
          ←
        </Link>

        {/* Logo */}
        <h1 className="text-center text-5xl font-black text-[#073b70]">
          Check-in
        </h1>

        <p className="mx-auto mt-5 max-w-md text-center text-lg text-slate-600">
          Welcome back. Please enter your details to begin your journey.
        </p>

        {/* Card */}
        <section className="mx-auto mt-10 max-w-xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
          {/* Top Accent */}
          <div className="h-1 bg-[#073b70]" />

          <div className="p-9">
            {/* Booking Reference */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                Booking Reference (PNR)
              </label>

              <input
                type="text"
                placeholder="e.g. G4KL9X"
                className="mt-2 h-12 w-full rounded border border-slate-300 px-4 outline-none transition focus:border-[#073b70]"
              />
            </div>

            {/* Passenger Name */}
            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                Passenger Last Name
              </label>

              <input
                type="text"
                placeholder="As it appears on your ticket"
                className="mt-2 h-12 w-full rounded border border-slate-300 px-4 outline-none transition focus:border-[#073b70]"
              />
            </div>

            {/* Information */}
            <div className="mt-6 rounded-md bg-slate-100 p-4">
              <div className="flex items-start gap-3">
                <CircleHelp className="mt-1 text-cyan-700" size={18} />

                <p className="text-sm text-slate-600">
                  Online check-in opens{" "}
                  <span className="font-bold text-[#073b70]">
                    48 hours
                  </span>{" "}
                  before your scheduled departure and remains available until{" "}
                  <span className="font-bold text-[#073b70]">
                    90 minutes
                  </span>{" "}
                  before take-off.
                </p>
              </div>
            </div>

            {/* Button */}
            <button className="mt-8 flex h-12 w-full items-center justify-center rounded bg-[#073b70] font-bold uppercase tracking-widest text-white transition hover:bg-[#052b52]">
              Search Booking →
            </button>
          </div>
        </section>

        {/* Footer Links */}
        <div className="mx-auto mt-6 flex max-w-xl items-center justify-between text-sm text-slate-600">
          <button className="hover:text-[#073b70] hover:underline">
            ⓘ Where can I find my reference?
          </button>

          <button className="hover:text-[#073b70] hover:underline">
            Manage other travel items ↗
          </button>
        </div>
      </div>
    </main>
  );
}

export default CheckIn;
