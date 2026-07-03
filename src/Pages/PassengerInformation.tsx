import React, { useState, useEffect } from 'react';
import { BadgeCheck, Mail, Plane, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import type { SelectedFlightResponse, CreatePassengerRequest, Passenger } from '../Services/api';
import { passengerApi } from '../Services/api';

const steps = ['Flight', 'Passenger', 'Service', 'Payment', 'Additional Services', 'Personalized'];

const inputClass = 'h-12 w-full rounded-md border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#073b70] focus:bg-white';

const Label = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-2 block text-[10px] font-black uppercase tracking-wide text-slate-500">
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
    <h2 className="mb-7 flex items-center gap-3 text-2xl font-black text-[#073b70]">
      <span className="text-lg text-[#073b70]">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
);

const Stepper = () => (
  <div className="mx-auto grid max-w-5xl grid-cols-6 items-start gap-2 px-4 py-8">
    {steps.map((step, index) => {
      const complete = index === 0;
      const active = index === 1;

      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
          <span
            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${complete
                ? 'border-blue-600 bg-blue-600 text-white'
                : active
                  ? 'border-amber-400 bg-[#073b70] text-white'
                  : 'border-slate-300 bg-slate-100 text-slate-400'
              }`}
          >
            {complete ? <BadgeCheck size={18} /> : index + 1}
          </span>
          <span className={`text-[10px] font-black uppercase ${active || complete ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
        </div>
      );
    })}
  </div>
);

