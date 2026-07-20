import React from 'react';
import { Link } from 'react-router';
import { CreditCard, Eye, Plus, Save, Trash2, Users } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
  type PhoneNumber,
} from 'libphonenumber-js';
import { useAuth } from '../contexts/useAuth';
import {
  profileApi,
  type EmergencyContact,
  type EmergencyContactPayload,
  type ProfileResponse,
  type SavedPassenger,
  type SavedPassengerPayload,
  type SavedPaymentMethod,
  type SavedPaymentMethodPayload,
} from '../Services/api';
import CountrySelect from '../components/CountrySelect';

const inputClass = 'h-11 w-full border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#073b70]';
const textAreaClass = 'min-h-24 w-full border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#073b70]';

const menuItems = [
  'Sign Up Details',
  'Personal Details',
  'Contact Information',
  'Passport Details',
  'Visa Information',
  'Emergency Contact',
  'Passenger Management',
  'Payment Methods',
];

const emptyProfile: Partial<ProfileResponse> = {
  title: 'Mr',
  first_name: '',
  middle_name: '',
  last_name: '',
  phone_number: '',
  alternate_phone_number: '',
  nationality: 'Thailand',
  date_of_birth: '',
  gender: 'M',
  address: '',
  preferred_language: 'English',
  preferred_currency: 'USD',
};

const emptyPassenger: SavedPassengerPayload = {
  relationship: 'Self',
  title: 'Mr',
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: 'M',
  date_of_birth: '',
  nationality: 'Thailand',
  passenger_type_code: 'ADT',
  contact_email: '',
  contact_phone: '',
  passport_number: '',
  passport_issuing_country: 'Thailand',
  passport_expiry_date: '',
  visa_number: '',
  visa_country: '',
  visa_expiry_date: '',
  notes: '',
};

const emptyEmergencyContact: EmergencyContactPayload = {
  contact_name: '',
  relationship: '',
  phone_number: '',
  email_address: '',
  priority: 1,
};

const emptyPaymentMethod: SavedPaymentMethodPayload = {
  payment_type: 'CARD',
  card_brand: 'Visa',
  cardholder_name: '',
  last_four: '',
  expiry_month: new Date().getMonth() + 1,
  expiry_year: new Date().getFullYear(),
  gateway_payment_method_id: '',
  billing_address: '',
  is_default: false,
};

