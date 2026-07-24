import React, { useEffect, useState } from 'react';
import { BadgeCheck, CreditCard, Plane } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { addonApi, duffelOrderApi, paymentApi, profileApi, type CreatePaymentRequest, type SavedPaymentMethod } from '../Services/api';
import { useAuth } from '../contexts/useAuth';

type PaymentMethod = 'card' | 'qr' | 'banking' | 'wallet';
type PaymentProvider = string;

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  acceptedTerms: boolean;
}

type CardErrors = Partial<Record<keyof CardDetails, string>>;

interface PaymentRouteState {
  pnrReference?: string;
  booking?: any;
  booking_id?: string;
  user_email_address?: string;
  totalPaymentAmount?: string | number;
  currency_code?: string;
  outboundFlight?: any;
  inboundFlight?: any;
  selectedFlight?: any;
  returnFlight?: any;
  passengers?: any[];
  selectedAddons?: any[];
  pendingAddonIds?: string[];
  addOnsTotal?: number;
  postBookingAddonPayment?: boolean;
}

const PRIMARY_CURRENCY_CODE = 'USD';
const PAYMENT_CHECKOUT_STATE_KEY = 'horizon_elite_checkout_state';

const readSavedPaymentCheckoutState = (): PaymentRouteState => {
  try {
    const savedState = window.sessionStorage.getItem(PAYMENT_CHECKOUT_STATE_KEY);
    return savedState ? JSON.parse(savedState) as PaymentRouteState : {};
  } catch {
    return {};
  }
};

const hasUsablePaymentState = (state?: PaymentRouteState) => {
  return Boolean(
    state?.pnrReference &&
    (state.totalPaymentAmount || state.booking_id || state.booking?.booking_id)
  );
};

const parseAmount = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getFlightAmount = (flight: any): number => {
  if (!flight) return 0;
  return (
    parseAmount(flight.selected_fare_price) ||
    parseAmount(flight.total_price) ||
    parseAmount(flight.total_amount) ||
    0
  );
};

const calculateTotalAmount = (state?: PaymentRouteState): number => {
  const passedAmount = parseAmount(state?.totalPaymentAmount);
  const outbound = state?.outboundFlight || state?.selectedFlight;
  const inbound = state?.inboundFlight || state?.returnFlight;

  // Prefer the passed amount only when it is a positive number.
  if (passedAmount > 0) return passedAmount;

  const outboundAmount = getFlightAmount(outbound);
  const inboundAmount = getFlightAmount(inbound);

  return outboundAmount + inboundAmount;
};

const getPaymentTokenForMethod = (method: PaymentMethod): string => {
  const testTokens: Record<PaymentMethod, string> = {
    card: 'tokn_test_visa',
    qr: 'tokn_test_promptpay',
    banking: 'tokn_test_mobile_banking',
    wallet: 'tokn_test_ewallet',
  };

  return testTokens[method];
};

const getErrorStatus = (error: any): number | undefined => {
  return error?.response?.status || error?.status || error?.statusCode;
};

const getErrorMessage = (error: any): string => {
  const responseData = error?.responseData || error?.response?.data;
  const detailMessages = Array.isArray(responseData?.details?.errors)
    ? responseData.details.errors.map((item: any) => item.message || item.title || item.code).filter(Boolean).join(', ')
    : Array.isArray(responseData?.details)
      ? responseData.details.join(', ')
      : typeof responseData?.details === 'string'
        ? responseData.details
        : '';

  return (
    detailMessages ||
    responseData?.error ||
    responseData?.message ||
    error?.responseData?.message ||
    error?.responseData?.error ||
    error?.message ||
    ''
  );
};

const isOfferUnavailableError = (error: any): boolean => {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error).toLowerCase();

  return (
    status === 409 ||
    message.includes('offer is no longer available') ||
    message.includes('no longer available')
  );
};

const getDuffelRequestId = (error: any): string | undefined => {
  return (
    error?.responseData?.duffel_request_id ||
    error?.responseData?.details?.meta?.request_id ||
    error?.details?.meta?.request_id ||
    error?.response?.data?.duffel_request_id ||
    error?.response?.data?.details?.meta?.request_id
  );
};

const getTicketingIssueMessage = (error: any): string => {
  const requestId = getDuffelRequestId(error);
  const baseMessage =
    error?.responseData?.retryable || [503, 504].includes(getErrorStatus(error) || 0)
      ? 'Payment succeeded, but Duffel is temporarily unavailable. Ticketing is pending and can be retried without charging again.'
      : getErrorMessage(error) || 'Payment succeeded, but ticket order creation failed.';

  return requestId
    ? `${baseMessage} Duffel request ID: ${requestId}.`
    : baseMessage;
};

const OFFER_UNAVAILABLE_MESSAGE =
  'This flight price is no longer available. Please run a new flight search and choose another flight.';
const newBookingSteps = ['Flight', 'Passenger', 'Services', 'Payment', 'Confirm'];
const addOnPaymentSteps = ['Manage', 'Add-ons', 'Payment', 'Done'];

