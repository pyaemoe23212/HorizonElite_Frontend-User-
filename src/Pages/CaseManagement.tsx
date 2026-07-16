import React, { useState } from 'react';
import { BookOpen, BriefcaseBusiness, CalendarClock, ChevronRight, CloudUpload, Filter, Headphones, Luggage, Plus, ShieldCheck, Star, TicketCheck } from 'lucide-react';
import { Link } from 'react-router';
import PageHeader from '../components/PageHeader';

const cases = [
  { title: 'Misplaced Baggage Recovery - Flight HE204', id: '#E-99281', status: 'In Progress', icon: Luggage, accent: 'bg-amber-100 text-amber-700' },
  { title: 'Points Redemption Inquiry', id: '#E-88372', status: 'Resolved', icon: TicketCheck, accent: 'bg-slate-200 text-slate-600' },
  { title: 'Seat Upgrade Availability HE10', id: '#E-88102', status: 'Resolved', icon: BriefcaseBusiness, accent: 'bg-slate-200 text-slate-600' },
];

function CaseManagement(): React.JSX.Element {
  const [openForm, setOpenForm] = useState(false);

  if (openForm) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-800">
        <PageHeader rightLink={{ label: 'Help Desk', to: '/case-management' }} />

        <section className="mx-auto max-w-3xl px-6 py-24">
          <form className="border border-slate-300 bg-white p-12 shadow-xl shadow-slate-200/70">
            <h1 className="text-3xl font-black text-[#073b70]">Open New Case</h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">Please provide as much detail as possible to help our Elite Support team assist you efficiently.</p>

            <div className="mt-9 space-y-6">
              <Field label="Category">
                <select className={inputClass} defaultValue="">
                  <option value="" disabled>Select a category</option>
                  <option>Baggage</option>
                  <option>Flight Change</option>
                  <option>Loyalty Points</option>
                  <option>Seat Upgrade</option>
                </select>
              </Field>
              <Field label="Subject"><input className={inputClass} placeholder="Brief summary of your inquiry" /></Field>
              <Field label="Flight Number" optional><input className={inputClass} placeholder="e.g. HE204" /></Field>
              <Field label="Description"><textarea className="min-h-48 w-full rounded border border-slate-300 px-4 py-4 text-base outline-none focus:border-[#073b70]" placeholder="Describe your issue in detail..." /></Field>

              <label className="block">
                <span className="mb-3 block text-xs font-black uppercase tracking-wide text-slate-700">Attachments</span>
                <span className="flex min-h-44 flex-col items-center justify-center border border-dashed border-slate-400 bg-white text-center text-base font-semibold text-slate-600">
                  <CloudUpload className="mb-3 text-slate-500" size={34} />
                  Drag and drop files here, or <span className="text-[#073b70]">browse</span>
                  <span className="mt-1 text-sm text-slate-500">PNG, JPG, PDF (Max 10MB)</span>
                </span>
              </label>
            </div>

            <div className="mt-12 flex justify-end gap-8">
              <button type="button" onClick={() => setOpenForm(false)} className="h-12 px-5 text-sm font-black text-slate-600">Cancel</button>
              <button type="button" onClick={() => setOpenForm(false)} className="h-12 rounded bg-[#073b70] px-10 text-sm font-black text-white">Submit Request</button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <PageHeader rightLink={{ label: 'Services', to: '/services' }} />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black text-[#073b70]">Case Management</h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">Track your ongoing inquiries or escalate new concerns. Our Elite support team monitors these requests 24/7 with dedicated priority.</p>
          </div>
          <button onClick={() => setOpenForm(true)} className="flex h-14 items-center justify-center gap-2 rounded bg-[#073b70] px-8 text-sm font-black text-white">
            <Plus size={18} /> Open New Case
          </button>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[350px_1fr]">
          <aside className="rounded bg-[#073b70] p-8 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-100">Elite Service Status</p>
            <h2 className="mt-6 text-3xl font-black">Concierge Priority Active</h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-blue-100">Your member status ensures a response time of under 15 minutes for all active cases.</p>
            <div className="mt-10 border-t border-blue-300/20 pt-7">
              <div className="flex gap-10">
                <Metric value="02" label="Pending" />
                <Metric value="14" label="Resolved" />
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded border border-slate-300 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-300 px-7 py-6">
              <h2 className="text-2xl font-black text-[#073b70]">Recent Activity</h2>
              <span className="flex items-center gap-2 text-xs font-black text-slate-500"><Filter size={14} /> Sort by: Newest</span>
            </div>
            {cases.map((item) => {
              const Icon = item.icon;
              return (
                <Link to="/manage-booking" key={item.id} className="flex items-center gap-5 border-b border-slate-200 px-7 py-5 transition hover:bg-slate-50">
                  <span className={`flex h-10 w-10 items-center justify-center rounded ${item.accent}`}><Icon size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-black text-[#073b70]">{item.title}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">Case ID: {item.id} - Last update: 14 mins ago</span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${item.status === 'In Progress' ? 'bg-amber-50 text-amber-700' : 'bg-cyan-50 text-cyan-700'}`}>{item.status}</span>
                  <ChevronRight className="text-slate-400" size={18} />
                </Link>
              );
            })}
            <Link to="/manage-booking" className="flex h-14 items-center justify-center bg-slate-50 text-xs font-black uppercase text-[#073b70]">View All History</Link>
          </section>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <SupportCard icon={Headphones} title="Instant Specialist" text="Connect directly with a human expert via secure live chat. Priority access for Elite members." action="Start Chat Now" />
          <SupportCard icon={BookOpen} title="Elite Knowledge Base" text="Browse exclusive guides on maximizing your rewards and navigating airport transfers." action="Browse Guides" />
          <div className="flex min-h-72 items-end rounded bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=900&auto=format&fit=crop')] bg-cover bg-center p-8 text-white shadow-sm">
            <p className="max-w-56 text-xl font-semibold">"Seamless travel is our standard."</p>
          </div>
        </div>

        <div className="mt-24 border-t border-slate-300 pt-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Trusted Protection Partner</p>
          <div className="mt-8 flex flex-wrap justify-center gap-10 text-lg font-black uppercase text-slate-400">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={18} /> Skyguard</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck size={18} /> Eliteprotect</span>
            <span className="inline-flex items-center gap-2"><Star size={18} /> Globecare</span>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputClass = 'h-12 w-full rounded border border-slate-300 px-4 text-base outline-none focus:border-[#073b70]';

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-3 flex justify-between text-xs font-black uppercase tracking-wide text-slate-700">
        {label}
        {optional && <span className="normal-case tracking-normal text-slate-500">Optional</span>}
      </span>
      {children}
    </label>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-light">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase text-blue-100">{label}</p>
    </div>
  );
}

function SupportCard({ icon: Icon, title, text, action }: { icon: typeof CalendarClock; title: string; text: string; action: string }) {
  return (
    <article className="rounded border border-slate-300 bg-white p-8 shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded bg-[#073b70] text-amber-300"><Icon size={22} /></span>
      <h3 className="mt-8 text-2xl font-black text-[#073b70]">{title}</h3>
      <p className="mt-3 min-h-20 text-sm font-semibold leading-6 text-slate-600">{text}</p>
      <button className="mt-4 h-11 w-full rounded border border-amber-300 text-sm font-black text-[#073b70]">{action}</button>
    </article>
  );
}

export default CaseManagement;