const toDateInput = (value?: string | null) => value ? String(value).slice(0, 10) : '';
const fromDateString = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const toDateString = (date: Date | null) => {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const todayAtStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
const calculateAge = (birthDateValue?: string | null) => {
  const birthDate = fromDateString(birthDateValue);
  if (!birthDate) return null;

  const today = todayAtStart();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};
const getPassengerAgeValidationMessage = (typeCode: string, birthDateValue?: string | null) => {
  const age = calculateAge(birthDateValue);
  if (age === null) return 'Passenger date of birth is required';
  if (typeCode === 'ADT' && age < 12) return 'Adult passengers must be at least 12 years old';
  if (typeCode === 'CHD' && (age < 2 || age >= 12)) return 'Child passengers must be between 2 and 11 years old';
  if (typeCode === 'INF' && age >= 2) return 'Infant passengers must be under 2 years old';
  return '';
};
const addYears = (date: Date, years: number) => {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + years);
  return nextDate;
};
const getYearsAgoDate = (years: number) => {
  const date = todayAtStart();
  date.setFullYear(date.getFullYear() - years);
  return date;
};
const getDateAfterYearsAgo = (years: number) => {
  const date = todayAtStart();
  date.setFullYear(date.getFullYear() - years);
  date.setDate(date.getDate() + 1);
  return date;
};
const getBirthDateRangeForType = (typeCode: string) => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (typeCode === 'ADT') return { minDate: addYears(todayAtStart(), -120), maxDate: getYearsAgoDate(12) };
  if (typeCode === 'CHD') return { minDate: getDateAfterYearsAgo(12), maxDate: getYearsAgoDate(2) };
  return { minDate: getDateAfterYearsAgo(2), maxDate: yesterday };
};
const getProfileEmail = (profile: Partial<ProfileResponse> | null) => profile?.email_address || profile?.email || '';
const fullName = (profile: Partial<ProfileResponse> | null) =>
  `${profile?.title ? `${profile.title} ` : ''}${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();

const getInitials = (profile: Partial<ProfileResponse> | null) => {
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();
  return initials || 'HE';
};

const maskValue = (value?: string | null) => {
  if (!value) return 'Not saved';
  if (value.length <= 4) return `**** ${value}`;
  return `**** **** ${value.slice(-4)}`;
};

const isPhoneValueValid = (value?: string | null, required = false) => {
  if (!value?.trim()) return !required;
  return isValidPhoneNumber(value);
};

const isFutureDate = (value?: string | null) => {
  if (!value) return true;
  const parsed = fromDateString(value);
  return Boolean(parsed && parsed > todayAtStart());
};

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 flex min-h-7 items-end text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="border border-slate-300 bg-white p-6 shadow-sm">
    <h2 className="mb-6 text-2xl font-black text-[#073b70]">{title}</h2>
    {children}
  </section>
);

const SaveButton = ({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) => (
  <button
    type="submit"
    disabled={disabled}
    className="inline-flex h-11 items-center justify-center gap-2 bg-[#073b70] px-6 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#052f59] disabled:opacity-50"
  >
    <Save size={15} />
    {children}
  </button>
);

interface CountryOption {
  flagUrl: string;
  label: string;
  name: string;
  dialCode: string;
  iso: string;
}

const PhoneInput = ({
  value,
  onChange,
  required = false,
  placeholder = 'Phone number',
}: {
  value?: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) => {
  const [phoneCountry, setPhoneCountry] = React.useState('TH');
  const [phoneNumber, setPhoneNumber] = React.useState(value || '');
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

  React.useEffect(() => {
    setPhoneNumber(value || '');
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        setParsedPhone(parsed);
        if (parsed.country) setPhoneCountry(parsed.country);
      } catch {
        setParsedPhone(null);
      }
    }
  }, [value]);

  const selectedCountry = React.useMemo(
    () => countryOptions.find(country => country.iso === phoneCountry) ?? null,
    [countryOptions, phoneCountry]
  );

  const validatePhone = (number: string, iso: string) => {
    if (!number.trim()) {
      setParsedPhone(null);
      setPhoneError(required ? 'Phone number is required' : '');
      onChange('');
      return !required;
    }

    const dialCode = countryOptions.find(c => c.iso === iso)?.dialCode ?? '';
    const rawValue = number.trim().startsWith('+') ? number.trim() : `${dialCode}${number}`;

    if (!isValidPhoneNumber(rawValue, iso as CountryCode)) {
      setPhoneError('Please enter a valid phone number for the selected country');
      setParsedPhone(null);
      return false;
    }

    try {
      const parsed = parsePhoneNumber(rawValue, iso as CountryCode);
      setParsedPhone(parsed);
      setPhoneError('');
      onChange(parsed.format('E.164'));
    } catch {
      setParsedPhone(null);
      setPhoneError('Please enter a valid phone number for the selected country');
      return false;
    }

    return true;
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = new AsYouType(phoneCountry as CountryCode).input(event.target.value);
    setPhoneNumber(formatted);
    setPhoneError('');
    setParsedPhone(null);
    const dialCode = countryOptions.find(c => c.iso === phoneCountry)?.dialCode ?? '';
    const rawValue = event.target.value.trim().startsWith('+') ? event.target.value.trim() : `${dialCode}${event.target.value}`;
    try {
      if (isValidPhoneNumber(rawValue, phoneCountry as CountryCode)) {
        onChange(parsePhoneNumber(rawValue, phoneCountry as CountryCode).format('E.164'));
        return;
      }
    } catch {
      // Keep the user's typed value until blur can show a validation message.
    }
    onChange(event.target.value);
  };

  const handleCountryChange = (iso: string) => {
    setPhoneCountry(iso);
    setPhoneNumber('');
    setPhoneError('');
    setParsedPhone(null);
    setIsCountryListOpen(false);
    onChange('');
  };

  return (
    <div>
      <div className="flex gap-3">
        <div className="relative w-44">
          <button
            type="button"
            onClick={() => setIsCountryListOpen(open => !open)}
            className="flex h-11 w-full items-center justify-between border border-slate-300 bg-white px-3 text-left text-sm font-semibold text-slate-800 outline-none transition focus:border-[#073b70]"
            aria-haspopup="listbox"
            aria-expanded={isCountryListOpen}
          >
            <span className="flex min-w-0 items-center gap-2">
              {selectedCountry && <img src={selectedCountry.flagUrl} alt={selectedCountry.iso} className="h-3 w-5 shrink-0 object-cover" />}
              <span className="truncate text-xs">{selectedCountry ? `${selectedCountry.iso} (${selectedCountry.dialCode})` : 'Country'}</span>
            </span>
            <span className="ml-2 text-xs text-slate-500">▼</span>
          </button>

          {isCountryListOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-72 overflow-y-auto border border-slate-300 bg-white p-2 shadow-2xl" role="listbox">
              {countryOptions.map(country => (
                <button
                  key={country.iso}
                  type="button"
                  role="option"
                  aria-selected={country.iso === phoneCountry}
                  onClick={() => handleCountryChange(country.iso)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-100 ${country.iso === phoneCountry ? 'bg-slate-100' : ''}`}
                >
                  <img src={country.flagUrl} alt={country.iso} className="h-3 w-5 shrink-0 object-cover" />
                  <span className="truncate">{country.name} <span className="text-slate-400">({country.dialCode})</span></span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={() => validatePhone(phoneNumber, phoneCountry)}
          className={`${inputClass} flex-1 ${phoneError ? 'border-red-500 focus:border-red-600' : ''}`}
          placeholder={placeholder}
        />
      </div>
      {phoneError && <p className="mt-1 text-xs font-semibold text-red-500">{phoneError}</p>}
      {parsedPhone && !phoneError && <p className="mt-1 text-xs font-semibold text-green-600">{parsedPhone.formatInternational()}</p>}
    </div>
  );
};

