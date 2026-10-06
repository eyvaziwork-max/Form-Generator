import { FormField } from '../types/form';

/**
 * Converts Persian and Arabic digits to standard Latin digits
 */
export function normalizePersianNumbers(str: string): string {
  if (!str) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let result = str.toString();
  for (let i = 0; i < 10; i++) {
    result = result
      .replace(new RegExp(persianDigits[i], 'g'), i.toString())
      .replace(new RegExp(arabicDigits[i], 'g'), i.toString());
  }
  return result;
}

/**
 * Validates Iranian mobile phone numbers (09xxxxxxxxx - 11 digits)
 */
export function isValidIranianMobile(phone: string): boolean {
  const normalized = normalizePersianNumbers(phone).trim();
  const mobileRegex = /^09[0-9]{9}$/;
  return mobileRegex.test(normalized);
}

/**
 * Validates Student ID (digits only, 5 to 14 digits)
 */
export function isValidStudentId(id: string): boolean {
  const normalized = normalizePersianNumbers(id).trim();
  const studentIdRegex = /^[0-9]{5,14}$/;
  return studentIdRegex.test(normalized);
}

/**
 * Validates Iranian National ID (کد ملی) using check digit algorithm
 */
export function isValidNationalCode(code: string): boolean {
  const normalized = normalizePersianNumbers(code).trim();
  if (!/^\d{10}$/.test(normalized)) return false;
  
  // Check for repeated digits like 1111111111
  const check = parseInt(normalized[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(normalized[i], 10) * (10 - i);
  }
  const remainder = sum % 11;
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}

/**
 * Validates Email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Simple XSS sanitizer for safe display and persistence
 */
export function sanitizeInput(input: any): any {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates a single form field value against its schema rules
 */
export function validateFieldValue(field: FormField, rawValue: any): { isValid: boolean; error?: string } {
  // If field is inactive, skip validation
  if (!field.active) return { isValid: true };

  // Skip static text and divider
  if (field.type === 'static_text' || field.type === 'divider') {
    return { isValid: true };
  }

  const isValueEmpty =
    rawValue === undefined ||
    rawValue === null ||
    (typeof rawValue === 'string' && rawValue.trim() === '') ||
    (Array.isArray(rawValue) && rawValue.length === 0);

  // 1. Required Check
  if (field.required && isValueEmpty) {
    return {
      isValid: false,
      error: field.customErrorMessage || `تکمیل فیلد «${field.label}» الزامی است.`,
    };
  }

  // If empty and not required, pass
  if (isValueEmpty) {
    return { isValid: true };
  }

  const strValue = typeof rawValue === 'string' ? rawValue.trim() : String(rawValue);
  const normalized = normalizePersianNumbers(strValue);

  // 2. Specialized Field Types Validation
  if (field.type === 'phone') {
    if (!isValidIranianMobile(normalized)) {
      return {
        isValid: false,
        error: field.customErrorMessage || 'شماره موبایل نامعتبر است. فرمت صحیح: ۱۱ رقم با پیش‌شماره ۰۹ (مانند ۰۹۱۲۳۴۵۶۷۸۹)',
      };
    }
  }

  if (field.type === 'student_id') {
    if (!isValidStudentId(normalized)) {
      return {
        isValid: false,
        error: field.customErrorMessage || 'شماره دانشجویی باید فقط شامل عدد باشد (بین ۵ تا ۱۴ رقم).',
      };
    }
  }

  if (field.type === 'national_id') {
    if (!isValidNationalCode(normalized)) {
      return {
        isValid: false,
        error: field.customErrorMessage || 'کد ملی وارد شده ۱۰ رقمی و معتبر نمی‌باشد.',
      };
    }
  }

  if (field.type === 'email') {
    if (!isValidEmail(strValue)) {
      return {
        isValid: false,
        error: field.customErrorMessage || 'فرمت پست الکترونیک (ایمیل) نامعتبر است.',
      };
    }
  }

  if (field.type === 'number') {
    const num = Number(normalized);
    if (isNaN(num)) {
      return {
        isValid: false,
        error: field.customErrorMessage || 'لطفاً یک عدد معتبر وارد کنید.',
      };
    }
    if (field.minValue !== undefined && num < field.minValue) {
      return {
        isValid: false,
        error: `حداقل مقدار مجاز برای ${field.label} برابر ${field.minValue} است.`,
      };
    }
    if (field.maxValue !== undefined && num > field.maxValue) {
      return {
        isValid: false,
        error: `حداکثر مقدار مجاز برای ${field.label} برابر ${field.maxValue} است.`,
      };
    }
  }

  // 3. Length checks
  if (typeof strValue === 'string') {
    if (field.minLength !== undefined && strValue.length < field.minLength) {
      return {
        isValid: false,
        error: `حداقل طول مجاز برای ${field.label}، ${field.minLength} کاراکتر است.`,
      };
    }
    if (field.maxLength !== undefined && strValue.length > field.maxLength) {
      return {
        isValid: false,
        error: `حداکثر طول مجاز برای ${field.label}، ${field.maxLength} کاراکتر است.`,
      };
    }
  }

  // 4. Custom Regex Pattern
  if (field.regexPattern && field.regexPattern.trim() !== '') {
    try {
      const regex = new RegExp(field.regexPattern);
      if (!regex.test(strValue)) {
        return {
          isValid: false,
          error: field.customErrorMessage || `مقدار وارد شده با الگوی مجاز فیلد ${field.label} همخوانی ندارد.`,
        };
      }
    } catch {
      // Invalid regex pattern configuration - ignore silently
    }
  }

  return { isValid: true };
}

/**
 * Validates an entire form submission
 */
export function validateFormSubmission(fields: FormField[], values: Record<string, any>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (!field.active) continue;
    // Check validation against field.name (or field.id fallback)
    const val = values[field.name] ?? values[field.id];
    const validation = validateFieldValue(field, val);
    if (!validation.isValid && validation.error) {
      errors[field.name] = validation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
