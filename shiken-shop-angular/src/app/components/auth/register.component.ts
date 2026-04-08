import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DataService } from '../../services/data.service';
import { 
  passwordMatchValidator, 
  strongPasswordValidator, 
  minAgeValidator,
  usernameValidator,
  noNumbersValidator,
  pastDateValidator
} from '../../validators/custom-validators';

// Interfaz extendida para registro
interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  address?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen py-20 px-4">
      
      <!-- Registration Form Section -->
      <div class="container mx-auto max-w-2xl">
        <div class="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl border border-purple-500/30 p-6 md:p-10">
          
          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-2">
              Únete a <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ShikenShop</span>
            </h2>
            <p class="text-gray-300">Crea tu cuenta y comienza a disfrutar de beneficios exclusivos</p>
          </div>

          <!-- Registration Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate class="space-y-6">
            
            <!-- Nombre Completo -->
            <div class="form-group">
              <label for="fullName" class="block text-white font-semibold mb-2">
                Nombre Completo <span class="text-pink-500">*</span>
              </label>
              <input 
                type="text" 
                id="fullName" 
                formControlName="fullName"
                (change)="onFieldChange('fullName', $event)"
                (keydown)="onKeyDown('fullName', $event)"
                (blur)="onFieldBlur('fullName')"
                (focus)="onFieldFocus('fullName')"
                class="w-full px-4 py-3 bg-gray-900 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                [class.border-purple-500/30]="!registerForm.get('fullName')?.invalid || !registerForm.get('fullName')?.touched"
                [class.border-pink-500]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
                placeholder="Ingresa tu nombre completo"
                autocomplete="name"
              >
              <span 
                class="error-message text-pink-500 text-sm mt-1"
                [class.hidden]="!registerForm.get('fullName')?.invalid || !registerForm.get('fullName')?.touched"
              >
                @if (registerForm.get('fullName')?.hasError('required')) {
                  El nombre completo es requerido
                }
                @if (registerForm.get('fullName')?.hasError('minlength')) {
                  El nombre debe tener al menos 2 caracteres
                }
                @if (registerForm.get('fullName')?.hasError('maxlength')) {
                  El nombre no puede exceder 50 caracteres
                }
                @if (registerForm.get('fullName')?.hasError('noNumbers')) {
                  El nombre no puede contener números
                }
              </span>
            </div>

            <!-- Nombre de Usuario -->
            <div class="form-group">
              <label for="username" class="block text-white font-semibold mb-2">
                Nombre de Usuario <span class="text-pink-500">*</span>
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  id="username" 
                  formControlName="username"
                  (change)="onFieldChange('username', $event)"
                  (keydown)="onKeyDown('username', $event)"
                  (input)="onInputChange('username', $event)"
                  (blur)="onFieldBlur('username')"
                  (focus)="onFieldFocus('username')"
                  class="w-full px-4 py-3 bg-gray-900 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                  [class.border-purple-500/30]="!registerForm.get('username')?.invalid || !registerForm.get('username')?.touched"
                  [class.border-pink-500]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
                  placeholder="Elige un nombre de usuario"
                  autocomplete="username"
                  maxlength="20"
                >
                <span class="absolute right-3 top-3 text-xs text-gray-400">
                  {{ usernameLength }}/20
                </span>
              </div>
              <span 
                class="error-message text-pink-500 text-sm mt-1"
                [class.hidden]="!registerForm.get('username')?.invalid || !registerForm.get('username')?.touched"
              >
                @if (registerForm.get('username')?.hasError('required')) {
                  El nombre de usuario es requerido
                }
                @if (registerForm.get('username')?.hasError('minlength')) {
                  El nombre de usuario debe tener al menos 3 caracteres
                }
                @if (registerForm.get('username')?.hasError('maxlength')) {
                  El nombre de usuario no puede exceder 20 caracteres
                }
                @if (registerForm.get('username')?.hasError('pattern') || registerForm.get('username')?.hasError('invalidUsername')) {
                  Solo se permiten letras, números y guiones bajos
                }
              </span>
              <p class="text-gray-400 text-xs mt-1">Solo letras, números y guiones bajos. Sin espacios.</p>
            </div>

            <!-- Correo Electrónico -->
            <div class="form-group">
              <label for="email" class="block text-white font-semibold mb-2">
                Correo Electrónico <span class="text-pink-500">*</span>
              </label>
              <div class="relative">
                <input 
                  type="email" 
                  id="email" 
                  formControlName="email"
                  (change)="onFieldChange('email', $event)"
                  (blur)="onFieldBlur('email')"
                  (focus)="onFieldFocus('email')"
                  class="w-full px-4 py-3 bg-gray-900 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                  [class.border-purple-500/30]="!registerForm.get('email')?.invalid || !registerForm.get('email')?.touched"
                  [class.border-pink-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  [class.border-green-500]="registerForm.get('email')?.valid && registerForm.get('email')?.touched"
                  placeholder="tu@email.com"
                  autocomplete="email"
                >
                @if (emailTyping) {
                  <span class="absolute right-3 top-3 text-xs text-purple-400">
                    ⌨️ Escribiendo...
                  </span>
                }
              </div>
              <span 
                class="error-message text-pink-500 text-sm mt-1"
                [class.hidden]="!registerForm.get('email')?.invalid || !registerForm.get('email')?.touched"
              >
                @if (registerForm.get('email')?.hasError('required')) {
                  El correo electrónico es requerido
                }
                @if (registerForm.get('email')?.hasError('email') || registerForm.get('email')?.hasError('pattern')) {
                  Ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)
                }
              </span>
            </div>

            <!-- Contraseña -->
            <div class="form-group">
              <label for="password" class="block text-white font-semibold mb-2">
                Contraseña <span class="text-pink-500">*</span>
              </label>
              <div class="relative">
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  id="password" 
                  formControlName="password"
                  (change)="onFieldChange('password', $event)"
                  (blur)="onFieldBlur('password')"
                  (focus)="onFieldFocus('password')"
                  class="w-full px-4 py-3 pr-14 bg-gray-900 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                  [class.border-purple-500/30]="!registerForm.get('password')?.invalid || !registerForm.get('password')?.touched"
                  [class.border-pink-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  placeholder="Mínimo 6 caracteres"
                  autocomplete="new-password"
                  minlength="6"
                  maxlength="18"
                >
                <button 
                  type="button" 
                  (click)="togglePassword()"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors flex items-center justify-center w-6 h-6"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showPassword) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12l2.122-2.122m-2.122 2.122L9.878 14.12M12 12v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>
              
              <!-- Indicador de fortaleza de contraseña -->
              @if (registerForm.get('password')?.value) {
                <div class="mt-2">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-gray-400">Fortaleza:</span>
                    <span class="text-xs font-semibold" [class.text-red-400]="passwordStrength < 30"
                          [class.text-yellow-400]="passwordStrength >= 30 && passwordStrength < 60"
                          [class.text-blue-400]="passwordStrength >= 60 && passwordStrength < 80"
                          [class.text-green-400]="passwordStrength >= 80">
                      {{ getPasswordStrengthLabel() }}
                    </span>
                  </div>
                  <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300"
                         [class]="getPasswordStrengthColor()"
                         [style.width.%]="passwordStrength">
                    </div>
                  </div>
                </div>
              }
              
              <span 
                class="error-message text-pink-500 text-sm mt-1"
                [class.hidden]="!registerForm.get('password')?.invalid || !registerForm.get('password')?.touched"
              >
                @if (registerForm.get('password')?.hasError('required')) {
                  La contraseña es requerida
                }
                @if (registerForm.get('password')?.hasError('minlength')) {
                  La contraseña debe tener al menos 6 caracteres
                }
                @if (registerForm.get('password')?.hasError('maxlength')) {
                  La contraseña no puede exceder 18 caracteres
                }
                @if (registerForm.get('password')?.hasError('strongPassword')) {
                  La contraseña debe contener mayúsculas, minúsculas y números
                }
              </span>
              <p class="text-gray-400 text-xs mt-1">Debe contener 6-18 caracteres, al menos un número y una letra mayúscula</p>
            </div>

            <!-- Confirmar Contraseña -->
            <div class="form-group">
              <label for="confirmPassword" class="block text-white font-semibold mb-2">
                Confirmar Contraseña <span class="text-pink-500">*</span>
              </label>
              <div class="relative">
                <input 
                  [type]="showConfirmPassword ? 'text' : 'password'" 
                  id="confirmPassword" 
                  formControlName="confirmPassword"
                  class="w-full px-4 py-3 pr-14 bg-gray-900 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                  [class.border-purple-500/30]="!registerForm.get('confirmPassword')?.invalid || !registerForm.get('confirmPassword')?.touched"
                  [class.border-pink-500]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                  placeholder="Repite tu contraseña"
                >
                <button 
                  type="button" 
                  (click)="toggleConfirmPassword()"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors flex items-center justify-center w-6 h-6"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    @if (showConfirmPassword) {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12l2.122-2.122m-2.122 2.122L9.878 14.12M12 12v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    }
                  </svg>
                </button>
              </div>
              <span 
                class="error-message text-pink-500 text-sm mt-1"
                [class.hidden]="!registerForm.get('confirmPassword')?.invalid || !registerForm.get('confirmPassword')?.touched"
              >
                @if (registerForm.get('confirmPassword')?.hasError('required')) {
                  Confirma tu contraseña
                }
              </span>
              <span 
                class="error-message text-pink-500 text-sm mt-1"
                [class.hidden]="!registerForm.hasError('passwordMismatch') || !registerForm.get('confirmPassword')?.touched"
              >
                Las contraseñas no coinciden
              </span>
            </div>

            <!-- Fecha de Nacimiento -->
            <div class="form-group">
              <label for="birthdate" class="block text-white font-semibold mb-2">
                Fecha de Nacimiento <span class="text-pink-500">*</span>
              </label>
              <input 
                type="date" 
                id="birthdate" 
                formControlName="birthdate"
                (change)="onFieldChange('birthdate', $event)"
                (blur)="onFieldBlur('birthdate')"
                class="w-full px-4 py-3 bg-gray-900 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                [class.border-purple-500/30]="!registerForm.get('birthdate')?.invalid || !registerForm.get('birthdate')?.touched"
                [class.border-pink-500]="registerForm.get('birthdate')?.invalid && registerForm.get('birthdate')?.touched"
                [max]="getCurrentDate()"
                autocomplete="bday"
              >
              <span 
                class="error-message text-pink-500 text-sm mt-1"
                [class.hidden]="!registerForm.get('birthdate')?.invalid || !registerForm.get('birthdate')?.touched"
              >
                @if (registerForm.get('birthdate')?.hasError('required')) {
                  La fecha de nacimiento es requerida
                }
                @if (registerForm.get('birthdate')?.hasError('minAge')) {
                  Debes tener al menos 13 años para registrarte
                }
                @if (registerForm.get('birthdate')?.hasError('pastDate')) {
                  La fecha de nacimiento debe ser en el pasado
                }
              </span>
              <p class="text-gray-400 text-xs mt-1">Debes tener al menos 13 años para registrarte</p>
            </div>

            <!-- Dirección de Despacho -->
            <div class="form-group">
              <label for="address" class="block text-white font-semibold mb-2">
                Dirección de Despacho <span class="text-gray-400 text-sm">(Opcional)</span>
              </label>
              <textarea 
                id="address" 
                formControlName="address"
                rows="3"
                class="w-full px-4 py-3 bg-gray-900 bg-opacity-50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 resize-none"
                placeholder="Calle, número, comuna, ciudad (opcional)"
              ></textarea>
            </div>

            <!-- Botones -->
            <div class="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                [disabled]="registerForm.invalid || isLoading"
                class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transform transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                @if (isLoading) {
                  <div class="flex items-center justify-center">
                    <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando cuenta...
                  </div>
                } @else {
                  Crear Cuenta
                }
              </button>
              <button 
                type="button" 
                (click)="clearForm()"
                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                Limpiar Formulario
              </button>
            </div>
          </form>

          <!-- Login Link -->
          <p class="text-gray-400 text-center mt-6">
            ¿Ya tienes cuenta? 
            <a [routerLink]="['/login']" class="text-purple-400 hover:text-pink-400 transition-colors duration-300 font-semibold">Inicia Sesión</a>
          </p>
        </div>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <a [routerLink]="['/']" class="text-gray-400 hover:text-purple-400 text-sm transition-colors inline-flex items-center">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dataService = inject(DataService);

  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  
  // Contadores de caracteres para feedback en tiempo real
  usernameLength = 0;
  passwordStrength = 0;
  emailTyping = false;

  constructor() {
    // Construir formulario con FormBuilder y validadores múltiples
    this.registerForm = this.formBuilder.group({
      fullName: new FormControl('', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(50),
        noNumbersValidator // Validador personalizado: no permite números en el nombre
      ]),
      username: new FormControl('', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/), // Pattern: solo letras, números y guion bajo
        usernameValidator // Validador personalizado adicional
      ]),
      email: new FormControl('', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // Pattern más estricto para email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(18),
        strongPasswordValidator // Validador personalizado para contraseña fuerte
      ]),
      confirmPassword: new FormControl('', [
        Validators.required
      ]),
      birthdate: new FormControl('', [
        Validators.required, 
        minAgeValidator(13), // Validador personalizado de edad mínima
        pastDateValidator // Validador personalizado: fecha debe ser en el pasado
      ]),
      address: new FormControl('', [
        Validators.maxLength(200)
      ]) // Campo opcional con límite de caracteres
    }, { 
      validators: passwordMatchValidator // Validador a nivel de FormGroup
    });

    // Suscribirse a cambios para feedback en tiempo real
    this.setupFormListeners();
  }

  ngOnInit(): void {
    // Asegurar que el DataService esté inicializado
    this.dataService.users(); // Trigger initialization
    
    // Verificar si ya hay una sesión activa
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  // ===================================
  // CONFIGURACIÓN DE LISTENERS DE EVENTOS
  // ===================================

  private setupFormListeners(): void {
    // Listener para username - actualizar longitud en tiempo real
    this.registerForm.get('username')?.valueChanges.subscribe(value => {
      this.usernameLength = value ? value.length : 0;
    });

    // Listener para password - calcular fortaleza en tiempo real
    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.passwordStrength = this.calculatePasswordStrength(value);
    });

    // Listener para email - detectar cuando está escribiendo
    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      this.emailTyping = true;
      setTimeout(() => this.emailTyping = false, 1000);
    });
  }

  // ===================================
  // MANEJO DE EVENTOS MODERNOS
  // ===================================

  /**
   * Evento (change) - Se dispara cuando el valor del input cambia y pierde el foco
   * Útil para validaciones que no necesitan ser en tiempo real
   */
  onFieldChange(fieldName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(`📝 Campo ${fieldName} cambió:`, input.value);
    
    // Ejemplo: Formatear el nombre con capitalize
    if (fieldName === 'fullName') {
      const formatted = this.capitalizeWords(input.value);
      this.registerForm.get('fullName')?.setValue(formatted, { emitEvent: false });
    }

    // Ejemplo: Convertir username a minúsculas automáticamente
    if (fieldName === 'username') {
      const lowercase = input.value.toLowerCase();
      if (input.value !== lowercase) {
        this.registerForm.get('username')?.setValue(lowercase, { emitEvent: false });
      }
    }
  }

  /**
   * Evento (keydown) - Se dispara cada vez que se presiona una tecla
   * Útil para prevenir caracteres no deseados o atajos de teclado
   */
  onKeyDown(fieldName: string, event: KeyboardEvent): void {
    // Prevenir espacios en username
    if (fieldName === 'username' && event.key === ' ') {
      event.preventDefault();
      this.notificationService.warning('El nombre de usuario no puede contener espacios');
      return;
    }

    // Prevenir números en el nombre completo
    if (fieldName === 'fullName' && /\d/.test(event.key) && event.key.length === 1) {
      event.preventDefault();
      return;
    }

    // Detectar Enter para enviar formulario
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  /**
   * Evento (input) - Se dispara en tiempo real mientras se escribe
   * Usado para validaciones inmediatas y feedback instantáneo
   */
  onInputChange(fieldName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    
    // Mostrar feedback inmediato de longitud
    if (fieldName === 'username') {
      this.usernameLength = input.value.length;
    }
  }

  /**
   * Evento (blur) - Se dispara cuando el campo pierde el foco
   * Útil para marcar el campo como touched y mostrar errores
   */
  onFieldBlur(fieldName: string): void {
    const control = this.registerForm.get(fieldName);
    
    if (control) {
      control.markAsTouched();
      
      // Validación adicional al perder el foco
      if (fieldName === 'email' && control.value) {
        console.log('✉️ Validando email:', control.value);
        // Aquí podrías agregar validación asíncrona para verificar si el email ya existe
      }
    }
  }

  /**
   * Evento (focus) - Se dispara cuando el campo obtiene el foco
   * Útil para mostrar ayudas o tips
   */
  onFieldFocus(fieldName: string): void {
    console.log(`🎯 Foco en campo: ${fieldName}`);
    
    // Ejemplo: mostrar tooltip con requisitos de contraseña
    if (fieldName === 'password') {
      // Se podría mostrar un tooltip aquí
    }
  }

  // ===================================
  // MÉTODOS DE UTILIDAD
  // ===================================

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearForm(): void {
    this.registerForm.reset();
    this.usernameLength = 0;
    this.passwordStrength = 0;
    this.notificationService.info('Formulario limpiado');
  }

  private capitalizeWords(text: string): string {
    return text.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private calculatePasswordStrength(password: string): number {
    if (!password) return 0;
    
    let strength = 0;
    
    // Longitud
    if (password.length >= 6) strength += 20;
    if (password.length >= 10) strength += 20;
    if (password.length >= 14) strength += 10;
    
    // Complejidad
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
    
    return Math.min(strength, 100);
  }

  getPasswordStrengthLabel(): string {
    if (this.passwordStrength < 30) return 'Débil';
    if (this.passwordStrength < 60) return 'Media';
    if (this.passwordStrength < 80) return 'Fuerte';
    return 'Muy fuerte';
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 30) return 'bg-red-500';
    if (this.passwordStrength < 60) return 'bg-yellow-500';
    if (this.passwordStrength < 80) return 'bg-blue-500';
    return 'bg-green-500';
  }

  getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  async onSubmit(): Promise<void> {
    console.log('🚀 [REGISTER] Iniciando proceso de registro...');
    
    if (this.registerForm.invalid) {
      console.log('❌ [REGISTER] Formulario inválido:', this.registerForm.errors);
      this.markFormGroupTouched();
      this.notificationService.error('Por favor, completa todos los campos correctamente');
      return;
    }

    this.isLoading = true;
    console.log('⏳ [REGISTER] Formulario válido, procesando...');

    try {
      const formValue = this.registerForm.value as RegisterFormData;
      console.log('📝 [REGISTER] Datos del formulario:', {
        fullName: formValue.fullName,
        username: formValue.username,
        email: formValue.email,
        hasPassword: !!formValue.password,
        hasConfirmPassword: !!formValue.confirmPassword,
        passwordsMatch: formValue.password === formValue.confirmPassword,
        birthdate: formValue.birthdate,
        hasAddress: !!formValue.address
      });
      
      // Preparar datos para el registro
      const registerData = {
        name: formValue.fullName,
        email: formValue.email,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword
      };
      
      console.log('📤 [REGISTER] Enviando datos al AuthService...');
      const result = await this.authService.register(registerData);
      console.log('📥 [REGISTER] Respuesta del AuthService:', result);
      
      if (result.success) {
        console.log('✅ [REGISTER] Registro exitoso!');
        this.notificationService.success('¡Cuenta creada exitosamente!');
        
        // Verificar si el usuario quedó autenticado
        const isAuthenticated = this.authService.isAuthenticated();
        const currentUser = this.authService.currentUser();
        console.log('🔐 [REGISTER] Estado de autenticación después del registro:', {
          isAuthenticated,
          currentUser: currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
          } : null
        });
        
        if (isAuthenticated) {
          console.log('🎯 [REGISTER] Usuario autenticado automáticamente, redirigiendo al dashboard...');
          
          // Pequeño delay para asegurar que la UI se actualice
          setTimeout(() => {
            this.redirectBasedOnRole();
          }, 100);
        } else {
          console.log('🔄 [REGISTER] Usuario no autenticado, redirigiendo al login...');
          // Redirigir al login con parámetro de éxito
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'true' } 
          });
        }
      } else {
        console.log('❌ [REGISTER] Error en registro:', result.message);
        this.notificationService.error(result.message || 'Error al crear la cuenta');
      }
    } catch (error) {
      console.error('💥 [REGISTER] Error inesperado en registro:', error);
      this.notificationService.error('Error inesperado al crear la cuenta');
    } finally {
      this.isLoading = false;
      console.log('🏁 [REGISTER] Proceso de registro finalizado');
    }
  }

  private redirectBasedOnRole(): void {
    const currentUser = this.authService.currentUser();
    
    if (currentUser?.role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (currentUser?.role === 'buyer') {
      this.router.navigate(['/buyer/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}