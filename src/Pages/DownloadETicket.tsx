import React from "react";
import { BadgeCheck, Download, Luggage as Suitcase, Mail, Plane, Printer } from "lucide-react";
import { Link, useLocation } from "react-router";
import { ticketApi } from "../Services/api";

function DownloadETicket(): React.JSX.Element {
  const { state } = useLocation();
  const ticketState = (state ?? {}) as any;
  const bookingId = ticketState.bookingId || ticketState.booking_id || ticketState.booking?.booking_id;
  const pnrReference = ticketState.pnrReference || ticketState.booking?.pnr_reference || "Not available";
  const paymentStatus = ticketState.paymentStatus || ticketState.payment?.payment_status_code || "Unknown";
  const passengers = ticketState.passengers || ticketState.booking?.passengers || [];
  const primaryPassenger = passengers[0] || {};
  const outbound = ticketState.outboundFlight || ticketState.selectedFlight;
  const [downloadError, setDownloadError] = React.useState("");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [emailStatus, setEmailStatus] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  const handleDownload = async () => {
    if (!bookingId) {
      setDownloadError("Missing booking ID. Please open this page from your booking confirmation.");
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadError("");
      const pdfBlob = await ticketApi.downloadETicket(bookingId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Horizon-Elite-${pnrReference}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Failed to download e-ticket.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!bookingId) {
      setEmailError("Missing booking ID. Please open this page from your booking confirmation.");
      return;
    }

    try {
      setIsSendingEmail(true);
      setEmailError("");
      setEmailStatus("");
      const response = await ticketApi.sendETicketEmail(bookingId);
      setEmailStatus(`E-ticket sent to ${response.data.recipient_email}.`);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "Failed to send e-ticket email.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          to="/manage-booking"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold uppercase text-[#073b70] hover:underline"
        >
          ← Back
        </Link>

        {/* Heading */}
        <h1 className="text-5xl font-black text-[#073b70]">
          Download E-ticket
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Your booking has been found. Review your flight details and download
          your e-ticket below.
        </p>

        {/* Success Banner */}
        <div className="mt-10 flex items-center gap-3 border-l-4 border-cyan-700 bg-cyan-50 p-5">
          <BadgeCheck className="text-cyan-700" size={22} />

          <p className="font-semibold text-[#073b70]">
            Your e-ticket is ready to download.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main Card */}
          <section className="rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black text-[#073b70]">
              E-ticket Details
            </h2>

            {/* Booking Summary */}
            <div className="mt-8 grid gap-6 md:grid-cols-4">
              <Info label="PNR" value={pnrReference} />

              <Info
                label="Status"
                value={<span className="inline-flex items-center gap-2"><BadgeCheck size={16} /> Confirmed</span>}
                valueColor="text-cyan-700"
              />

              <Info label="Payment" value={paymentStatus === "PAID" ? "Paid" : paymentStatus} />

              <Info label="Date" value={ticketState.booking?.booking_date_timestamp ? new Date(ticketState.booking.booking_date_timestamp).toLocaleDateString() : "Not available"} />
            </div>

            <hr className="my-8" />

            {/* Passenger */}
            <div className="grid gap-6 md:grid-cols-3">
              <Info
                label="Passenger Name"
                value={[primaryPassenger.pi_title, primaryPassenger.pi_first_name, primaryPassenger.pi_last_name].filter(Boolean).join(" ") || "Not available"}
              />

              <Info label="Type" value={primaryPassenger.pi_passenger_type_code || "Not available"} />

              <Info
                label="Email"
                value={primaryPassenger.pi_contact_email || ticketState.payment?.user_email_address || ticketState.booking?.user_email_address || "Not available"}
              />
            </div>

            <hr className="my-8" />

            {/* Flight Card */}
            <div className="rounded bg-slate-100 p-6">
              <p className="mb-5 text-xs font-bold uppercase text-slate-500">
                <span className="inline-flex items-center gap-2"><Plane size={16} /> Flight HE 742</span>
              </p>

              <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
                <div>
                  <p className="text-4xl font-black text-[#073b70]">
                    {outbound?.origin_airport_code || outbound?.departure_airport || "--"}
                  </p>

                  <p className="text-slate-500">Origin</p>

                  <Plane className="my-2 text-cyan-700" size={24} />

                  <p className="text-4xl font-black text-[#073b70]">
                    {outbound?.destination_airport_code || outbound?.arrival_airport || "--"}
                  </p>

                  <p className="text-slate-500">Destination</p>
                </div>

                <Info
                  label="Schedule"
                  value={
                    <>
                      <p>{outbound?.departure_datetime ? new Date(outbound.departure_datetime).toLocaleDateString() : "Not available"}</p>
                      <p className="text-sm font-normal">
                        {outbound?.departure_datetime ? new Date(outbound.departure_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"} - {outbound?.arrival_datetime ? new Date(outbound.arrival_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                      </p>
                    </>
                  }
                />

                <Info label="Cabin" value={outbound?.cabin_class || ticketState.booking?.cabin_class || "Not available"} />

                <Info
                  label="Seat"
                  value="12A"
                  valueColor="text-[#073b70]"
                />

                <Info label="Baggage" value={outbound?.baggage_allowance || "Not available"} />
              </div>
            </div>

            <p className="mt-6 italic text-slate-500">
              Please check that your passenger name and flight details are
              correct before downloading your e-ticket.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              {downloadError && (
                <div className="w-full rounded border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {downloadError}
                </div>
              )}

              {emailStatus && (
                <div className="w-full rounded border border-green-300 bg-green-50 p-3 text-sm font-semibold text-green-700">
                  {emailStatus}
                </div>
              )}

              {emailError && (
                <div className="w-full rounded border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {emailError}
                </div>
              )}

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading || !bookingId}
                className="inline-flex items-center gap-2 rounded bg-[#073b70] px-6 py-3 font-bold text-white hover:bg-[#052f59] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download size={18} />
                {isDownloading ? "Downloading..." : "Download E-ticket PDF"}
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                disabled={isSendingEmail || !bookingId}
                className="inline-flex items-center gap-2 rounded border border-[#073b70] px-6 py-3 font-bold text-[#073b70] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Mail size={18} />
                {isSendingEmail ? "Sending..." : "Send E-ticket to Email"}
              </button>

              <button className="inline-flex items-center gap-2 font-bold text-[#073b70] hover:underline">
                <Printer size={18} />
                Print E-ticket
              </button>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Help */}
            <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-black text-[#073b70]">
                Need Help?
              </h3>

              <p className="mt-4 text-slate-600">
                If your e-ticket information is incorrect or you cannot
                download the file, please contact Horizon Elite support.
              </p>

              <Link to="/case-management" className="mt-6 flex w-full items-center justify-center rounded border border-[#073b70] py-3 font-bold text-[#073b70] hover:bg-slate-50">
                Contact Support
              </Link>
            </section>

            {/* Travel Note */}
            <section className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-black text-[#073b70]">
                Travel Note
              </h3>

              <p className="mt-4 text-slate-600">
                Bring a valid passport or travel document to the airport.
                Some destinations may require visas or entry documents.
              </p>

              <div className="mt-6 flex h-36 items-center justify-center rounded bg-slate-200 text-[#073b70]">
                <Suitcase size={56} strokeWidth={1.7} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

type InfoProps = {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
};

function Info({
  label,
  value,
  valueColor = "text-slate-800",
}: InfoProps) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">
        {label}
      </p>

      <div className={`mt-2 font-bold ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}

export default DownloadETicket;