interface PassengerRouteState {
  selectedFlight?: SelectedFlightResponse['selectedFlight'];
  selectedFlightId?: string;
  returnFlight?: SelectedFlightResponse['selectedFlight'] | null;
  selectedReturnFlightId?: string | null;
  flightSearchId?: string;
  tripType?: 'ONE_WAY' | 'ROUND_TRIP';
  searchData?: {
    passengers?: string;
  };
}

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
  nextState,
}: {
  selectedFlight: SelectedFlightResponse['selectedFlight'];
  returnFlight?: SelectedFlightResponse['selectedFlight'] | null;
  nextState: PassengerRouteState;
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
      <h2 className="text-2xl font-black text-amber-300">Horizon Elite</h2>
      <Plane size={24} />
    </div>

    <div className="space-y-6 p-6">
      {flights.map(([title, flight]) => (
        <div key={title} className="border-b border-dashed border-slate-300 pb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#073b70]"><Plane size={15} /> {title}</h3>
            <span className="rounded bg-slate-200 px-2 py-1 text-[10px] font-black uppercase text-[#073b70]">{flight.cabin_class}</span>
          </div>
          <p className="text-base font-black text-[#073b70]">{flight.origin_airport_code} to {flight.destination_airport_code}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{formatFlightDate(flight.departure_datetime)}</p>
        </div>
      ))}

      <div className="space-y-3 bg-slate-100 p-4 text-sm font-bold text-slate-600">
        <div className="flex justify-between"><span>Base Fare</span><span>{currencyCode} {total.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Taxes & Fees</span><span>Included</span></div>
        <div className="flex justify-between border-t border-slate-300 pt-3 font-black text-[#073b70]"><span>Total</span><span>{currencyCode} {total.toFixed(2)}</span></div>
      </div>

      <Link to="/add-ons" state={nextState} className="flex h-14 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white shadow-md shadow-blue-950/15">
        Continue to Add-ons
      </Link>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Checkout</div>
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

  // Required passenger count based on search data
  const requiredPassengerCount = parseInt(searchData?.passengers?.split(' ')[0] || '1');

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

  const validateForm = (): boolean => {
    console.log('🔍 [PassengerInformation] Validating form data...');
    
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
    if (!formData.pi_passport_number.trim()) {
      console.warn('⚠️ Validation failed: Passport number is required');
      setErrorMessage('Passport number is required');
      return false;
    }
    if (!formData.pi_passport_expiry_date) {
      console.warn('⚠️ Validation failed: Passport expiry date is required');
      setErrorMessage('Passport expiry date is required');
      return false;
    }
    if (!formData.pi_contact_email.trim()) {
      console.warn('⚠️ Validation failed: Email is required');
      setErrorMessage('Email is required');
      return false;
    }
    if (!formData.pi_contact_phone.trim()) {
      console.warn('⚠️ Validation failed: Phone number is required');
      setErrorMessage('Phone number is required');
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
        pi_contact_phone: formData.pi_contact_phone,
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
            <Link to="/" className="text-2xl font-black tracking-wide text-[#073b70]">
              HORIZON<span className="text-amber-500">ELITE</span>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-8">
            <h1 className="mb-3 text-2xl font-black text-amber-800">No Flight Selected</h1>
            <p className="mb-6 text-sm font-semibold text-amber-700">Please select a flight before entering passenger information.</p>
            <Link to="/" className="inline-flex h-12 items-center justify-center rounded bg-[#073b70] px-6 text-sm font-black text-white">
              Back to Search
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const nextState = {
    selectedFlight,
    selectedFlightId,
    returnFlight,
    selectedReturnFlightId,
    flightSearchId,
    tripType,
    searchData,
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
          <Link to="/" className="text-2xl font-black tracking-wide text-[#073b70]">
            HORIZON<span className="text-amber-500">ELITE</span>
          </Link>
        </div>
      </header>

      <Stepper />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-7">
            <h1 className="text-4xl font-black tracking-normal text-[#073b70]">Passenger Information</h1>
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
              <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-[#073b70]">
                Passengers Added ({passengers.length}/{requiredPassengerCount})
              </h2>
              <div className="space-y-3">
                {passengers.map((passenger, index) => (
                  <div key={passenger.passenger_id} className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-black text-[#073b70]">
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
                    <input
                      type="date"
                      value={formData.pi_date_of_birth}
                      onChange={(e) => setFormData({ ...formData, pi_date_of_birth: e.target.value })}
                      className={inputClass}
                    />
                  </Label>
                  <Label label="Nationality*">
                    <select
                      value={formData.pi_nationality}
                      onChange={(e) => setFormData({ ...formData, pi_nationality: e.target.value })}
                      className={inputClass}
                    >
                      <option>Thailand</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Singapore</option>
                      <option>Vietnam</option>
                      <option>China</option>
                      <option>Japan</option>
                    </select>
                  </Label>
                  <Label label="Passenger Type">
                    <input className={inputClass} value="ADULT" readOnly />
                  </Label>
                </div>
              </Panel>

              <Panel title="Passport Information" icon={<BadgeCheck size={20} />}>
                <div className="grid gap-5 md:grid-cols-3">
                  <Label label="Passport Number*">
                    <input
                      value={formData.pi_passport_number}
                      onChange={(e) => setFormData({ ...formData, pi_passport_number: e.target.value })}
                      className={inputClass}
                      placeholder="Enter number"
                    />
                  </Label>
                  <Label label="Issuing Country*">
                    <select
                      value={formData.pi_passport_issuing_country}
                      onChange={(e) => setFormData({ ...formData, pi_passport_issuing_country: e.target.value })}
                      className={inputClass}
                    >
                      <option>Thailand</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Singapore</option>
                      <option>Vietnam</option>
                    </select>
                  </Label>
                  <Label label="Expiry Date*">
                    <input
                      type="date"
                      value={formData.pi_passport_expiry_date}
                      onChange={(e) => setFormData({ ...formData, pi_passport_expiry_date: e.target.value })}
                      className={inputClass}
                    />
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
                  </Label>
                  <Label label="Phone Number*">
                    <input
                      type="tel"
                      value={formData.pi_contact_phone}
                      onChange={(e) => setFormData({ ...formData, pi_contact_phone: e.target.value })}
                      className={inputClass}
                      placeholder="0812345678"
                    />
                  </Label>
                </div>
              </Panel>

              <div className="flex justify-center">
                <button
                  onClick={handleAddPassenger}
                  disabled={isAddingPassenger}
                  type="button"
                  className="h-12 rounded border-2 border-[#073b70] px-8 text-sm font-black uppercase tracking-wide text-[#073b70] disabled:opacity-50"
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
              className="flex h-12 w-48 items-center justify-center rounded border border-[#073b70] text-sm font-black text-[#073b70] transition hover:bg-slate-100"
            >
              ← Back to Flights
            </Link>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleContinue}
                disabled={isContinuing || passengers.length !== requiredPassengerCount}
                type="button"
                className="flex h-12 w-60 items-center justify-center rounded bg-[#073b70] text-sm font-black text-white shadow-md shadow-blue-950/20 transition hover:bg-[#0a2d51] disabled:opacity-50 disabled:cursor-not-allowed"
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

        <TripSummary selectedFlight={selectedFlight} returnFlight={returnFlight} nextState={nextState} />
      </div>
    </main>
  );
}

export default PassengerInformation;
