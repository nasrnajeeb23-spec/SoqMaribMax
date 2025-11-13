import React, { useState, useCallback, useEffect } from 'react';
import { validate, ValidationRules, FormErrors } from '../utils/validation';

interface UseFormProps<T> {
  initialValues: T;
  validationRules: ValidationRules<T>;
  onSubmit: (values: T, helpers: { resetForm: () => void }) => void;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Re-initialize form when initialValues change (e.g., for edit forms)
  useEffect(() => {
    setValues(initialValues);
  }, [JSON.stringify(initialValues)]);


  const validateForm = useCallback((formValues: T) => {
    const newErrors = validate(formValues, validationRules);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validationRules]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'radio') {
        // Find the radio that is checked
        processedValue = value;
    }


    const newValues = { ...values, [name]: processedValue };
    setValues(newValues);

    // Validate on change if the field has been touched
    if (touched[name as keyof T]) {
      validateForm(newValues);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateForm(values);
  };

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTouched(
        Object.keys(initialValues).reduce((acc, key) => ({...acc, [key]: true}), {})
    );

    const isValid = validateForm(values);
    
    if (isValid) {
      onSubmit(values, { resetForm });
    }
    
    setIsSubmitting(false);
  };
  
  const formIsValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    formIsValid,
    handleChange,
    handleBlur,
    handleSubmit,
  };
};
