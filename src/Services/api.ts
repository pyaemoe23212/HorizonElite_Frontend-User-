import axios, { type AxiosInstance, type AxiosError } from 'axios';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token?: string;
  jwt_token?: string;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  message?: string;
}

export interface RegisterData {
  title: string;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface LoginCredentials {
  email_address: string;
  password: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  title?: string;
  created_at?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// ─── Translation Types ───────────────────────────────────────────────────────
export interface Language {
  code: string;
  name: string;
  native_name?: string;
  flag?: string;
}

export interface SupportedLanguagesResponse {
  languages: Language[];
  default_language?: string;  // Optional: backend may not provide this
}

export interface TranslateRequest {
  text: string;
  target_language: string;
  source_language?: string;
}

export interface TranslateResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
}

export interface BulkTranslateRequest {
  texts: string[];
  target_language: string;
  source_language?: string;
}

export interface BulkTranslateResponse {
  translated_texts: string[];
  source_language: string;
  target_language: string;
}

export interface FlightContentResponse {
  language: string;
  content: {
    cabin_classes: Record<string, string>;
    amenities: Record<string, string>;
    meals: Record<string, string>;
    [key: string]: any;
  };
}

// ─── Flight Search Types ─────────────────────────────────────────────────────

/**
 * Represents a single flight segment (a leg of the journey).
 * Example: "New York to London on June 15"
 * For a round trip, you'd have 2 segments.
 */
export interface FlightSegment {
  origin_airport_code: string;      // e.g., "JFK" for New York
  destination_airport_code: string; // e.g., "LHR" for London
  departure_date: string;           // Format: "YYYY-MM-DD"
}

/**
 * Request body for searching flights.
 * This is sent to POST /api/flights/search to find available flights.
 * 
 * Example usage in Home.tsx:
 * api.searchFlights({
 *   trip_type: "ROUND_TRIP",
 *   adult_passenger_count: 1,
 *   child_passenger_count: 0,
 *   infant_passenger_count: 0,
 *   cabin_class: "economy",
 *   currency_code: "USD",
 *   segments: [
 *     { origin_airport_code: "JFK", destination_airport_code: "LHR", departure_date: "2025-06-15" },
 *     { origin_airport_code: "LHR", destination_airport_code: "JFK", departure_date: "2025-06-22" }
 *   ]
 * })
 */
export interface SearchFlightRequest {
  trip_type: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY';
  adult_passenger_count: number;
  child_passenger_count: number;
  infant_passenger_count: number;
  cabin_class: string;                    // e.g., "economy", "business"
  currency_code: string;                  // e.g., "USD", "THB"
  segments: FlightSegment[];              // Array of flight legs
  preferred_airline?: string;             // Optional: filter by airline
  direct_flight_only?: boolean;           // Optional: only show direct flights
  promo_fare_type?: string | null;        // Optional: promo code
}

/**
 * Represents a single flight result from the search.
 * Contains pricing and basic flight info.
 * Maps to /api/flights/search response results array.
 */
export interface FlightResultItem {
  flight_result_id: string;               // Unique ID for this result (needed for selecting)
  flight_offer_id: string;                // Duffel offer ID
  airline_name: string;                   // e.g., "Singapore Airlines"
  airline_code: string;                   // e.g., "SQ"
  total_price: string;                    // Price as string from API
  currency_code: string;                  // e.g., "USD"
  departure_airport: string;              // e.g., "BKK"
  arrival_airport: string;                // e.g., "SIN"
  departure_datetime: string;             // ISO 8601 format: "2026-07-10T09:00:00"
  arrival_datetime: string;               // ISO 8601 format: "2026-07-10T12:30:00"
  total_stop_count: number;               // 0 for direct, 1+ for connections
  cabin_class: string;                    // e.g., "economy"
  
  // Optional fields that may be included
  flight_number?: string;                 // Flight number if available
  duration?: string;                      // Duration if available (e.g., "1h 10m")
  baggage_allowance?: string;             // Baggage info if available
  refundable_status?: boolean;            // Refundability if available
  
