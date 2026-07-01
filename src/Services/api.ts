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
    const message =
      (error.response?.data as any)?.message ||
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

  // ─── Commented Out: Other Endpoints ──────────────────────────────────────

  // // ─── Flight Search ────────────────────────────────────────────────────────
  // searchFlights: (searchData) =>
  //   axiosInstance.post('/flights/search', searchData),

  // // ─── Flight Results ───────────────────────────────────────────────────────
  // getFlightResults: (flightSearchId) =>
  //   axiosInstance.get(`/results/${flightSearchId}`),

  // // ─── Selected Flights ─────────────────────────────────────────────────────
  // saveSelectedFlight: (selectedFlightData) =>
  //   axiosInstance.post('/selected-flights', selectedFlightData),

  // // ─── Passengers ───────────────────────────────────────────────────────────
  // createPassenger: (passengerData) =>
  //   axiosInstance.post('/passengers', passengerData),

  // getPassengers: (selectedFlightId) =>
  //   axiosInstance.get(`/passengers/${selectedFlightId}`),

  // deletePassenger: (passengerId) =>
  //   axiosInstance.delete(`/passengers/${passengerId}`),

  // // ─── Bookings ─────────────────────────────────────────────────────────────
  // createBooking: (bookingData) =>
  //   axiosInstance.post('/bookings', bookingData),

  // // ─── Payments ─────────────────────────────────────────────────────────────
  // testPayment: () =>
  //   axiosInstance.get('/payment/test'),

  // createPayment: (paymentData) =>
  //   axiosInstance.post('/payment/create', paymentData),

  // chargePayment: (chargeData) =>
  //   axiosInstance.post('/payment/charge', chargeData),
};

export default api;