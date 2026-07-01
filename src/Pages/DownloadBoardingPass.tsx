import React from "react";
import { BadgeCheck, Download, Luggage as Suitcase, Mail, Plane, Printer } from "lucide-react";
import { Link } from "react-router";

function DownloadBoardingPass(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-14">
      <div className="mx-auto max-w-7xl">
        {/* Back */}
        <Link
          to="/services"
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
                    Mr. TunBhone PyaeMoe
                  </p>
                  <p>Adult</p>
                </Info>

                <div className="mt-8">
                  <Info
                    label="Booking Ref (PNR)"
                    value="HZN7XL"
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
                        HE 742
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-slate-500">
                        Date
                      </p>

                      <p className="font-bold text-[#073b70]">
                        June 18, 2026
                      </p>
                    </div>
                  </div>

                  <div className="my-8 flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black text-[#073b70]">
                        RGN
                      </p>

                      <p>Yangon</p>

                      <p className="mt-2 font-bold">
                        09:30 AM
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
                        BKK
                      </p>

                      <p>Bangkok</p>

                      <p className="mt-2 font-bold">
                        11:15 AM
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
              <button className="inline-flex items-center gap-2 rounded bg-[#073b70] px-8 py-4 font-bold text-white hover:bg-[#052b52]">
                <Download size={18} />
                Download Boarding Pass PDF
              </button>

              <button className="inline-flex items-center gap-2 rounded border border-amber-300 bg-white px-8 py-4 font-bold text-amber-700 hover:bg-amber-50">
                <Mail size={18} />
                Send Boarding Pass to Email
              </button>

              <button className="inline-flex items-center gap-2 font-bold text-[#073b70] hover:underline">
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