  [key: string]: any;                     // Allow additional fields from backend
}

/**
 * Response from searching flights (POST /api/flights/search).
 * Contains the search ID and array of available flights.
 * 
 * The flight_search_id should be stored for:
 * - Retrieving results later using getFlightResults()
 * - Selecting a flight using selectFlight()
 */
export interface SearchFlightResponse {
  message: string;
  flight_search_id: string;               // Store this! You'll need it later
  results: FlightResultItem[];            // Array of available flights
  [key: string]: any;                     // Allow additional fields from backend
}

// ─── Selected Flight Types ────────────────────────────────────────────────────

/**
 * Request body for selecting a flight (POST /api/selected-flights).
 * Send this after the user chooses which flight they want.
 * 
 * Use the flight_result_id from the searchFlights response.
 */
export interface SelectFlightRequest {
  flight_search_id: string;               // From searchFlights response
  flight_result_id: string;               // From searchFlights response results
  flight_offer_id: string;                // Duffel offer ID
  selected_trip_type: 'OUTBOUND' | 'RETURN' | 'MULTI_CITY';
  airline_name: string;
  flight_number: string;
  origin_airport_code: string;
  destination_airport_code: string;
  departure_datetime: string;
  arrival_datetime: string;
  cabin_class: string;
  selected_fare_price: number;
  currency_code: string;
  baggage_allowance?: string;
  refundable_status?: boolean;
}

/**
 * Response from selecting a flight (POST /api/selected-flights).
 * Contains the saved selected flight details and a unique ID.
 */
export interface SelectedFlightResponse {
  message: string;
  selectedFlight: {
    selected_flight_id: string;           // Unique ID for this selection
    flight_search_id: string;
    flight_result_id: string;
    selected_trip_type: string;
    airline_name: string;
    flight_number: string;
    origin_airport_code: string;
    destination_airport_code: string;
    departure_datetime: string;
    arrival_datetime: string;
    cabin_class: string;
    selected_fare_price: string;
    currency_code: string;
    baggage_allowance?: string;
    refundable_status: boolean;
    selection_status: string;              // e.g., "SELECTED"
    selected_at: string;                   // ISO 8601 timestamp
    [key: string]: any;                    // Allow additional fields from backend
  };
}

/**
 * Response from retrieving saved flight results (GET /api/results/:flight_search_id).
 * Contains all flights that were found for a particular search.
 */
export interface GetFlightResultsResponse {
  flight_search_id: string;
  total_results: number;
  results: FlightResultItem[];            // Same structure as searchFlights response
  [key: string]: any;                     // Allow additional fields from backend
}

// ─── Axios Configuration ─────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT token from localStorage if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – unwrap data and surface error messages
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const responseData = error.response?.data as any;
    const message =
      responseData?.message ||
      responseData?.error ||
      (Array.isArray(responseData?.details) ? responseData.details.join(', ') : undefined) ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  },
);

