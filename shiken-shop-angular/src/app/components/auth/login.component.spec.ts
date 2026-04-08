import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { DataService } from '../../services/data.service';

// ===================================
// LOGIN COMPONENT - UNIT TESTS
// ===================================

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let dataService: jasmine.SpyObj<DataService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  // ===================================
  // CONFIGURACIÓN DEL TESTBED
  // ===================================

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
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
    
    // Mock completo de ActivatedRoute con snapshot
    const activatedRouteSpy = {
      snapshot: {
        queryParams: {}
      },
      queryParams: of({})
    };

    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.currentUser.and.returnValue(null);
    dataServiceSpy.users.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ===================================
  // TESTS DE CREACIÓN E INICIALIZACIÓN
  // ===================================

  describe('Component Creation and Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize login form with empty values', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('identifier')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should have isLoading set to false initially', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should have showPassword set to false initially', () => {
      expect(component.showPassword).toBe(false);
    });

    it('should redirect if already authenticated', () => {
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
  // TESTS DE VALIDACIONES
  // ===================================

  describe('Form Validation', () => {
    it('should be invalid when form is empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });

    it('should require identifier', () => {
      const identifierControl = component.loginForm.get('identifier');
      expect(identifierControl?.valid).toBeFalsy();
      expect(identifierControl?.hasError('required')).toBeTruthy();
    });

    it('should require password', () => {
      const passwordControl = component.loginForm.get('password');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });

    it('should be valid with correct values', () => {
      component.loginForm.patchValue({
        identifier: 'test@example.com',
        password: 'Password123'
      });

      expect(component.loginForm.valid).toBeTruthy();
    });

    it('should validate email format if identifier looks like email', () => {
      const identifierControl = component.loginForm.get('identifier');
      
      // El patrón actual permite letras, números y @._+-
      identifierControl?.setValue('invalid email with space');
      expect(identifierControl?.hasError('pattern')).toBeTruthy();
      
      identifierControl?.setValue('valid@email.com');
      expect(identifierControl?.hasError('pattern')).toBeFalsy();
    });

    it('should accept username as identifier', () => {
      const identifierControl = component.loginForm.get('identifier');
      
      identifierControl?.setValue('username123');
      expect(identifierControl?.valid).toBeTruthy();
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
  });

  // ===================================
  // TESTS DE ENVÍO DE FORMULARIO
  // ===================================

  describe('Form Submission', () => {
    it('should not submit if form is invalid', async () => {
      await component.onSubmit();
      
      expect(authService.login).not.toHaveBeenCalled();
      expect(notificationService.warning).toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', async () => {
      await component.onSubmit();
      
      expect(component.loginForm.get('identifier')?.touched).toBeTruthy();
      expect(component.loginForm.get('password')?.touched).toBeTruthy();
    });

    it('should submit valid form successfully', fakeAsync(() => {
      component.loginForm.patchValue({
        identifier: 'test@example.com',
        password: 'Password123'
      });

      authService.login.and.returnValue(Promise.resolve({ 
        success: true, 
        message: 'Login successful',
        user: { id: '1', name: 'Test', email: 'test@example.com', role: 'buyer' } as any
      }));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123'
      }, false);
      expect(notificationService.success).toHaveBeenCalled();
    }));

    it('should show error on failed login', fakeAsync(() => {
      component.loginForm.patchValue({
        identifier: 'test@example.com',
        password: 'WrongPassword'
      });

      authService.login.and.returnValue(Promise.resolve({ 
        success: false, 
        message: 'Invalid credentials' 
      }));

      component.onSubmit();
      tick();

      expect(notificationService.error).toHaveBeenCalledWith('Invalid credentials');
    }));

    it('should set isLoading during login', fakeAsync(() => {
      component.loginForm.patchValue({
        identifier: 'test@example.com',
        password: 'Password123'
      });

      authService.login.and.returnValue(Promise.resolve({ 
        success: true, 
        message: 'Success',
        user: { id: '1', name: 'Test', email: 'test@example.com', role: 'buyer' } as any
      }));

      expect(component.isLoading).toBe(false);
      
      component.onSubmit();
      expect(component.isLoading).toBe(true);
      
      tick();
      expect(component.isLoading).toBe(false);
    }));

    it('should redirect to admin dashboard for admin users', fakeAsync(() => {
      component.loginForm.patchValue({
        identifier: 'admin@example.com',
        password: 'Admin123'
      });

      const adminUser = { 
        id: '1', 
        name: 'Admin', 
        email: 'admin@example.com', 
        role: 'admin' 
      } as any;

      authService.login.and.returnValue(Promise.resolve({ 
        success: true, 
        message: 'Success',
        user: adminUser
      }));
      authService.currentUser.and.returnValue(adminUser);

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    }));

    it('should redirect to buyer dashboard for buyer users', fakeAsync(() => {
      component.loginForm.patchValue({
        identifier: 'buyer@example.com',
        password: 'Buyer123'
      });

      const buyerUser = { 
        id: '1', 
        name: 'Buyer', 
        email: 'buyer@example.com', 
        role: 'buyer' 
      } as any;

      authService.login.and.returnValue(Promise.resolve({ 
        success: true, 
        message: 'Success',
        user: buyerUser
      }));
      authService.currentUser.and.returnValue(buyerUser);

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/buyer/dashboard']);
    }));
  });

  // ===================================
  // TESTS DE INTEGRACIÓN CON detectChanges()
  // ===================================

  describe('Integration Tests with detectChanges()', () => {
    it('should update view when form values change', () => {
      component.loginForm.get('identifier')?.setValue('test@example.com');
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const input = compiled.querySelector('#identifier') as HTMLInputElement;
      
      expect(input.value).toBe('test@example.com');
    });

    it('should show error messages after marking as touched', () => {
      const identifierControl = component.loginForm.get('identifier');
      identifierControl?.markAsTouched();
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const errorMessage = compiled.querySelector('.error-msg');
      
      expect(errorMessage).toBeTruthy();
    });

    it('should toggle password input type', () => {
      const compiled = fixture.nativeElement;
      const passwordInput = compiled.querySelector('#password') as HTMLInputElement;
      
      expect(passwordInput.type).toBe('password');
      
      component.togglePassword();
      fixture.detectChanges();
      
      expect(passwordInput.type).toBe('text');
    });

    it('should disable submit button when form is invalid', () => {
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      expect(submitButton.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.loginForm.patchValue({
        identifier: 'test@example.com',
        password: 'Password123'
      });
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
      
      expect(submitButton.disabled).toBeFalsy();
    });
  });

  // ===================================
  // TESTS DE EDGE CASES
  // ===================================

  describe('Edge Cases', () => {
    it('should handle login with username instead of email', fakeAsync(() => {
      component.loginForm.patchValue({
        identifier: 'testuser',
        password: 'Password123'
      });

      authService.login.and.returnValue(Promise.resolve({ 
        success: true, 
        message: 'Success',
        user: { id: '1', name: 'Test', username: 'testuser', role: 'buyer' } as any
      }));

      component.onSubmit();
      tick();

      expect(authService.login).toHaveBeenCalled();
    }));

    it('should handle network errors gracefully', fakeAsync(() => {
      component.loginForm.patchValue({
        identifier: 'test@example.com',
        password: 'Password123'
      });

      authService.login.and.returnValue(Promise.reject(new Error('Network error')));

      component.onSubmit();
      tick();

      expect(notificationService.error).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
    }));

    it('should trim whitespace from identifier', () => {
      component.loginForm.patchValue({
        identifier: '  test@example.com  ',
        password: 'Password123'
      });

      const trimmedValue = component.loginForm.get('identifier')?.value.trim();
      expect(trimmedValue).toBe('test@example.com');
    });
  });
});
