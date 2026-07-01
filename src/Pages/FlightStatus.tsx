import React from "react";
import { CircleHelp, Plane } from "lucide-react";
import { Link } from "react-router";

function FlightStatus(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          to="/services"
          className="mb-8 inline-flex items-center text-slate-600 hover:text-[#073b70]"
        >
          ←
        </Link>

        {/* Heading */}
        <h1 className="text-5xl font-black text-[#073b70]">
          Track Your Journey
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Experience precision in every mile. Stay informed with real-time
          updates on your Horizon Elite flight status.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left Search Card */}
          <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            {/* Tabs */}
            <div className="flex border-b">
              <button className="border-b-2 border-[#073b70] pb-3 text-xs font-bold uppercase text-[#073b70]">
                By Flight Number
              </button>

              <button className="ml-5 pb-3 text-xs font-bold uppercase text-slate-400">
                By Route
              </button>
            </div>

            {/* Flight Number */}
            <div className="mt-6">
              <label className="text-xs font-bold uppercase text-slate-500">
                Flight Number
              </label>

              <input
                type="text"
                placeholder="HE-402"
                className="mt-2 h-11 w-full rounded border border-slate-300 px-4 outline-none focus:border-[#073b70]"
              />
            </div>

            {/* Date */}
            <div className="mt-5">
              <label className="text-xs font-bold uppercase text-slate-500">
                Departure Date
              </label>

              <input
                type="date"
                className="mt-2 h-11 w-full rounded border border-slate-300 px-4 outline-none focus:border-[#073b70]"
              />
            </div>

            {/* Button */}
            <button className="mt-6 h-12 w-full rounded bg-[#073b70] font-bold text-white transition hover:bg-[#052b52]">
              Check Status
            </button>
          </section>

          {/* Flight Status */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-3xl font-black text-[#073b70]">
                Latest Update
              </h2>

              <p className="text-sm text-slate-500">
                Last updated: 2 mins ago
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between bg-[#073b70] px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black">Flight HE-402</h3>

                  <span className="rounded bg-cyan-700 px-3 py-1 text-xs font-bold uppercase">
                    On Time
                  </span>
                </div>

                <span className="text-sm font-semibold">
                  Airbus A350-1000
                </span>
              </div>

              {/* Flight Progress */}
              <div className="grid grid-cols-3 items-center gap-8 p-8">
                {/* Departure */}
                <div>
                  <p className="text-5xl font-light text-[#073b70]">14:20</p>

                  <p className="text-3xl font-black text-[#073b70]">SIN</p>

                  <p className="mt-2 text-slate-500">
                    Singapore Changi
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#073b70]">
                    TERMINAL 4, GATE B2
                  </p>
                </div>

                {/* Flight */}
                <div className="text-center">
                  <div className="flex items-center">
                    <div className="h-px flex-1 bg-slate-300"></div>

                    <Plane className="mx-4 text-[#073b70]" size={28} />

                    <div className="h-px flex-1 bg-slate-300"></div>
                  </div>

                  <p className="mt-3 text-sm font-semibold uppercase text-slate-500">
                    13H 45M Flight
                  </p>
                </div>

                {/* Arrival */}
                <div className="text-right">
                  <p className="text-5xl font-light text-[#073b70]">05:05</p>

                  <p className="text-3xl font-black text-[#073b70]">LHR</p>

                  <p className="mt-2 text-slate-500">
                    London Heathrow
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Next Day Arrival
                  </p>
                </div>
              </div>

              <hr />

              {/* Bottom Stats */}
              <div className="grid grid-cols-4 gap-6 p-6">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Aircraft
                  </p>

                  <p className="mt-1 font-bold text-[#073b70]">
                    A350-1000
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Altitude
                  </p>

                  <p className="mt-1 font-bold text-[#073b70]">
                    38,000 ft
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Ground Speed
                  </p>

                  <p className="mt-1 font-bold text-[#073b70]">
                    562 mph
                  </p>
                </div>

                <div className="text-right">
                  <button className="font-bold text-cyan-700 hover:underline">
                    Live Map →
                  </button>
                </div>
              </div>
            </div>

            {/* Advisory */}
            <div className="mt-6 rounded-lg bg-slate-50 p-6">
              <div className="flex gap-3">
                <CircleHelp className="text-cyan-700" size={20} />

                <div>
                  <h3 className="font-bold uppercase text-[#073b70]">
                    Travel Advisory
                  </h3>

                  <p className="mt-2 text-slate-600">
                    Gate assignments are subject to change. Please verify your
                    boarding gate upon arrival at the terminal through the
                    Horizon Elite mobile app or digital signage.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default FlightStatus;
