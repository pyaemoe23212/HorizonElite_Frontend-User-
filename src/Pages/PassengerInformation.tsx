import React, { useState, useEffect } from 'react';
import { BadgeCheck, Mail, Plane, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Link, useLocation, useNavigate } from 'react-router';
import type { SelectedFlightResponse, CreatePassengerRequest, Passenger, SavedPassenger } from '../Services/api';
import { passengerApi, profileApi } from '../Services/api';
import CountrySelect from '../components/CountrySelect';
import {
  isValidPhoneNumber,
  parsePhoneNumber,
  AsYouType,
  getCountries,
  getCountryCallingCode,
  type PhoneNumber,
} from 'libphonenumber-js';

const steps = ['Flight', 'Passenger', 'Services', 'Payment', 'Confirm'];

const inputClass = 'h-12 w-full rounded-md border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#073b70] focus:bg-white';
const isEmailStructureValid = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
const isPassportNumberValid = (passportNumber: string): boolean =>
  /^[A-Za-z0-9]{6,12}$/.test(passportNumber.trim());

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 flex min-h-7 items-end text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      {label.includes('*') ? (
        <>
          {label.replace('*', '')}
          <span className="text-red-500">*</span>
        </>
      ) : label}
    </span>
    {children}
  </label>
);

const Panel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <section className="rounded-lg border border-slate-300 bg-white p-7 shadow-sm">
    <h2 className="mb-7 flex items-center gap-3 text-2xl font-semibold text-[#073b70]">
      <span className="text-lg text-[#073b70]">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

const Stepper = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-5 items-start gap-2 px-4 py-8">
    {steps.map((step, index) => {
      const complete = index === 0;
      const active = index === 1;

      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
          <span
            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${complete
                ? 'border-blue-600 bg-blue-600 text-white'
                : active
                  ? 'border-amber-400 bg-[#073b70] text-white'
                  : 'border-slate-300 bg-slate-100 text-slate-400'
              }`}
          >
            {complete ? <BadgeCheck size={18} /> : index + 1}
          </span>
          <span className={`text-[10px] font-semibold uppercase ${active || complete ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
        </div>
      );
    })}
  </div>
);

interface CountryOption {
  flagUrl: string;
  label: string;
  name: string;
  dialCode: string;
  iso: string;
}

interface PassengerRouteState {
  selectedFlight?: SelectedFlightResponse['selectedFlight'];
  selectedFlightId?: string;
  returnFlight?: SelectedFlightResponse['selectedFlight'] | null;
  selectedReturnFlightId?: string | null;
  flightSearchId?: string;
  tripType?: 'ONE_WAY' | 'ROUND_TRIP';
  searchData?: {
    passengers?: string;
    adultCount?: number;
    childCount?: number;
    infantCount?: number;
  };
}

