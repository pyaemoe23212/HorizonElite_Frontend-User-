export type ValidationTone = 'neutral' | 'error' | 'warning' | 'success';

export interface PassportExpiryValidation {
  tone: ValidationTone;
  message: string;
}

const parseDateOnly = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const todayAtStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getPassportExpiryValidation = (value?: string | null): PassportExpiryValidation => {
  if (!value) return { tone: 'neutral', message: '' };

  const expiryDate = parseDateOnly(value);
  const today = todayAtStart();

  if (!expiryDate || expiryDate <= today) {
    return { tone: 'error', message: 'Passport expiry date must be in the future.' };
  }

  const minimumRecommendedPassportExpiry = new Date(today);
  minimumRecommendedPassportExpiry.setMonth(minimumRecommendedPassportExpiry.getMonth() + 6);

  if (expiryDate < minimumRecommendedPassportExpiry) {
    return { tone: 'warning', message: 'Passport should be valid for at least 6 months from today.' };
  }

  return { tone: 'success', message: 'Passport expiry date looks good.' };
};
