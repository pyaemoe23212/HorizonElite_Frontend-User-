import React, { useState } from "react";
import { CircleHelp, LoaderCircle, Plane, Search } from "lucide-react";
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
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const displayDate = (endpoint?: FlightStatusEndpoint) => {
  const value = endpoint?.scheduledTime?.local ?? endpoint?.scheduledTime?.utc;
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const statusStyle = (status?: string) => {
  const normalized = status?.toLowerCase() ?? "";
  if (["landed", "arrived", "active", "en route"].some((item) => normalized.includes(item))) {
    return "bg-emerald-600";
  }
  if (["cancelled", "canceled", "diverted"].some((item) => normalized.includes(item))) {
    return "bg-red-600";
  }
  if (["delayed", "unknown"].some((item) => normalized.includes(item))) {
    return "bg-amber-600";
  }
  return "bg-cyan-700";
};

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
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <Link to="/services" className="mb-8 inline-flex items-center text-slate-600 hover:text-[#073b70]">
          <span aria-hidden="true">&larr;</span><span className="sr-only">Back to services</span>
        </Link>

        <h1 className="text-4xl font-black text-[#073b70] sm:text-5xl">Track Your Journey</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Stay informed with the latest available updates for your flight.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[300px_1fr]">
          <form onSubmit={checkStatus} className="h-fit rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
            <div className="border-b">
              <p className="inline-block border-b-2 border-[#073b70] pb-3 text-xs font-bold uppercase text-[#073b70]">
                By Flight Number
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="flight-number" className="text-xs font-bold uppercase text-slate-500">Flight Number</label>
              <input
                id="flight-number"
                value={flightNumber}
                onChange={(event) => setFlightNumber(event.target.value)}
                type="text"
                placeholder="SQ12"
                autoComplete="off"
                className="mt-2 h-11 w-full rounded border border-slate-300 px-4 uppercase outline-none focus:border-[#073b70] focus:ring-1 focus:ring-[#073b70]"
              />
            </div>

            <div className="mt-5">
              <label htmlFor="departure-date" className="text-xs font-bold uppercase text-slate-500">Departure Date</label>
              <input
                id="departure-date"
                value={departureDate}
                onChange={(event) => setDepartureDate(event.target.value)}
                type="date"
                className="mt-2 h-11 w-full rounded border border-slate-300 px-4 outline-none focus:border-[#073b70] focus:ring-1 focus:ring-[#073b70]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded bg-[#073b70] font-bold text-white transition hover:bg-[#052b52] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <LoaderCircle className="animate-spin" size={19} /> : <Search size={19} />}
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>

          <section aria-live="polite">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-3xl font-black text-[#073b70]">Latest Update</h2>
              {lastUpdated && <p className="text-sm text-slate-500">Last checked: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
            </div>

            {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}

            {!error && loading && (
              <div className="flex min-h-64 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 shadow-sm">
                <LoaderCircle className="mr-3 animate-spin" /> Retrieving flight status...
              </div>
            )}

            {!error && !loading && !hasSearched && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
                <Plane className="mb-4 text-[#073b70]" size={36} />
                Enter a flight number and departure date to see its status.
              </div>
            )}

            {!error && !loading && hasSearched && results.length === 0 && (
              <div className="rounded-lg border border-slate-300 bg-white p-8 text-center text-slate-600 shadow-sm">
                No matching flight was found. Check the flight number and date, then try again.
              </div>
            )}

            {!error && !loading && results.map((flight, index) => {
              const departure = flight.departure;
              const arrival = flight.arrival;
              const flightLabel = flight.number || flightNumber.trim().toUpperCase();
              const aircraft = flight.aircraft?.model || "Aircraft unavailable";
              return (
                <article key={`${flightLabel}-${index}`} className="mb-6 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#073b70] px-6 py-4 text-white">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-black">Flight {flightLabel}</h3>
                      <span className={`rounded px-3 py-1 text-xs font-bold uppercase ${statusStyle(flight.status)}`}>
                        {flight.status || "Status unavailable"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold">{flight.airline?.name || aircraft}</span>
                  </div>

                  <div className="grid gap-8 p-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-8">
                    <div>
                      <p className="text-4xl font-light text-[#073b70] sm:text-5xl">{displayTime(departure)}</p>
                      <p className="text-3xl font-black text-[#073b70]">{departure?.airport?.iata || departure?.airport?.icao || "---"}</p>
                      <p className="mt-2 text-slate-500">{departure?.airport?.name || departure?.airport?.municipalityName || "Departure airport unavailable"}</p>
                      <p className="mt-2 text-sm font-bold uppercase text-[#073b70]">
                        {[departure?.terminal && `Terminal ${departure.terminal}`, departure?.gate && `Gate ${departure.gate}`].filter(Boolean).join(", ") || "Terminal and gate pending"}
                      </p>
                    </div>

                    <div className="min-w-32 text-center">
                      <div className="flex items-center"><div className="h-px flex-1 bg-slate-300" /><Plane className="mx-4 text-[#073b70]" size={28} /><div className="h-px flex-1 bg-slate-300" /></div>
                      <p className="mt-3 text-xs font-semibold uppercase text-slate-500">{displayDate(departure)}</p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-4xl font-light text-[#073b70] sm:text-5xl">{displayTime(arrival)}</p>
                      <p className="text-3xl font-black text-[#073b70]">{arrival?.airport?.iata || arrival?.airport?.icao || "---"}</p>
                      <p className="mt-2 text-slate-500">{arrival?.airport?.name || arrival?.airport?.municipalityName || "Arrival airport unavailable"}</p>
                      <p className="mt-2 text-sm font-semibold uppercase text-slate-500">
                        {[arrival?.terminal && `Terminal ${arrival.terminal}`, arrival?.gate && `Gate ${arrival.gate}`].filter(Boolean).join(", ") || "Terminal and gate pending"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 border-t p-6 sm:grid-cols-3">
                    <div><p className="text-xs font-bold uppercase text-slate-500">Aircraft</p><p className="mt-1 font-bold text-[#073b70]">{aircraft}</p></div>
                    <div><p className="text-xs font-bold uppercase text-slate-500">Registration</p><p className="mt-1 font-bold text-[#073b70]">{flight.aircraft?.reg || "Unavailable"}</p></div>
                    <div><p className="text-xs font-bold uppercase text-slate-500">Distance</p><p className="mt-1 font-bold text-[#073b70]">{flight.greatCircleDistance?.km != null ? `${Math.round(flight.greatCircleDistance.km).toLocaleString()} km` : "Unavailable"}</p></div>
                  </div>
                </article>
              );
            })}

            <div className="mt-6 rounded-lg bg-slate-50 p-6">
              <div className="flex gap-3"><CircleHelp className="shrink-0 text-cyan-700" size={20} /><div><h3 className="font-bold uppercase text-[#073b70]">Travel Advisory</h3><p className="mt-2 text-slate-600">Gate assignments can change. Verify your boarding gate at the airport using official signage or your airline&apos;s latest notification.</p></div></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default FlightStatus;
