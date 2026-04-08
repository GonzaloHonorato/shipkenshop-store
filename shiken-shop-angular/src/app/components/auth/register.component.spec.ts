import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DataService } from '../../services/data.service';

// ===================================
// REGISTER COMPONENT - UNIT TESTS
// ===================================

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let dataService: jasmine.SpyObj<DataService>;
  let router: jasmine.SpyObj<Router>;

  // ===================================
  // CONFIGURACIÓN DEL TESTBED
  // ===================================

  beforeEach(async () => {
    // Crear spies (mocks) de los servicios
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'register',
      'isAuthenticated',
      'currentUser',
      'logout'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning',
      'info'
    ]);
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['users']);
    
    // CORREGIDO: Mock completo del Router con todos los métodos necesarios
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl'], {
      events: new Subject()
    });
    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('/mocked-url');
    
    // AGREGADO: Mock de ActivatedRoute
    const activatedRouteSpy = {
      snapshot: {
        queryParams: {}
      },
      queryParams: of({})
    };

    // Configurar valores por defecto para los spies
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.currentUser.and.returnValue(null);
    dataServiceSpy.users.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    // Obtener referencias a los servicios mock
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Crear el componente
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger ngOnInit
  });

  // ===================================
  // TESTS DE CREACIÓN E INICIALIZACIÓN
  // ===================================

  describe('Component Creation and Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the registration form with empty values', () => {
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('fullName')?.value).toBe('');
      expect(component.registerForm.get('username')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
      expect(component.registerForm.get('birthdate')?.value).toBe('');
      expect(component.registerForm.get('address')?.value).toBe('');
    });

    it('should have isLoading set to false initially', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should have showPassword set to false initially', () => {
      expect(component.showPassword).toBe(false);
    });

    it('should call dataService.users() on initialization', () => {
      expect(dataService.users).toHaveBeenCalled();
    });

    it('should redirect if user is already authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue({ 
        id: '1', 
        name: 'Test User', 
        email: 'test@test.com', 
        role: 'buyer' 
      } as any);
      
      component.ngOnInit();
      
      expect(router.navigate).toHaveBeenCalled();
    });
  });

  // ===================================
  // TESTS DE VALIDACIONES - REQUIRED
  // ===================================

  describe('Form Validation - Required Fields', () => {
    it('should be invalid when form is empty', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('should require fullName', () => {
      const fullNameControl = component.registerForm.get('fullName');
      expect(fullNameControl?.valid).toBeFalsy();
      expect(fullNameControl?.hasError('required')).toBeTruthy();
    });

    it('should require username', () => {
      const usernameControl = component.registerForm.get('username');
      expect(usernameControl?.valid).toBeFalsy();
      expect(usernameControl?.hasError('required')).toBeTruthy();
    });

    it('should require email', () => {
      const emailControl = component.registerForm.get('email');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('required')).toBeTruthy();
    });

    it('should require password', () => {
      const passwordControl = component.registerForm.get('password');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });

    it('should require confirmPassword', () => {
      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      expect(confirmPasswordControl?.valid).toBeFalsy();
      expect(confirmPasswordControl?.hasError('required')).toBeTruthy();
    });

    it('should require birthdate', () => {
      const birthdateControl = component.registerForm.get('birthdate');
      expect(birthdateControl?.valid).toBeFalsy();
      expect(birthdateControl?.hasError('required')).toBeTruthy();
    });

    it('should not require address (optional field)', () => {
      const addressControl = component.registerForm.get('address');
      expect(addressControl?.hasError('required')).toBeFalsy();
    });
  });

  // ===================================
  // TESTS DE VALIDACIONES - MIN/MAX LENGTH
  // ===================================

  describe('Form Validation - MinLength and MaxLength', () => {
    it('should validate fullName minLength (2 characters)', () => {
      const fullNameControl = component.registerForm.get('fullName');
      fullNameControl?.setValue('A');
      expect(fullNameControl?.hasError('minlength')).toBeTruthy();
      
      fullNameControl?.setValue('AB');
      expect(fullNameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate fullName maxLength (50 characters)', () => {
      const fullNameControl = component.registerForm.get('fullName');
      const longName = 'A'.repeat(51);
      fullNameControl?.setValue(longName);
      expect(fullNameControl?.hasError('maxlength')).toBeTruthy();
      
      fullNameControl?.setValue('A'.repeat(50));
      expect(fullNameControl?.hasError('maxlength')).toBeFalsy();
    });

    it('should validate username minLength (3 characters)', () => {
      const usernameControl = component.registerForm.get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBeTruthy();
      
      usernameControl?.setValue('abc');
      expect(usernameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate username maxLength (20 characters)', () => {
      const usernameControl = component.registerForm.get('username');
      const longUsername = 'a'.repeat(21);
      usernameControl?.setValue(longUsername);
      expect(usernameControl?.hasError('maxlength')).toBeTruthy();
    });

    it('should validate password minLength (6 characters)', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('Pass1');
      expect(passwordControl?.hasError('minlength')).toBeTruthy();
      
      passwordControl?.setValue('Pass12');
      expect(passwordControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate password maxLength (18 characters)', () => {
      const passwordControl = component.registerForm.get('password');
      const longPassword = 'Password123' + 'a'.repeat(10);
      passwordControl?.setValue(longPassword);
      expect(passwordControl?.hasError('maxlength')).toBeTruthy();
    });
  });

  // ===================================
  // TESTS DE VALIDACIONES - PATTERN
  // ===================================

  describe('Form Validation - Pattern Validators', () => {
    it('should validate email pattern', () => {
      const emailControl = component.registerForm.get('email');
      
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email') || emailControl?.hasError('pattern')).toBeTruthy();
      
      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
      expect(emailControl?.hasError('pattern')).toBeFalsy();
    });

    it('should validate username pattern (only letters, numbers, underscore)', () => {
      const usernameControl = component.registerForm.get('username');
      
      usernameControl?.setValue('user name'); // with space
      expect(usernameControl?.hasError('pattern') || usernameControl?.hasError('invalidUsername')).toBeTruthy();
      
      usernameControl?.setValue('user-name'); // with dash
      expect(usernameControl?.hasError('pattern') || usernameControl?.hasError('invalidUsername')).toBeTruthy();
      
      usernameControl?.setValue('user_name123');
      expect(usernameControl?.hasError('pattern')).toBeFalsy();
    });
  });

  // ===================================
  // TESTS DE VALIDADORES PERSONALIZADOS
  // ===================================

  describe('Form Validation - Custom Validators', () => {
    it('should validate strong password (uppercase, lowercase, number)', () => {
      const passwordControl = component.registerForm.get('password');
      
      passwordControl?.setValue('password'); // no uppercase, no number
      expect(passwordControl?.hasError('strongPassword')).toBeTruthy();
      
      passwordControl?.setValue('Password'); // no number
      expect(passwordControl?.hasError('strongPassword')).toBeTruthy();
      
      passwordControl?.setValue('password123'); // no uppercase
      expect(passwordControl?.hasError('strongPassword')).toBeTruthy();
      
      passwordControl?.setValue('Password123'); // valid
      expect(passwordControl?.hasError('strongPassword')).toBeFalsy();
    });

    it('should validate password match', () => {
      component.registerForm.patchValue({
        password: 'Password123',
        confirmPassword: 'Password456'
      });
      
      expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
      
      component.registerForm.patchValue({
        confirmPassword: 'Password123'
      });
      
      expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should validate minimum age (13 years)', () => {
      const birthdateControl = component.registerForm.get('birthdate');
      
      // Fecha hace 10 años (menor de 13)
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      birthdateControl?.setValue(tenYearsAgo.toISOString().split('T')[0]);
      
      expect(birthdateControl?.hasError('minAge')).toBeTruthy();
      
      // Fecha hace 15 años (mayor de 13)
      const fifteenYearsAgo = new Date();
      fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);
      birthdateControl?.setValue(fifteenYearsAgo.toISOString().split('T')[0]);
      
      expect(birthdateControl?.hasError('minAge')).toBeFalsy();
    });

    it('should validate that fullName does not contain numbers', () => {
      const fullNameControl = component.registerForm.get('fullName');
      
      fullNameControl?.setValue('John Doe 123');
      expect(fullNameControl?.hasError('noNumbers')).toBeTruthy();
      
      fullNameControl?.setValue('John Doe');
      expect(fullNameControl?.hasError('noNumbers')).toBeFalsy();
    });

    it('should validate that birthdate is in the past', () => {
      const birthdateControl = component.registerForm.get('birthdate');
      
      // Fecha futura
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      birthdateControl?.setValue(tomorrow.toISOString().split('T')[0]);
      
      expect(birthdateControl?.hasError('pastDate')).toBeTruthy();
      
      // Fecha pasada
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      birthdateControl?.setValue(yesterday.toISOString().split('T')[0]);
      
      expect(birthdateControl?.hasError('pastDate')).toBeFalsy();
    });
  });

  // ===================================
  // TESTS DE MÉTODOS DE MANEJO DE EVENTOS
  // ===================================

  describe('Event Handling Methods', () => {
    it('should capitalize full name on change event', () => {
      const mockEvent = {
        target: { value: 'john doe' }
      } as any;
      
      component.registerForm.get('fullName')?.setValue('john doe');
      component.onFieldChange('fullName', mockEvent);
      fixture.detectChanges();
      
      expect(component.registerForm.get('fullName')?.value).toBe('John Doe');
    });

    it('should convert username to lowercase on change event', () => {
      const mockEvent = {
        target: { value: 'UserName123' }
      } as any;
      
      component.registerForm.get('username')?.setValue('UserName123');
      component.onFieldChange('username', mockEvent);
      fixture.detectChanges();
      
      expect(component.registerForm.get('username')?.value).toBe('username123');
    });

    it('should prevent spaces in username on keydown', () => {
      const mockEvent = {
        key: ' ',
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      component.onKeyDown('username', mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(notificationService.warning).toHaveBeenCalledWith('El nombre de usuario no puede contener espacios');
    });

    it('should prevent numbers in fullName on keydown', () => {
      const mockEvent = {
        key: '5',
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      component.onKeyDown('fullName', mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should update username length on input change', () => {
      const mockEvent = {
        target: { value: 'testuser' }
      } as any;
      
      component.onInputChange('username', mockEvent);
      
      expect(component.usernameLength).toBe(8);
    });

    it('should mark field as touched on blur', () => {
      const emailControl = component.registerForm.get('email');
      expect(emailControl?.touched).toBeFalsy();
      
      component.onFieldBlur('email');
      
      expect(emailControl?.touched).toBeTruthy();
    });
  });

  // ===================================
  // TESTS DE MÉTODOS DE UTILIDAD
  // ===================================

  describe('Utility Methods', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword).toBe(false);
      
      component.togglePassword();
      expect(component.showPassword).toBe(true);
      
      component.togglePassword();
      expect(component.showPassword).toBe(false);
    });

    it('should toggle confirm password visibility', () => {
      expect(component.showConfirmPassword).toBe(false);
      
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBe(true);
      
      component.toggleConfirmPassword();
      expect(component.showConfirmPassword).toBe(false);
    });

    it('should clear form and show notification', () => {
      component.registerForm.patchValue({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com'
      });
      
      component.clearForm();
      
      expect(component.registerForm.get('fullName')?.value).toBeNull();
      expect(component.registerForm.get('username')?.value).toBeNull();
      expect(component.registerForm.get('email')?.value).toBeNull();
      expect(notificationService.info).toHaveBeenCalledWith('Formulario limpiado');
    });

    it('should calculate password strength correctly', () => {
      expect(component['calculatePasswordStrength']('weak')).toBeLessThan(30);
      expect(component['calculatePasswordStrength']('Medium1')).toBeGreaterThanOrEqual(30);
      expect(component['calculatePasswordStrength']('Strong123')).toBeGreaterThanOrEqual(60);
      expect(component['calculatePasswordStrength']('VeryStrong123!')).toBeGreaterThanOrEqual(80);
    });

    it('should return correct password strength label', () => {
      component.passwordStrength = 20;
      expect(component.getPasswordStrengthLabel()).toBe('Débil');
      
      component.passwordStrength = 50;
      expect(component.getPasswordStrengthLabel()).toBe('Media');
      
      component.passwordStrength = 70;
      expect(component.getPasswordStrengthLabel()).toBe('Fuerte');
      
      component.passwordStrength = 90;
      expect(component.getPasswordStrengthLabel()).toBe('Muy fuerte');
    });

    it('should return current date in correct format', () => {
      const currentDate = component.getCurrentDate();
      expect(currentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ===================================
  // TESTS DE ENVÍO DE FORMULARIO
  // ===================================

  describe('Form Submission', () => {
    it('should not submit if form is invalid', async () => {
      await component.onSubmit();
      
      expect(authService.register).not.toHaveBeenCalled();
      expect(notificationService.error).toHaveBeenCalledWith('Por favor, completa todos los campos correctamente');
    });

    it('should mark all fields as touched when submitting invalid form', async () => {
      await component.onSubmit();
      
      expect(component.registerForm.get('fullName')?.touched).toBeTruthy();
      expect(component.registerForm.get('username')?.touched).toBeTruthy();
      expect(component.registerForm.get('email')?.touched).toBeTruthy();
    });

    it('should submit valid form successfully', fakeAsync(() => {
      // Configurar formulario válido
      const fifteenYearsAgo = new Date();
      fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);
      
      component.registerForm.patchValue({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        birthdate: fifteenYearsAgo.toISOString().split('T')[0],
        address: '123 Main St'
      });

      // Mock successful registration
      authService.register.and.returnValue(Promise.resolve({ success: true, message: 'Success' }));
      authService.isAuthenticated.and.returnValue(true);
      authService.currentUser.and.returnValue({ 
        id: '1', 
        name: 'John Doe', 
        email: 'john@example.com', 
        role: 'buyer' 
      } as any);

      component.onSubmit();
      tick();

      expect(authService.register).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('¡Cuenta creada exitosamente!');
    }));

    it('should show error on failed registration', fakeAsync(() => {
      const fifteenYearsAgo = new Date();
      fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);
      
      component.registerForm.patchValue({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        birthdate: fifteenYearsAgo.toISOString().split('T')[0]
      });

      authService.register.and.returnValue(
        Promise.resolve({ success: false, message: 'Email already exists' })
      );

      component.onSubmit();
      tick();

      expect(notificationService.error).toHaveBeenCalledWith('Email already exists');
    }));

    it('should set isLoading during submission', fakeAsync(() => {
      const fifteenYearsAgo = new Date();
      fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);
      
      component.registerForm.patchValue({
        fullName: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        birthdate: fifteenYearsAgo.toISOString().split('T')[0]
      });

      authService.register.and.returnValue(Promise.resolve({ success: true, message: 'Success' }));

      expect(component.isLoading).toBe(false);
      
      component.onSubmit();
      expect(component.isLoading).toBe(true);
      
      tick();
      expect(component.isLoading).toBe(false);
    }));
  });

  // ===================================
  // TESTS DE INTEGRACIÓN CON detectChanges()
  // ===================================

  describe('Integration Tests with detectChanges()', () => {
    it('should update view when form values change', () => {
      component.registerForm.get('username')?.setValue('testuser');
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const input = compiled.querySelector('#username') as HTMLInputElement;
      
      expect(input.value).toBe('testuser');
    });

    it('should show error messages after detectChanges()', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const errorMessage = compiled.querySelector('.error-message');
      
      expect(errorMessage).toBeTruthy();
    });

    it('should update password strength indicator', () => {
      component.registerForm.get('password')?.setValue('Password123');
      fixture.detectChanges();
      
      expect(component.passwordStrength).toBeGreaterThan(0);
    });
  });
});
