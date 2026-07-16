import React from 'react';
import { Link } from 'react-router';

interface ModifySearchProps {
  onClose?: () => void;
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
}

const Info = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded border border-slate-200 bg-slate-50 p-4">
    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-black text-[#073b70]">{value || 'Not selected'}</p>
  </div>
);

export const ModifySearch: React.FC<ModifySearchProps> = ({
  onClose,
  from = 'Not selected',
  to = 'Not selected',
  departDate = 'Not selected',
  returnDate = 'Not selected',
}) => (
  <section className="mx-auto mb-8 max-w-5xl rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-black text-[#073b70]">Search Summary</h2>
        <p className="mt-1 text-xs font-bold text-slate-500">
          Review your current search. Start a new search to change route, dates, passengers, or cabin class.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-xl text-slate-400 transition hover:text-slate-700"
        aria-label="Close search summary"
      >
        x
      </button>
    </div>

    <div className="grid gap-4 md:grid-cols-4">
      <Info label="From" value={from} />
      <Info label="To" value={to} />
      <Info label="Depart" value={departDate} />
      <Info label="Return" value={returnDate} />
    </div>

    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-slate-500">
        This panel is read-only so selected fare results stay consistent.
      </p>
      <Link to="/" className="inline-flex h-11 items-center justify-center rounded bg-[#073b70] px-5 text-sm font-black text-white">
        Start New Search
      </Link>
    </div>
  </section>
);

export default ModifySearch;
