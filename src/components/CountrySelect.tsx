import React from 'react';
import { getCountries } from 'libphonenumber-js';

interface CountryOption {
  flagUrl: string;
  name: string;
  iso: string;
}

interface CountrySelectProps {
  value?: string | null;
  onChange: (countryName: string) => void;
  className?: string;
  placeholder?: string;
}

const countryOptions: CountryOption[] = (() => {
  const countryNames =
    typeof Intl !== 'undefined' && Intl.DisplayNames
      ? new Intl.DisplayNames(['en'], { type: 'region' })
      : null;

  return getCountries()
    .map((iso) => ({
      flagUrl: `https://flagcdn.com/w40/${iso.toLowerCase()}.png`,
      name: countryNames?.of(iso) ?? iso,
      iso,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

function CountrySelect({
  value,
  onChange,
  className = '',
  placeholder = 'Select country',
}: CountrySelectProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const selectedCountry = countryOptions.find(country => country.name === value) ?? null;
  const filteredCountries = countryOptions.filter(country => {
    const searchText = `${country.name} ${country.iso}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  });

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className={`${className} flex items-center justify-between gap-3 text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selectedCountry && <img src={selectedCountry.flagUrl} alt={selectedCountry.iso} className="h-3 w-5 shrink-0 object-cover" />}
          <span className={selectedCountry ? 'truncate' : 'truncate text-slate-400'}>{selectedCountry?.name || value || placeholder}</span>
        </span>
        <span className="shrink-0 text-xs text-slate-500">▼</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded border border-slate-300 bg-white p-2 shadow-2xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mb-2 h-10 w-full rounded border border-slate-300 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#073b70]"
            placeholder="Search country"
            autoFocus
          />
          <div className="max-h-72 overflow-y-auto" role="listbox">
            {filteredCountries.map(country => (
              <button
                key={country.iso}
                type="button"
                role="option"
                aria-selected={country.name === value}
                onClick={() => {
                  onChange(country.name);
                  setOpen(false);
                  setQuery('');
                }}
                className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-100 ${
                  country.name === value ? 'bg-slate-100' : ''
                }`}
              >
                <img src={country.flagUrl} alt={country.iso} className="h-3 w-5 shrink-0 object-cover" />
                <span className="truncate">{country.name}</span>
                <span className="ml-auto text-xs font-black text-slate-400">{country.iso}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <div className="px-3 py-4 text-center text-sm font-semibold text-slate-500">No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;