function Profile(): React.JSX.Element {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const [profile, setProfile] = React.useState<Partial<ProfileResponse>>({ ...emptyProfile, ...user });
  const [passengers, setPassengers] = React.useState<SavedPassenger[]>([]);
  const [emergencyContacts, setEmergencyContacts] = React.useState<EmergencyContact[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<SavedPaymentMethod[]>([]);
  const [passengerForm, setPassengerForm] = React.useState<SavedPassengerPayload>(emptyPassenger);
  const [editingPassengerId, setEditingPassengerId] = React.useState<string | null>(null);
  const [viewingPassengerId, setViewingPassengerId] = React.useState<string | null>(null);
  const [emergencyForm, setEmergencyForm] = React.useState<EmergencyContactPayload>(emptyEmergencyContact);
  const [editingEmergencyId, setEditingEmergencyId] = React.useState<string | null>(null);
  const [paymentForm, setPaymentForm] = React.useState<SavedPaymentMethodPayload>(emptyPaymentMethod);
  const [editingPaymentId, setEditingPaymentId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const showSuccess = (value: string) => {
    setMessage(value);
    setError('');
    window.setTimeout(() => setMessage(''), 3500);
  };

  const showError = (value: unknown) => {
    setError(value instanceof Error ? value.message : String(value));
    setMessage('');
  };

  const isNotFoundError = (value: unknown) => (
    value instanceof Error && (value as Error & { status?: number }).status === 404
  );

  const loadProfile = React.useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const summary = await profileApi.getSummary();
      setProfile({ ...emptyProfile, ...summary.profile });
      setPassengers(summary.passengers);
      setEmergencyContacts(summary.emergencyContacts);
      setPaymentMethods(summary.paymentMethods);
      updateUser({
        title: summary.profile.title,
        first_name: summary.profile.first_name,
        last_name: summary.profile.last_name,
        phone_number: summary.profile.phone_number,
        email_address: getProfileEmail(summary.profile),
      });
    } catch (loadError) {
      showError(loadError);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, updateUser]);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfileField = (key: keyof ProfileResponse, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const updatePassengerField = (key: keyof SavedPassengerPayload, value: string) => {
    setPassengerForm(prev => {
      const next = { ...prev, [key]: value };
      if (
        key === 'passenger_type_code' &&
        prev.date_of_birth &&
        getPassengerAgeValidationMessage(value, prev.date_of_birth)
      ) {
        next.date_of_birth = '';
      }
      return next;
    });
  };

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.title?.trim()) {
      showError('Title is required');
      return;
    }
    if (!profile.first_name?.trim() || !profile.last_name?.trim()) {
      showError('First name and last name are required');
      return;
    }
    if (!profile.phone_number?.trim()) {
      showError('Phone number is required');
      return;
    }
    if (!isPhoneValueValid(profile.phone_number, true) || !isPhoneValueValid(profile.alternate_phone_number)) {
      showError('Please enter valid profile phone numbers');
      return;
    }

    try {
      setSaving(true);
      const response = await profileApi.updateProfile(profile);
      setProfile({ ...emptyProfile, ...response.profile });
      showSuccess('Profile updated successfully');
    } catch (submitError) {
      showError(submitError);
    } finally {
      setSaving(false);
    }
  };

  const submitPassenger = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passengerForm.first_name.trim() || !passengerForm.last_name.trim() || !passengerForm.date_of_birth) {
      showError('Passenger first name, last name, and date of birth are required');
      return;
    }
    const ageValidationMessage = getPassengerAgeValidationMessage(
      passengerForm.passenger_type_code,
      passengerForm.date_of_birth
    );
    if (ageValidationMessage) {
      showError(ageValidationMessage);
      return;
    }
    if (!isPhoneValueValid(passengerForm.contact_phone)) {
      showError('Please enter a valid saved passenger phone number');
      return;
    }
    if (!isFutureDate(passengerForm.passport_expiry_date)) {
      showError('Passport expiry date must be in the future');
      return;
    }
    if (!isFutureDate(passengerForm.visa_expiry_date)) {
      showError('Visa expiry date must be in the future');
      return;
    }

    try {
      setSaving(true);
      if (editingPassengerId) {
        const response = await profileApi.updateSavedPassenger(editingPassengerId, passengerForm);
        setPassengers(prev => prev.map(item => item.saved_passenger_id === editingPassengerId ? response.passenger : item));
        showSuccess('Saved passenger updated');
      } else {
        const response = await profileApi.createSavedPassenger(passengerForm);
        setPassengers(prev => [...prev, response.passenger]);
        showSuccess('Saved passenger added');
      }
      setPassengerForm(emptyPassenger);
      setEditingPassengerId(null);
      setViewingPassengerId(null);
    } catch (submitError) {
      showError(submitError);
    } finally {
      setSaving(false);
    }
  };

  const editPassenger = (passenger: SavedPassenger) => {
    setEditingPassengerId(passenger.saved_passenger_id);
    setViewingPassengerId(null);
    setPassengerForm({
      relationship: passenger.relationship || 'Self',
      title: passenger.title || 'Mr',
      first_name: passenger.first_name || '',
      middle_name: passenger.middle_name || '',
      last_name: passenger.last_name || '',
      gender: passenger.gender || 'M',
      date_of_birth: toDateInput(passenger.date_of_birth),
      nationality: passenger.nationality || 'Thailand',
      passenger_type_code: passenger.passenger_type_code || 'ADT',
      contact_email: passenger.contact_email || '',
      contact_phone: passenger.contact_phone || '',
      passport_number: passenger.passport_number || '',
      passport_issuing_country: passenger.passport_issuing_country || 'Thailand',
      passport_expiry_date: toDateInput(passenger.passport_expiry_date),
      visa_number: passenger.visa_number || '',
      visa_country: passenger.visa_country || '',
      visa_expiry_date: toDateInput(passenger.visa_expiry_date),
      notes: passenger.notes || '',
    });
  };

  const deletePassenger = async (id: string) => {
    try {
      setSaving(true);
      await profileApi.deleteSavedPassenger(id);
      setPassengers(prev => prev.filter(item => item.saved_passenger_id !== id));
      if (editingPassengerId === id) {
        setEditingPassengerId(null);
        setPassengerForm(emptyPassenger);
      }
      if (viewingPassengerId === id) {
        setViewingPassengerId(null);
      }
      showSuccess('Saved passenger deleted');
    } catch (deleteError) {
      if (isNotFoundError(deleteError)) {
        setPassengers(prev => prev.filter(item => item.saved_passenger_id !== id));
        if (viewingPassengerId === id) {
          setViewingPassengerId(null);
        }
        showSuccess('Saved passenger was already removed');
        return;
      }
      showError(deleteError);
    } finally {
      setSaving(false);
    }
  };

  const submitEmergency = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!emergencyForm.contact_name.trim() || !emergencyForm.phone_number.trim()) {
      showError('Emergency contact name and phone are required');
      return;
    }
    if (!isPhoneValueValid(emergencyForm.phone_number, true)) {
      showError('Please enter a valid emergency contact phone number');
      return;
    }

    try {
      setSaving(true);
      if (editingEmergencyId) {
        const response = await profileApi.updateEmergencyContact(editingEmergencyId, emergencyForm);
        setEmergencyContacts(prev => prev.map(item => item.emergency_contact_id === editingEmergencyId ? response.contact : item));
        showSuccess('Emergency contact updated');
      } else {
        const response = await profileApi.createEmergencyContact(emergencyForm);
        setEmergencyContacts(prev => [...prev, response.contact]);
        showSuccess('Emergency contact added');
      }
      setEmergencyForm(emptyEmergencyContact);
      setEditingEmergencyId(null);
    } catch (submitError) {
      showError(submitError);
    } finally {
      setSaving(false);
    }
  };

  const deleteEmergency = async (id: string) => {
    try {
      setSaving(true);
      await profileApi.deleteEmergencyContact(id);
      setEmergencyContacts(prev => prev.filter(item => item.emergency_contact_id !== id));
      showSuccess('Emergency contact deleted');
    } catch (deleteError) {
      if (isNotFoundError(deleteError)) {
        setEmergencyContacts(prev => prev.filter(item => item.emergency_contact_id !== id));
        showSuccess('Emergency contact was already removed');
        return;
      }
      showError(deleteError);
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!paymentForm.cardholder_name.trim() || !/^[0-9]{4}$/.test(paymentForm.last_four)) {
      showError('Cardholder name and exactly four last card digits are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...paymentForm,
        expiry_month: Number(paymentForm.expiry_month),
        expiry_year: Number(paymentForm.expiry_year),
      };
      if (editingPaymentId) {
        const response = await profileApi.updatePaymentMethod(editingPaymentId, payload);
        setPaymentMethods(prev => prev.map(item => item.payment_method_id === editingPaymentId ? response.paymentMethod : item));
        showSuccess('Payment method updated');
      } else {
        const response = await profileApi.createPaymentMethod(payload);
        setPaymentMethods(prev => response.paymentMethod.is_default
          ? [...prev.map(item => ({ ...item, is_default: false })), response.paymentMethod]
          : [...prev, response.paymentMethod]);
        showSuccess('Payment method saved');
      }
      setPaymentForm(emptyPaymentMethod);
      setEditingPaymentId(null);
    } catch (submitError) {
      showError(submitError);
    } finally {
      setSaving(false);
    }
  };

  const deletePayment = async (id: string) => {
    try {
      setSaving(true);
      await profileApi.deletePaymentMethod(id);
      setPaymentMethods(prev => prev.filter(item => item.payment_method_id !== id));
      showSuccess('Payment method deleted');
    } catch (deleteError) {
      if (isNotFoundError(deleteError)) {
        setPaymentMethods(prev => prev.filter(item => item.payment_method_id !== id));
        showSuccess('Payment method was already removed');
        return;
      }
      showError(deleteError);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-800">
        <div className="border border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-[#073b70]">Loading Profile</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-slate-800">
        <div className="max-w-md border border-amber-300 bg-amber-50 p-8 text-center">
          <h1 className="text-2xl font-black text-amber-800">Sign in required</h1>
          <p className="mt-3 text-sm font-semibold text-amber-700">Please sign in to manage your saved travel profile.</p>
          <Link to="/signin" className="mt-6 inline-flex h-11 items-center justify-center bg-[#073b70] px-6 text-sm font-black text-white">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-center px-6">
          <Link to="/" className="text-2xl font-black tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="bg-[#073b70] p-8 text-white md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 items-center justify-center border-4 border-amber-300 bg-white shadow">
                <span className="text-3xl font-black text-[#073b70]">{getInitials(profile)}</span>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-normal">{fullName(profile) || 'Profile'}</h1>
                <p className="mt-2 text-sm font-bold">{getProfileEmail(profile) || 'Email not available'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="border border-white/20 px-4 py-3"><p className="text-2xl font-black">{passengers.length}</p><p className="text-[10px] font-black uppercase">Passengers</p></div>
              <div className="border border-white/20 px-4 py-3"><p className="text-2xl font-black">{emergencyContacts.length}</p><p className="text-[10px] font-black uppercase">Contacts</p></div>
              <div className="border border-white/20 px-4 py-3"><p className="text-2xl font-black">{paymentMethods.length}</p><p className="text-[10px] font-black uppercase">Payments</p></div>
            </div>
          </div>
        </section>

        <div className="mt-6 min-h-12">
          {message && <div className="border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div>}
          {error && <div className="border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}
        </div>

        <div className="mt-4 grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="h-fit border border-slate-300 bg-white">
            {menuItems.map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                className="flex h-14 items-center gap-3 border-b border-slate-200 px-6 text-xs font-black uppercase tracking-wide text-slate-600 hover:bg-slate-50 hover:text-[#073b70]"
              >
                <span className="h-3 w-3 bg-amber-300" />
                {item}
              </a>
            ))}
          </aside>

          <div className="space-y-8">
            <form onSubmit={submitProfile} className="space-y-8">
              <Section id="sign-up-details" title="Sign Up Details">
                <p className="mb-5 border border-blue-200 bg-blue-50 p-4 text-xs font-bold text-[#073b70]">
                  These are the account details required when creating a Horizon Elite account. Email is used as your login ID and cannot be changed here.
                </p>
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Title *">
                    <select value={profile.title || ''} onChange={event => updateProfileField('title', event.target.value)} className={inputClass}>
                      <option value="">Select Title</option>
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr.</option>
                    </select>
                  </Label>
                  <Label label="First Name *">
                    <input value={profile.first_name || ''} onChange={event => updateProfileField('first_name', event.target.value)} className={inputClass} />
                  </Label>
                  <Label label="Last Name *">
                    <input value={profile.last_name || ''} onChange={event => updateProfileField('last_name', event.target.value)} className={inputClass} />
                  </Label>
                  <Label label="Email Address *">
                    <input value={getProfileEmail(profile)} className={`${inputClass} bg-slate-100 text-slate-500`} readOnly />
                  </Label>
                  <Label label="Phone Number *">
                    <PhoneInput value={profile.phone_number || ''} onChange={value => updateProfileField('phone_number', value)} required />
                  </Label>
                  <Label label="Password *">
                    <input value="Managed securely" className={`${inputClass} bg-slate-100 text-slate-500`} readOnly />
                  </Label>
                </div>
                <div className="mt-7 flex justify-end">
                  <SaveButton disabled={saving}>Save Sign Up Details</SaveButton>
                </div>
              </Section>

              <Section id="personal-details" title="Personal Details">
                <div className="grid gap-5 md:grid-cols-4">
                  <Label label="Title">
                    <select value={profile.title || 'Mr'} onChange={event => updateProfileField('title', event.target.value)} className={inputClass}>
                      <option>Mr</option><option>Mrs</option><option>Ms</option><option>Miss</option><option>Dr</option>
                    </select>
                  </Label>
                  <Label label="First Name">
                    <input value={profile.first_name || ''} onChange={event => updateProfileField('first_name', event.target.value)} className={inputClass} />
                  </Label>
                  <Label label="Middle Name">
                    <input value={profile.middle_name || ''} onChange={event => updateProfileField('middle_name', event.target.value)} className={inputClass} />
                  </Label>
                  <Label label="Last Name">
                    <input value={profile.last_name || ''} onChange={event => updateProfileField('last_name', event.target.value)} className={inputClass} />
                  </Label>
                  <Label label="Date of Birth">
                    <DatePicker
                      selected={fromDateString(profile.date_of_birth)}
                      onChange={(date: Date | null) => updateProfileField('date_of_birth', toDateString(date))}
                      className={inputClass}
                      placeholderText="Select date of birth"
                      dateFormat="dd MMM yyyy"
                      minDate={getBirthDateRangeForType(passengerForm.passenger_type_code).minDate}
                      maxDate={getBirthDateRangeForType(passengerForm.passenger_type_code).maxDate}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {passengerForm.passenger_type_code === 'ADT' && 'Adult must be 12 years or older.'}
                      {passengerForm.passenger_type_code === 'CHD' && 'Child must be 2 to 11 years old.'}
                      {passengerForm.passenger_type_code === 'INF' && 'Infant must be under 2 years old.'}
                    </p>
                  </Label>
                  <Label label="Gender">
                    <select value={profile.gender || 'M'} onChange={event => updateProfileField('gender', event.target.value)} className={inputClass}>
                      <option value="M">Male</option><option value="F">Female</option><option value="X">Other</option>
                    </select>
                  </Label>
                  <Label label="Nationality">
                    <CountrySelect value={profile.nationality || ''} onChange={country => updateProfileField('nationality', country)} className={inputClass} placeholder="Select nationality" />
                  </Label>
                  <Label label="Preferred Currency">
                    <input value={profile.preferred_currency || ''} onChange={event => updateProfileField('preferred_currency', event.target.value.toUpperCase())} maxLength={3} className={inputClass} />
                  </Label>
                </div>
              </Section>

              <Section id="contact-information" title="Contact Information">
                <div className="grid gap-5 md:grid-cols-2">
                  <Label label="Email Address">
                    <input value={getProfileEmail(profile)} className={inputClass} readOnly />
                  </Label>
                  <Label label="Phone Number">
                    <PhoneInput value={profile.phone_number || ''} onChange={value => updateProfileField('phone_number', value)} required />
                  </Label>
                  <Label label="Alternate Phone">
                    <PhoneInput value={profile.alternate_phone_number || ''} onChange={value => updateProfileField('alternate_phone_number', value)} />
                  </Label>
                  <Label label="Preferred Language">
                    <input value={profile.preferred_language || ''} onChange={event => updateProfileField('preferred_language', event.target.value)} className={inputClass} />
                  </Label>
                </div>
                <div className="mt-5">
                  <Label label="Residential Address">
                    <textarea value={profile.address || ''} onChange={event => updateProfileField('address', event.target.value)} className={textAreaClass} />
                  </Label>
                </div>
                <div className="mt-7 flex justify-end">
                  <SaveButton disabled={saving}>Save Profile</SaveButton>
                </div>
              </Section>
            </form>

            <form onSubmit={submitPassenger} className="space-y-8">
              <Section id="passenger-management" title="Passenger Management">
                <div className="mb-6 grid gap-3">
                  {passengers.map(passenger => (
                    <div key={passenger.saved_passenger_id} className="flex flex-col gap-4 border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-[#073b70]">{passenger.title} {passenger.first_name} {passenger.last_name}</p>
                        <p className="text-xs font-bold text-slate-500">{passenger.relationship} | Passport {maskValue(passenger.passport_number)} | Visa {maskValue(passenger.visa_number)}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setViewingPassengerId(current => current === passenger.saved_passenger_id ? null : passenger.saved_passenger_id)}
                          className="flex h-9 items-center gap-2 border border-slate-300 px-4 text-xs font-black uppercase text-slate-600"
                        >
                          <Eye size={14} />
                          {viewingPassengerId === passenger.saved_passenger_id ? 'Hide' : 'View'}
                        </button>
                        <button type="button" onClick={() => editPassenger(passenger)} className="h-9 border border-[#073b70] px-4 text-xs font-black uppercase text-[#073b70]">Edit</button>
                        <button type="button" onClick={() => deletePassenger(passenger.saved_passenger_id)} className="flex h-9 items-center gap-2 border border-red-300 px-4 text-xs font-black uppercase text-red-600"><Trash2 size={14} /> Delete</button>
                      </div>
                      {viewingPassengerId === passenger.saved_passenger_id && (
                        <div className="border-t border-slate-200 pt-4 sm:col-span-2 sm:w-full">
                          <dl className="grid gap-3 text-xs font-bold text-slate-600 md:grid-cols-4">
                            <div><dt className="uppercase text-slate-400">Date of Birth</dt><dd>{toDateInput(passenger.date_of_birth) || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Gender</dt><dd>{passenger.gender}</dd></div>
                            <div><dt className="uppercase text-slate-400">Nationality</dt><dd>{passenger.nationality || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Passenger Type</dt><dd>{passenger.passenger_type_code}</dd></div>
                            <div><dt className="uppercase text-slate-400">Email</dt><dd>{passenger.contact_email || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Phone</dt><dd>{passenger.contact_phone || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Passport Country</dt><dd>{passenger.passport_issuing_country || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Passport Expiry</dt><dd>{toDateInput(passenger.passport_expiry_date) || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Visa Country</dt><dd>{passenger.visa_country || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Visa Expiry</dt><dd>{toDateInput(passenger.visa_expiry_date) || 'Not saved'}</dd></div>
                          </dl>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-black uppercase text-[#073b70]">
                    <Users size={18} />
                    {editingPassengerId ? 'Edit Saved Passenger' : 'Add Saved Passenger'}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {editingPassengerId && (
                      <button
                        type="button"
                        onClick={() => { setEditingPassengerId(null); setPassengerForm(emptyPassenger); }}
                        className="h-11 border border-slate-300 px-6 text-xs font-black uppercase text-slate-600"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <SaveButton disabled={saving}>{editingPassengerId ? 'Update Passenger' : 'Save Passenger'}</SaveButton>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Relationship"><input value={passengerForm.relationship} onChange={event => updatePassengerField('relationship', event.target.value)} className={inputClass} /></Label>
                  <Label label="Title"><select value={passengerForm.title} onChange={event => updatePassengerField('title', event.target.value)} className={inputClass}><option>Mr</option><option>Mrs</option><option>Ms</option><option>Miss</option><option>Dr</option></select></Label>
                  <Label label="Passenger Type"><select value={passengerForm.passenger_type_code} onChange={event => updatePassengerField('passenger_type_code', event.target.value)} className={inputClass}><option value="ADT">Adult</option><option value="CHD">Child</option><option value="INF">Infant</option></select></Label>
                  <Label label="First Name"><input value={passengerForm.first_name} onChange={event => updatePassengerField('first_name', event.target.value)} className={inputClass} /></Label>
                  <Label label="Middle Name"><input value={passengerForm.middle_name || ''} onChange={event => updatePassengerField('middle_name', event.target.value)} className={inputClass} /></Label>
                  <Label label="Last Name"><input value={passengerForm.last_name} onChange={event => updatePassengerField('last_name', event.target.value)} className={inputClass} /></Label>
                  <Label label="Gender"><select value={passengerForm.gender} onChange={event => updatePassengerField('gender', event.target.value)} className={inputClass}><option value="M">Male</option><option value="F">Female</option><option value="X">Other</option></select></Label>
                  <Label label="Date of Birth">
                    <DatePicker
                      selected={fromDateString(passengerForm.date_of_birth)}
                      onChange={(date: Date | null) => updatePassengerField('date_of_birth', toDateString(date))}
                      className={inputClass}
                      placeholderText="Select date of birth"
                      dateFormat="dd MMM yyyy"
                      maxDate={todayAtStart()}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </Label>
                  <Label label="Nationality"><CountrySelect value={passengerForm.nationality} onChange={country => updatePassengerField('nationality', country)} className={inputClass} placeholder="Select nationality" /></Label>
                  <Label label="Contact Email"><input type="email" value={passengerForm.contact_email || ''} onChange={event => updatePassengerField('contact_email', event.target.value)} className={inputClass} /></Label>
                  <Label label="Contact Phone"><PhoneInput value={passengerForm.contact_phone || ''} onChange={value => updatePassengerField('contact_phone', value)} /></Label>
                </div>
              </Section>

              <Section id="passport-details" title="Passport Details">
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Passport Number"><input value={passengerForm.passport_number || ''} onChange={event => updatePassengerField('passport_number', event.target.value)} className={inputClass} /></Label>
                  <Label label="Issuing Country"><CountrySelect value={passengerForm.passport_issuing_country || ''} onChange={country => updatePassengerField('passport_issuing_country', country)} className={inputClass} placeholder="Select issuing country" /></Label>
                  <Label label="Expiry Date">
                    <DatePicker
                      selected={fromDateString(passengerForm.passport_expiry_date)}
                      onChange={(date: Date | null) => updatePassengerField('passport_expiry_date', toDateString(date))}
                      className={inputClass}
                      placeholderText="Select expiry date"
                      dateFormat="dd MMM yyyy"
                      minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </Label>
                </div>
              </Section>

              <Section id="visa-information" title="Visa Information">
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Visa Number"><input value={passengerForm.visa_number || ''} onChange={event => updatePassengerField('visa_number', event.target.value)} className={inputClass} /></Label>
                  <Label label="Visa Country"><CountrySelect value={passengerForm.visa_country || ''} onChange={country => updatePassengerField('visa_country', country)} className={inputClass} placeholder="Select visa country" /></Label>
                  <Label label="Visa Expiry Date">
                    <DatePicker
                      selected={fromDateString(passengerForm.visa_expiry_date)}
                      onChange={(date: Date | null) => updatePassengerField('visa_expiry_date', toDateString(date))}
                      className={inputClass}
                      placeholderText="Select visa expiry"
                      dateFormat="dd MMM yyyy"
                      minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </Label>
                </div>
                <div className="mt-7 flex flex-wrap justify-end gap-3">
                  {editingPassengerId && <button type="button" onClick={() => { setEditingPassengerId(null); setPassengerForm(emptyPassenger); }} className="h-11 border border-slate-300 px-6 text-xs font-black uppercase text-slate-600">Cancel</button>}
                  <SaveButton disabled={saving}>{editingPassengerId ? 'Update Passenger' : 'Save Passenger'}</SaveButton>
                </div>
              </Section>
            </form>

            <form onSubmit={submitEmergency}>
              <Section id="emergency-contact" title="Emergency Contact">
                <div className="mb-6 grid gap-3">
                  {emergencyContacts.map(contact => (
                    <div key={contact.emergency_contact_id} className="flex flex-col gap-4 border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-[#073b70]">{contact.contact_name}</p>
                        <p className="text-xs font-bold text-slate-500">{contact.relationship || 'Contact'} | {contact.phone_number} | Priority {contact.priority}</p>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setEditingEmergencyId(contact.emergency_contact_id); setEmergencyForm({ contact_name: contact.contact_name, relationship: contact.relationship || '', phone_number: contact.phone_number, email_address: contact.email_address || '', priority: contact.priority }); }} className="h-9 border border-[#073b70] px-4 text-xs font-black uppercase text-[#073b70]">Edit</button>
                        <button type="button" onClick={() => deleteEmergency(contact.emergency_contact_id)} className="h-9 border border-red-300 px-4 text-xs font-black uppercase text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Label label="Contact Name"><input value={emergencyForm.contact_name} onChange={event => setEmergencyForm(prev => ({ ...prev, contact_name: event.target.value }))} className={inputClass} /></Label>
                  <Label label="Relationship"><input value={emergencyForm.relationship || ''} onChange={event => setEmergencyForm(prev => ({ ...prev, relationship: event.target.value }))} className={inputClass} /></Label>
                  <Label label="Phone Number"><PhoneInput value={emergencyForm.phone_number} onChange={value => setEmergencyForm(prev => ({ ...prev, phone_number: value }))} required /></Label>
                  <Label label="Email Address"><input type="email" value={emergencyForm.email_address || ''} onChange={event => setEmergencyForm(prev => ({ ...prev, email_address: event.target.value }))} className={inputClass} /></Label>
                </div>
                <div className="mt-7 flex justify-end">
                  <SaveButton disabled={saving}>{editingEmergencyId ? 'Update Contact' : 'Add Contact'}</SaveButton>
                </div>
              </Section>
            </form>

            <form onSubmit={submitPayment}>
              <Section id="payment-methods" title="Payment Methods">
                <p className="mb-5 border border-amber-300 bg-amber-50 p-4 text-xs font-bold text-amber-800">
                  For security, save only payment metadata here. Do not enter full card numbers or CVV.
                </p>
                <div className="mb-6 grid gap-3">
                  {paymentMethods.map(method => (
                    <div key={method.payment_method_id} className="flex flex-col gap-4 border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-[#073b70]">{method.card_brand || 'Card'} ending {method.last_four} {method.is_default ? <span className="text-xs text-emerald-600">Default</span> : null}</p>
                        <p className="text-xs font-bold text-slate-500">{method.cardholder_name} | Expires {String(method.expiry_month).padStart(2, '0')}/{method.expiry_year}</p>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setEditingPaymentId(method.payment_method_id); setPaymentForm({ payment_type: method.payment_type, card_brand: method.card_brand || '', cardholder_name: method.cardholder_name, last_four: method.last_four, expiry_month: method.expiry_month, expiry_year: method.expiry_year, gateway_payment_method_id: method.gateway_payment_method_id || '', billing_address: method.billing_address || '', is_default: method.is_default }); }} className="h-9 border border-[#073b70] px-4 text-xs font-black uppercase text-[#073b70]">Edit</button>
                        <button type="button" onClick={() => deletePayment(method.payment_method_id)} className="h-9 border border-red-300 px-4 text-xs font-black uppercase text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase text-[#073b70]">
                  {editingPaymentId ? <CreditCard size={18} /> : <Plus size={18} />}
                  {editingPaymentId ? 'Edit Payment Method' : 'Add Payment Method'}
                </div>
                <div className="grid gap-5 md:grid-cols-4">
                  <Label label="Card Brand"><input value={paymentForm.card_brand || ''} onChange={event => setPaymentForm(prev => ({ ...prev, card_brand: event.target.value }))} className={inputClass} /></Label>
                  <Label label="Cardholder Name"><input value={paymentForm.cardholder_name} onChange={event => setPaymentForm(prev => ({ ...prev, cardholder_name: event.target.value }))} className={inputClass} /></Label>
                  <Label label="Last 4 Digits"><input value={paymentForm.last_four} onChange={event => setPaymentForm(prev => ({ ...prev, last_four: event.target.value.replace(/\D/g, '').slice(0, 4) }))} className={inputClass} inputMode="numeric" /></Label>
                  <Label label="Expiry Month"><input type="number" min="1" max="12" value={paymentForm.expiry_month} onChange={event => setPaymentForm(prev => ({ ...prev, expiry_month: Number(event.target.value) }))} className={inputClass} /></Label>
                  <Label label="Expiry Year"><input type="number" min={new Date().getFullYear()} value={paymentForm.expiry_year} onChange={event => setPaymentForm(prev => ({ ...prev, expiry_year: Number(event.target.value) }))} className={inputClass} /></Label>
                  <Label label="Gateway Token ID"><input value={paymentForm.gateway_payment_method_id || ''} onChange={event => setPaymentForm(prev => ({ ...prev, gateway_payment_method_id: event.target.value }))} className={inputClass} placeholder="Optional token/reference" /></Label>
                  <label className="flex h-11 items-center gap-3 text-sm font-bold text-slate-600 md:col-span-2"><input type="checkbox" checked={paymentForm.is_default} onChange={event => setPaymentForm(prev => ({ ...prev, is_default: event.target.checked }))} className="accent-[#073b70]" /> Set as default payment method</label>
                </div>
                <div className="mt-7 flex justify-end">
                  <SaveButton disabled={saving}>{editingPaymentId ? 'Update Payment' : 'Save Payment'}</SaveButton>
                </div>
              </Section>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
