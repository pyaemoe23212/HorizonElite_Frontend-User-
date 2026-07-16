import React, { useState } from "react";
import { CalendarDays, CircleHelp, Clock, Home, LoaderCircle, MapPin, Plane, Search } from "lucide-react";
import { Link } from "react-router";
import {
  flightStatusApi,
  type FlightStatusEndpoint,
  type FlightStatusRecord,
} from "../Services/api";

const today = new Date().toISOString().slice(0, 10);

const displayTime = (endpoint?: FlightStatusEndpoint) => {
  const value =
    endpoint?.runwayTime?.local ??
    endpoint?.revisedTime?.local ??
    endpoint?.predictedTime?.local ??
    endpoint?.scheduledTime?.local ??
    endpoint?.runwayTime?.utc ??
    endpoint?.revisedTime?.utc ??
    endpoint?.predictedTime?.utc ??
    endpoint?.scheduledTime?.utc;

  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(11, 16) || value;
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);
};

const displayDate = (endpoint?: FlightStatusEndpoint) => {
  const value = endpoint?.scheduledTime?.local ?? endpoint?.scheduledTime?.utc;
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const statusClasses = (status?: string) => {
  const normalized = status?.toLowerCase() ?? "";
  if (["landed", "arrived", "active", "en route"].some((item) => normalized.includes(item))) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (["cancelled", "canceled", "diverted"].some((item) => normalized.includes(item))) {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (["delayed", "unknown"].some((item) => normalized.includes(item))) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-cyan-200 bg-cyan-50 text-cyan-700";
};

const airportCode = (endpoint?: FlightStatusEndpoint) => endpoint?.airport?.iata || endpoint?.airport?.icao || "---";
const airportName = (endpoint: FlightStatusEndpoint | undefined, fallback: string) =>
  endpoint?.airport?.name || endpoint?.airport?.municipalityName || fallback;
const terminalGate = (endpoint?: FlightStatusEndpoint) =>
  [endpoint?.terminal && `Terminal ${endpoint.terminal}`, endpoint?.gate && `Gate ${endpoint.gate}`].filter(Boolean).join(" - ") || "Terminal and gate pending";

function FlightStatus(): React.JSX.Element {
  const [flightNumber, setFlightNumber] = useState("");
  const [departureDate, setDepartureDate] = useState(today);
  const [results, setResults] = useState<FlightStatusRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const checkStatus = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedFlightNumber = flightNumber.trim().replace(/\s+/g, "").toUpperCase();

    if (!normalizedFlightNumber || !departureDate) {
      setError("Enter a flight number and departure date.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const response = await flightStatusApi.getStatus(normalizedFlightNumber, departureDate);
      const records = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
      setResults(records);
      setLastUpdated(new Date());
    } catch (requestError) {
      setResults([]);
      setError(requestError instanceof Error ? requestError.message : "Unable to retrieve flight status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-2xl font-black tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/services" className="hidden h-11 items-center rounded border border-slate-300 px-4 text-sm font-black text-slate-600 hover:bg-slate-50 sm:inline-flex">
              Services
            </Link>
            <Link to="/" className="inline-flex h-11 items-center gap-2 rounded border border-[#073b70] px-4 text-sm font-black text-[#073b70] hover:bg-slate-50">
              <Home size={18} />
              Home
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#073b70] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Flight Status</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-normal sm:text-6xl">Track Your Journey</h1>
              <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-blue-100">
                Check departure, arrival, gate, terminal, and aircraft updates before you leave for the airport.
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-cyan-100">Latest check</p>
              <p className="mt-2 text-2xl font-black">{lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Waiting for search"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[360px_1fr]">
        <aside>
          <form onSubmit={checkStatus} className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
              <span className="flex h-11 w-11 items-center justify-center rounded bg-blue-50 text-[#073b70]">
                <Search size={21} />
              </span>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-[#073b70]">Search Flight</p>
                <p className="text-sm font-semibold text-slate-500">Use your flight number and date.</p>
              </div>
            </div>

            {error && <div role="alert" className="mt-5 rounded border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

            <label htmlFor="flight-number" className="mt-6 block text-xs font-black uppercase tracking-widest text-slate-500">
              Flight Number
              <input
                id="flight-number"
                value={flightNumber}
                onChange={(event) => setFlightNumber(event.target.value.toUpperCase())}
                type="text"
                placeholder="HE742"
                autoComplete="off"
                className="mt-2 h-12 w-full rounded border border-slate-300 px-4 text-base font-bold uppercase text-slate-800 outline-none focus:border-[#073b70] focus:ring-1 focus:ring-[#073b70]"
              />
            </label>

            <label htmlFor="departure-date" className="mt-5 block text-xs font-black uppercase tracking-widest text-slate-500">
              Departure Date
              <input
                id="departure-date"
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                type="date"
                className="mt-2 h-12 w-full rounded border border-slate-300 px-4 text-base font-semibold text-slate-800 outline-none focus:border-[#073b70] focus:ring-1 focus:ring-[#073b70]"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-13 min-h-13 w-full items-center justify-center gap-2 rounded bg-[#073b70] px-5 py-4 font-black text-white transition hover:bg-[#052b52] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <LoaderCircle className="animate-spin" size={19} /> : <Search size={19} />}
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="flex gap-3">
              <CircleHelp className="mt-1 shrink-0 text-cyan-700" size={20} />
              <div>
                <h2 className="font-black uppercase tracking-wide text-[#073b70]">Travel Advisory</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Gate assignments can change. Verify your boarding gate at the airport using official signage before boarding.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section aria-live="polite">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Live Information</p>
              <h2 className="mt-1 text-3xl font-black text-[#073b70]">Latest Update</h2>
            </div>
            {lastUpdated && <p className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-500">Last checked {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
          </div>

          {!error && loading && (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
              <LoaderCircle className="mb-4 animate-spin text-[#073b70]" size={38} />
              <p className="text-xl font-black text-[#073b70]">Retrieving flight status</p>
              <p className="mt-2 text-sm font-semibold">Checking airline updates, gate details, and schedule changes.</p>
            </div>
          )}

          {!error && !loading && !hasSearched && (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
              <Plane className="mb-4 text-[#073b70]" size={44} />
              <p className="text-2xl font-black text-[#073b70]">Search a flight to begin</p>
              <p className="mt-2 max-w-md text-sm font-semibold leading-6">
                Enter a flight number and departure date to view route, timing, aircraft, terminal, and gate information.
              </p>
            </div>
          )}

          {!error && !loading && hasSearched && results.length === 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-8 text-center text-amber-800 shadow-sm">
              <p className="text-xl font-black">No matching flight found</p>
              <p className="mt-2 text-sm font-semibold">Check the flight number and date, then try again.</p>
            </div>
          )}

          {!error && !loading && results.map((flight, index) => {
            const departure = flight.departure;
            const arrival = flight.arrival;
            const flightLabel = flight.number || flightNumber.trim().toUpperCase();
            const aircraft = flight.aircraft?.model || "Aircraft unavailable";

            return (
              <article key={`${flightLabel}-${index}`} className="mb-6 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-7 py-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">{flight.airline?.name || "Airline unavailable"}</p>
                    <h3 className="mt-1 text-3xl font-black text-[#073b70]">Flight {flightLabel}</h3>
                  </div>
                  <span className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest ${statusClasses(flight.status)}`}>
                    {flight.status || "Status unavailable"}
                  </span>
                </div>

                <div className="grid gap-8 p-7 lg:grid-cols-[1fr_220px_1fr] lg:items-center">
                  <FlightEndpoint title="Departure" endpoint={departure} fallbackName="Departure airport unavailable" align="left" />

                  <div className="text-center">
                    <div className="flex items-center">
                      <span className="h-px flex-1 bg-slate-300" />
                      <span className="mx-4 flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-[#073b70]">
                        <Plane size={26} />
                      </span>
                      <span className="h-px flex-1 bg-slate-300" />
                    </div>
                    <p className="mt-4 inline-flex items-center gap-2 rounded bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
                      <CalendarDays size={15} />
                      {displayDate(departure)}
                    </p>
                  </div>

                  <FlightEndpoint title="Arrival" endpoint={arrival} fallbackName="Arrival airport unavailable" align="right" />
                </div>

                <div className="grid gap-4 border-t border-slate-200 bg-slate-50 p-6 sm:grid-cols-3">
                  <Detail icon={<Plane size={18} />} label="Aircraft" value={aircraft} />
                  <Detail icon={<MapPin size={18} />} label="Registration" value={flight.aircraft?.reg || "Unavailable"} />
                  <Detail icon={<Clock size={18} />} label="Distance" value={flight.greatCircleDistance?.km != null ? `${Math.round(flight.greatCircleDistance.km).toLocaleString()} km` : "Unavailable"} />
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function FlightEndpoint({
  title,
  endpoint,
  fallbackName,
  align,
}: {
  title: string;
  endpoint?: FlightStatusEndpoint;
  fallbackName: string;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "lg:text-right" : ""}>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</p>
      <p className="mt-3 text-5xl font-light text-[#073b70]">{displayTime(endpoint)}</p>
      <p className="mt-2 text-4xl font-black text-[#073b70]">{airportCode(endpoint)}</p>
      <p className="mt-2 text-sm font-semibold text-slate-500">{airportName(endpoint, fallbackName)}</p>
      <p className="mt-4 inline-flex rounded bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-[#073b70]">
        {terminalGate(endpoint)}
      </p>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded border border-slate-200 bg-white p-4">
      <span className="text-[#073b70]">{icon}</span>
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 font-black text-[#073b70]">{value}</p>
      </div>
    </div>
  );
}

export default FlightStatus;
