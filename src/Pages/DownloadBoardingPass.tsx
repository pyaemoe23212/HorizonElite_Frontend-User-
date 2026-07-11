import React from "react";
import { BadgeCheck, Download, Luggage as Suitcase, Mail, Plane, Printer } from "lucide-react";
import { Link, useLocation } from "react-router";
import { boardingPassApi } from "../Services/api";

function DownloadBoardingPass(): React.JSX.Element {
  const { state } = useLocation();
  const bookingState = (state ?? {}) as any;
  const bookingId = bookingState.bookingId || bookingState.booking_id || bookingState.booking?.booking_id;
  const pnr = bookingState.pnrReference || bookingState.booking?.pnr_reference || "Not available";
  const passengers = bookingState.passengers || bookingState.booking?.passengers || [];
  const passenger = passengers[0] || {};
  const flight = bookingState.outboundFlight || bookingState.selectedFlight || {};
  const passengerName = [passenger.pi_title, passenger.pi_first_name, passenger.pi_last_name].filter(Boolean).join(" ") || "Not available";
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  const handleDownload = async () => {
    if (!bookingId) return setError("Missing booking ID. Please open this page from your confirmed booking.");
    try {
      setIsDownloading(true); setError(""); setMessage("");
      const blob = await boardingPassApi.download(bookingId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `Horizon-Elite-Boarding-Pass-${pnr}.pdf`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      setMessage("Boarding pass PDF downloaded successfully.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Failed to download boarding pass."); }
    finally { setIsDownloading(false); }
  };

  const handleEmail = async () => {
    if (!bookingId) return setError("Missing booking ID. Please open this page from your confirmed booking.");
    try {
      setIsSending(true); setError(""); setMessage("");
      const response = await boardingPassApi.sendEmail(bookingId);
      setMessage(`Boarding pass sent to ${response.data.recipient_email}.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Failed to email boarding pass."); }
    finally { setIsSending(false); }
  };
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          to="/additional-services?flow=booking"
          state={bookingState}
          className="mb-8 inline-flex items-center gap-2 text-[#073b70] hover:underline"
        >
          ← Back
        </Link>

        {/* Heading */}
        <h1 className="text-5xl font-black text-[#073b70]">
          Download Boarding Pass
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Your boarding pass is ready. Review your flight and passenger
          details before downloading.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px]">
          {/* Boarding Pass */}
          <section>
            <div className="grid overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm lg:grid-cols-[1fr_1.25fr]">
              {/* Passenger Details */}
              <div className="border-r border-dashed border-slate-300 p-6">
                <Info label="Passenger">
                  <p className="font-bold text-[#073b70]">
                    {passengerName}
                  </p>
                  <p>Adult</p>
                </Info>

                <div className="mt-8">
                  <Info
                    label="Booking Ref (PNR)"
                    value={pnr}
                  />
                </div>

                <div className="mt-8">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Status
                  </p>

                  <p className="mt-2 font-bold text-cyan-700">
                    <span className="inline-flex items-center gap-2"><BadgeCheck size={16} /> Ready, Checked In</span>
                  </p>
                </div>
              </div>

              {/* Flight Details */}
              <div className="grid lg:grid-cols-[1.3fr_180px]">
                <div className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Flight
                      </p>

                      <p className="font-bold text-[#073b70]">
                        {flight.flight_number || "Not available"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Date
                      </p>

                      <p className="font-bold text-[#073b70]">
                        {flight.departure_datetime ? new Date(flight.departure_datetime).toLocaleDateString() : "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="my-8 flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black text-[#073b70]">
                        {flight.origin_airport_code || flight.departure_airport || "--"}
                      </p>

                      <p>Yangon</p>

                      <p className="mt-2 font-bold">
                        {flight.departure_datetime ? new Date(flight.departure_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                      </p>
                    </div>

                    <div className="text-center">
                      <Plane className="mx-auto text-[#073b70]" size={28} />

                      <p className="text-xs font-bold uppercase text-slate-500">
                        Non-stop
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-black text-[#073b70]">
                        {flight.destination_airport_code || flight.arrival_airport || "--"}
                      </p>

                      <p>Bangkok</p>

                      <p className="mt-2 font-bold">
                        {flight.arrival_datetime ? new Date(flight.arrival_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                      </p>
                    </div>
                  </div>

                  <hr />

                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <Info label="Gate" value="B12" />

                    <Info
                      label="Boarding"
                      value={
                        <>
                          08:45
                          <br />
                          AM
                        </>
                      }
                    />

                    <Info label="Seat" value="12A" />
                  </div>

                  <div className="mt-8 flex gap-8">
                    <div>
                      <p className="text-[#073b70]">
                        Economy
                      </p>
                    </div>

                    <div>
                      <p className="text-[#073b70]">
                        <span className="inline-flex items-center gap-2"><Suitcase size={17} /> 20KG Checked</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR */}
                <div className="border-l border-dashed border-slate-300 p-6 text-center">
                  <div className="flex h-44 items-center justify-center rounded bg-slate-100 text-7xl">
                    ▩
                  </div>

                  <p className="mt-5 font-bold text-[#073b70]">
                    Scan at Airport
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Digital boarding passes are accepted at all Horizon Elite
                    terminals.
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              {message && <p className="w-full rounded border border-green-300 bg-green-50 p-3 font-semibold text-green-700">{message}</p>}
              {error && <p className="w-full rounded border border-red-300 bg-red-50 p-3 font-semibold text-red-700">{error}</p>}
              {!bookingId && <p className="w-full rounded border border-amber-300 bg-amber-50 p-3 font-semibold text-amber-800">Open Boarding Pass from your confirmed booking to enable download and email.</p>}
              <button type="button" onClick={handleDownload} disabled={!bookingId || isDownloading} className="inline-flex items-center gap-2 rounded bg-[#073b70] px-8 py-4 font-bold text-white hover:bg-[#052b52] disabled:cursor-not-allowed disabled:opacity-60">
                <Download size={18} />
                {isDownloading ? "Downloading..." : "Download Boarding Pass PDF"}
              </button>

              <button type="button" onClick={handleEmail} disabled={!bookingId || isSending} className="inline-flex items-center gap-2 rounded border border-amber-300 bg-white px-8 py-4 font-bold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60">
                <Mail size={18} />
                {isSending ? "Sending..." : "Send Boarding Pass to Email"}
              </button>

              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 font-bold text-[#073b70] hover:underline">
                <Printer size={18} />
                Print Boarding Pass
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#073b70]">
                Airport Reminder
              </h2>

              <ul className="mt-5 space-y-4 text-slate-600">
                <li>
                  Arrive at least 2 hours before departure for international
                  flights.
                </li>

                <li>
                  Keep your passport and visa documents ready for inspection
                  at the gate.
                </li>

                <li>
                  Baggage drop closes 60 minutes prior to departure for
                  flight HE 742.
                </li>
              </ul>

              <hr className="my-6" />

              <button className="font-bold text-cyan-700 hover:underline">
                View Baggage Policy
              </button>
            </section>

            <section className="rounded-lg bg-[#073b70] p-6 text-white shadow-sm">
              <h2 className="text-xl font-black">
                Need Help?
              </h2>

              <p className="mt-4 text-slate-200">
                Our Elite concierge is available 24/7 to assist with your
                travel arrangements.
              </p>

              <button className="mt-6 w-full rounded border border-white py-3 font-bold hover:bg-white hover:text-[#073b70]">
                Contact Support
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

type InfoProps = {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
};

function Info({ label, value, children }: InfoProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">
        {label}
      </p>

      {value && (
        <div className="mt-2 font-bold text-[#073b70]">
          {value}
        </div>
      )}

      {children && (
        <div className="mt-2 text-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}

export default DownloadBoardingPass;
