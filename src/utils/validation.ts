export function validateDate(dateString: string | undefined | null): boolean {
  if (!dateString || dateString.trim() === '') {
    return false;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);

  if (year < 1900 || year > new Date().getFullYear()) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  const actualDate = new Date(year, month - 1, day);
  if (isNaN(actualDate.getTime())) {
    return false;
  }

  return (
    actualDate.getFullYear() === year &&
    actualDate.getMonth() === month - 1 &&
    actualDate.getDate() === day
  );
}

export function isValidDateInPast(dateString: string): boolean {
  if (!validateDate(dateString)) {
    return false;
  }

  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate <= today;
}

export function sanitizeDate(dateString: string | undefined | null): string | null {
  if (!dateString || dateString.trim() === '') {
    return null;
  }

  if (!validateDate(dateString)) {
    return null;
  }

  return dateString.trim();
}

export function validateRequiredString(value: string | undefined | null): boolean {
  return !!value && value.trim() !== '';
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateOnboardingData(data: {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  language?: string;
  maritalStatus?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateRequiredString(data.firstName)) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!validateRequiredString(data.lastName)) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!validateDate(data.dateOfBirth)) {
    errors.push({ field: 'dateOfBirth', message: 'Valid date of birth is required (YYYY-MM-DD)' });
  }

  if (!validateRequiredString(data.gender)) {
    errors.push({ field: 'gender', message: 'Gender is required' });
  }

  if (!validateRequiredString(data.language)) {
    errors.push({ field: 'language', message: 'Language is required' });
  }

  if (!validateRequiredString(data.maritalStatus)) {
    errors.push({ field: 'maritalStatus', message: 'Marital status is required' });
  }

  return errors;
}