// ─── Authentication API ──────────────────────────────────────────────────────
export const api = {
  /**
   * Register a new user account
   */
  register: (userData: RegisterData): Promise<AuthResponse> =>
    axiosInstance.post('/auth/register', userData),

  /**
   * Login with email and password
   */
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    axiosInstance.post('/auth/login', credentials),

  /**
   * Get current authenticated user's profile
   */
  getProfile: (): Promise<ProfileResponse> =>
    axiosInstance.get('/auth/profile'),

  /**
   * Logout user and clear session
   */
  logout: (): Promise<ApiResponse> =>
    axiosInstance.post('/auth/logout', {}),

  /**
   * Refresh authentication token
   */
  refreshToken: (): Promise<AuthResponse> =>
    axiosInstance.post('/auth/refresh', {}),

  // ─── Translation API ─────────────────────────────────────────────────────

  /**
   * Get list of all supported languages for translation
   * 
   * Returns an array of available languages with their codes and names.
   * This is typically called when the app loads to populate language
   * selection dropdowns in the navbar or settings.
   * 
   * Transforms backend response (language_code, language_name) to frontend
   * interface (code, name) for consistent usage across the app.
   * 
   * Example response:
   * {
   *   "languages": [
   *     { "code": "en", "name": "English", "native_name": "English" },
   *     { "code": "th", "name": "Thai", "native_name": "ไทย" }
   *   ],
   *   "default_language": "en"
   * }
   */
  getSupportedLanguages: async (): Promise<SupportedLanguagesResponse> => {
    interface BackendLanguage {
      language_code: string;
      language_name: string;
      native_name: string;
      is_default: boolean;
    }
    
    interface BackendResponse {
      message: string;
      total_languages: number;
      languages: BackendLanguage[];
    }
    
    const response = (await axiosInstance.get('/translations/supported-languages')) as BackendResponse;
    
    // Transform backend response to match frontend interface
    const transformedLanguages: Language[] = response.languages.map(
      (lang: BackendLanguage) => ({
        code: lang.language_code,
        name: lang.language_name,
        native_name: lang.native_name,
      })
    );
    
    // Find default language from the is_default flag
    const defaultLang = response.languages.find(
      (lang: BackendLanguage) => lang.is_default === true
    );
    
    return {
      languages: transformedLanguages,
      default_language: defaultLang?.language_code || 'en',
    };
  },

  /**
   * Translate a single piece of text to the target language
   * 
   * Parameters:
   * - text: The text you want to translate (e.g., "Hello World")
   * - target_language: Language code to translate to (e.g., "th" for Thai)
   * - source_language (optional): Language code of the original text (e.g., "en")
   * 
   * Example usage:
   * api.translateText({
   *   text: "Welcome to Horizon Elite",
   *   target_language: "th"
   * })
   * 
   * Returns: { "translated_text": "ยินดีต้อนรับสู่ Horizon Elite", ... }
   */
  translateText: (request: TranslateRequest): Promise<TranslateResponse> =>
    axiosInstance.post('/translations/translate', request),

  /**
   * Translate multiple pieces of text at once (bulk translation)
   * 
   * This is more efficient than calling translateText multiple times.
   * Use this when you need to translate many texts in one request.
   * 
   * Parameters:
   * - texts: Array of strings to translate (e.g., ["Hello", "Goodbye"])
   * - target_language: Language code to translate to (e.g., "th")
   * - source_language (optional): Language code of the original texts
   * 
   * Example usage:
   * api.bulkTranslate({
   *   texts: ["Economy", "Business", "First Class"],
   *   target_language: "th"
   * })
   * 
   * Returns: { "translated_texts": ["เศรษฐกิจ", "ธุรกิจ", "ชั้นหนึ่ง"], ... }
   */
  bulkTranslate: (request: BulkTranslateRequest): Promise<BulkTranslateResponse> =>
    axiosInstance.post('/translations/bulk', request),

  /**
   * Get pre-translated flight content for a specific language
   * 
   * This returns common flight-related terms and phrases that are already
   * translated in the backend. Examples include:
   * - Cabin class names (Economy, Business, First)
   * - Amenity descriptions
   * - Meal options
   * - Other common flight content
   * 
   * Parameters:
   * - lang: Language code (e.g., "th" for Thai, "en" for English)
   * 
   * Example usage:
   * api.getFlightContent("th")
   * 
   * Returns: {
   *   "language": "th",
   *   "content": {
   *     "cabin_classes": { "economy": "เศรษฐกิจ", "business": "ธุรกิจ" },
   *     "amenities": { "wifi": "วิไฟ", "meals": "อาหาร" },
   *     ...
   *   }
   * }
   */
  getFlightContent: (lang: string): Promise<FlightContentResponse> =>
    axiosInstance.get(`/translations/flight-content/${lang}`),

  // ─── Flight Search API ────────────────────────────────────────────────────

  /**
   * Search for available flights based on user criteria.
   * 
   * This endpoint searches for flights and saves the search to the database.
   * The JWT token is automatically attached by the request interceptor.
   * 
   * Returns both the search ID and an array of available flights.
   * IMPORTANT: Store the flight_search_id — you'll need it later to:
   * - Retrieve results using getFlightResults()
   * - Select a flight using selectFlight()
   * 
   * Example usage from Home.tsx:
   * const response = await api.searchFlights({
   *   trip_type: "ROUND_TRIP",
   *   adult_passenger_count: 1,
   *   child_passenger_count: 0,
   *   infant_passenger_count: 0,
   *   cabin_class: "economy",
   *   currency_code: "USD",
   *   segments: [
   *     { origin_airport_code: "JFK", destination_airport_code: "LHR", departure_date: "2025-06-15" },
   *     { origin_airport_code: "LHR", destination_airport_code: "JFK", departure_date: "2025-06-22" }
   *   ]
   * });
   * 
   * // Store for later:
   * const flightSearchId = response.flight_search_id;
   * const flights = response.results; // Array of available flights
   * 
   * Returns: { flight_search_id: "abc-123", results: [...] }
   */
  searchFlights: (searchData: SearchFlightRequest): Promise<SearchFlightResponse> =>
    axiosInstance.post('/flights/search', searchData),

  // ─── Flight Results API ───────────────────────────────────────────────────

  /**
   * Retrieve previously saved flight results using the search ID.
   * 
   * This is useful if:
   * - The user navigated away and came back
   * - You want to show the results again without searching again
   * - You need to retrieve results from a previous search
   * 
   * The flight_search_id was returned by searchFlights().
   * 
   * Example usage:
   * const results = await api.getFlightResults("abc-123");
   * // Results are ordered by price (cheapest first)
   * 
   * Returns: { flight_search_id: "abc-123", total_results: 15, results: [...] }
   */
  getFlightResults: (flightSearchId: string): Promise<GetFlightResultsResponse> =>
    axiosInstance.get(`/results/${flightSearchId}`),

  // ─── Selected Flight API ──────────────────────────────────────────────────

  /**
   * Save the user's selected flight to the database.
   * 
   * Call this after the user clicks on a flight in the search results.
   * This stores their choice and typically moves them to the next step
   * (passenger information or add-ons).
   * 
   * Required fields to provide:
   * - flight_search_id: From searchFlights response
   * - flight_result_id: From searchFlights response results
   * - selected_trip_type: "OUTBOUND" for the first flight, "RETURN" for return flight
   * - All the flight details (airline, number, times, prices, etc.)
   * 
   * Example usage in FlightResults.tsx:
   * const flight = flights[0]; // User clicked on this flight
   * await api.selectFlight({
   *   flight_search_id: "abc-123",
   *   flight_result_id: flight.flight_result_id,
   *   selected_trip_type: "OUTBOUND",
   *   airline_name: "Horizon Elite",
   *   flight_number: "HE 1209",
   *   origin_airport_code: "JFK",
   *   destination_airport_code: "LHR",
   *   departure_datetime: "2025-06-15T14:40:00",
   *   arrival_datetime: "2025-06-15T15:50:00",
   *   cabin_class: "economy",
   *   selected_fare_price: 282.00,
   *   currency_code: "USD"
   * });
   * 
   * Returns: { message: "Flight selected successfully", selectedFlight: {...} }
   */
  selectFlight: (flightData: SelectFlightRequest): Promise<SelectedFlightResponse> =>
    axiosInstance.post('/selected-flights', flightData),
};

