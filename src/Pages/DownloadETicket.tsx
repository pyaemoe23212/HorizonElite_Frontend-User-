import React from "react";
import { BadgeCheck, Download, Luggage as Suitcase, Mail, Plane, Printer } from "lucide-react";
import { Link } from "react-router";

function DownloadETicket(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          to="/services"
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
              <Info label="PNR" value="HZN7XL" />

              <Info
                label="Status"
                value={<span className="inline-flex items-center gap-2"><BadgeCheck size={16} /> Confirmed</span>}
                valueColor="text-cyan-700"
              />

              <Info label="Payment" value="Paid" />

              <Info label="Date" value="15 June 2026" />
            </div>

            <hr className="my-8" />

            {/* Passenger */}
            <div className="grid gap-6 md:grid-cols-3">
              <Info
                label="Passenger Name"
                value="Mr. TunBhone PyaeMoe"
              />

              <Info label="Type" value="Adult" />

              <Info
                label="Email"
                value="example@email.com"
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
                    RGN
                  </p>

                  <p className="text-slate-500">Yangon</p>

                  <Plane className="my-2 text-cyan-700" size={24} />

                  <p className="text-4xl font-black text-[#073b70]">
                    BKK
                  </p>

                  <p className="text-slate-500">Bangkok</p>
                </div>

                <Info
                  label="Schedule"
                  value={
                    <>
                      <p>18 June 2026</p>
                      <p className="text-sm font-normal">
                        09:30 AM - 11:10 AM
                      </p>
                    </>
                  }
                />

                <Info label="Cabin" value="Economy" />

                <Info
                  label="Seat"
                  value="12A"
                  valueColor="text-[#073b70]"
                />

                <Info label="Baggage" value="20 KG" />
              </div>
            </div>

            <p className="mt-6 italic text-slate-500">
              Please check that your passenger name and flight details are
              correct before downloading your e-ticket.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded bg-[#073b70] px-6 py-3 font-bold text-white hover:bg-[#052f59]">
                <Download size={18} />
                Download E-ticket PDF
              </button>

              <button className="inline-flex items-center gap-2 rounded border border-[#073b70] px-6 py-3 font-bold text-[#073b70] hover:bg-slate-50">
                <Mail size={18} />
                Send E-ticket to Email
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

              <button className="mt-6 w-full rounded border border-[#073b70] py-3 font-bold text-[#073b70] hover:bg-slate-50">
                Contact Support
              </button>
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
