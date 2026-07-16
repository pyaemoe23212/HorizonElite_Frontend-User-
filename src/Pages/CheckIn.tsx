import React from "react";
import { BadgeCheck, CircleHelp, Plane } from "lucide-react";
import { useNavigate } from "react-router";
import { checkInApi, type CheckInResult, type ManageBookingDetails } from "../Services/api";
import PageHeader from "../components/PageHeader";

const toRouteState = (details: ManageBookingDetails) => {
  const outboundFlight = {
    airline_name: details.flight.airline_name,
    flight_number: details.flight.flight_number,
    origin_airport_code: details.flight.origin,
    destination_airport_code: details.flight.destination,
    departure_datetime: details.flight.departure,
    arrival_datetime: details.flight.arrival,
    cabin_class: details.booking.cabin_class,
  };
  const passengers = details.passengers.map((passenger) => ({
    passenger_id: passenger.passenger_id,
    pi_first_name: passenger.first_name,
    pi_last_name: passenger.last_name,
    pi_passenger_type_code: passenger.type,
    pi_contact_email: passenger.email,
    pi_contact_phone: passenger.phone,
  }));
  return {
    booking: details.booking,
    bookingId: details.booking.booking_id,
    booking_id: details.booking.booking_id,
    pnrReference: details.booking.pnr_reference,
    outboundFlight,
    selectedFlight: outboundFlight,
    passengers,
    checkedIn: true,
  };
};

function CheckIn(): React.JSX.Element {
  const navigate = useNavigate();
  const [pnr, setPnr] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [result, setResult] = React.useState<CheckInResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState("");

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pnr.trim() || !lastName.trim()) return setError("Please enter both PNR and passenger last name.");
    try {
      setLoading(true); setError(""); setResult(null);
      const response = await checkInApi.lookup(pnr.trim().toUpperCase(), lastName.trim());
      setResult(response.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to find this booking."); }
    finally { setLoading(false); }
  };

  const confirm = async () => {
    try {
      setConfirming(true); setError("");
      const response = await checkInApi.confirm(pnr.trim().toUpperCase(), lastName.trim());
      setResult(response.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to complete check-in."); }
    finally { setConfirming(false); }
  };

  const details = result?.details;
  const complete = Boolean(result?.eligibility.already_checked_in);

  return (
    <main className="min-h-screen bg-slate-100">
      <PageHeader rightLink={{ label: "Services", to: "/services" }} />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-center text-5xl font-black text-[#073b70]">Online Check-in</h1>
        <p className="mx-auto mt-5 max-w-xl text-center text-lg text-slate-600">Enter your booking reference and passenger last name to check in.</p>

        <section className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
          <div className="h-1 bg-[#073b70]" />
          <form onSubmit={search} className="p-9">
            {error && <div className="mb-6 rounded border border-red-300 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}
            <div className="grid gap-6 md:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Booking Reference (PNR)
                <input value={pnr} onChange={(event) => setPnr(event.target.value.toUpperCase())} maxLength={6} placeholder="e.g. G4KL9X" className="mt-2 h-12 w-full rounded border border-slate-300 px-4 text-base font-normal normal-case outline-none focus:border-[#073b70]" />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Passenger Last Name
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="As it appears on your ticket" className="mt-2 h-12 w-full rounded border border-slate-300 px-4 text-base font-normal normal-case outline-none focus:border-[#073b70]" />
              </label>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-md bg-slate-100 p-4 text-sm text-slate-600"><CircleHelp className="mt-0.5 shrink-0 text-cyan-700" size={18} /><p>Online check-in opens <strong>48 hours</strong> before departure and closes <strong>90 minutes</strong> before take-off.</p></div>
            <button disabled={loading} className="mt-8 flex h-12 w-full items-center justify-center rounded bg-[#073b70] font-bold uppercase tracking-widest text-white hover:bg-[#052b52] disabled:opacity-60">{loading ? "Searching..." : "Search Booking →"}</button>
          </form>
        </section>

        {details && result && (
          <section className={`mx-auto mt-8 max-w-2xl rounded-lg border bg-white p-8 shadow-sm ${complete ? "border-green-300" : result.eligibility.eligible ? "border-cyan-300" : "border-amber-300"}`}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-widest text-slate-500">{complete ? "Checked In" : "Booking Found"}</p><h2 className="mt-2 text-2xl font-black text-[#073b70]">{details.passengers[0]?.first_name} {details.passengers[0]?.last_name}</h2></div>
              {complete && <BadgeCheck className="text-green-600" size={32} />}
            </div>
            <div className="mt-6 grid gap-5 rounded bg-slate-100 p-5 sm:grid-cols-3">
              <Info label="PNR" value={details.booking.pnr_reference} />
              <Info label="Flight" value={details.flight.flight_number || "Not available"} />
              <Info label="Route" value={`${details.flight.origin} → ${details.flight.destination}`} />
              <Info label="Departure" value={details.flight.departure ? new Date(details.flight.departure).toLocaleString() : "Not available"} />
              <Info label="Status" value={details.booking.ticketing_status} />
              <Info label="Cabin" value={details.booking.cabin_class || "Not available"} />
            </div>
            <p className={`mt-5 rounded p-4 font-semibold ${result.eligibility.eligible ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-800"}`}>{result.eligibility.reason}{result.eligibility.opens_at ? ` Available from ${new Date(result.eligibility.opens_at).toLocaleString()}.` : ""}</p>
            {result.eligibility.eligible && !complete && <button type="button" onClick={confirm} disabled={confirming} className="mt-6 flex h-12 w-full items-center justify-center rounded bg-cyan-700 font-black uppercase tracking-widest text-white hover:bg-cyan-800 disabled:opacity-60">{confirming ? "Completing Check-in..." : "Confirm Check-in"}</button>}
            {complete && <button type="button" onClick={() => navigate("/download-boarding-pass", { state: toRouteState(details) })} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded bg-[#073b70] font-black uppercase tracking-widest text-white"><Plane size={18} /> View Boarding Pass</button>}
          </section>
        )}
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-[#073b70]">{value}</p></div>;
}

export default CheckIn;
