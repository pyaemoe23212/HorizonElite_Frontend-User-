import React from 'react';
import { BadgeCheck, Download, Plane, Printer } from 'lucide-react';
import { Link } from 'react-router';

function BookingConfirmed(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-20 text-slate-800">
      <section className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-[#073b70] shadow-2xl shadow-blue-950/15">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#073b70]">
              <BadgeCheck size={28} strokeWidth={2.5} />
            </span>
          </div>

          <h1 className="mt-8 text-6xl font-black tracking-normal text-[#073b70]">Booking Confirmed!</h1>
          <p className="mt-5 text-xl font-semibold text-slate-600">Thank you for choosing Horizon Elite. Your journey awaits.</p>

          <div className="mt-5 inline-flex items-center rounded border border-slate-300 bg-slate-200 px-5 py-3">
            <span className="mr-4 text-sm font-black uppercase tracking-widest text-slate-600">Booking Ref:</span>
            <span className="text-3xl font-black tracking-widest text-[#073b70]">HE7429BL</span>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-[#073b70] px-8 py-5 text-white">
              <h2 className="text-3xl font-black">Flight Itinerary</h2>
              <span className="rounded bg-cyan-700/60 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-100">Confirmed</span>
            </div>

            <div className="grid min-h-72 items-start gap-8 px-8 py-10 md:grid-cols-[1fr_1.2fr_1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Origin</p>
                <p className="mt-4 text-4xl font-black text-[#073b70]">JFK</p>
                <p className="mt-2 text-xl font-semibold text-slate-700">New York</p>
                <p className="mt-3 text-base font-semibold text-slate-500">Jun 15, 2025 • 08:30 AM</p>
              </div>

              <div className="flex flex-col items-center pt-12 text-center">
                <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-5">
                  <span className="h-px bg-slate-300" />
                  <Plane className="text-[#073b70]" size={34} strokeWidth={2.4} />
                  <span className="h-px bg-slate-300" />
                </div>
                <p className="mt-5 text-sm font-black uppercase tracking-widest text-cyan-600">Non-stop • 7h 15m</p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Destination</p>
                <p className="mt-4 text-4xl font-black text-[#073b70]">LHR</p>
                <p className="mt-2 text-xl font-semibold text-slate-700">London</p>
                <p className="mt-3 text-base font-semibold text-slate-500">Jun 16, 2025 • 08:45 PM</p>
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <section className="rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
              <h2 className="border-b border-slate-200 pb-4 text-sm font-black uppercase tracking-widest text-slate-600">Passenger Details</h2>
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-500">Name</p>
                <p className="mt-2 text-2xl font-black text-[#073b70]">Jonathan Doe</p>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Seat</p>
                  <p className="mt-2 text-2xl font-black text-[#073b70]">14A</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Class</p>
                  <p className="mt-2 text-2xl font-black text-[#073b70]">Economy</p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-300 bg-white p-8 shadow-sm">
              <h2 className="border-b border-slate-200 pb-4 text-sm font-black uppercase tracking-widest text-slate-600">Payment Summary</h2>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-500">Total Paid</p>
                  <p className="mt-2 text-3xl font-black text-[#073b70]">$1,095.50</p>
                </div>
                <span className="text-sm font-black uppercase text-cyan-600">Paid</span>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-14 text-center">
          <p className="text-lg font-semibold text-slate-500">The eTicket and the payment receipt has been sent to xxx@gmail.com.</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/additional-services?flow=booking" className="flex h-14 w-64 items-center justify-center gap-2 rounded bg-[#073b70] text-base font-black text-white">
              <BadgeCheck size={20} />
              Additional Services
            </Link>
            <Link to="/download-e-ticket" className="flex h-14 w-64 items-center justify-center gap-2 rounded border border-[#073b70] bg-white text-base font-black text-[#073b70]">
              <Download size={20} />
              Download E-Ticket
            </Link>
            <Link to="/manage-booking" className="flex h-14 w-64 items-center justify-center rounded border border-amber-300 bg-white text-base font-black text-amber-500">Manage Booking</Link>
            <Link to="/" className="flex h-14 w-64 items-center justify-center gap-2 rounded text-base font-black text-[#073b70]">
              <Printer size={20} />
              Print Receipt
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BookingConfirmed;
