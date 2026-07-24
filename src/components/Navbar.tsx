import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { CircleDollarSign } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from '../contexts/useTranslation';
import { useCurrency } from '../contexts/useCurrency';
import { api } from '../Services/api';
import type { Language } from '../Services/api';
import { currencyNames, currencySymbols, formatUsdExchangeRate } from '../utils/currency';

const GlobeIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 0 20" />
    <path d="M12 2a15.3 15.3 0 0 0 0 20" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const UserIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

function Navbar(): React.JSX.Element {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { currentLanguage, setLanguage } = useTranslation();  // ← Get from context
  const { selectedCurrency, setSelectedCurrency, currencies, exchangeRates, status: currencyStatus } = useCurrency();
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const filteredCurrencies = currencies.filter((currency) =>
    currency.toLowerCase().includes(currencySearch.trim().toLowerCase()) ||
    (currencyNames[currency] || '').toLowerCase().includes(currencySearch.trim().toLowerCase())
  );

  // Fetch supported languages when component mounts
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoadingLanguages(true);
        const response = await api.getSupportedLanguages();
        setLanguages(response.languages);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        // Fallback to default languages if API fails
        setLanguages([
          { code: 'en', name: 'English', native_name: 'English' },
          { code: 'th', name: 'Thai', native_name: 'ไทย' },
          { code: 'es', name: 'Spanish', native_name: 'Español' },
          { code: 'zh', name: 'Chinese', native_name: '中文' },
        ]);
      } finally {
        setIsLoadingLanguages(false);
      }
    };

    fetchLanguages();
  }, []);

  // Handle language change - update context (triggers re-render in all components)
  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);  // This updates context, localStorage, and all subscribed components
    setLanguageDropdownOpen(false);
    console.log('Language changed to:', languageCode);
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setCurrencyDropdownOpen(false);
    setCurrencySearch('');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(e.target as Node)) {
        setLanguageDropdownOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-sky-50/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="text-xl font-semibold tracking-wide text-[#083b74]"
          >
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>

          <div className="hidden items-center gap-10 text-base font-semibold text-slate-800 md:flex">
            <Link to="/flight-status" className="transition hover:text-blue-600">
              Flight Status
            </Link>
            <Link to="/services" className="transition hover:text-blue-600">
              Services
            </Link>
            <Link to="/case-management" className="transition hover:text-blue-600">
              Help Desk
            </Link>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-8">
          {/* Language Selector */}
          <div className="relative" ref={languageRef}>
            <button
              type="button"
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
              className="hidden items-center gap-1.5 text-sm font-medium text-slate-800 transition hover:text-blue-600 sm:flex"
              aria-label="Select language"
              aria-expanded={languageDropdownOpen}
            >
              <GlobeIcon />
              {currentLanguage.toUpperCase()}
              <ChevronDownIcon />
            </button>

            {/* Language Dropdown Menu */}
            {languageDropdownOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                {isLoadingLanguages ? (
                  <div className="px-4 py-3 text-center text-sm text-slate-500">
                    Loading languages...
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-3 text-left text-sm font-semibold transition ${
                          currentLanguage === lang.code
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span>{lang.name}</span>
                          {lang.native_name && (
                            <span className="text-xs text-slate-500">
                              {lang.native_name}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={currencyRef}>
            <button
              type="button"
              onClick={() => setCurrencyDropdownOpen(open => !open)}
              className="hidden h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm sm:flex"
              aria-label="Select currency"
              aria-expanded={currencyDropdownOpen}
            >
              <CircleDollarSign size={17} />
              {selectedCurrency}
              <ChevronDownIcon />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 top-12 w-[22rem] animate-[fadeIn_160ms_ease-out] rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#073b70]">
                      <CircleDollarSign size={17} />
                      Select Currency
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {currencyStatus === 'live' ? 'Live exchange rates' : currencyStatus === 'loading' ? 'Loading live rates' : 'Fallback rates'}
                    </p>
                  </div>
                  <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-[#073b70]">{currencySymbols[selectedCurrency]} {selectedCurrency}</span>
                </div>

                <input
                  value={currencySearch}
                  onChange={(event) => setCurrencySearch(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#073b70]"
                  placeholder="Search currency code"
                />

                <div className="mt-3 grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1">
                  {filteredCurrencies.map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => handleCurrencyChange(currency)}
                      className={`rounded-lg border px-3 py-2 text-left transition duration-150 hover:-translate-y-0.5 ${selectedCurrency === currency ? 'border-[#073b70] bg-[#073b70] text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'}`}
                    >
                      <span className="block text-sm font-semibold">{currencySymbols[currency]} {currency}</span>
                      <span className={`block text-xs font-semibold ${selectedCurrency === currency ? 'text-blue-100' : 'text-slate-400'}`}>{currencyNames[currency]}</span>
                      <span className={`mt-1 block text-[11px] font-semibold ${selectedCurrency === currency ? 'text-blue-100' : 'text-slate-500'}`}>
                        {formatUsdExchangeRate(currency, exchangeRates)}
                      </span>
                    </button>
                  ))}
                  {filteredCurrencies.length === 0 && (
                    <p className="col-span-3 py-5 text-center text-sm font-semibold text-slate-500">No currency found.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              {/* Avatar button — opens dropdown */}
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063b70] text-sm font-extrabold text-white shadow-md shadow-blue-900/25 ring-2 ring-amber-400 transition hover:bg-[#052f59]"
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-14 w-52 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
                  {/* User info */}
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#063b70]">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {user?.email_address}
                    </p>
                  </div>

                  {/* Profile link */}
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-[#063b70]"
                  >
                    <UserIcon />
                    My Profile
                  </Link>

                  {/* Logout button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-b-xl border-t border-slate-100 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogoutIcon />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white shadow-md shadow-blue-600/25 ring-2 ring-amber-400 transition hover:bg-blue-700"
              aria-label="Sign In"
              title="Sign In"
            >
              SI
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