const toDateString = (date: Date | null) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fromDateString = (value?: string | null) => {
  if (!value) return null;
  const normalizedValue = String(value).slice(0, 10);
  const parsed = new Date(`${normalizedValue}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const todayAtStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const calculateAge = (birthDateValue: string) => {
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

const getPassengerTypeLabel = (typeCode: string) => {
  if (typeCode === 'CHD') return 'Child';
  if (typeCode === 'INF') return 'Infant';
  return 'Adult';
};

const getPassengerAgeValidationMessage = (typeCode: string, birthDateValue: string) => {
  const age = calculateAge(birthDateValue);
  if (age === null) return 'date of birth missing';
  if (typeCode === 'ADT' && age < 12) return 'not old enough for Adult';
  if (typeCode === 'CHD' && (age < 2 || age >= 12)) return 'not in Child age range';
  if (typeCode === 'INF' && age >= 2) return 'not in Infant age range';
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

  if (typeCode === 'ADT') {
    return {
      maxDate: getYearsAgoDate(12),
      minDate: addYears(todayAtStart(), -120),
    };
  }

  if (typeCode === 'CHD') {
    return {
      maxDate: getYearsAgoDate(2),
      minDate: getDateAfterYearsAgo(12),
    };
  }

  return {
    maxDate: yesterday,
    minDate: getDateAfterYearsAgo(2),
  };
};

const formatFlightDate = (value?: string) => {
  if (!value) return 'Date unavailable';
  return new Date(value).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const TripSummary = ({
  selectedFlight,
  returnFlight,
}: {
  selectedFlight: SelectedFlightResponse['selectedFlight'];
  returnFlight?: SelectedFlightResponse['selectedFlight'] | null;
}) => {
  const flights: Array<[string, SelectedFlightResponse['selectedFlight']]> = [
    ['Outbound Flight', selectedFlight],
    ...(returnFlight ? [['Return Flight', returnFlight] as [string, SelectedFlightResponse['selectedFlight']]] : []),
  ];
  const total = flights.reduce((sum, [, flight]) => sum + Number(flight.selected_fare_price || 0), 0);
  const currencyCode = selectedFlight.currency_code || returnFlight?.currency_code || 'USD';

  return (
  <aside className="h-fit rounded border border-slate-300 bg-white shadow-sm">
    <div className="flex items-center justify-between bg-[#073b70] px-6 py-5 text-white">
      <h2 className="text-2xl font-semibold text-amber-300">Horizon Elite</h2>
      <Plane size={24} />
    </div>

    <div className="space-y-6 p-6">
      {flights.map(([title, flight]) => (
        <div key={title} className="border-b border-dashed border-slate-300 pb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[#073b70]"><Plane size={15} /> {title}</h3>
            <span className="rounded bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase text-[#073b70]">{flight.cabin_class}</span>
          </div>
          <p className="text-base font-semibold text-[#073b70]">{flight.origin_airport_code} to {flight.destination_airport_code}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{formatFlightDate(flight.departure_datetime)}</p>
        </div>
      ))}

      <div className="space-y-3 bg-slate-100 p-4 text-sm font-medium text-slate-600">
        <div className="flex justify-between"><span>Base Fare</span><span>{currencyCode} {total.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Taxes & Fees</span><span>Included</span></div>
        <div className="flex justify-between border-t border-slate-300 pt-3 font-semibold text-[#073b70]"><span>Total</span><span>{currencyCode} {total.toFixed(2)}</span></div>
      </div>

      <div className="rounded bg-blue-50 p-4 text-sm font-semibold text-[#073b70]">
        Add all passenger details to continue to add-ons.
      </div>

      <div className="text-center text-[10px] font-semibold uppercase tracking-widest text-slate-400">Secure Checkout</div>
    </div>
  </aside>
  );
};

function PassengerInformation(): React.JSX.Element {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    selectedFlight,
    selectedFlightId,
    returnFlight = null,
    selectedReturnFlightId = null,
    flightSearchId,
    tripType = 'ONE_WAY',
    searchData,
  } = (state ?? {}) as PassengerRouteState;

  // Form state
  const [formData, setFormData] = useState({
    pi_title: 'Mr',
    pi_first_name: '',
    pi_middle_name: '',
    pi_last_name: '',
    pi_gender: 'M',
    pi_date_of_birth: '',
    pi_nationality: 'Thailand',
    pi_passenger_type_code: 'ADT',
    pi_passport_number: '',
    pi_passport_issuing_country: 'Thailand',
    pi_passport_expiry_date: '',
    pi_contact_email: '',
    pi_contact_phone: '',
  });

  // Passengers list
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isAddingPassenger, setIsAddingPassenger] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [savedPassengers, setSavedPassengers] = useState<SavedPassenger[]>([]);
  const [savedPassengerId, setSavedPassengerId] = useState('');
  const [savedPassengersLoading, setSavedPassengersLoading] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState('TH');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [parsedPhone, setParsedPhone] = useState<PhoneNumber | null>(null);
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);

  // Required passenger count based on search data
  const passengerCountFromLabel = parseInt(searchData?.passengers?.split(' ')[0] || '1');
  const providedAdultCount = Number(searchData?.adultCount ?? 0);
  const providedChildCount = Number(searchData?.childCount ?? 0);
  const providedInfantCount = Number(searchData?.infantCount ?? 0);
  const providedPassengerTotal = providedAdultCount + providedChildCount + providedInfantCount;
  const requiredPassengerCount = providedPassengerTotal > 0 ? providedPassengerTotal : passengerCountFromLabel;
  const adultCount = providedPassengerTotal > 0 ? providedAdultCount : requiredPassengerCount;
  const childCount = providedPassengerTotal > 0 ? providedChildCount : 0;
  const infantCount = providedPassengerTotal > 0 ? providedInfantCount : 0;

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

  const nextPassengerType = React.useMemo(() => {
    const addedAdults = passengers.filter(p => p.pi_passenger_type_code === 'ADT').length;
    const addedChildren = passengers.filter(p => p.pi_passenger_type_code === 'CHD').length;
    const addedInfants = passengers.filter(p => p.pi_passenger_type_code === 'INF').length;

    if (addedAdults < adultCount) return 'ADT';
    if (addedChildren < childCount) return 'CHD';
    if (addedInfants < infantCount) return 'INF';
    return 'ADT';
  }, [adultCount, childCount, infantCount, passengers]);
  const nextPassengerTypeIndex = React.useMemo(() => {
    return passengers.filter(p => p.pi_passenger_type_code === nextPassengerType).length + 1;
  }, [nextPassengerType, passengers]);
  const birthDateRange = React.useMemo(
    () => getBirthDateRangeForType(formData.pi_passenger_type_code),
    [formData.pi_passenger_type_code]
  );
  const compatibleSavedPassengers = React.useMemo(
    () => savedPassengers.filter(savedPassenger => (
      !getPassengerAgeValidationMessage(
        formData.pi_passenger_type_code,
        toDateString(fromDateString(savedPassenger.date_of_birth))
      )
    )),
    [formData.pi_passenger_type_code, savedPassengers]
  );

  // ✈️ LOG: Page initialization
  useEffect(() => {
    console.log('🎫 [PassengerInformation] Page loaded');
    console.log('✈️ Flight Details:', {
      outbound: selectedFlight ? `${selectedFlight.origin_airport_code} → ${selectedFlight.destination_airport_code}` : 'N/A',
      return: returnFlight ? `${returnFlight.origin_airport_code} → ${returnFlight.destination_airport_code}` : 'N/A',
      tripType,
    });
    console.log(`👥 Required Passengers: ${requiredPassengerCount}`);
    console.log('🔍 Search Data:', searchData);
  }, []);

  // ✈️ LOG: Passengers list changes
  useEffect(() => {
    console.log(`📊 [PassengerInformation] Passengers state updated: ${passengers.length}/${requiredPassengerCount}`);
    if (passengers.length > 0) {
      console.log('Current passengers:');
      passengers.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.pi_title} ${p.pi_first_name} ${p.pi_last_name} (ID: ${p.passenger_id})`);
      });
    }
  }, [passengers]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, pi_passenger_type_code: nextPassengerType }));
  }, [nextPassengerType]);

  useEffect(() => {
    let cancelled = false;

    const loadSavedPassengers = async () => {
      if (!localStorage.getItem('jwt_token')) return;

      try {
        setSavedPassengersLoading(true);
        const response = await profileApi.getSavedPassengers();
        if (!cancelled) {
          setSavedPassengers(response);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Could not load saved passengers:', error);
        }
      } finally {
        if (!cancelled) {
          setSavedPassengersLoading(false);
        }
      }
    };

    loadSavedPassengers();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!selectedFlight) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-800">
        <header className="bg-[#073b70] text-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <Link to="/" className="text-2xl font-semibold tracking-wide">
              HORIZON<span className="text-amber-400">ELITE</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-8 text-center">
            <p className="mb-3 text-lg font-semibold text-amber-800">No Flight Selection Found</p>
            <p className="mb-6 text-sm font-semibold text-amber-700">
              Please choose a flight before adding passenger information.
            </p>
            <Link to="/" className="inline-flex h-11 items-center justify-center rounded bg-[#073b70] px-6 text-sm font-semibold text-white">
              Back to Flight Search
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const validatePhone = (number: string, iso: string): boolean => {
    if (!number.trim()) {
      setPhoneError('Phone number is required');
      setParsedPhone(null);
      return false;
    }

    const dialCode = countryOptions.find(c => c.iso === iso)?.dialCode ?? '';
    if (!isValidPhoneNumber(dialCode + number, iso as any)) {
      setPhoneError('Please enter a valid phone number for the selected country');
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
    setFormData(prev => ({ ...prev, pi_contact_phone: '' }));
  };

  const applySavedPassenger = (passengerId: string) => {
    setSavedPassengerId(passengerId);
    setErrorMessage('');
    setSuccessMessage('');

    if (!passengerId) {
      setFormData(prev => ({
        ...prev,
        pi_title: 'Mr',
        pi_first_name: '',
        pi_middle_name: '',
        pi_last_name: '',
        pi_gender: 'M',
        pi_date_of_birth: '',
        pi_nationality: 'Thailand',
        pi_passport_number: '',
        pi_passport_issuing_country: 'Thailand',
        pi_passport_expiry_date: '',
        pi_contact_email: '',
        pi_contact_phone: '',
      }));
      setPhoneCountry('TH');
      setPhoneNumber('');
      setParsedPhone(null);
      setPhoneError('');
      return;
    }

    const savedPassenger = savedPassengers.find(passenger => passenger.saved_passenger_id === passengerId);
    if (!savedPassenger) return;

    const typeMismatchMessage = getPassengerAgeValidationMessage(
      formData.pi_passenger_type_code,
      toDateString(fromDateString(savedPassenger.date_of_birth))
    );
    if (typeMismatchMessage) {
      setSavedPassengerId('');
      setErrorMessage(`Please choose a saved ${getPassengerTypeLabel(formData.pi_passenger_type_code)} passenger or enter details manually.`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      pi_title: savedPassenger.title || 'Mr',
      pi_first_name: savedPassenger.first_name || '',
      pi_middle_name: savedPassenger.middle_name || '',
      pi_last_name: savedPassenger.last_name || '',
      pi_gender: savedPassenger.gender || 'M',
      pi_date_of_birth: toDateString(fromDateString(savedPassenger.date_of_birth)),
      pi_nationality: savedPassenger.nationality || 'Thailand',
      pi_passenger_type_code: prev.pi_passenger_type_code,
      pi_passport_number: savedPassenger.passport_number || '',
      pi_passport_issuing_country: savedPassenger.passport_issuing_country || 'Thailand',
      pi_passport_expiry_date: toDateString(fromDateString(savedPassenger.passport_expiry_date || '')),
      pi_contact_email: savedPassenger.contact_email || '',
      pi_contact_phone: savedPassenger.contact_phone || '',
    }));

    if (savedPassenger.contact_phone) {
      try {
        const parsed = parsePhoneNumber(savedPassenger.contact_phone);
        setPhoneCountry((parsed.country || 'TH') as string);
        setPhoneNumber(parsed.nationalNumber);
        setParsedPhone(parsed);
        setPhoneError('');
      } catch {
        setPhoneNumber(savedPassenger.contact_phone);
        setParsedPhone(null);
      }
    }

    setSuccessMessage(`${savedPassenger.first_name} ${savedPassenger.last_name} loaded from your profile. You can edit the details before adding.`);
  };

  const validateForm = (): boolean => {
    console.log('🔍 [PassengerInformation] Validating form data...');
    const today = todayAtStart();
    const birthDate = fromDateString(formData.pi_date_of_birth);
    const passportExpiryDate = fromDateString(formData.pi_passport_expiry_date);
    const age = calculateAge(formData.pi_date_of_birth);
    
    if (!formData.pi_first_name.trim()) {
      console.warn('⚠️ Validation failed: First name is required');
      setErrorMessage('First name is required');
      return false;
    }
    if (!formData.pi_last_name.trim()) {
      console.warn('⚠️ Validation failed: Last name is required');
      setErrorMessage('Last name is required');
      return false;
    }
    if (!formData.pi_date_of_birth) {
      console.warn('⚠️ Validation failed: Date of birth is required');
      setErrorMessage('Date of birth is required');
      return false;
    }
    if (!birthDate || birthDate >= today) {
      console.warn('⚠️ Validation failed: Date of birth must be in the past');
      setErrorMessage('Date of birth must be a past date');
      return false;
    }
    if (formData.pi_passenger_type_code === 'ADT' && (age === null || age < 12)) {
      console.warn('⚠️ Validation failed: Adult passenger is under 12');
      setErrorMessage('Adult passengers must be at least 12 years old');
      return false;
    }
    if (formData.pi_passenger_type_code === 'CHD' && (age === null || age < 2 || age >= 12)) {
      console.warn('⚠️ Validation failed: Child passenger age is outside 2-11');
      setErrorMessage('Child passengers must be between 2 and 11 years old');
      return false;
    }
    if (formData.pi_passenger_type_code === 'INF' && (age === null || age >= 2)) {
      console.warn('⚠️ Validation failed: Infant passenger is 2 or older');
      setErrorMessage('Infant passengers must be under 2 years old');
      return false;
    }
    if (!formData.pi_passport_number.trim()) {
      console.warn('⚠️ Validation failed: Passport number is required');
      setErrorMessage('Passport number is required');
      return false;
    }
    if (!isPassportNumberValid(formData.pi_passport_number)) {
      setErrorMessage('Passport number must be 6 to 12 letters or numbers');
      return false;
    }
    if (!formData.pi_passport_expiry_date) {
      console.warn('⚠️ Validation failed: Passport expiry date is required');
      setErrorMessage('Passport expiry date is required');
      return false;
    }
    if (!passportExpiryDate || passportExpiryDate <= today) {
      console.warn('⚠️ Validation failed: Passport expiry date must be in the future');
      setErrorMessage('Passport expiry date must be a future date');
      return false;
    }
    const minimumRecommendedPassportExpiry = new Date(today);
    minimumRecommendedPassportExpiry.setMonth(minimumRecommendedPassportExpiry.getMonth() + 6);
    if (passportExpiryDate < minimumRecommendedPassportExpiry) {
      setErrorMessage('Passport should be valid for at least 6 months from today');
      return false;
    }
    if (!formData.pi_contact_email.trim()) {
      console.warn('⚠️ Validation failed: Email is required');
      setErrorMessage('Email is required');
      return false;
    }
    if (!isEmailStructureValid(formData.pi_contact_email)) {
      setErrorMessage('Please enter a valid passenger contact email');
      return false;
    }
    if (!phoneNumber.trim()) {
      console.warn('⚠️ Validation failed: Phone number is required');
      setErrorMessage('Phone number is required');
      return false;
    }
    if (!validatePhone(phoneNumber, phoneCountry)) {
      setErrorMessage('Please enter a valid phone number for the selected country');
      return false;
    }
    
    console.log('✅ Form validation passed');
    return true;
  };

  const handleAddPassenger = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) return;

    if (passengers.length >= requiredPassengerCount) {
      setErrorMessage(`Maximum ${requiredPassengerCount} passengers allowed`);
      return;
    }

    if (!selectedFlightId) {
      setErrorMessage('Selected flight data missing. Please select your flight again.');
      return;
    }

    try {
      setIsAddingPassenger(true);
      const parsedContactPhone = parsePhoneNumber(phoneNumber, phoneCountry as any);

      const request: CreatePassengerRequest = {
        selected_flight_id: selectedFlightId,
        pi_title: formData.pi_title,
        pi_first_name: formData.pi_first_name,
        pi_middle_name: formData.pi_middle_name || undefined,
        pi_last_name: formData.pi_last_name,
        pi_gender: formData.pi_gender as 'M' | 'F' | 'X',
        pi_date_of_birth: formData.pi_date_of_birth,
        pi_nationality: formData.pi_nationality,
        pi_passenger_type_code: formData.pi_passenger_type_code as 'ADT' | 'CHD' | 'INF',
        pi_passport_number: formData.pi_passport_number,
        pi_passport_issuing_country: formData.pi_passport_issuing_country,
        pi_passport_expiry_date: formData.pi_passport_expiry_date,
        pi_contact_email: formData.pi_contact_email,
        pi_contact_phone: parsedContactPhone.format('E.164'),
      };

      // ✈️ LOG: Passenger data being sent to API
      console.log('🛫 [PassengerInformation] Sending passenger #' + (passengers.length + 1) + ' to POST /api/passengers');
      console.log('📋 Request Data:', request);

      const response = await passengerApi.createPassenger(request);

      // ✈️ LOG: Full API response
      console.log('✅ [PassengerInformation] API Response received:', response);
      console.log('👤 Passenger ID:', response.passenger.passenger_id);
      console.log('👨‍👩‍👧‍👦 Created Passenger Object:', response.passenger);

      // Add to passengers list
      const updatedPassengers = [...passengers, response.passenger];
      setPassengers(updatedPassengers);

      // ✈️ LOG: Summary of passengers added so far
      console.log(`📊 [PassengerInformation] Passenger Summary (${updatedPassengers.length}/${requiredPassengerCount}):`);
      updatedPassengers.forEach((p, idx) => {
        console.log(`   ${idx + 1}. ${p.pi_title} ${p.pi_first_name} ${p.pi_last_name} (ID: ${p.passenger_id})`);
      });

      setSuccessMessage(`${response.passenger.pi_first_name} ${response.passenger.pi_last_name} added successfully`);

      // Reset form
      setFormData({
        pi_title: 'Mr',
        pi_first_name: '',
        pi_middle_name: '',
        pi_last_name: '',
        pi_gender: 'M',
        pi_date_of_birth: '',
        pi_nationality: 'Thailand',
        pi_passenger_type_code: 'ADT',
        pi_passport_number: '',
        pi_passport_issuing_country: 'Thailand',
        pi_passport_expiry_date: '',
        pi_contact_email: '',
        pi_contact_phone: '',
      });
      setPhoneNumber('');
      setPhoneError('');
      setParsedPhone(null);
      setSavedPassengerId('');

      // ✈️ LOG: Form reset
      console.log('🔄 [PassengerInformation] Form reset for next passenger');

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // ✈️ LOG: Error with passenger data
      console.error('❌ [PassengerInformation] Failed to add passenger #' + (passengers.length + 1));
      console.error('💥 Error Message:', error instanceof Error ? error.message : String(error));
      console.error('📋 Passenger Data That Failed:', {
        pi_first_name: formData.pi_first_name,
        pi_last_name: formData.pi_last_name,
        pi_email: formData.pi_contact_email,
        pi_passenger_type_code: formData.pi_passenger_type_code,
      });
      console.error('Full Error Object:', error);

      setErrorMessage(error instanceof Error ? error.message : 'Failed to add passenger');
    } finally {
      setIsAddingPassenger(false);
    }
  };

  const handleRemovePassenger = (passengerId: string) => {
    console.log('🗑️ [PassengerInformation] Removing passenger with ID:', passengerId);
    const updatedPassengers = passengers.filter(p => p.passenger_id !== passengerId);
    setPassengers(updatedPassengers);
    console.log(`📊 Remaining passengers: ${updatedPassengers.length}/${requiredPassengerCount}`);
    updatedPassengers.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.pi_title} ${p.pi_first_name} ${p.pi_last_name} (ID: ${p.passenger_id})`);
    });
  };

  const handleContinue = async () => {
    if (passengers.length !== requiredPassengerCount) {
      setErrorMessage(`Please add ${requiredPassengerCount} passenger(s) before continuing`);
      return;
    }

    try {
      setIsContinuing(true);
      setErrorMessage('');

      // ✈️ LOG: Continue button clicked
      console.log('▶️ [PassengerInformation] Continue button clicked');
      console.log(`✅ All passengers added (${passengers.length}/${requiredPassengerCount})`);
      console.log('👥 Final Passenger List:', passengers);

      const nextState = {
        selectedFlight,
        selectedFlightId,
        returnFlight,
        selectedReturnFlightId,
        flightSearchId,
        tripType,
        searchData,
        passengerIds: passengers.map(p => p.passenger_id),
        passengers,
      };

      // ✈️ LOG: Navigation state being passed
      console.log('📤 Passing to Add-ons page with state:', nextState);
      console.log('🛫 Passenger IDs for booking:', nextState.passengerIds);

      navigate('/add-ons', { state: nextState });
    } catch (error) {
      console.error('❌ [PassengerInformation] Failed to continue to Add-ons:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to continue');
    } finally {
      setIsContinuing(false);
    }
  };

  if (!selectedFlight || !selectedFlightId) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-800">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
            <Link to="/" className="text-2xl font-semibold tracking-wide text-[#073b70]">
              HORIZON<span className="text-amber-500">ELITE</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-8">
            <h1 className="mb-3 text-2xl font-semibold text-amber-800">No Flight Selected</h1>
            <p className="mb-6 text-sm font-semibold text-amber-700">Please select a flight before entering passenger information.</p>
            <Link to="/" className="inline-flex h-12 items-center justify-center rounded bg-[#073b70] px-6 text-sm font-semibold text-white">
              Back to Search
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
          <Link to="/" className="text-2xl font-semibold tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
        </div>
      </header>

      <Stepper />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-7">
            <h1 className="text-4xl font-semibold tracking-normal text-[#073b70]">Passenger Information</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Add {requiredPassengerCount} passenger(s) for {selectedFlight.origin_airport_code} to {selectedFlight.destination_airport_code}.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-sm font-semibold text-green-700">
              ✅ {successMessage}
            </div>
          )}

          {/* Passengers Added */}
          {passengers.length > 0 && (
            <div className="mb-8 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#073b70]">
                Passengers Added ({passengers.length}/{requiredPassengerCount})
              </h2>
              <div className="space-y-3">
                {passengers.map((passenger, index) => (
                  <div key={passenger.passenger_id} className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#073b70]">
                          {passenger.pi_title} {passenger.pi_first_name} {passenger.pi_last_name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          DOB: {new Date(passenger.pi_date_of_birth).toLocaleDateString()} • {passenger.pi_nationality}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePassenger(passenger.passenger_id)}
                      className="rounded-full p-2 text-red-600 hover:bg-red-100"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Passenger Form */}
          {passengers.length < requiredPassengerCount && (
            <div className="space-y-8">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Passenger {passengers.length + 1} of {requiredPassengerCount}
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#073b70]">
                  {getPassengerTypeLabel(formData.pi_passenger_type_code)} {nextPassengerTypeIndex}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  This passenger type is detected from your search selection: {adultCount} adult(s), {childCount} child(ren), {infantCount} infant(s).
                </p>
              </div>

              <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#073b70]">Passenger Source</p>
                    <p className="mb-4 text-xs font-semibold text-slate-500">
                      Select a saved passenger to auto-fill the form, or leave manual entry selected.
                    </p>
                    <select
                      value={savedPassengerId}
                      onChange={(event) => applySavedPassenger(event.target.value)}
                      className={inputClass}
                      disabled={savedPassengersLoading}
                    >
                      <option value="">{savedPassengersLoading ? 'Loading saved passengers...' : 'Enter manually'}</option>
                      {compatibleSavedPassengers.map(savedPassenger => (
                        <option key={savedPassenger.saved_passenger_id} value={savedPassenger.saved_passenger_id}>
                          {savedPassenger.first_name} {savedPassenger.last_name} - {savedPassenger.relationship} ({getPassengerTypeLabel(savedPassenger.passenger_type_code)})
                        </option>
                      ))}
                    </select>
                    {!savedPassengersLoading && savedPassengers.length > 0 && compatibleSavedPassengers.length === 0 && (
                      <p className="mt-2 text-xs font-semibold text-amber-700">
                        No saved {getPassengerTypeLabel(formData.pi_passenger_type_code).toLowerCase()} passengers match this slot. Enter manually or update Passenger Management.
                      </p>
                    )}
                  </div>
                  <Link
                    to="/profile#passenger-management"
                    className="flex h-12 items-center justify-center rounded border border-[#073b70] px-5 text-xs font-semibold uppercase tracking-wide text-[#073b70]"
                  >
                    Manage Saved Passengers
                  </Link>
                </div>
              </div>

              <Panel title="Personal Information" icon={<BadgeCheck size={20} />}>
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Title*">
                    <select
                      value={formData.pi_title}
                      onChange={(e) => setFormData({ ...formData, pi_title: e.target.value })}
                      className={inputClass}
                    >
                      <option>Mr</option>
                      <option>Mrs</option>
                      <option>Ms</option>
                      <option>Miss</option>
                    </select>
                  </Label>
                  <Label label="First Name*">
                    <input
                      value={formData.pi_first_name}
                      onChange={(e) => setFormData({ ...formData, pi_first_name: e.target.value })}
                      className={inputClass}
                      placeholder="As per passport"
                    />
                  </Label>
                  <Label label="Middle Name">
                    <input
                      value={formData.pi_middle_name}
                      onChange={(e) => setFormData({ ...formData, pi_middle_name: e.target.value })}
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </Label>
                  <Label label="Last Name*">
                    <input
                      value={formData.pi_last_name}
                      onChange={(e) => setFormData({ ...formData, pi_last_name: e.target.value })}
                      className={inputClass}
                      placeholder="As per passport"
                    />
                  </Label>
                  <Label label="Gender*">
                    <div className="flex h-12 items-center gap-5 text-sm font-semibold text-slate-600">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value="M"
                          checked={formData.pi_gender === 'M'}
                          onChange={() => setFormData({ ...formData, pi_gender: 'M' })}
                        />
                        Male
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value="F"
                          checked={formData.pi_gender === 'F'}
                          onChange={() => setFormData({ ...formData, pi_gender: 'F' })}
                        />
                        Female
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value="X"
                          checked={formData.pi_gender === 'X'}
                          onChange={() => setFormData({ ...formData, pi_gender: 'X' })}
                        />
                        Other
                      </label>
                    </div>
                  </Label>
                  <span className="hidden md:block" />
                  <Label label="Date of Birth*">
                    <DatePicker
                      selected={fromDateString(formData.pi_date_of_birth)}
                      onChange={(date: Date | null) => setFormData({ ...formData, pi_date_of_birth: toDateString(date) })}
                      className={inputClass}
                      placeholderText="Select date of birth"
                      dateFormat="dd MMM yyyy"
                      minDate={birthDateRange.minDate}
                      maxDate={birthDateRange.maxDate}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </Label>
                  <Label label="Nationality*">
                    <CountrySelect
                      value={formData.pi_nationality}
                      onChange={(country) => setFormData({ ...formData, pi_nationality: country })}
                      className={inputClass}
                      placeholder="Select nationality"
                    />
                  </Label>
                  <Label label="Passenger Type">
                    <input className={inputClass} value={getPassengerTypeLabel(formData.pi_passenger_type_code)} readOnly />
                  </Label>
                </div>
              </Panel>

              <Panel title="Contact Information" icon={<Mail size={20} />}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Label label="Email Address*">
                    <input
                      type="email"
                      value={formData.pi_contact_email}
                      onChange={(e) => setFormData({ ...formData, pi_contact_email: e.target.value })}
                      className={inputClass}
                      placeholder="example@email.com"
                    />
                    {formData.pi_contact_email && !isEmailStructureValid(formData.pi_contact_email) && (
                      <p className="mt-1 text-xs font-semibold text-red-500">Enter a valid email address.</p>
                    )}
                  </Label>
                  <Label label="Phone Number*">
                    <div className="flex gap-3">
                      <div className="relative w-48">
                        <button
                          type="button"
                          onClick={() => setIsCountryListOpen(open => !open)}
                          className="flex h-12 w-full items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 text-left text-sm font-semibold text-slate-800 outline-none transition focus:border-[#073b70] focus:bg-white"
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
                              {selectedCountry ? `${selectedCountry.iso} (${selectedCountry.dialCode})` : 'Country'}
                            </span>
                          </span>
                          <span className="ml-2 text-xs text-slate-500">▼</span>
                        </button>

                        {isCountryListOpen && (
                          <div
                            className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto rounded border border-slate-300 bg-white p-2 shadow-2xl"
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
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        onBlur={() => validatePhone(phoneNumber, phoneCountry)}
                        className={`${inputClass} flex-1 ${phoneError ? 'border-red-500 focus:border-red-600' : ''}`}
                        placeholder="Phone number"
                      />
                    </div>
                    {phoneError && (
                      <p className="mt-1 text-xs font-semibold text-red-500">{phoneError}</p>
                    )}
                    {parsedPhone && !phoneError && (
                      <p className="mt-1 text-xs font-semibold text-green-600">{parsedPhone.formatInternational()}</p>
                    )}
                  </Label>
                </div>
              </Panel>

              <Panel title="Passport Information" icon={<BadgeCheck size={20} />}>
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Passport Number*">
                    <input
                      value={formData.pi_passport_number}
                      onChange={(e) => setFormData({ ...formData, pi_passport_number: e.target.value.toUpperCase() })}
                      className={inputClass}
                      placeholder="Enter number"
                    />
                    {formData.pi_passport_number && !isPassportNumberValid(formData.pi_passport_number) && (
                      <p className="mt-1 text-xs font-semibold text-red-500">Use 6 to 12 letters or numbers.</p>
                    )}
                  </Label>
                  <Label label="Issuing Country*">
                    <CountrySelect
                      value={formData.pi_passport_issuing_country}
                      onChange={(country) => setFormData({ ...formData, pi_passport_issuing_country: country })}
                      className={inputClass}
                      placeholder="Select issuing country"
                    />
                  </Label>
                  <Label label="Expiry Date*">
                    <DatePicker
                      selected={fromDateString(formData.pi_passport_expiry_date)}
                      onChange={(date: Date | null) => setFormData({ ...formData, pi_passport_expiry_date: toDateString(date) })}
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
              </Panel>

              <div className="flex justify-center">
                <button
                  onClick={handleAddPassenger}
                  disabled={isAddingPassenger}
                  type="button"
                  className="h-12 rounded border-2 border-[#073b70] px-8 text-sm font-semibold uppercase tracking-wide text-[#073b70] disabled:opacity-50"
                >
                  {isAddingPassenger ? '⏳ Adding...' : 'Add Passenger'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/flight-results"
              className="flex h-12 w-48 items-center justify-center rounded border border-[#073b70] text-sm font-semibold text-[#073b70] transition hover:bg-slate-100"
            >
              ← Back to Flights
            </Link>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleContinue}
                disabled={isContinuing || passengers.length !== requiredPassengerCount}
                type="button"
                className="flex h-12 w-60 items-center justify-center rounded bg-[#073b70] text-sm font-semibold text-white shadow-md shadow-blue-950/20 transition hover:bg-[#0a2d51] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isContinuing ? '⏳ Processing...' : 'Save & Continue →'}
              </button>
              {passengers.length !== requiredPassengerCount && (
                <span className="text-xs font-semibold text-slate-500">
                  {passengers.length}/{requiredPassengerCount} passengers added
                </span>
              )}
            </div>
          </div>
        </section>

        <TripSummary selectedFlight={selectedFlight} returnFlight={returnFlight} />
      </div>
    </main>
  );
}

export default PassengerInformation;
