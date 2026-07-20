import React from 'react';
import { Link } from 'react-router';
import { api } from '../Services/api';
import {
  isValidPhoneNumber,
  parsePhoneNumber,
  AsYouType,
  getCountries,
  getCountryCallingCode,
  PhoneNumber,
} from 'libphonenumber-js';

interface CountryOption {
  flagUrl: string;
  label: string;
  name: string;
  dialCode: string;
  iso: string;
}

const EyeIcon = () => (
  <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const LineIcon = () => (
  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06c755] text-[10px] font-black text-white">L</span>
);

const GoogleIcon = () => <span className="text-lg font-black text-blue-500">G</span>;

const FacebookIcon = () => (
  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">f</span>
);

const AppleIcon = () => (
  <svg className="h-5 w-5 text-slate-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.7 12.3c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.6.8-3.3.8s-1.8-.8-2.9-.8c-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 7 1.1 9.2.8 1.1 1.7 2.4 2.9 2.3 1.1-.1 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6-.1-.1-2.8-1.1-2.8-3.7zM14.5 5.7c.6-.8 1.1-1.8 1-2.9-1 .1-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3z" />
  </svg>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="mb-2 flex min-h-8 items-end text-[11px] font-black uppercase tracking-wide text-[#063b70]">{children}</span>
);

const isEmailStructureValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const emailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
const passwordSymbolPattern = /^[A-Za-z0-9!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]+$/;

const getEmailSuggestions = (email: string): string[] => {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || trimmedEmail.includes(' ') || !trimmedEmail.includes('@')) {
    return [];
  }

  const [localPart, typedDomain = ''] = trimmedEmail.split('@');

  if (!localPart || trimmedEmail.includes('@@')) {
    return [];
  }

  return emailDomains
    .filter(domain => domain.startsWith(typedDomain) && domain !== typedDomain)
    .map(domain => `@${domain}`);
};

const getPasswordChecks = (password: string) => {
  return [
    {
      label: '12 to 16 characters',
      isValid: password.length >= 12 && password.length <= 16,
    },
    {
      label: 'Contains only letters, numbers, and symbols',
      isValid: password.length > 0 && passwordSymbolPattern.test(password),
    },
    {
      label: 'At least one uppercase letter',
      isValid: /[A-Z]/.test(password),
    },
    {
      label: 'At least one lowercase letter',
      isValid: /[a-z]/.test(password),
    },
    {
      label: 'At least one number',
      isValid: /[0-9]/.test(password),
    },
    {
      label: 'At least one symbol',
      isValid: /[^A-Za-z0-9]/.test(password),
    },
  ];
};

