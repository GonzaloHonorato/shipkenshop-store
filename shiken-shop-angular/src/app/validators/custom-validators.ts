import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ===================================
// VALIDADORES PERSONALIZADOS
// ===================================

/**
 * Validador para confirmar que dos contraseñas coinciden
 * Debe ser usado a nivel de FormGroup
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

/**
 * Validador para contraseña fuerte
 * Requiere: mayúsculas, minúsculas, números y longitud 6-18
 */
export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const password = control.value;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const minLength = password.length >= 6;
  const maxLength = password.length <= 18;
  
  const valid = hasUpperCase && hasLowerCase && hasNumber && minLength && maxLength;
  
  if (!valid) {
    return {
      strongPassword: {
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
        minLength,
        maxLength
      }
    };
  }
  
  return null;
}

/**
 * Validador para edad mínima basado en fecha de nacimiento
 */
export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
  };
}

/**
 * Validador para verificar que el username no contenga espacios ni caracteres especiales
 */
export function usernameValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const username = control.value;
  const hasSpaces = /\s/.test(username);
  const hasSpecialChars = /[^a-zA-Z0-9_]/.test(username);
  
  if (hasSpaces || hasSpecialChars) {
    return { 
      invalidUsername: { 
        hasSpaces, 
        hasSpecialChars 
      } 
    };
  }
  
  return null;
}

/**
 * Validador para precio positivo
 */
export function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const value = Number(control.value);
  
  if (isNaN(value) || value < 0) {
    return { positiveNumber: true };
  }
  
  return null;
}

/**
 * Validador para stock entero positivo
 */
export function integerValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value && control.value !== 0) return null;
  
  const value = Number(control.value);
  
  if (isNaN(value) || !Number.isInteger(value) || value < 0) {
    return { integer: true };
  }
  
  return null;
}

/**
 * Validador para porcentaje (0-100)
 */
export function percentageValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value && control.value !== 0) return null;
  
  const value = Number(control.value);
  
  if (isNaN(value) || value < 0 || value > 100) {
    return { percentage: true };
  }
  
  return null;
}

/**
 * Validador para URL válida
 */
export function urlValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  try {
    new URL(control.value);
    return null;
  } catch {
    return { invalidUrl: true };
  }
}

/**
 * Validador para que el nombre de producto no contenga números al inicio
 */
export function productNameValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const name = control.value.trim();
  const startsWithNumber = /^\d/.test(name);
  
  if (startsWithNumber) {
    return { startsWithNumber: true };
  }
  
  return null;
}

/**
 * Validador personalizado para texto sin números
 */
export function noNumbersValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  const hasNumbers = /\d/.test(control.value);
  
  if (hasNumbers) {
    return { noNumbers: true };
  }
  
  return null;
}

/**
 * Validador de email corporativo (opcional para uso específico)
 */
export function corporateEmailValidator(domains: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const email = control.value.toLowerCase();
    const hasValidDomain = domains.some(domain => email.endsWith(`@${domain}`));
    
    if (!hasValidDomain) {
      return { corporateEmail: { allowedDomains: domains } };
    }
    
    return null;
  };
}

/**
 * Validador para comparar dos campos (genérico)
 */
export function matchFieldValidator(fieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) return null;
    
    const field = control.parent.get(fieldName);
    
    if (!field) return null;
    
    return control.value === field.value ? null : { fieldMismatch: { field: fieldName } };
  };
}

/**
 * Validador para fecha en el pasado
 */
export function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  // Parsear la fecha de entrada de manera segura (evitar problemas de zona horaria)
  const dateParts = control.value.split('-');
  const inputDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  inputDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (inputDate >= today) {
    return { pastDate: true };
  }
  
  return null;
}

/**
 * Validador para fecha en el futuro
 */
export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  
  // Parsear la fecha de entrada de manera segura (evitar problemas de zona horaria)
  const dateParts = control.value.split('-');
  const inputDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  inputDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (inputDate <= today) {
    return { futureDate: true };
  }
  
  return null;
}
