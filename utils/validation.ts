export type ValidationRule<T> = {
  validate: (value: any, allValues?: T) => boolean;
  message: string;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

// --- Rule Creators ---

export const required = <T>(message: string = 'هذا الحقل مطلوب'): ValidationRule<T> => ({
  validate: (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },
  message,
});

export const minLength = <T>(min: number, message?: string): ValidationRule<T> => ({
  validate: (value: any) => typeof value === 'string' && value.length >= min,
  message: message || `يجب أن يكون ${min} أحرف على الأقل`,
});

export const isEmail = <T>(message: string = 'البريد الإلكتروني غير صالح'): ValidationRule<T> => ({
  validate: (value: any) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message,
});

export const isNumber = <T>(message: string = 'يجب أن يكون هذا الحقل رقمًا'): ValidationRule<T> => ({
    validate: (value: any) => !isNaN(parseFloat(value)) && isFinite(value),
    message,
});

export const isPositiveNumber = <T>(message: string = 'يجب أن يكون الرقم أكبر من صفر'): ValidationRule<T> => ({
    validate: (value: any) => !isNaN(parseFloat(value)) && isFinite(value) && parseFloat(value) > 0,
    message,
});

export const conditional = <T>(
  condition: (allValues: T) => boolean,
  rules: ValidationRule<T>[]
): ValidationRule<T>[] => {
  return rules.map(rule => ({
    validate: (value: any, allValues?: T) => {
      if (!allValues || !condition(allValues)) {
        return true; // If condition is not met, the rule passes
      }
      return rule.validate(value, allValues); // If condition is met, apply the original rule
    },
    message: rule.message,
  }));
};


// --- Validator Function ---

export function validate<T>(values: T, rules: ValidationRules<T>): FormErrors<T> {
  const errors: FormErrors<T> = {};

  for (const key in rules) {
    const fieldRules = rules[key as keyof T];
    if (fieldRules) {
      for (const rule of fieldRules) {
        if (!rule.validate(values[key as keyof T], values)) {
          errors[key as keyof T] = rule.message;
          break; // Stop at the first error for a field
        }
      }
    }
  }

  return errors;
}
