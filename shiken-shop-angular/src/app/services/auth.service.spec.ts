import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { DataService } from './data.service';
import { NotificationService } from './notification.service';
import { UserRole } from '../models';

const API_URL = 'http://localhost:8082/api';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let dataService: jasmine.SpyObj<DataService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();

    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'migrateLocalCartToBackend',
      'loadUserOrders'
    ]);
    dataServiceSpy.migrateLocalCartToBackend.and.returnValue(Promise.resolve());
    dataServiceSpy.loadUserOrders.and.returnValue(Promise.resolve());

    const notifSpy = jasmine.createSpyObj('NotificationService', [
      'success', 'error', 'info', 'warning'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DataService, useValue: dataServiceSpy },
        { provide: NotificationService, useValue: notifSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  // ===================================
  // Creación del servicio
  // ===================================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===================================
  // Estado inicial (sin sesión)
  // ===================================

  describe('initial state - no session', () => {
    it('should not be authenticated', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should have null currentUser', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should have null userRole', () => {
      expect(service.userRole()).toBeNull();
    });

    it('should not be admin', () => {
      expect(service.isAdmin()).toBeFalse();
    });

    it('should not be buyer', () => {
      expect(service.isBuyer()).toBeFalse();
    });

    it('authState$ should emit not-authenticated state', (done) => {
      service.authState$.subscribe(state => {
        expect(state.isAuthenticated).toBeFalse();
        expect(state.user).toBeNull();
        done();
      });
    });
  });

  // ===================================
  // Restauración de sesión desde localStorage
  // ===================================

  describe('session restoration', () => {
    it('should restore session from localStorage on init', () => {
      const session = {
        isLoggedIn: true,
        userId: 0,
        username: 'admin@test.com',
        email: 'admin@test.com',
        name: 'Admin',
        fullName: 'Admin User',
        role: UserRole.ADMIN,
        token: 'test-token',
        loginTime: Date.now(),
        rememberMe: true
      };
      localStorage.setItem('session', JSON.stringify(session));

      // Re-instanciar el servicio para que lea el localStorage
      TestBed.resetTestingModule();

      const dataServiceSpy2 = jasmine.createSpyObj('DataService', [
        'migrateLocalCartToBackend', 'loadUserOrders'
      ]);
      const notifSpy2 = jasmine.createSpyObj('NotificationService', [
        'success', 'error', 'info', 'warning'
      ]);
      const routerSpy2 = jasmine.createSpyObj('Router', ['navigate']);

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: DataService, useValue: dataServiceSpy2 },
          { provide: NotificationService, useValue: notifSpy2 },
          { provide: Router, useValue: routerSpy2 }
        ]
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.isAuthenticated()).toBeTrue();
      expect(newService.currentUser()?.email).toBe('admin@test.com');
    });

    it('should NOT restore expired session', () => {
      const expiredSession = {
        isLoggedIn: true,
        userId: 0,
        username: 'admin@test.com',
        email: 'admin@test.com',
        name: 'Admin',
        fullName: 'Admin User',
        role: UserRole.ADMIN,
        token: 'test-token',
        loginTime: Date.now() - (60 * 60 * 1000), // 60 minutos atrás (expirada)
        rememberMe: true
      };
      localStorage.setItem('session', JSON.stringify(expiredSession));

      TestBed.resetTestingModule();
      const dataServiceSpy2 = jasmine.createSpyObj('DataService', [
        'migrateLocalCartToBackend', 'loadUserOrders'
      ]);
      const notifSpy2 = jasmine.createSpyObj('NotificationService', [
        'success', 'error', 'info', 'warning'
      ]);
      const routerSpy2 = jasmine.createSpyObj('Router', ['navigate']);

      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: DataService, useValue: dataServiceSpy2 },
          { provide: NotificationService, useValue: notifSpy2 },
          { provide: Router, useValue: routerSpy2 }
        ]
      });

      const newService = TestBed.inject(AuthService);
      expect(newService.isAuthenticated()).toBeFalse();
    });

    it('should handle invalid session JSON in localStorage', () => {
      localStorage.setItem('session', 'invalid-json{{{');
      // Service should not throw during initialization
      expect(() => {
        TestBed.resetTestingModule();
        const spy1 = jasmine.createSpyObj('DataService', ['migrateLocalCartToBackend', 'loadUserOrders']);
        const spy2 = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);
        const spy3 = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
          providers: [
            AuthService,
            provideHttpClient(),
            provideHttpClientTesting(),
            { provide: DataService, useValue: spy1 },
            { provide: NotificationService, useValue: spy2 },
            { provide: Router, useValue: spy3 }
          ]
        });
        TestBed.inject(AuthService);
      }).not.toThrow();
    });
  });

  // ===================================
  // login()
  // ===================================

  describe('login()', () => {
    it('should return error when account is locked', async () => {
      localStorage.setItem('lockoutTime', Date.now().toString());
      localStorage.setItem('loginAttempts', '5');

      const result = await service.login({ email: 'test@test.com', password: 'pass' });

      expect(result.success).toBeFalse();
      expect(result.message).toContain('bloqueada');
    });

    it('should make POST request to /auth/login', fakeAsync(async () => {
      const loginPromise = service.login({
        email: 'admin@shiken.com',
        password: 'Admin123'
      });

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({
        success: true,
        user: {
          email: 'admin@shiken.com',
          name: 'Admin',
          role: UserRole.ADMIN,
          fullName: 'Admin User'
        },
        token: 'valid-token',
        message: '¡Bienvenido, Admin!'
      });
      flushMicrotasks();

      const result = await loginPromise;
      expect(result.success).toBeTrue();
      expect(result.message).toBe('¡Bienvenido, Admin!');
    }));

    it('should authenticate user after successful login', fakeAsync(async () => {
      const loginPromise = service.login({ email: 'admin@shiken.com', password: 'Admin123' });

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush({
        success: true,
        user: { email: 'admin@shiken.com', name: 'Admin', role: UserRole.ADMIN, fullName: 'Admin' },
        token: 'valid-token',
        message: '¡Bienvenido!'
      });
      flushMicrotasks();

      await loginPromise;
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.isAdmin()).toBeTrue();
    }));

    it('should return error on failed login response', fakeAsync(async () => {
      const loginPromise = service.login({ email: 'wrong@test.com', password: 'wrong' });

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush({ success: false, message: 'Credenciales incorrectas' });
      flushMicrotasks();

      const result = await loginPromise;
      expect(result.success).toBeFalse();
    }));

    it('should increment login attempts on failure', fakeAsync(async () => {
      const loginPromise = service.login({ email: 'wrong@test.com', password: 'wrong' });

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush({ success: false });
      flushMicrotasks();

      await loginPromise;
      expect(localStorage.getItem('loginAttempts')).toBe('1');
    }));

    it('should lock account after max attempts', fakeAsync(async () => {
      localStorage.setItem('loginAttempts', '4');

      const loginPromise = service.login({ email: 'wrong@test.com', password: 'wrong' });
      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush({ success: false });
      flushMicrotasks();

      await loginPromise;
      expect(localStorage.getItem('lockoutTime')).toBeTruthy();
    }));

    it('should return error on network failure', fakeAsync(async () => {
      const loginPromise = service.login({ email: 'test@test.com', password: 'pass' });

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      const result = await loginPromise;
      expect(result.success).toBeFalse();
      expect(result.message).toContain('Error');
    }));

    it('should pass rememberMe to backend', fakeAsync(async () => {
      const loginPromise = service.login({ email: 'admin@test.com', password: 'pass' }, true);

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      expect(req.request.body.rememberMe).toBeTrue();
      req.flush({ success: false });
      flushMicrotasks();

      await loginPromise;
    }));
  });

  // ===================================
  // register()
  // ===================================

  describe('register()', () => {
    it('should make POST request to /auth/register', fakeAsync(async () => {
      const registerPromise = service.register({
        name: 'Test User',
        email: 'test@test.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      });

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, message: 'Cuenta creada exitosamente' });
      flushMicrotasks();

      const result = await registerPromise;
      expect(result.success).toBeTrue();
    }));

    it('should return error when registration fails', fakeAsync(async () => {
      const registerPromise = service.register({
        name: 'Test',
        email: 'existing@test.com',
        password: 'Pass123',
        confirmPassword: 'Pass123'
      });

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      req.flush({ success: false, message: 'Email ya registrado' });
      flushMicrotasks();

      const result = await registerPromise;
      expect(result.success).toBeFalse();
      expect(result.message).toBe('Email ya registrado');
    }));

    it('should create session when register returns token', fakeAsync(async () => {
      const registerPromise = service.register({
        name: 'New User',
        email: 'new@test.com',
        password: 'Pass123',
        confirmPassword: 'Pass123'
      });

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      req.flush({
        success: true,
        user: { email: 'new@test.com', name: 'New User', role: UserRole.BUYER, fullName: 'New User' },
        token: 'new-token',
        message: '¡Bienvenido!'
      });
      flushMicrotasks();

      const result = await registerPromise;
      expect(result.success).toBeTrue();
    }));

    it('should return error on network failure', fakeAsync(async () => {
      const registerPromise = service.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'Pass123',
        confirmPassword: 'Pass123'
      });

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      const result = await registerPromise;
      expect(result.success).toBeFalse();
    }));

    it('should use error field from response if message is missing', fakeAsync(async () => {
      const registerPromise = service.register({
        name: 'Test',
        email: 'test@test.com',
        password: 'Pass123',
        confirmPassword: 'Pass123'
      });

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      req.flush({ success: false, error: 'Error del servidor' });
      flushMicrotasks();

      const result = await registerPromise;
      expect(result.message).toBe('Error del servidor');
    }));
  });

  // ===================================
  // logout()
  // ===================================

  describe('logout()', () => {
    it('should navigate to home (/)', () => {
      service.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should clear authentication state', () => {
      service.logout();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should show info notification', () => {
      service.logout();
      expect(notificationService.info).toHaveBeenCalled();
    });

    it('should remove session from localStorage', fakeAsync(async () => {
      const loginPromise = service.login({ email: 'admin@test.com', password: 'pass' });
      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush({
        success: true,
        user: { email: 'admin@test.com', name: 'Admin', role: UserRole.ADMIN, fullName: 'Admin' },
        token: 'token',
        message: '¡Bienvenido!'
      });
      flushMicrotasks();
      await loginPromise;

      service.logout();
      expect(localStorage.getItem('session')).toBeNull();
    }));
  });

  // ===================================
  // hasRole()
  // ===================================

  describe('hasRole()', () => {
    it('should return false when not authenticated', () => {
      expect(service.hasRole(UserRole.ADMIN)).toBeFalse();
      expect(service.hasRole(UserRole.BUYER)).toBeFalse();
    });
  });

  // ===================================
  // canAccess()
  // ===================================

  describe('canAccess()', () => {
    it('should return false when not authenticated with specific roles', () => {
      expect(service.canAccess([UserRole.ADMIN])).toBeFalse();
    });

    it('should return false even with empty roles when not authenticated', () => {
      expect(service.canAccess([])).toBeFalse();
    });
  });

  // ===================================
  // getCurrentUser()
  // ===================================

  describe('getCurrentUser()', () => {
    it('should return null when not authenticated', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  // ===================================
  // clearLockout()
  // ===================================

  describe('clearLockout()', () => {
    it('should remove loginAttempts from localStorage', () => {
      localStorage.setItem('loginAttempts', '3');
      service.clearLockout();
      expect(localStorage.getItem('loginAttempts')).toBeNull();
    });

    it('should remove lockoutTime from localStorage', () => {
      localStorage.setItem('lockoutTime', Date.now().toString());
      service.clearLockout();
      expect(localStorage.getItem('lockoutTime')).toBeNull();
    });

    it('should work when lockout data does not exist', () => {
      expect(() => service.clearLockout()).not.toThrow();
    });

    it('should clear expired lockout when login is attempted', fakeAsync(async () => {
      // Lockout expirado (hace más de 15 minutos)
      const expiredLockTime = Date.now() - (20 * 60 * 1000);
      localStorage.setItem('lockoutTime', expiredLockTime.toString());
      localStorage.setItem('loginAttempts', '5');

      // Login no debe devolver "cuenta bloqueada" porque el lockout expiró
      const loginPromise = service.login({ email: 'test@test.com', password: 'pass' });
      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush({ success: false, message: 'Credenciales incorrectas' });
      flushMicrotasks();

      const result = await loginPromise;
      expect(result.message).not.toContain('bloqueada');
    }));
  });

  // ===================================
  // redirectToDashboard()
  // ===================================

  describe('redirectToDashboard()', () => {
    it('should navigate to / when not authenticated (role null)', () => {
      service.redirectToDashboard();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