const methods: Array<{ id: PaymentMethod; title: string; subtitle: string; icon: string }> = [
  { id: 'card', title: 'Credit / Debit Card', subtitle: 'Mastercard / Visa', icon: 'CARD' },
  { id: 'qr', title: 'Thai QR / PromptPay', subtitle: 'Scan with banking app', icon: 'QR' },
  { id: 'banking', title: 'Mobile Banking', subtitle: 'Pay through bank apps', icon: 'BANK' },
  { id: 'wallet', title: 'eWallet', subtitle: 'Supported wallets', icon: 'WALLET' },
];

const inputClass = 'h-14 w-full rounded border border-slate-300 bg-white px-5 text-lg text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#073b70]';
const errorInputClass = 'border-red-500 focus:border-red-600';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatCardNumber = (value: string) => onlyDigits(value).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

const formatExpiryDate = (value: string) => {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const getCardBrand = (cardNumber: string) => {
  const digits = onlyDigits(cardNumber);
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^(6011|65|64[4-9])/.test(digits)) return 'Discover';
  return 'Card';
};

const formatSavedCardExpiry = (method: SavedPaymentMethod) => {
  const month = String(method.expiry_month).padStart(2, '0');
  const year = String(method.expiry_year).slice(-2);
  return `${month}/${year}`;
};

const CardBrandLogo = ({ brand, compact = false }: { brand: string; compact?: boolean }) => {
  if (brand === 'Mastercard') {
    return (
      <span className={`inline-flex items-center ${compact ? 'h-8 w-12' : 'h-12 w-20'} justify-center`} aria-label="Mastercard">
        <span className={`${compact ? 'h-7 w-7' : 'h-10 w-10'} rounded-full bg-red-500`} />
        <span className={`${compact ? '-ml-3 h-7 w-7' : '-ml-4 h-10 w-10'} rounded-full bg-amber-400 opacity-90`} />
      </span>
    );
  }

  if (brand === 'Visa') {
    return (
      <span className={`inline-flex ${compact ? 'h-8 w-14 text-lg' : 'h-12 w-24 text-4xl'} items-center justify-center rounded bg-white font-semibold italic text-[#173f8a] shadow-sm`} aria-label="Visa">
        VISA
      </span>
    );
  }

  if (brand === 'American Express') {
    return (
      <span className={`inline-flex ${compact ? 'h-8 w-14 text-[10px]' : 'h-12 w-24 text-sm'} items-center justify-center rounded bg-[#2e77bb] font-semibold leading-none text-white shadow-sm`} aria-label="American Express">
        AMEX
      </span>
    );
  }

  if (brand === 'Discover') {
    return (
      <span className={`inline-flex ${compact ? 'h-8 w-16 text-[10px]' : 'h-12 w-28 text-sm'} items-center justify-center rounded bg-gradient-to-r from-slate-900 via-orange-500 to-slate-900 font-semibold text-white shadow-sm`} aria-label="Discover">
        DISCOVER
      </span>
    );
  }

  return (
    <span className={`inline-flex ${compact ? 'h-8 w-12 text-[10px]' : 'h-12 w-20 text-xs'} items-center justify-center rounded border border-slate-300 bg-white font-semibold text-slate-500`} aria-label="Card">
      CARD
    </span>
  );
};

