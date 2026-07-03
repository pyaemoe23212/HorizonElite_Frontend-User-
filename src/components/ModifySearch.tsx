import React from 'react';

interface ModifySearchProps {
  onClose?: () => void;
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
}

const inputClass = 'h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm font-bold text-[#073b70] outline-none focus:border-blue-600';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

export const ModifySearch: React.FC<ModifySearchProps> = ({
  onClose,
  from = 'New York, John F. Kennedy Int...',
  to = 'London, Heathrow Airport (LHR)',
  departDate = '12 Oct 2024',
  returnDate = '24 Oct 2024',
}) => (
  <section className="mx-auto mb-8 max-w-5xl rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-black text-[#073b70]">Modify Search</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">
          {from} &nbsp; | &nbsp; {to} &nbsp; | &nbsp; {departDate} - {returnDate}
        </p>
      </div>
      <button onClick={onClose} className="text-xl text-slate-400">
        ×
      </button>
    </div>
    <div className="mb-4 flex gap-2">
      <button className="rounded bg-slate-100 px-5 py-2 text-xs font-black text-slate-500">One way</button>
      <button className="rounded bg-blue-100 px-5 py-2 text-xs font-black text-blue-700">Round trip</button>
    </div>
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_140px]">
      <Field label="From">
        <input className={inputClass} defaultValue={from} />
      </Field>
      <Field label="To">
        <input className={inputClass} defaultValue={to} />
      </Field>
      <Field label="Depart">
        <input className={inputClass} defaultValue={departDate} />
      </Field>
      <Field label="Return">
        <input className={inputClass} defaultValue={returnDate} />
      </Field>
      <button className="mt-6 h-11 rounded-lg bg-[#073b70] text-sm font-black text-white">Search</button>
    </div>
    <div className="mt-4 max-w-md">
      <Field label="Passengers and Class">
        <select className={inputClass} defaultValue="2 Adults, 1 Child, Business Class">
          <option>2 Adults, 1 Child, Business Class</option>
          <option>1 Passenger, Economy</option>
        </select>
      </Field>
    </div>
  </section>
);

export default ModifySearch;