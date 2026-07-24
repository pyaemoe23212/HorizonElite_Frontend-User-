import React from 'react';
import { Link } from 'react-router';
import { AlertCircle, ChevronDown, CreditCard, Eye, IdCard, Mail, Phone, Plane, Plus, ShieldCheck, Trash2, UserRound, Users, WalletCards, PencilLine, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
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
import { FormLabel as Label, FormSection as Section, SaveButton } from '../components/forms/FormPrimitives';
import { getPassportExpiryValidation } from '../utils/passportValidation';

const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#073b70] focus:ring-2 focus:ring-blue-100';
const textAreaClass = 'min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#073b70] focus:ring-2 focus:ring-blue-100';
const viewInputClass = `${inputClass} bg-slate-50 text-slate-700 focus:border-slate-300 focus:ring-0`;
const viewTextAreaClass = `${textAreaClass} bg-slate-50 text-slate-700 focus:border-slate-300 focus:ring-0`;
type ProfileSectionKey = 'account' | 'personal' | 'contact';

const menuItems = [
  { label: 'Account', href: 'sign-up-details', icon: UserRound },
  { label: 'Personal', href: 'personal-details', icon: IdCard },
  { label: 'Contact', href: 'contact-information', icon: Phone },
  { label: 'Passengers', href: 'passenger-management', icon: Users },
  { label: 'Passport', href: 'passport-details', icon: Plane },
  { label: 'Visa', href: 'visa-information', icon: ShieldCheck },
  { label: 'Emergency', href: 'emergency-contact', icon: AlertCircle },
  { label: 'Payments', href: 'payment-methods', icon: WalletCards },
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

const savedPassengerName = (passenger: Pick<SavedPassengerPayload, 'title' | 'first_name' | 'middle_name' | 'last_name'>) => [
  passenger.title,
  passenger.first_name,
  passenger.middle_name,
  passenger.last_name,
].filter(Boolean).join(' ');

const getInitials = (profile: Partial<ProfileResponse> | null) => {
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase();
  return initials || 'HE';
};

const maskValue = (value?: string | null) => {
  if (!value) return 'Not saved';
  if (value.length <= 4) return `**** ${value}`;
  return `**** **** ${value.slice(-4)}`;
};

const formatDisplayDate = (value?: string | null) => {
  const date = fromDateString(value);
  if (!date) return 'Not saved';
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getProfileCompletion = (
  profile: Partial<ProfileResponse>,
  passengers: SavedPassenger[],
  emergencyContacts: EmergencyContact[],
  paymentMethods: SavedPaymentMethod[]
) => {
  const checks = [
    Boolean(profile.first_name && profile.last_name),
    Boolean(getProfileEmail(profile)),
    Boolean(profile.phone_number),
    Boolean(profile.date_of_birth),
    Boolean(profile.nationality),
    passengers.length > 0,
    emergencyContacts.length > 0,
    paymentMethods.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
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

const StatCard = ({ icon: Icon, label, value, tone = 'blue' }: { icon: React.ElementType; label: string; value: string | number; tone?: 'blue' | 'amber' | 'emerald' }) => {
  const tones = {
    blue: 'bg-blue-50 text-[#073b70]',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={19} />
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
};

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
  disabled = false,
}: {
  value?: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [phoneCountry, setPhoneCountry] = React.useState('TH');
  const [phoneNumber, setPhoneNumber] = React.useState(value || '');
  const [phoneError, setPhoneError] = React.useState('');
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
        if (parsed.country) setPhoneCountry(parsed.country);
      } catch {
        // Keep the current country when an existing value cannot be parsed.
      }
    }
  }, [value]);

  const selectedCountry = React.useMemo(
    () => countryOptions.find(country => country.iso === phoneCountry) ?? null,
    [countryOptions, phoneCountry]
  );

  const validatePhone = (number: string, iso: string) => {
    if (!number.trim()) {
      setPhoneError(required ? 'Phone number is required' : '');
      onChange('');
      return !required;
    }

    const dialCode = countryOptions.find(c => c.iso === iso)?.dialCode ?? '';
    const rawValue = number.trim().startsWith('+') ? number.trim() : `${dialCode}${number}`;

    if (!isValidPhoneNumber(rawValue, iso as CountryCode)) {
      setPhoneError('Please enter a valid phone number for the selected country');
      return false;
    }

    try {
      const parsed = parsePhoneNumber(rawValue, iso as CountryCode);
      setPhoneError('');
      onChange(parsed.format('E.164'));
    } catch {
      setPhoneError('Please enter a valid phone number for the selected country');
      return false;
    }

    return true;
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = new AsYouType(phoneCountry as CountryCode).input(event.target.value);
    setPhoneNumber(formatted);
    setPhoneError('');
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
    setIsCountryListOpen(false);
    onChange('');
  };

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsCountryListOpen(open => !open)}
            disabled={disabled}
            className={`flex h-11 w-full items-center justify-between border border-slate-300 px-3 text-left text-sm font-semibold outline-none transition focus:border-[#073b70] ${disabled ? 'bg-slate-50 text-slate-700' : 'bg-white text-slate-800'}`}
            aria-haspopup="listbox"
            aria-expanded={isCountryListOpen}
          >
            <span className="flex min-w-0 items-center gap-2">
              {selectedCountry && <img src={selectedCountry.flagUrl} alt={selectedCountry.iso} className="h-3 w-5 shrink-0 object-cover" />}
              <span className="truncate text-xs">{selectedCountry ? `${selectedCountry.iso} (${selectedCountry.dialCode})` : 'Country'}</span>
            </span>
            <span className="ml-2 text-xs text-slate-500">▼</span>
          </button>

          {isCountryListOpen && !disabled && (
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
          disabled={disabled}
          className={`${disabled ? viewInputClass : inputClass} ${phoneError ? 'border-red-500 focus:border-red-600' : ''}`}
          placeholder={placeholder}
        />
      </div>
      {phoneError && <p className="mt-1 text-xs font-semibold text-red-500">{phoneError}</p>}
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
  const [passengerFormOpen, setPassengerFormOpen] = React.useState(false);
  const [emergencyFormOpen, setEmergencyFormOpen] = React.useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [editingProfileSection, setEditingProfileSection] = React.useState<ProfileSectionKey | null>(null);
  const [profileSnapshot, setProfileSnapshot] = React.useState<Partial<ProfileResponse> | null>(null);

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

  const startProfileEdit = (section: ProfileSectionKey) => {
    setProfileSnapshot(profile);
    setEditingProfileSection(section);
    setError('');
    setMessage('');
  };

  const cancelProfileEdit = () => {
    if (profileSnapshot) setProfile(profileSnapshot);
    setProfileSnapshot(null);
    setEditingProfileSection(null);
    setError('');
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

  const renderProfileSectionActions = (section: ProfileSectionKey) => {
    const isEditing = editingProfileSection === section;
    const isAnotherSectionEditing = Boolean(editingProfileSection && !isEditing);

    return (
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {isEditing ? 'Editing this section' : 'View mode'}
        </p>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <button type="button" onClick={cancelProfileEdit} className="he-action inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50">
                <X size={14} />
                Cancel
              </button>
              <SaveButton disabled={saving}>{saving ? 'Saving...' : 'Save'}</SaveButton>
            </>
          ) : (
            <button type="button" onClick={() => startProfileEdit(section)} disabled={isAnotherSectionEditing} className="he-action inline-flex h-9 items-center gap-2 rounded-lg bg-[#073b70] px-4 text-xs font-semibold uppercase tracking-wide text-white hover:bg-[#052f59] disabled:cursor-not-allowed disabled:bg-slate-400">
              <PencilLine size={14} />
              Edit
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderFormToggle = ({
    open,
    onToggle,
    icon: Icon,
    title,
    description,
    editing,
  }: {
    open: boolean;
    onToggle: () => void;
    icon: React.ElementType;
    title: string;
    description: string;
    editing?: boolean;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`mb-5 flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition ${open ? 'border-[#073b70] bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-[#073b70] hover:bg-white'}`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${open ? 'bg-[#073b70] text-white' : 'bg-white text-[#073b70]'}`}>
          <Icon size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold uppercase tracking-wide text-[#073b70]">{editing ? title.replace('Add', 'Edit') : title}</span>
          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{description}</span>
        </span>
      </span>
      <ChevronDown className={`h-5 w-5 shrink-0 text-[#073b70] transition ${open ? 'rotate-180' : ''}`} />
    </button>
  );

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProfileSection) return;

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
      setProfileSnapshot(null);
      setEditingProfileSection(null);
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
    if (!passengerForm.relationship.trim() || !passengerForm.title.trim() || !passengerForm.gender.trim() || !passengerForm.nationality.trim()) {
      showError('Relationship, title, gender, and nationality are required');
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
    if (!passengerForm.passport_number?.trim() || !passengerForm.passport_issuing_country?.trim() || !passengerForm.passport_expiry_date) {
      showError('Passport number, issuing country, and expiry date are required');
      return;
    }
    const passportExpiryValidation = getPassportExpiryValidation(passengerForm.passport_expiry_date);
    if (passportExpiryValidation.tone === 'error' || passportExpiryValidation.tone === 'warning') {
      showError(passportExpiryValidation.message);
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
      setPassengerFormOpen(false);
    } catch (submitError) {
      showError(submitError);
    } finally {
      setSaving(false);
    }
  };

  const editPassenger = (passenger: SavedPassenger) => {
    setEditingPassengerId(passenger.saved_passenger_id);
    setViewingPassengerId(passenger.saved_passenger_id);
    setPassengerFormOpen(true);
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
    window.setTimeout(() => {
      document.getElementById('passenger-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
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
      setEmergencyFormOpen(false);
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
      setPaymentFormOpen(false);
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

  const profileCompletion = getProfileCompletion(profile, passengers, emergencyContacts, paymentMethods);
  const passengerPassportExpiryValidation = React.useMemo(
    () => getPassportExpiryValidation(passengerForm.passport_expiry_date),
    [passengerForm.passport_expiry_date]
  );
  const defaultPayment = paymentMethods.find(method => method.is_default);

  if (isLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-800">
        <div className="border border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#073b70]">Loading Profile</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 text-slate-800">
        <div className="max-w-md border border-amber-300 bg-amber-50 p-8 text-center">
          <h1 className="text-2xl font-semibold text-amber-800">Sign in required</h1>
          <p className="mt-3 text-sm font-semibold text-amber-700">Please sign in to manage your saved travel profile.</p>
          <Link to="/signin" className="mt-6 inline-flex h-11 items-center justify-center bg-[#073b70] px-6 text-sm font-semibold text-white">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-semibold tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
          <Link to="/" className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#073b70] transition hover:border-[#073b70] hover:bg-blue-50">
            Book a flight
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="overflow-hidden rounded-2xl bg-[#073b70] text-white shadow-xl shadow-blue-950/10">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-amber-300 bg-white shadow-lg">
                  <span className="text-3xl font-semibold text-[#073b70]">{getInitials(profile)}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.24em] text-amber-300">Horizon Elite Account</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-normal">{fullName(profile) || 'Your travel profile'}</h1>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-sky-100">
                    <span className="inline-flex items-center gap-2"><Mail size={15} />{getProfileEmail(profile) || 'Email not available'}</span>
                    <span className="inline-flex items-center gap-2"><Phone size={15} />{profile.phone_number || 'Phone not saved'}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-100/80">Default Payment</p>
                  <p className="mt-1 text-lg font-semibold">{defaultPayment ? `${defaultPayment.card_brand || 'Card'} ${defaultPayment.last_four}` : 'Not set'}</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-100/80">Preferred Currency</p>
                  <p className="mt-1 text-lg font-semibold">{profile.preferred_currency || 'USD'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard icon={Users} label="Saved passengers" value={passengers.length} />
          <StatCard icon={AlertCircle} label="Emergency contacts" value={emergencyContacts.length} tone="amber" />
          <StatCard icon={WalletCards} label="Payment methods" value={paymentMethods.length} tone="emerald" />
          <StatCard icon={Plane} label="Ready for booking" value={profileCompletion >= 75 ? 'Yes' : 'Almost'} />
        </div>

        <div className="mt-6 min-h-12">
          {message && <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</div>}
          {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}
        </div>

        <div className="mt-4 grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="sticky top-24 h-fit overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-slate-400">Manage</p>
            </div>
            {menuItems.map(item => (
              <a
                key={item.href}
                href={`#${item.href}`}
                className="flex h-12 items-center gap-3 border-b border-slate-100 px-5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-blue-50 hover:text-[#073b70]"
              >
                <item.icon size={16} />
                {item.label}
              </a>
            ))}
          </aside>

          <div className="space-y-8">
            <form onSubmit={submitProfile} className="space-y-8">
              <Section id="sign-up-details" title="Account Details" description="Your login identity and required profile basics. Email is used as your account ID and cannot be changed here.">
                {renderProfileSectionActions('account')}
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Title *">
                    <select value={profile.title || ''} onChange={event => updateProfileField('title', event.target.value)} disabled={editingProfileSection !== 'account'} className={editingProfileSection === 'account' ? inputClass : viewInputClass}>
                      <option value="">Select Title</option>
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr.</option>
                    </select>
                  </Label>
                  <Label label="First Name *">
                    <input value={profile.first_name || ''} onChange={event => updateProfileField('first_name', event.target.value)} readOnly={editingProfileSection !== 'account'} className={editingProfileSection === 'account' ? inputClass : viewInputClass} />
                  </Label>
                  <Label label="Last Name *">
                    <input value={profile.last_name || ''} onChange={event => updateProfileField('last_name', event.target.value)} readOnly={editingProfileSection !== 'account'} className={editingProfileSection === 'account' ? inputClass : viewInputClass} />
                  </Label>
                  <Label label="Email Address *">
                    <input value={getProfileEmail(profile)} className={`${inputClass} bg-slate-100 text-slate-500`} readOnly />
                  </Label>
                  <Label label="Phone Number *" className="md:col-span-2">
                    <PhoneInput value={profile.phone_number || ''} onChange={value => updateProfileField('phone_number', value)} required disabled={editingProfileSection !== 'account'} />
                  </Label>
                  <Label label="Password *">
                    <input value="Managed securely" className={`${inputClass} bg-slate-100 text-slate-500`} readOnly />
                  </Label>
                </div>
              </Section>

              <Section id="personal-details" title="Personal Details" description="Keep these details aligned with the passport or ID you use when flying.">
                {renderProfileSectionActions('personal')}
                <div className="grid gap-5 md:grid-cols-4">
                  <Label label="Title">
                    <select value={profile.title || 'Mr'} onChange={event => updateProfileField('title', event.target.value)} disabled={editingProfileSection !== 'personal'} className={editingProfileSection === 'personal' ? inputClass : viewInputClass}>
                      <option>Mr</option><option>Mrs</option><option>Ms</option><option>Miss</option><option>Dr</option>
                    </select>
                  </Label>
                  <Label label="First Name">
                    <input value={profile.first_name || ''} onChange={event => updateProfileField('first_name', event.target.value)} readOnly={editingProfileSection !== 'personal'} className={editingProfileSection === 'personal' ? inputClass : viewInputClass} />
                  </Label>
                  <Label label="Middle Name">
                    <input value={profile.middle_name || ''} onChange={event => updateProfileField('middle_name', event.target.value)} readOnly={editingProfileSection !== 'personal'} className={editingProfileSection === 'personal' ? inputClass : viewInputClass} />
                  </Label>
                  <Label label="Last Name">
                    <input value={profile.last_name || ''} onChange={event => updateProfileField('last_name', event.target.value)} readOnly={editingProfileSection !== 'personal'} className={editingProfileSection === 'personal' ? inputClass : viewInputClass} />
                  </Label>
                  <Label label="Date of Birth">
                    <DatePicker
                      selected={fromDateString(profile.date_of_birth)}
                      onChange={(date: Date | null) => updateProfileField('date_of_birth', toDateString(date))}
                      className={editingProfileSection === 'personal' ? inputClass : viewInputClass}
                      disabled={editingProfileSection !== 'personal'}
                      placeholderText="Select date of birth"
                      dateFormat="dd MMM yyyy"
                      minDate={addYears(todayAtStart(), -120)}
                      maxDate={todayAtStart()}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </Label>
                  <Label label="Gender">
                    <select value={profile.gender || 'M'} onChange={event => updateProfileField('gender', event.target.value)} disabled={editingProfileSection !== 'personal'} className={editingProfileSection === 'personal' ? inputClass : viewInputClass}>
                      <option value="M">Male</option><option value="F">Female</option><option value="X">Other</option>
                    </select>
                  </Label>
                  <Label label="Nationality">
                    <CountrySelect value={profile.nationality || ''} onChange={country => updateProfileField('nationality', country)} className={editingProfileSection === 'personal' ? inputClass : viewInputClass} placeholder="Select nationality" disabled={editingProfileSection !== 'personal'} />
                  </Label>
                  <Label label="Preferred Currency">
                    <input value={profile.preferred_currency || ''} onChange={event => updateProfileField('preferred_currency', event.target.value.toUpperCase())} maxLength={3} readOnly={editingProfileSection !== 'personal'} className={editingProfileSection === 'personal' ? inputClass : viewInputClass} />
                  </Label>
                </div>
              </Section>

              <Section id="contact-information" title="Contact Information" description="Used for booking confirmations, flight changes, check-in reminders, and urgent service updates.">
                {renderProfileSectionActions('contact')}
                <div className="grid gap-5 md:grid-cols-2">
                  <Label label="Email Address">
                    <input value={getProfileEmail(profile)} className={viewInputClass} readOnly />
                  </Label>
                  <Label label="Phone Number">
                    <PhoneInput value={profile.phone_number || ''} onChange={value => updateProfileField('phone_number', value)} required disabled={editingProfileSection !== 'contact'} />
                  </Label>
                  <Label label="Alternate Phone">
                    <PhoneInput value={profile.alternate_phone_number || ''} onChange={value => updateProfileField('alternate_phone_number', value)} disabled={editingProfileSection !== 'contact'} />
                  </Label>
                  <Label label="Preferred Language">
                    <input value={profile.preferred_language || ''} onChange={event => updateProfileField('preferred_language', event.target.value)} readOnly={editingProfileSection !== 'contact'} className={editingProfileSection === 'contact' ? inputClass : viewInputClass} />
                  </Label>
                </div>
                <div className="mt-5">
                  <Label label="Residential Address">
                    <textarea value={profile.address || ''} onChange={event => updateProfileField('address', event.target.value)} readOnly={editingProfileSection !== 'contact'} className={editingProfileSection === 'contact' ? textAreaClass : viewTextAreaClass} />
                  </Label>
                </div>
              </Section>
            </form>

            <form onSubmit={submitPassenger} className="space-y-8">
              <Section id="passenger-management" title="Saved Passengers" description="Store frequent travelers so booking and check-in forms can be filled faster.">
                <div className="mb-6 grid gap-3">
                  {passengers.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <Users className="mx-auto text-slate-400" size={30} />
                      <p className="mt-3 text-sm font-semibold text-slate-700">No saved passengers yet</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Add yourself or a frequent travel companion below.</p>
                    </div>
                  )}
                  {passengers.map(passenger => {
                    const isEditingPassenger = editingPassengerId === passenger.saved_passenger_id;

                    return (
                    <div key={passenger.saved_passenger_id} className={`rounded-xl border p-4 transition ${isEditingPassenger ? 'border-[#073b70] bg-blue-50 shadow-md shadow-blue-950/10 ring-2 ring-blue-100' : 'border-slate-200 bg-slate-50/60'}`}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-[#073b70]">{savedPassengerName(passenger)}</p>
                          {isEditingPassenger && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#073b70] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                              <PencilLine size={12} />
                              Currently Editing
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500">{passenger.relationship} | {passenger.passenger_type_code} | Passport {maskValue(passenger.passport_number)}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setViewingPassengerId(current => current === passenger.saved_passenger_id ? null : passenger.saved_passenger_id)}
                          className="flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold uppercase text-slate-600 transition hover:border-[#073b70] hover:text-[#073b70]"
                        >
                          <Eye size={14} />
                          {viewingPassengerId === passenger.saved_passenger_id ? 'Hide' : 'View'}
                        </button>
                        <button
                          type="button"
                          onClick={() => editPassenger(passenger)}
                          className={`flex h-9 items-center gap-2 rounded-lg border px-4 text-xs font-semibold uppercase transition ${isEditingPassenger ? 'border-[#073b70] bg-[#073b70] text-white' : 'border-[#073b70] bg-white text-[#073b70] hover:bg-blue-50'}`}
                        >
                          <PencilLine size={14} />
                          {isEditingPassenger ? 'Editing' : 'Edit'}
                        </button>
                        <button type="button" onClick={() => deletePassenger(passenger.saved_passenger_id)} className="flex h-9 items-center gap-2 rounded-lg border border-red-300 bg-white px-4 text-xs font-semibold uppercase text-red-600"><Trash2 size={14} /> Delete</button>
                      </div>
                      </div>
                      {viewingPassengerId === passenger.saved_passenger_id && (
                        <div className="border-t border-slate-200 pt-4 sm:col-span-2 sm:w-full">
                          <dl className="grid gap-3 text-xs font-medium text-slate-600 md:grid-cols-4">
                            <div><dt className="uppercase text-slate-400">Date of Birth</dt><dd>{formatDisplayDate(passenger.date_of_birth)}</dd></div>
                            <div><dt className="uppercase text-slate-400">Gender</dt><dd>{passenger.gender}</dd></div>
                            <div><dt className="uppercase text-slate-400">Nationality</dt><dd>{passenger.nationality || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Passenger Type</dt><dd>{passenger.passenger_type_code}</dd></div>
                            <div><dt className="uppercase text-slate-400">Email</dt><dd>{passenger.contact_email || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Phone</dt><dd>{passenger.contact_phone || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Passport Country</dt><dd>{passenger.passport_issuing_country || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Passport Expiry</dt><dd>{formatDisplayDate(passenger.passport_expiry_date)}</dd></div>
                            <div><dt className="uppercase text-slate-400">Visa Country</dt><dd>{passenger.visa_country || 'Not saved'}</dd></div>
                            <div><dt className="uppercase text-slate-400">Visa Expiry</dt><dd>{formatDisplayDate(passenger.visa_expiry_date)}</dd></div>
                          </dl>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>

                {renderFormToggle({
                  open: passengerFormOpen,
                  onToggle: () => {
                    if (passengerFormOpen && editingPassengerId) {
                      setEditingPassengerId(null);
                      setPassengerForm(emptyPassenger);
                    }
                    setPassengerFormOpen(open => !open);
                  },
                  icon: editingPassengerId ? PencilLine : Users,
                  title: 'Add Saved Passenger',
                  description: 'Open the form only when you want to add or update a frequent traveler.',
                  editing: Boolean(editingPassengerId),
                })}

                {passengerFormOpen && (
                <div id="passenger-form" className={`mt-5 rounded-xl border ${editingPassengerId ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-slate-50/70'}`}>
                  <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase text-[#073b70]">
                        {editingPassengerId ? <PencilLine size={18} /> : <Users size={18} />}
                        {editingPassengerId ? 'Edit Saved Passenger' : 'Add Saved Passenger'}
                      </div>
                      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                        Fill the required passenger and passport details. Visa details are optional and can be left blank.
                      </p>
                    </div>
                  </div>

                  {editingPassengerId && (
                    <div className="mx-5 mt-5 rounded-lg border border-blue-200 bg-white p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-[#073b70]">
                        <PencilLine size={17} />
                        Editing {savedPassengerName(passengerForm)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">Update the fields below, then click Update Passenger or Cancel Edit.</p>
                    </div>
                  )}

                  <div className="space-y-6 p-5">
                    <div>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#073b70]">Passenger Details</h3>
                        <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">Required</span>
                      </div>
                      <div className="grid gap-5 md:grid-cols-3">
                        <Label label="Relationship*"><input value={passengerForm.relationship} onChange={event => updatePassengerField('relationship', event.target.value)} className={inputClass} /></Label>
                        <Label label="Title*"><select value={passengerForm.title} onChange={event => updatePassengerField('title', event.target.value)} className={inputClass}><option>Mr</option><option>Mrs</option><option>Ms</option><option>Miss</option><option>Dr</option></select></Label>
                        <Label label="Passenger Type*"><select value={passengerForm.passenger_type_code} onChange={event => updatePassengerField('passenger_type_code', event.target.value)} className={inputClass}><option value="ADT">Adult</option><option value="CHD">Child</option><option value="INF">Infant</option></select></Label>
                        <Label label="First Name*"><input value={passengerForm.first_name} onChange={event => updatePassengerField('first_name', event.target.value)} className={inputClass} /></Label>
                        <Label label="Middle Name (Optional)"><input value={passengerForm.middle_name || ''} onChange={event => updatePassengerField('middle_name', event.target.value)} className={inputClass} /></Label>
                        <Label label="Last Name*"><input value={passengerForm.last_name} onChange={event => updatePassengerField('last_name', event.target.value)} className={inputClass} /></Label>
                        <Label label="Gender*"><select value={passengerForm.gender} onChange={event => updatePassengerField('gender', event.target.value)} className={inputClass}><option value="M">Male</option><option value="F">Female</option><option value="X">Other</option></select></Label>
                        <Label label="Date of Birth*">
                          <DatePicker
                            selected={fromDateString(passengerForm.date_of_birth)}
                            onChange={(date: Date | null) => updatePassengerField('date_of_birth', toDateString(date))}
                            className={inputClass}
                            placeholderText="Select date of birth"
                            dateFormat="dd MMM yyyy"
                            minDate={getBirthDateRangeForType(passengerForm.passenger_type_code).minDate}
                            maxDate={getBirthDateRangeForType(passengerForm.passenger_type_code).maxDate}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                          />
                        </Label>
                        <Label label="Nationality*"><CountrySelect value={passengerForm.nationality} onChange={country => updatePassengerField('nationality', country)} className={inputClass} placeholder="Select nationality" /></Label>
                        <Label label="Contact Email (Optional)"><input type="email" value={passengerForm.contact_email || ''} onChange={event => updatePassengerField('contact_email', event.target.value)} className={inputClass} /></Label>
                        <Label label="Contact Phone (Optional)"><PhoneInput value={passengerForm.contact_phone || ''} onChange={value => updatePassengerField('contact_phone', value)} /></Label>
                      </div>
                    </div>

                    <div id="passport-details" className="border-t border-slate-200 pt-6">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#073b70]">Passport Details</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-500">Needed to reuse this passenger during booking.</p>
                        </div>
                        <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">Required</span>
                      </div>
                      <div className="grid gap-5 md:grid-cols-3">
                        <Label label="Passport Number*"><input value={passengerForm.passport_number || ''} onChange={event => updatePassengerField('passport_number', event.target.value)} className={inputClass} /></Label>
                        <Label label="Issuing Country*"><CountrySelect value={passengerForm.passport_issuing_country || ''} onChange={country => updatePassengerField('passport_issuing_country', country)} className={inputClass} placeholder="Select issuing country" /></Label>
                        <Label label="Expiry Date*">
                          <DatePicker
                            selected={fromDateString(passengerForm.passport_expiry_date)}
                            onChange={(date: Date | null) => updatePassengerField('passport_expiry_date', toDateString(date))}
                            className={`${inputClass} ${passengerPassportExpiryValidation.tone === 'error' ? 'border-red-500 bg-red-50 focus:border-red-600' : passengerPassportExpiryValidation.tone === 'warning' ? 'border-amber-400 bg-amber-50 focus:border-amber-500' : passengerPassportExpiryValidation.tone === 'success' ? 'border-green-500 bg-green-50 focus:border-green-600' : ''}`}
                            placeholderText="Select expiry date"
                            dateFormat="dd MMM yyyy"
                            minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                          />
                          {passengerPassportExpiryValidation.message && (
                            <p className={`mt-1 text-xs font-semibold ${passengerPassportExpiryValidation.tone === 'error' ? 'text-red-500' : passengerPassportExpiryValidation.tone === 'warning' ? 'text-amber-700' : 'text-green-600'}`}>
                              {passengerPassportExpiryValidation.message}
                            </p>
                          )}
                        </Label>
                      </div>
                    </div>

                    <div id="visa-information" className="border-t border-slate-200 pt-6">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#073b70]">Visa Details</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-500">Only fill this if the destination requires visa information.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Optional</span>
                      </div>
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
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white p-5">
                    {editingPassengerId && <button type="button" onClick={() => { setEditingPassengerId(null); setPassengerForm(emptyPassenger); }} className="h-11 rounded-lg border border-slate-300 px-6 text-xs font-semibold uppercase text-slate-600">Cancel</button>}
                    <SaveButton disabled={saving}>{editingPassengerId ? 'Update Passenger' : 'Save Passenger'}</SaveButton>
                  </div>
                </div>
                )}
              </Section>
            </form>

            <form onSubmit={submitEmergency}>
              <Section id="emergency-contact" title="Emergency Contacts" description="People Horizon Elite can contact if there is an urgent travel issue or service disruption.">
                <div className="mb-6 grid gap-3">
                  {emergencyContacts.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <AlertCircle className="mx-auto text-slate-400" size={30} />
                      <p className="mt-3 text-sm font-semibold text-slate-700">No emergency contacts saved</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Add one trusted contact for safer travel support.</p>
                    </div>
                  )}
                  {emergencyContacts.map(contact => (
                    <div key={contact.emergency_contact_id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[#073b70]">{contact.contact_name}</p>
                        <p className="text-xs font-medium text-slate-500">{contact.relationship || 'Contact'} | {contact.phone_number} | Priority {contact.priority}</p>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setEditingEmergencyId(contact.emergency_contact_id); setEmergencyFormOpen(true); setEmergencyForm({ contact_name: contact.contact_name, relationship: contact.relationship || '', phone_number: contact.phone_number, email_address: contact.email_address || '', priority: contact.priority }); }} className="h-9 rounded-lg border border-[#073b70] bg-white px-4 text-xs font-semibold uppercase text-[#073b70]">Edit</button>
                        <button type="button" onClick={() => deleteEmergency(contact.emergency_contact_id)} className="h-9 rounded-lg border border-red-300 bg-white px-4 text-xs font-semibold uppercase text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                {renderFormToggle({
                  open: emergencyFormOpen,
                  onToggle: () => {
                    if (emergencyFormOpen && editingEmergencyId) {
                      setEditingEmergencyId(null);
                      setEmergencyForm(emptyEmergencyContact);
                    }
                    setEmergencyFormOpen(open => !open);
                  },
                  icon: editingEmergencyId ? PencilLine : AlertCircle,
                  title: 'Add Emergency Contact',
                  description: 'Open this form when you want to add or update an emergency contact.',
                  editing: Boolean(editingEmergencyId),
                })}

                {emergencyFormOpen && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <Label label="Contact Name"><input value={emergencyForm.contact_name} onChange={event => setEmergencyForm(prev => ({ ...prev, contact_name: event.target.value }))} className={inputClass} /></Label>
                      <Label label="Relationship"><input value={emergencyForm.relationship || ''} onChange={event => setEmergencyForm(prev => ({ ...prev, relationship: event.target.value }))} className={inputClass} /></Label>
                      <Label label="Phone Number"><PhoneInput value={emergencyForm.phone_number} onChange={value => setEmergencyForm(prev => ({ ...prev, phone_number: value }))} required /></Label>
                      <Label label="Email Address"><input type="email" value={emergencyForm.email_address || ''} onChange={event => setEmergencyForm(prev => ({ ...prev, email_address: event.target.value }))} className={inputClass} /></Label>
                    </div>
                    <div className="mt-7 flex flex-wrap justify-end gap-3">
                      {editingEmergencyId && <button type="button" onClick={() => { setEditingEmergencyId(null); setEmergencyForm(emptyEmergencyContact); setEmergencyFormOpen(false); }} className="h-11 rounded-lg border border-slate-300 bg-white px-6 text-xs font-semibold uppercase text-slate-600">Cancel</button>}
                      <SaveButton disabled={saving}>{editingEmergencyId ? 'Update Contact' : 'Add Contact'}</SaveButton>
                    </div>
                  </div>
                )}
              </Section>
            </form>

            <form onSubmit={submitPayment}>
              <Section id="payment-methods" title="Payment Methods" description="Save card metadata for faster checkout. Full card numbers and CVV should never be stored here.">
                <p className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-medium text-amber-800">
                  For security, save only payment metadata here. Do not enter full card numbers or CVV.
                </p>
                <div className="mb-6 grid gap-3">
                  {paymentMethods.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <WalletCards className="mx-auto text-slate-400" size={30} />
                      <p className="mt-3 text-sm font-semibold text-slate-700">No payment methods saved</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">Add a card reference to speed up payment at checkout.</p>
                    </div>
                  )}
                  {paymentMethods.map(method => (
                    <div key={method.payment_method_id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[#073b70]">{method.card_brand || 'Card'} ending {method.last_four} {method.is_default ? <span className="ml-2 rounded-full bg-emerald-100 px-2 py-1 text-[10px] uppercase text-emerald-700">Default</span> : null}</p>
                        <p className="text-xs font-medium text-slate-500">{method.cardholder_name} | Expires {String(method.expiry_month).padStart(2, '0')}/{method.expiry_year}</p>
                      </div>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setEditingPaymentId(method.payment_method_id); setPaymentFormOpen(true); setPaymentForm({ payment_type: method.payment_type, card_brand: method.card_brand || '', cardholder_name: method.cardholder_name, last_four: method.last_four, expiry_month: method.expiry_month, expiry_year: method.expiry_year, gateway_payment_method_id: method.gateway_payment_method_id || '', billing_address: method.billing_address || '', is_default: method.is_default }); }} className="h-9 rounded-lg border border-[#073b70] bg-white px-4 text-xs font-semibold uppercase text-[#073b70]">Edit</button>
                        <button type="button" onClick={() => deletePayment(method.payment_method_id)} className="h-9 rounded-lg border border-red-300 bg-white px-4 text-xs font-semibold uppercase text-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
                {renderFormToggle({
                  open: paymentFormOpen,
                  onToggle: () => {
                    if (paymentFormOpen && editingPaymentId) {
                      setEditingPaymentId(null);
                      setPaymentForm(emptyPaymentMethod);
                    }
                    setPaymentFormOpen(open => !open);
                  },
                  icon: editingPaymentId ? CreditCard : Plus,
                  title: 'Add Payment Method',
                  description: 'Open this form when you want to save or update a card reference.',
                  editing: Boolean(editingPaymentId),
                })}

                {paymentFormOpen && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="grid gap-5 md:grid-cols-4">
                      <Label label="Card Brand"><input value={paymentForm.card_brand || ''} onChange={event => setPaymentForm(prev => ({ ...prev, card_brand: event.target.value }))} className={inputClass} /></Label>
                      <Label label="Cardholder Name"><input value={paymentForm.cardholder_name} onChange={event => setPaymentForm(prev => ({ ...prev, cardholder_name: event.target.value }))} className={inputClass} /></Label>
                      <Label label="Last 4 Digits"><input value={paymentForm.last_four} onChange={event => setPaymentForm(prev => ({ ...prev, last_four: event.target.value.replace(/\D/g, '').slice(0, 4) }))} className={inputClass} inputMode="numeric" /></Label>
                      <Label label="Expiry Month"><input type="number" min="1" max="12" value={paymentForm.expiry_month} onChange={event => setPaymentForm(prev => ({ ...prev, expiry_month: Number(event.target.value) }))} className={inputClass} /></Label>
                      <Label label="Expiry Year"><input type="number" min={new Date().getFullYear()} value={paymentForm.expiry_year} onChange={event => setPaymentForm(prev => ({ ...prev, expiry_year: Number(event.target.value) }))} className={inputClass} /></Label>
                      <Label label="Gateway Token ID"><input value={paymentForm.gateway_payment_method_id || ''} onChange={event => setPaymentForm(prev => ({ ...prev, gateway_payment_method_id: event.target.value }))} className={inputClass} placeholder="Optional token/reference" /></Label>
                      <label className="flex h-11 items-center gap-3 text-sm font-medium text-slate-600 md:col-span-2"><input type="checkbox" checked={paymentForm.is_default} onChange={event => setPaymentForm(prev => ({ ...prev, is_default: event.target.checked }))} className="accent-[#073b70]" /> Set as default payment method</label>
                    </div>
                    <div className="mt-7 flex flex-wrap justify-end gap-3">
                      {editingPaymentId && <button type="button" onClick={() => { setEditingPaymentId(null); setPaymentForm(emptyPaymentMethod); setPaymentFormOpen(false); }} className="h-11 rounded-lg border border-slate-300 bg-white px-6 text-xs font-semibold uppercase text-slate-600">Cancel</button>}
                      <SaveButton disabled={saving}>{editingPaymentId ? 'Update Payment' : 'Save Payment'}</SaveButton>
                    </div>
                  </div>
                )}
              </Section>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