const passesLuhn = (cardNumber: string) => {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const isValidExpiryDate = (value: string) => {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = Number(`20${match[2]}`);
  if (month < 1 || month > 12) return false;

  const expiry = new Date(year, month, 0, 23, 59, 59, 999);
  return expiry >= new Date();
};

const validateCardDetails = (cardDetails: CardDetails): CardErrors => {
  const errors: CardErrors = {};
  const cardNumberDigits = onlyDigits(cardDetails.cardNumber);
  const cvvDigits = onlyDigits(cardDetails.cvv);
  const cardBrand = getCardBrand(cardDetails.cardNumber);

  if (!cardNumberDigits) {
    errors.cardNumber = 'Card number is required';
  } else if (!passesLuhn(cardNumberDigits)) {
    errors.cardNumber = 'Enter a valid card number';
  }

  if (!cardDetails.expiryDate.trim()) {
    errors.expiryDate = 'Expiry date is required';
  } else if (!isValidExpiryDate(cardDetails.expiryDate)) {
    errors.expiryDate = 'Enter a valid future expiry date';
  }

  if (!cvvDigits) {
    errors.cvv = 'CVV is required';
  } else if (cardBrand === 'American Express' ? cvvDigits.length !== 4 : cvvDigits.length !== 3) {
    errors.cvv = cardBrand === 'American Express' ? 'American Express CVV must be 4 digits' : 'CVV must be 3 digits';
  }

  const cleanName = cardDetails.cardholderName.trim();
  if (!cleanName) {
    errors.cardholderName = 'Cardholder name is required';
  } else if (!/^[a-zA-Z][a-zA-Z\s'.-]{1,}$/.test(cleanName) || cleanName.split(/\s+/).length < 2) {
    errors.cardholderName = 'Enter the full name shown on the card';
  }

  if (!cardDetails.acceptedTerms) {
    errors.acceptedTerms = 'Please confirm you are authorized to use this payment method';
  }

  return errors;
};

const Stepper = ({ isPostBookingAddonPayment }: { isPostBookingAddonPayment: boolean }) => {
  const steps = isPostBookingAddonPayment ? addOnPaymentSteps : newBookingSteps;
  const activeIndex = isPostBookingAddonPayment ? 2 : 3;

  return (
  <div className={`mx-auto grid max-w-5xl items-start gap-2 px-4 py-10 ${isPostBookingAddonPayment ? 'grid-cols-4' : 'grid-cols-5'}`}>
    {steps.map((step, index) => {
      const complete = index < activeIndex;
      const active = index === activeIndex;
      return (
        <div key={step} className="relative flex flex-col items-center gap-2 text-center">
          {index > 0 && <span className="absolute left-[-50%] top-4 h-px w-full bg-slate-300" />}
          <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${complete ? 'border-blue-600 bg-blue-600 text-white' : active ? 'border-amber-400 bg-[#073b70] text-white' : 'border-slate-300 bg-slate-100 text-slate-400'}`}>
            {complete ? <BadgeCheck size={18} /> : index + 1}
          </span>
          <span className={`text-[10px] font-semibold uppercase ${complete || active ? 'text-[#073b70]' : 'text-slate-400'}`}>{step}</span>
        </div>
      );
    })}
  </div>
  );
};

const TripSummary = ({ 
  method, 
  isProcessing, 
  onPay,
  routeState,
  errorMessage,
  offerUnavailable,
  isMissingCheckoutState,
  isPostBookingAddonPayment,
}: { 
  method: PaymentMethod; 
  isProcessing: boolean; 
  onPay: () => void;
  routeState?: PaymentRouteState;
  errorMessage?: string;
  offerUnavailable?: boolean;
  isMissingCheckoutState?: boolean;
  isPostBookingAddonPayment?: boolean;
}) => {
  const pnrReference = routeState?.pnrReference || 'Not available';
  const outboundFlight = routeState?.outboundFlight || routeState?.selectedFlight;
  const inboundFlight = routeState?.inboundFlight || routeState?.returnFlight;
  
  const totalAmount = calculateTotalAmount(routeState);
  
  const currencyCode = routeState?.currency_code || PRIMARY_CURRENCY_CODE;

  console.log('💵 TripSummary - Calculated total amount:', totalAmount, 'from:', {
    passed: routeState?.totalPaymentAmount,
    outboundSelected: outboundFlight?.selected_fare_price,
    inboundSelected: inboundFlight?.selected_fare_price,
    outboundTotal: outboundFlight?.total_price,
    inboundTotal: inboundFlight?.total_price,
    outboundAmount: getFlightAmount(outboundFlight),
    inboundAmount: getFlightAmount(inboundFlight),
  });

  return (
    <aside className="h-fit border border-slate-300 bg-white p-8 shadow-md">
      <h2 className="text-3xl font-semibold text-[#073b70]">{isPostBookingAddonPayment ? 'Add-ons Summary' : 'Trip Summary'}</h2>
      <div className="my-7 h-px bg-slate-200" />
      {/* PNR Reference Display */}
      <div className="mb-6 rounded bg-blue-50 p-4 border border-blue-200">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Booking Reference (PNR)</p>
        <p className="text-2xl font-semibold text-[#073b70]">{pnrReference}</p>
      </div>
      {/* Flight Route */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div>
          <p className="text-xl font-semibold text-[#073b70]">{outboundFlight?.departure_airport || outboundFlight?.origin_airport_code || '--'}</p>
          <p className="text-[10px] font-semibold uppercase text-slate-500">Departure</p>
        </div>
        <div className="text-center text-amber-500">
          <Plane className="mx-auto" size={24} />
          <div className="mt-2 h-px w-24 bg-slate-300" />
          <p className="mt-2 text-[10px] font-semibold uppercase text-slate-500">
            {outboundFlight?.total_stop_count === 0 ? 'Non-stop' : `${outboundFlight?.total_stop_count} Stop(s)`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-[#073b70]">{outboundFlight?.arrival_airport || outboundFlight?.destination_airport_code || '--'}</p>
          <p className="text-[10px] font-semibold uppercase text-slate-500">Arrival</p>
        </div>
      </div>
      {/* Price Breakdown */}
      <div className="mt-10 space-y-4 text-base font-semibold text-slate-600">
        <div className="flex justify-between"><span>Total Amount</span><span className="font-semibold text-[#073b70]">{currencyCode} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
        <div className="flex justify-between pt-3 text-xl"><span>Amount Due</span><span className="text-[#073b70]">{currencyCode} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
      </div>
      {/* Error Message */}
      {errorMessage && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}
      {/* Pay Button */}
      <button
        type="button"
        onClick={onPay}
        disabled={isProcessing}
        className="mt-9 flex h-16 w-full items-center justify-center rounded bg-[#073b70] text-base font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {offerUnavailable ? 'Search Again' : isMissingCheckoutState ? 'Return to Booking' : isProcessing ? (isPostBookingAddonPayment ? 'Completing Add-ons...' : 'Creating Payment...') : method === 'qr' ? 'Complete QR Payment' : `Pay ${currencyCode} ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </button>
      {isProcessing && <p className="mt-4 text-center text-xs font-semibold uppercase tracking-widest text-cyan-700">Processing...</p>}
      <div className="mt-7 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">SSL 256-bit encrypted</div>
    </aside>
  );
};

const CardPanel = ({
  cardDetails,
  cardErrors,
  onCardChange,
  savedPaymentMethods,
  savedPaymentsLoading,
  selectedSavedPaymentId,
  onUseSavedPayment,
}: {
  cardDetails: CardDetails;
  cardErrors: CardErrors;
  onCardChange: (field: keyof CardDetails, value: string | boolean) => void;
  savedPaymentMethods: SavedPaymentMethod[];
  savedPaymentsLoading: boolean;
  selectedSavedPaymentId: string;
  onUseSavedPayment: (method: SavedPaymentMethod) => void;
}) => {
  const cardBrand = getCardBrand(cardDetails.cardNumber);
  const selectedSavedPayment = savedPaymentMethods.find(method => method.payment_method_id === selectedSavedPaymentId);

  return (
  <section>
    <h1 className="text-3xl font-semibold text-[#073b70]">Credit / Debit Card</h1>
    <p className="mt-3 text-base font-semibold text-slate-600">Enter your card details for secure payment processing.</p>

    <div className="mt-8 rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-[#073b70]">Saved Payment Methods</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Tap a saved card to prefill safe details. Tap again to clear it.</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#073b70]">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      {savedPaymentsLoading ? (
        <p className="mt-5 rounded border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-500">Loading saved payment methods...</p>
      ) : savedPaymentMethods.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {savedPaymentMethods.map((method) => {
            const isSelected = selectedSavedPaymentId === method.payment_method_id;
            return (
              <button
                key={method.payment_method_id}
                type="button"
                onClick={() => onUseSavedPayment(method)}
                className={`he-action rounded border p-4 text-left transition ${isSelected ? 'border-[#073b70] bg-blue-50 shadow-sm ring-2 ring-[#073b70]/10' : 'border-slate-200 bg-slate-50 hover:border-[#073b70] hover:bg-white'}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-base font-semibold text-slate-800">{method.card_brand || method.payment_type || 'Card'} ending {method.last_four}</span>
                    <span className="mt-1 block text-xs font-semibold uppercase tracking-widest text-slate-500">Expires {formatSavedCardExpiry(method)}</span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${isSelected ? 'bg-[#073b70] text-white' : method.is_default ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                    {isSelected ? 'Using' : method.is_default ? 'Default' : 'Use'}
                  </span>
                </span>
                <span className="mt-3 block text-sm font-medium text-slate-500">{method.cardholder_name}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-500">No saved payment methods yet. You can still enter a card below.</p>
      )}

      {selectedSavedPayment && (
        <p className="mt-4 rounded bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
          Selected reference: {selectedSavedPayment.card_brand || 'Card'} ending {selectedSavedPayment.last_four}. For security, the full card number and CVV are not saved, so they are still required.
        </p>
      )}
    </div>

    <div className="mt-8 flex items-center gap-5">
      <CardBrandLogo brand={cardBrand} />
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">{cardBrand === 'Card' ? 'Card type will appear as you type' : `${cardBrand} detected`}</p>
    </div>
    <div className="my-9 h-px bg-slate-200" />
    <form className="space-y-8">
      <label className="block">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#073b70]">Card Number</span>
        <div className={`flex h-14 items-center rounded border bg-white px-5 transition focus-within:border-[#073b70] ${cardErrors.cardNumber ? errorInputClass : 'border-slate-300'}`}>
          <input
            className="min-w-0 flex-1 bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-400"
            inputMode="numeric"
            autoComplete="cc-number"
            value={cardDetails.cardNumber}
            onChange={(event) => onCardChange('cardNumber', formatCardNumber(event.target.value))}
            placeholder="0000 0000 0000 0000"
            maxLength={23}
          />
          <CardBrandLogo brand={cardBrand} compact />
        </div>
        {cardErrors.cardNumber && <p className="mt-2 text-xs font-semibold text-red-600">{cardErrors.cardNumber}</p>}
      </label>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#073b70]">Expiry Date</span>
          <input
            className={`${inputClass} ${cardErrors.expiryDate ? errorInputClass : ''}`}
            inputMode="numeric"
            autoComplete="cc-exp"
            value={cardDetails.expiryDate}
            onChange={(event) => onCardChange('expiryDate', formatExpiryDate(event.target.value))}
            placeholder="MM/YY"
            maxLength={5}
          />
          {cardErrors.expiryDate && <p className="mt-2 text-xs font-semibold text-red-600">{cardErrors.expiryDate}</p>}
        </label>
        <label className="block">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#073b70]">CVV</span>
          <input
            className={`${inputClass} ${cardErrors.cvv ? errorInputClass : ''}`}
            inputMode="numeric"
            autoComplete="cc-csc"
            value={cardDetails.cvv}
            onChange={(event) => onCardChange('cvv', onlyDigits(event.target.value).slice(0, cardBrand === 'American Express' ? 4 : 3))}
            placeholder={cardBrand === 'American Express' ? '1234' : '123'}
            maxLength={4}
          />
          {cardErrors.cvv && <p className="mt-2 text-xs font-semibold text-red-600">{cardErrors.cvv}</p>}
        </label>
      </div>
      <label className="block">
        <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#073b70]">Cardholder's Full Name</span>
        <input
          className={`${inputClass} ${cardErrors.cardholderName ? errorInputClass : ''}`}
          autoComplete="cc-name"
          value={cardDetails.cardholderName}
          onChange={(event) => onCardChange('cardholderName', event.target.value.toUpperCase())}
          placeholder="As shown on card"
        />
        {cardErrors.cardholderName && <p className="mt-2 text-xs font-semibold text-red-600">{cardErrors.cardholderName}</p>}
      </label>
      <label className="flex items-start gap-4 text-base font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={cardDetails.acceptedTerms}
          onChange={(event) => onCardChange('acceptedTerms', event.target.checked)}
          className="mt-1 h-5 w-5 accent-[#073b70]"
        />
        <span>I agree to the <a href="#" className="font-semibold text-[#073b70]">Terms & Conditions</a> and confirm that I am authorized to use this payment method.</span>
      </label>
      {cardErrors.acceptedTerms && <p className="-mt-6 text-xs font-semibold text-red-600">{cardErrors.acceptedTerms}</p>}
    </form>
  </section>
  );
};

const QrPanel = ({ amount, currencyCode }: { amount: number; currencyCode: string }) => {
  const [secondsRemaining, setSecondsRemaining] = React.useState(600);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsRemaining(current => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = String(secondsRemaining % 60).padStart(2, '0');

  return (
    <section>
      <h1 className="text-3xl font-semibold text-[#073b70]">Thai QR / PromptPay</h1>
      <p className="mt-3 text-base font-semibold text-slate-600">Scan this QR code using your Thai mobile banking app.</p>
      <div className="mt-6 border border-dashed border-slate-500 bg-slate-50 p-10 text-center">
        <div className="mx-auto w-64 bg-white p-8">
          <p className="mb-4 inline-block border border-[#073b70] px-3 text-sm font-semibold text-[#073b70]">PromptPay</p>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 49 }).map((_, index) => (
              <span key={index} className={`h-5 w-5 ${index % 3 === 0 || index % 7 === 0 || index % 11 === 0 ? 'bg-black' : 'bg-white'}`} />
            ))}
          </div>
        </div>
        <p className="mt-8 text-3xl font-semibold text-slate-900">
          {currencyCode} {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="mt-4 text-base font-semibold text-red-600">
          {secondsRemaining > 0 ? `QR code expires in ${minutes}:${seconds}` : 'QR code expired. Please refresh this payment method.'}
        </p>
      </div>
      <p className="mt-8 text-center text-sm font-semibold text-slate-600">Once scanned, the payment will be processed immediately. Do not close this page.</p>
      <div className="mt-8 border border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-600">Your transaction is encrypted and secured by Horizon Elite's enterprise-grade safety protocols.</div>
    </section>
  );
};

const BankingPanel = ({
  selectedProvider,
  onSelectProvider,
}: {
  selectedProvider: PaymentProvider;
  onSelectProvider: (provider: PaymentProvider) => void;
}) => (
  <section>
    <h1 className="text-3xl font-semibold text-[#073b70]">Mobile Banking</h1>
    <p className="mt-3 text-base font-semibold text-slate-600">Choose your bank</p>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {['K PLUS', 'SCB Easy', 'Krungthai NEXT', 'Bangkok Bank'].map((bank, index) => (
        <button key={bank} type="button" onClick={() => onSelectProvider(bank)} className={`flex h-24 items-center gap-5 rounded-lg border p-6 text-left ${selectedProvider === bank ? 'border-[#073b70] bg-blue-50 ring-1 ring-[#073b70]' : 'border-slate-300 bg-white'}`}>
          <span className={`flex h-12 w-12 items-center justify-center text-lg font-semibold text-white ${index === 0 ? 'bg-emerald-600' : index === 1 ? 'bg-purple-700' : index === 2 ? 'bg-sky-500' : 'bg-blue-900'}`}>{bank.slice(0, 2)}</span>
          <span className="text-lg font-semibold text-[#073b70]">{bank}</span>
        </button>
      ))}
    </div>
    <div className="mt-8 border-l-4 border-amber-300 bg-slate-100 p-6 text-base font-semibold leading-7 text-slate-600">
      You will be redirected to your selected bank's secure payment page to complete payment. Please ensure your mobile banking app is installed and ready on your device.
    </div>
  </section>
);

const WalletPanel = ({
  selectedProvider,
  onSelectProvider,
}: {
  selectedProvider: PaymentProvider;
  onSelectProvider: (provider: PaymentProvider) => void;
}) => (
  <section>
    <h1 className="text-3xl font-semibold text-[#073b70]">eWallet</h1>
    <p className="mt-3 text-base font-semibold text-slate-600">Choose your wallet</p>
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      {['TrueMoney Wallet', 'Line Pay'].map((wallet, index) => (
        <button key={wallet} type="button" onClick={() => onSelectProvider(wallet)} className={`flex h-36 flex-col items-center justify-center rounded border bg-white p-6 ${selectedProvider === wallet ? 'border-[#073b70] ring-1 ring-[#073b70]' : 'border-slate-300'}`}>
          <span className={`text-4xl font-semibold ${index === 0 ? 'text-orange-500' : 'text-green-600'}`}>{index === 0 ? 'W' : 'LINE'}</span>
          <span className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-700">{wallet}</span>
        </button>
      ))}
    </div>
    <div className="mt-10 border-l-4 border-cyan-600 bg-slate-100 p-6 text-base font-semibold leading-7 text-slate-600">
      You will be redirected to your selected wallet to complete payment. Please ensure you have sufficient balance before proceeding.
    </div>
  </section>
);

function Payment(): React.JSX.Element {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const locationState = (state ?? {}) as PaymentRouteState;
  const routeState = hasUsablePaymentState(locationState)
    ? locationState
    : readSavedPaymentCheckoutState();
  const paymentCurrencyCode = routeState.currency_code || PRIMARY_CURRENCY_CODE;
  const paymentAmount = calculateTotalAmount(routeState);
  const isMissingCheckoutState = !hasUsablePaymentState(routeState);
  const isPostBookingAddonPayment = Boolean(routeState.postBookingAddonPayment);
  
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [selectedBank, setSelectedBank] = useState<PaymentProvider>('K PLUS');
  const [selectedWallet, setSelectedWallet] = useState<PaymentProvider>('TrueMoney Wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [offerUnavailable, setOfferUnavailable] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [savedPaymentsLoading, setSavedPaymentsLoading] = useState(false);
  const [selectedSavedPaymentId, setSelectedSavedPaymentId] = useState('');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    acceptedTerms: false,
  });
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const selectedSavedPayment = savedPaymentMethods.find(savedMethod => savedMethod.payment_method_id === selectedSavedPaymentId);

  useEffect(() => {
    let cancelled = false;

    const loadSavedPaymentMethods = async () => {
      if (!user?.email_address && !localStorage.getItem('jwt_token')) return;

      setSavedPaymentsLoading(true);
      try {
        const methods = await profileApi.getSummary().then(summary => summary.paymentMethods || []);
        if (cancelled) return;

        setSavedPaymentMethods(methods);
        setSelectedSavedPaymentId('');
      } catch (error) {
        console.warn('Could not load saved payment methods:', error);
      } finally {
        if (!cancelled) setSavedPaymentsLoading(false);
      }
    };

    loadSavedPaymentMethods();

    return () => {
      cancelled = true;
    };
  }, [user?.email_address]);

  const handleCardChange = (field: keyof CardDetails, value: string | boolean) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
    setSelectedSavedPaymentId('');
    setCardErrors(prev => {
      const nextErrors = { ...prev };
      delete nextErrors[field];
      return nextErrors;
    });
    setErrorMessage('');
  };

  const handleUseSavedPayment = (savedMethod: SavedPaymentMethod) => {
    setMethod('card');

    if (selectedSavedPaymentId === savedMethod.payment_method_id) {
      setSelectedSavedPaymentId('');
      setCardDetails(prev => ({
        ...prev,
        cardNumber: '',
        cvv: '',
        expiryDate: '',
        cardholderName: '',
      }));
      setCardErrors({});
      setErrorMessage('');
      return;
    }

    setSelectedSavedPaymentId(savedMethod.payment_method_id);
    setCardDetails(prev => ({
      ...prev,
      cardNumber: '',
      cvv: '',
      expiryDate: formatSavedCardExpiry(savedMethod),
      cardholderName: savedMethod.cardholder_name.toUpperCase(),
    }));
    setCardErrors({});
    setErrorMessage('');
  };

  const handleCreatePayment = async () => {
    try {
      if (offerUnavailable) {
        navigate('/', { replace: true });
        return;
      }

      if (isMissingCheckoutState) {
        setErrorMessage('Payment details were lost. Please return to Manage Booking or complete the add-ons step again.');
        navigate('/manage-booking', { replace: true });
        return;
      }

      if (isProcessing) return;

      if (method === 'card') {
        const nextCardErrors = validateCardDetails(cardDetails);
        setCardErrors(nextCardErrors);

        if (Object.keys(nextCardErrors).length > 0) {
          setErrorMessage('Please correct the highlighted card details before paying.');
          return;
        }
      }
      
      setIsProcessing(true);
      setErrorMessage('');
      setOfferUnavailable(false);

      const bookingOwnerEmail =
        routeState.booking?.user_email_address ||
        routeState.user_email_address ||
        routeState.passengers?.find(passenger => passenger.pi_contact_email)?.pi_contact_email;
      const payerEmail = user?.email_address || bookingOwnerEmail;

      if (!bookingOwnerEmail) {
        throw new Error('Passenger contact email is required for guest payment.');
      }
      if (method === 'banking' && !selectedBank) {
        setErrorMessage('Please choose a mobile banking provider.');
        return;
      }
      if (method === 'wallet' && !selectedWallet) {
        setErrorMessage('Please choose an eWallet provider.');
        return;
      }
      
      console.log('📧 Using payment contact email:', bookingOwnerEmail);
      console.log('📊 Route state received:', routeState);
      console.log('💰 Total Payment Amount from state:', routeState.totalPaymentAmount, typeof routeState.totalPaymentAmount);
      
      // Validate required data from AddOns/Booking
      if (!routeState.pnrReference) {
        throw new Error('Missing PNR reference. Please return to Manage Booking or complete the add-ons step again.');
      }

      const outboundFlight = routeState.outboundFlight || routeState.selectedFlight;
      const inboundFlight = routeState.inboundFlight || routeState.returnFlight;
      const totalAmount = calculateTotalAmount(routeState);
      const bookingIdForPayment = routeState.booking?.booking_id || routeState.booking_id;

      console.log('💰 Total Amount Calculation:');
      console.log('   - From totalPaymentAmount:', routeState.totalPaymentAmount);
      console.log('   - From outbound selected_fare_price:', outboundFlight?.selected_fare_price);
      console.log('   - From inbound selected_fare_price:', inboundFlight?.selected_fare_price);
      console.log('   - From outbound total_price:', outboundFlight?.total_price);
      console.log('   - From inbound total_price:', inboundFlight?.total_price);
      console.log('   - Final total:', totalAmount);

      // Map payment method to API enum
      const paymentMethodMap: Record<PaymentMethod, CreatePaymentRequest['payment_method']> = {
        card: 'CREDIT_CARD',
        qr: 'THAI_QR',
        banking: 'MOBILE_BANKING',
        wallet: 'EWALLET',
      };

      const createPaymentRequest: CreatePaymentRequest = {
        booking_id: bookingIdForPayment,
        pnr_reference: routeState.pnrReference,
        user_email_address: bookingOwnerEmail,
        payment_method: paymentMethodMap[method],
        payment_region: 'ASIA',
        currency_code: routeState.currency_code || PRIMARY_CURRENCY_CODE,
        total_payment_amount: totalAmount || 0,
      };

      console.log('💳 Creating Payment with request:', createPaymentRequest);

      if (!routeState.postBookingAddonPayment) {
        if (!bookingIdForPayment) {
          throw new Error('Missing booking_id for offer validation.');
        }

        try {
          await duffelOrderApi.validateOffer({
            booking_id: bookingIdForPayment,
          });
        } catch (offerError) {
          if (isOfferUnavailableError(offerError)) {
            setOfferUnavailable(true);
            setErrorMessage(OFFER_UNAVAILABLE_MESSAGE);
            setIsProcessing(false);
            return;
          }

          throw offerError;
        }
      }

      // Call payment API to create payment record
      const response = await paymentApi.createPayment(createPaymentRequest);

      console.log('✅ Payment created successfully!');
      console.log('🔑 Payment ID:', response.payment.payment_id);
      console.log('📊 Payment Status:', response.payment.payment_status_code);

      // Charge payment to move status from PENDING -> PAID
      let finalizedPayment: any = response.payment;
      const paymentToken = response.payment.payment_token || getPaymentTokenForMethod(method);

      try {
        console.log('💳 Charging payment...');

        const chargeResponse = await paymentApi.chargePayment({
          payment_id: response.payment.payment_id,
          pnr_reference: routeState.pnrReference,
          payment_token: paymentToken,
          amount: totalAmount,
          currency: routeState.currency_code || PRIMARY_CURRENCY_CODE,
          description: `Flight booking ${routeState.pnrReference}`,
          metadata: {
            pnr_reference: routeState.pnrReference,
            user_email_address: bookingOwnerEmail,
            payer_email_address: payerEmail,
            payment_purpose: routeState.postBookingAddonPayment ? 'ADD_ONS' : 'TICKET',
            pending_addon_ids: routeState.pendingAddonIds || [],
            saved_payment_method_id: method === 'card' ? selectedSavedPayment?.payment_method_id : undefined,
          },
        });

        finalizedPayment = {
          ...response.payment,
          ...chargeResponse,
        };

        console.log('✅ Payment charged successfully!');
        console.log('📊 Final Payment Status:', finalizedPayment.payment_status_code);
      } catch (chargeError) {
        console.error('❌ Payment charge failed:', chargeError);
        setErrorMessage(chargeError instanceof Error ? chargeError.message : 'Payment processing failed');
        setIsProcessing(false);
        return;
      }

      // Create Duffel order once payment is PAID
      let duffelOrderResult: any = null;
      let ticketingIssue = '';

      if (
        finalizedPayment.payment_status_code === 'PAID' &&
        routeState.postBookingAddonPayment &&
        routeState.booking_id &&
        routeState.pendingAddonIds?.length
      ) {
        try {
          await addonApi.markAddonsPaid({
            booking_id: routeState.booking_id,
            passenger_id: routeState.passengers?.[0]?.passenger_id,
            addon_ids: routeState.pendingAddonIds,
            payment_id: finalizedPayment.payment_id || response.payment.payment_id,
          });
        } catch (addonPaymentError) {
          console.error('Could not mark add-ons as paid after payment:', addonPaymentError);
          ticketingIssue = 'Payment succeeded, but add-on payment status could not be updated automatically. Please contact support.';
        }
      }

      if (finalizedPayment.payment_status_code === 'PAID' && !routeState.postBookingAddonPayment) {
        const bookingId = routeState.booking?.booking_id || routeState.booking_id;
        const paymentId = finalizedPayment.payment_id || response.payment.payment_id;

        if (!bookingId) {
          throw new Error('Missing booking_id for Duffel order creation.');
        }

        console.log('🧾 Creating Duffel order with:', { booking_id: bookingId, payment_id: paymentId });

        try {
          duffelOrderResult = await duffelOrderApi.createOrder({
            booking_id: bookingId,
            payment_id: paymentId,
          });
        } catch (orderError) {
          if (isOfferUnavailableError(orderError)) {
            console.error('❌ Duffel offer expired:', orderError);
            ticketingIssue = 'Payment was processed, but the selected airline offer expired before ticketing. The booking cannot be ticketed from this offer. Please contact support with this PNR so the payment can be voided/refunded or a fresh flight can be booked.';
          } else {

          ticketingIssue = getTicketingIssueMessage(orderError);
          console.error('Duffel order creation failed after payment:', orderError);
          }
        }

        if (duffelOrderResult) {
          console.log('✅ Duffel order created successfully!');
          console.log('🆔 Duffel order ID:', duffelOrderResult.order?.duffel_order?.data?.id);
        }
      }

      // Navigate to confirm payment or next step with payment_id
      window.sessionStorage.removeItem(PAYMENT_CHECKOUT_STATE_KEY);

      window.setTimeout(() => {
        navigate('/booking-confirmed', {
          replace: true,
          state: {
            ...routeState,
            totalPaymentAmount: totalAmount,
            payment: finalizedPayment,
            payment_id: finalizedPayment.payment_id || response.payment.payment_id,
            paymentStatus: finalizedPayment.payment_status_code || 'PENDING',
            duffelOrder: duffelOrderResult?.order,
            duffelOrderId: duffelOrderResult?.order?.duffel_order?.data?.id,
            ticketingStatus: routeState.postBookingAddonPayment ? 'ADD_ONS_PAID' : duffelOrderResult ? 'ORDER_CREATED' : ticketingIssue ? 'ORDER_FAILED' : 'ORDER_PENDING',
            ticketingIssue,
            postBookingAddonPayment: routeState.postBookingAddonPayment,
            checkoutComplete: true,
          },
        });
      }, 1200);
    } catch (error) {
      console.error('❌ Checkout failed:', error);
      if (isOfferUnavailableError(error)) {
        setOfferUnavailable(true);
        setErrorMessage(OFFER_UNAVAILABLE_MESSAGE);
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-slate-100 pt-10 text-center">
        <Link to="/" className="text-4xl font-semibold tracking-wide text-[#073b70]">HORIZON<span className="text-amber-500">ELITE</span></Link>
      </header>
      <Stepper isPostBookingAddonPayment={isPostBookingAddonPayment} />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-28 lg:grid-cols-[310px_1fr_310px]">
        <aside>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-600">Payment Methods</h2>
          <div className="space-y-4">
            {methods.map((item) => (
              <button key={item.id} onClick={() => setMethod(item.id)} className={`flex min-h-20 w-full items-center gap-4 rounded border bg-white p-5 text-left transition ${method === item.id ? 'border-l-4 border-l-amber-300 border-slate-200 shadow-sm' : 'border-slate-300 hover:border-[#073b70]'}`}>
                <span className="w-12 text-center text-xs font-semibold text-[#073b70]">{item.icon}</span>
                <span>
                  <span className="block text-lg font-semibold text-slate-700">{item.title}</span>
                  <span className="text-xs font-semibold text-slate-500">{item.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="border-t-8 border-[#073b70] bg-white p-10 shadow-md">
          {method === 'card' ? (
            <CardPanel
              cardDetails={cardDetails}
              cardErrors={cardErrors}
              onCardChange={handleCardChange}
              savedPaymentMethods={savedPaymentMethods}
              savedPaymentsLoading={savedPaymentsLoading}
              selectedSavedPaymentId={selectedSavedPaymentId}
              onUseSavedPayment={handleUseSavedPayment}
            />
          ) : method === 'qr' ? (
            <QrPanel amount={paymentAmount} currencyCode={paymentCurrencyCode} />
          ) : method === 'banking' ? (
            <BankingPanel selectedProvider={selectedBank} onSelectProvider={setSelectedBank} />
          ) : (
            <WalletPanel selectedProvider={selectedWallet} onSelectProvider={setSelectedWallet} />
          )}
        </section>

        <TripSummary 
          method={method} 
          isProcessing={isProcessing} 
          onPay={handleCreatePayment}
          routeState={routeState}
          errorMessage={errorMessage}
          offerUnavailable={offerUnavailable}
          isMissingCheckoutState={isMissingCheckoutState}
          isPostBookingAddonPayment={isPostBookingAddonPayment}
        />
      </div>

      <footer className="pb-10 text-center text-xs font-semibold text-slate-400">© 2024 Horizon Elite Airways. All data transmitted is encrypted using the highest industry standards.</footer>
    </main>
  );
}

export default Payment;