const getPasswordStrength = (validCount: number, password: string) => {
  if (!password) {
    return { label: 'Weak', color: 'bg-slate-200', textColor: 'text-slate-500', activeBars: 0 };
  }
  if (validCount >= 6) {
    return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600', activeBars: 4 };
  }
  if (validCount >= 4) {
    return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600', activeBars: 3 };
  }
  if (validCount >= 2) {
    return { label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600', activeBars: 2 };
  }
  return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600', activeBars: 1 };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const startFacebookLogin = () => {
  window.location.href = `${API_BASE_URL.replace(/\/$/, '')}/auth/facebook`;
};

const startGoogleLogin = () => {
  window.location.href = `${API_BASE_URL.replace(/\/$/, '')}/auth/google`;
};

const startLineLogin = () => {
  window.location.href = `${API_BASE_URL.replace(/\/$/, '')}/auth/line`;
};

function Signup(): React.JSX.Element {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email_address: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const [verificationEmail, setVerificationEmail] = React.useState('');
  const [resendLoading, setResendLoading] = React.useState(false);
  const [phoneCountry, setPhoneCountry] = React.useState('TH');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [phoneError, setPhoneError] = React.useState('');
  const [parsedPhone, setParsedPhone] = React.useState<PhoneNumber | null>(null);
  const [isCountryListOpen, setIsCountryListOpen] = React.useState(false);

  const countryOptions = React.useMemo(() => {
    const countryNames =
      typeof Intl !== 'undefined' && Intl.DisplayNames
        ? new Intl.DisplayNames(['en'], { type: 'region' })
        : null;

    return getCountries()
      .map((iso) => {
        const dialCode = `+${getCountryCallingCode(iso)}`;
        const name = countryNames?.of(iso) ?? iso;

        return {
          flagUrl: `https://flagcdn.com/w40/${iso.toLowerCase()}.png`,
          label: `${name} (${dialCode})`,
          name,
          dialCode,
          iso,
        } as CountryOption;
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const selectedCountry = React.useMemo(
    () => countryOptions.find(country => country.iso === phoneCountry) ?? null,
    [countryOptions, phoneCountry]
  );
  const emailSuggestions = React.useMemo(
    () => getEmailSuggestions(formData.email_address),
    [formData.email_address]
  );
  const passwordChecks = React.useMemo(
    () => getPasswordChecks(formData.password),
    [formData.password]
  );
  const passwordStrength = React.useMemo(
    () => getPasswordStrength(passwordChecks.filter(check => check.isValid).length, formData.password),
    [passwordChecks, formData.password]
  );

  const validatePhone = (number: string, iso: string): boolean => {
    if (!number) {
      setPhoneError('Phone number is required.');
      setParsedPhone(null);
      return false;
    }
    const dialCode = countryOptions.find(c => c.iso === iso)?.dialCode ?? '';
    if (!isValidPhoneNumber(dialCode + number, iso as any)) {
      setPhoneError('Please enter a valid phone number for the selected country.');
      setParsedPhone(null);
      return false;
    }
    try {
      const parsed = parsePhoneNumber(number, iso as any);
      setParsedPhone(parsed);
    } catch {
      setParsedPhone(null);
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = new AsYouType(phoneCountry as any).input(e.target.value);
    setPhoneNumber(formatted);
    setPhoneError('');
    setParsedPhone(null);
  };

  const handleCountryChange = (iso: string) => {
    setPhoneCountry(iso);
    setPhoneNumber('');
    setPhoneError('');
    setParsedPhone(null);
    setIsCountryListOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setInfo('');
    if (name === 'email_address') {
      setEmailError('');
    }
  };

  const handleEmailSuggestionClick = (email: string) => {
    const localPart = formData.email_address.split('@')[0] ?? '';
    setFormData(prev => ({ ...prev, email_address: `${localPart}${email}` }));
    setEmailError('');
    setError('');
    setInfo('');
  };

  const validateEmail = (): boolean => {
    const email = formData.email_address.trim();

    if (!email) {
      setEmailError('Email is required.');
      return false;
    }

    if (!isEmailStructureValid(email)) {
      setEmailError('Email structure is invalid.');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (!formData.title) {
      setError('Please select a title');
      return;
    }
    if (!formData.first_name.trim()) {
      setError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required');
      return;
    }
    if (!formData.email_address.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (passwordChecks.some(check => !check.isValid)) {
      setError('Password must meet all password requirements.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!validatePhone(phoneNumber, phoneCountry)) {
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = formData.email_address.trim().toLowerCase();

      await api.register({
        ...formData,
        email_address: normalizedEmail,
        phone_number: parsedPhone?.format('E.164') || phoneNumber,
      });
      setVerificationEmail(normalizedEmail);
      setInfo(`We sent a verification email to ${normalizedEmail}. Please click the Verify Email button in that email.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    setError('');
    setInfo('');
    setResendLoading(true);

    try {
      await api.resendVerificationEmail({
        email_address: verificationEmail,
      });
      setInfo(`A new verification email was sent to ${verificationEmail}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.02fr_.98fr]">
      <section className="flex min-h-[560px] flex-col justify-between bg-[#063b70] px-8 py-14 text-white sm:px-16 lg:min-h-screen lg:px-16">
        <div>
          <div className="h-px w-full bg-white/15" />
          <Link to="/" className="mt-6 inline-block text-2xl font-black text-amber-300">Horizon Elite</Link>
          <p className="mt-2 text-xs font-black uppercase tracking-[.26em] text-sky-100/65">
            Global excellence in aviation
          </p>
        </div>

        <div className="max-w-xl">
          <h1 className="text-5xl font-black leading-tight tracking-normal">Join the Elite</h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-sky-100/60">
            Elevate your journey with personalized services, priority access, and rewards that transcend ordinary travel. Experience the horizon like never before.
          </p>
        </div>

        <div>
          <img
            src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1200&auto=format&fit=crop"
            alt="Luxury aircraft cabin"
            className="h-48 w-full max-w-[520px] rounded-lg object-cover"
          />
          <p className="mt-8 text-xs font-black uppercase tracking-[.4em] text-sky-100/80">
            Defining the future of luxury aviation.
          </p>
        </div>
      </section>

      <section className="flex justify-center px-8 py-14 sm:px-12 lg:py-20">
        <div className="w-full max-w-[460px]">
          <h2 className="text-4xl font-black tracking-normal text-[#063b70]">Create your account</h2>
          <p className="mt-3 text-base leading-6 text-slate-600">Please provide your details to join our membership program.</p>

          {error && (
            <div className="mt-4 rounded bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {info && (
            <div className="mt-4 rounded bg-green-50 p-4 text-sm font-medium text-green-700 border border-green-200">
              {info}
            </div>
          )}

          {verificationEmail ? (
            <div className="mt-8 space-y-5 rounded border border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-semibold leading-6 text-slate-700">
                We sent a verification email to <span className="font-black text-[#063b70]">{verificationEmail}</span>.
                Open the email and click the Verify Email button to activate your account.
              </p>
              <button
                disabled={resendLoading}
                type="button"
                onClick={handleResendVerificationEmail}
                className="h-11 w-full rounded border border-slate-300 bg-white text-sm font-black text-[#063b70] transition hover:border-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <Link to="/signin" className="flex h-11 w-full items-center justify-center rounded bg-[#063b70] text-sm font-black text-white transition hover:bg-[#052f59]">
                Go to Sign In
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <FieldLabel>Title <span className="text-red-500">*</span></FieldLabel>
              <select name="title" value={formData.title} onChange={handleChange} required className="h-11 w-full rounded border border-slate-300 bg-white px-4 text-sm text-slate-600 outline-none transition focus:border-blue-600">
                <option value="">Select Title</option>
                <option value="Mr">Mr.</option>
                <option value="Ms">Ms.</option>
                <option value="Mrs">Mrs.</option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label className="block">
                <FieldLabel>First Name <span className="text-red-500">*</span></FieldLabel>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Jane" className="h-11 w-full rounded border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600" />
              </label>
              <label className="block">
                <FieldLabel>Middle Name <span className="text-slate-400">(Optional)</span></FieldLabel>
                <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Marie" className="h-11 w-full rounded border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600" />
              </label>
              <label className="block">
                <FieldLabel>Last Name <span className="text-red-500">*</span></FieldLabel>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe" className="h-11 w-full rounded border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600" />
              </label>
            </div>

            <label className="block">
              <FieldLabel>Email Address <span className="text-red-500">*</span></FieldLabel>
              <input required type="email" name="email_address" value={formData.email_address} onChange={handleChange} onBlur={validateEmail} placeholder="jane.doe@example.com" className={`h-11 w-full rounded border bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                emailError ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'
              }`} />
              {emailSuggestions.length > 0 && (
                <div className="mt-2 w-full overflow-hidden rounded border border-slate-200 bg-white shadow-lg">
                  {emailSuggestions.map(email => (
                    <button
                      key={email}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleEmailSuggestionClick(email)}
                      className="block w-full px-4 py-2 text-left text-sm font-semibold text-[#063b70] transition hover:bg-blue-50"
                    >
                      {email}
                    </button>
                  ))}
                </div>
              )}
              {emailError && (
                <p className="mt-1 text-xs text-red-500">{emailError}</p>
              )}
            </label>

            <label className="block">
              <FieldLabel>Phone Number <span className="text-red-500">*</span></FieldLabel>
              <div className="mt-2 flex gap-3">
                <div className="relative w-48">
                  <button
                    type="button"
                    onClick={() => setIsCountryListOpen(open => !open)}
                    className="flex h-full min-h-11 w-full items-center justify-between rounded border border-slate-300 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-600"
                    aria-haspopup="listbox"
                    aria-expanded={isCountryListOpen}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {selectedCountry && (
                        <img
                          src={selectedCountry.flagUrl}
                          alt={selectedCountry.iso}
                          className="h-3 w-5 shrink-0 object-cover"
                        />
                      )}
                      <span className="truncate text-xs">
                        {selectedCountry
                          ? `${selectedCountry.iso} (${selectedCountry.dialCode})`
                          : 'Select country'}
                      </span>
                    </span>
                    <span className="ml-2 text-slate-500 text-xs">▼</span>
                  </button>

                  {isCountryListOpen && (
                    <div
                      className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-72 overflow-y-auto rounded border border-slate-300 bg-white p-2 shadow-2xl"
                      role="listbox"
                    >
                      {countryOptions.map(country => (
                        <button
                          key={country.iso}
                          type="button"
                          role="option"
                          aria-selected={country.iso === phoneCountry}
                          onClick={() => handleCountryChange(country.iso)}
                          className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-100 ${
                            country.iso === phoneCountry ? 'bg-slate-100' : ''
                          }`}
                        >
                          <img
                            src={country.flagUrl}
                            alt={country.iso}
                            className="h-3 w-5 shrink-0 object-cover"
                          />
                          <span className="truncate">
                            {country.name} <span className="text-slate-400">({country.dialCode})</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  required
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onBlur={() => validatePhone(phoneNumber, phoneCountry)}
                  placeholder="(555) 000-0000"
                  className={`flex-1 rounded border px-4 py-3 text-sm outline-none transition ${
                    phoneError ? 'border-red-500 focus:border-red-600' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>

              {phoneError && (
                <p className="mt-1 text-xs text-red-500">{phoneError}</p>
              )}
              {parsedPhone && !phoneError && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ {parsedPhone.formatInternational()}
                </p>
              )}
            </label>

            <label className="block">
              <FieldLabel>Password <span className="text-red-500">*</span></FieldLabel>
              <span className="flex h-11 items-center rounded border border-slate-300 bg-white px-4 transition focus-within:border-blue-600">
                <input required type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="********" className="min-w-0 flex-1 text-sm outline-none" />
                <button type="button" onClick={() => setShowPassword(current => !current)} className="rounded p-1 outline-none transition hover:bg-slate-100 focus:bg-slate-100" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon />
                </button>
              </span>
            </label>

            <div className="rounded border border-slate-300 p-5">
              <div className="mb-4 flex items-center gap-1">
                {[0, 1, 2, 3].map(index => (
                  <span
                    key={index}
                    className={`h-1 flex-1 rounded ${index < passwordStrength.activeBars ? passwordStrength.color : 'bg-slate-200'}`}
                  />
                ))}
                <span className={`ml-6 text-[10px] font-black uppercase ${passwordStrength.textColor}`}>{passwordStrength.label}</span>
              </div>
              <div className="space-y-2 text-xs font-medium text-slate-600">
                {passwordChecks.map(check => (
                  <div key={check.label} className={`flex items-center gap-3 ${check.isValid ? 'text-green-700' : 'text-slate-600'}`}>
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-black ${
                      check.isValid ? 'border-green-600 bg-green-600 text-white' : 'border-slate-400 text-transparent'
                    }`}>
                      ✓
                    </span>
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <FieldLabel>Confirm Password <span className="text-red-500">*</span></FieldLabel>
              <span className="flex h-11 items-center rounded border border-slate-300 bg-white px-4 transition focus-within:border-blue-600">
                <input required type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="********" className="min-w-0 flex-1 text-sm outline-none" />
                <button type="button" onClick={() => setShowConfirmPassword(current => !current)} className="rounded p-1 outline-none transition hover:bg-slate-100 focus:bg-slate-100" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                  <EyeIcon />
                </button>
              </span>
            </label>

            <div className="space-y-3 pt-2 text-xs text-slate-600">
              <label className="flex items-start gap-3">
                <input required type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#063b70]" />
                <span>
                  I agree to the <a href="#" className="font-bold text-[#063b70] underline">Terms of Use</a> and <a href="#" className="font-bold text-[#063b70] underline">Privacy Policy</a>.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#063b70]" />
                Receive promotional campaigns from Horizon Elite or partners.
              </label>
            </div>

            <button disabled={loading} type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded bg-[#063b70] text-sm font-black text-white transition hover:bg-[#052f59] disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Sending verification email...' : 'Create Account'}
              {!loading && <ArrowRightIcon />}
            </button>
          </form>
          )}

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-black uppercase tracking-[.22em] text-slate-500">Or connect with</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-3">
            {[
              { label: 'Continue with Line', icon: <LineIcon key="line" />, onClick: startLineLogin },
              { label: 'Continue with Google', icon: <GoogleIcon key="google" />, onClick: startGoogleLogin },
              { label: 'Continue with Facebook', icon: <FacebookIcon key="facebook" />, onClick: startFacebookLogin },
              { label: 'Continue with Apple', icon: <AppleIcon key="apple" /> },
            ].map((item) => (
              <button key={item.label} type="button" onClick={item.onClick} className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 transition hover:border-blue-500 hover:text-[#063b70]">
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/signin" className="font-black text-[#063b70] underline underline-offset-2">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Signup;