// ─── Passenger Types ─────────────────────────────────────────────────────────

export interface CreatePassengerRequest {
  selected_flight_id: string;             // From POST /api/selected-flights response
  pi_title: string;                       // e.g., "Mr", "Ms", "Mrs"
  pi_first_name: string;
  pi_middle_name?: string;
  pi_last_name: string;
  pi_gender: 'M' | 'F' | 'X';
  pi_date_of_birth: string;               // Format: "YYYY-MM-DD"
  pi_nationality: string;
  pi_passenger_type_code: 'ADT' | 'CHD' | 'INF'; // Adult, Child, Infant
  pi_passport_number?: string;
  pi_passport_issuing_country?: string;
  pi_passport_expiry_date?: string;       // Format: "YYYY-MM-DD"
  pi_contact_email: string;
  pi_contact_phone: string;
}

export interface Passenger {
  passenger_id: string;
  selected_flight_id: string;
  pi_title: string;
  pi_first_name: string;
  pi_middle_name?: string;
  pi_last_name: string;
  pi_gender: string;
  pi_date_of_birth: string;
  pi_nationality: string;
  pi_passenger_type_code: string;
  pi_passport_number?: string;
  pi_passport_issuing_country?: string;
  pi_passport_expiry_date?: string;
  pi_contact_email: string;
  pi_contact_phone: string;
  pi_passenger_status: string;
  date_created?: string;
  date_modified?: string;
}

export interface CreatePassengerResponse {
  message: string;
  passenger: Passenger;
}

// ─── API Export ──────────────────────────────────────────────────────────────

// Extended API object with passenger endpoint
export const passengerApi = {
  /**
   * Create a new passenger record
   */
  createPassenger: (data: CreatePassengerRequest): Promise<CreatePassengerResponse> =>
    axiosInstance.post('/passengers', data),

  /**
   * Get passengers for a selected flight
   */
  getPassengers: (selectedFlightId: string): Promise<Passenger[]> =>
    axiosInstance.get(`/passengers/${selectedFlightId}`),

  /**
   * Delete a passenger
   */
  deletePassenger: (passengerId: string): Promise<{ message: string }> =>
    axiosInstance.delete(`/passengers/${passengerId}`),
};

export default api;
