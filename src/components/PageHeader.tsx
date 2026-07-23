import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router';

interface PageHeaderProps {
  rightLink?: {
    label: string;
    to: string;
  };
}

function PageHeader({ rightLink }: PageHeaderProps): React.JSX.Element {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="text-2xl font-semibold tracking-wide text-[#073b70]">
          HORIZON<span className="text-amber-500">ELITE</span>
        </Link>
        <div className="flex items-center gap-3">
          {rightLink && (
            <Link to={rightLink.to} className="hidden h-11 items-center rounded border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:inline-flex">
              {rightLink.label}
            </Link>
          )}
          <Link to="/" className="inline-flex h-11 items-center gap-2 rounded border border-[#073b70] px-4 text-sm font-semibold text-[#073b70] hover:bg-slate-50">
            <Home size={18} />
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
