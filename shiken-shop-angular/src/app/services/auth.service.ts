import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, fromEvent, merge, firstValueFrom } from 'rxjs';
import { User, LoginCredentials, AuthState, UserRole, RegisterData, StorageKeys } from '../models';
import { NotificationService } from './notification.service';
import { DataService } from './data.service';
import { environment } from '../../environments/environment';

// ===================================
// AUTH CONFIGURATION
// ===================================

/**
 * @description
 * Interface de configuración para el servicio de autenticación.
 * Define parámetros de seguridad y comportamiento del sistema de login.
 * 
 * @interface AuthConfig
 * 
 * @property {number} sessionTimeout - Tiempo en milisegundos antes de que expire una sesión por inactividad
 * @property {number} maxLoginAttempts - Número máximo de intentos de login fallidos antes de bloquear
 * @property {number} lockoutTime - Tiempo en milisegundos que dura el bloqueo de cuenta
 * @property {string} loginUrl - URL a la que redirigir cuando se necesita autenticación
 * @property {string} unauthorizedUrl - URL a la que redirigir cuando hay acceso no autorizado
 * 
 * @usageNotes
 * - sessionTimeout afecta tanto a sesiones con "recordarme" como sin él
 * - El bloqueo por intentos fallidos es temporal y se almacena en localStorage
 * - Las URLs deben ser rutas válidas de la aplicación Angular
 * 
 * @example
 * ```typescript
 * const customConfig: AuthConfig = {
 *   sessionTimeout: 60 * 60 * 1000, // 1 hora
 *   maxLoginAttempts: 3,
 *   lockoutTime: 30 * 60 * 1000, // 30 minutos
 *   loginUrl: '/auth/login',
 *   unauthorizedUrl: '/403'
 * };
 * ```
 */
export interface AuthConfig {
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutTime: number;
  loginUrl: string;
  unauthorizedUrl: string;
}

/**
 * @description
 * Configuración por defecto del servicio de autenticación.
 * Establece valores estándar de seguridad para el sistema.
 * 
 * @constant
 * @type {AuthConfig}
 */
const DEFAULT_AUTH_CONFIG: AuthConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutos
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, // 15 minutos  
  loginUrl: '/login',
  unauthorizedUrl: '/login'
};

// ===================================
// SESSION DATA INTERFACE
// ===================================

/**
 * @description
 * Interface que representa los datos completos de una sesión de usuario activa.
 * Contiene toda la información necesaria para mantener y validar una sesión.
 * Se almacena en localStorage cuando el usuario selecciona "recordarme".
 * 
 * @interface SessionData
 * 
 * @property {boolean} isLoggedIn - Indica si hay una sesión activa
 * @property {number} userId - ID numérico del usuario (índice en array de usuarios)
 * @property {string} username - Nombre de usuario para identificación
 * @property {string} email - Email del usuario
 * @property {string} name - Nombre de display del usuario
 * @property {string} fullName - Nombre completo del usuario
 * @property {UserRole} role - Rol del usuario (admin o buyer)
 * @property {string} token - Token de sesión (simulado en esta implementación)
 * @property {number} loginTime - Timestamp en milisegundos del momento de login
 * @property {boolean} rememberMe - Si la sesión debe persistir después de cerrar el navegador
 * 
 * @usageNotes
 * - Solo se guarda en localStorage si rememberMe es true
 * - El loginTime se usa para calcular timeout de sesión
 * - No contiene información sensible como contraseñas
 * - Se valida en cada carga de la aplicación
 * 
 * @example
 * ```typescript
 * const sessionData: SessionData = {
 *   isLoggedIn: true,
 *   userId: 0,
 *   username: 'admin',
 *   email: 'admin@shiken.com',
 *   name: 'Admin',
 *   fullName: 'Administrador del Sistema',
 *   role: UserRole.ADMIN,
 *   token: 'session-token-12345',
 *   loginTime: Date.now(),
 *   rememberMe: true
 * };
 * ```
 */
export interface SessionData {
  isLoggedIn: boolean;
  userId: number;
  username: string;
  email: string;
  name: string;
  fullName: string;
  role: UserRole;
  token: string;
  loginTime: number;
  rememberMe: boolean;
}

/**
 * @description
 * Servicio de autenticación centralizado que gestiona todo el ciclo de vida de sesiones de usuario.
 * Proporciona funcionalidades de login, logout, registro, validación de sesiones y control de acceso.
 * Implementa manejo de estado reactivo mediante Angular signals y RxJS observables para máxima flexibilidad.
 * Incluye características de seguridad como timeout de sesión, límite de intentos de login y bloqueo temporal.
 * 
 * @class AuthService
 * @injectable
 * 
 * @usageNotes
 * - El servicio se proporciona en 'root' y es singleton en toda la aplicación
 * - Las sesiones expiran después de 30 minutos de inactividad por defecto
 * - Después de 5 intentos fallidos de login, la cuenta se bloquea por 15 minutos
 * - Soporta persistencia de sesión con "recordarme" mediante localStorage
 * - Emite cambios de estado mediante signals (reactivo) y observables (para código legacy)
 * - Se integra automáticamente con guards para protección de rutas
 * - Detecta actividad del usuario (clicks, teclas, movimiento) para resetear el timer de inactividad
 * 
 * @example
 * ```typescript
 * // Inyección en componente
 * constructor(private authService: AuthService) {
 *   // Verificar autenticación con signal
 *   if (this.authService.isAuthenticated()) {
 *     console.log('Usuario:', this.authService.currentUser()?.name);
 *   }
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Login de usuario
 * async onLogin() {
 *   const result = await this.authService.login({
 *     email: this.email,
 *     password: this.password
 *   }, this.rememberMe);
 *   
 *   if (result.success) {
 *     this.router.navigate(['/dashboard']);
 *   } else {
 *     console.error(result.message);
 *   }
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Suscripción a cambios de estado (observable)
 * this.authService.authState$.subscribe(state => {
 *   if (state.isAuthenticated) {
 *     console.log('Usuario logueado:', state.user?.name);
 *   } else {
 *     console.log('Usuario no autenticado');
 *   }
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Verificar roles con computed signals
 * if (this.authService.isAdmin()) {
 *   // Mostrar funcionalidades de administrador
 * } else if (this.authService.isBuyer()) {
 *   // Mostrar funcionalidades de comprador
 * }
 * ```
 */
// ===================================
// API RESPONSE INTERFACE
// ===================================
interface AuthResponse {
  success: boolean;
  message?: string;
  user?: Omit<User, 'password'>;
  token?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dataService = inject(DataService);
  private apiUrl = environment.apiUrl;
  private config: AuthConfig = DEFAULT_AUTH_CONFIG;
  
  // ===================================
  // REACTIVE STATE MANAGEMENT
  // ===================================
  
  // Señales para estado reactivo
  private authStateSignal = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null
  });
  
  // Computed signals
  public readonly authState = this.authStateSignal.asReadonly();
  public readonly isAuthenticated = computed(() => this.authState().isAuthenticated);
  public readonly currentUser = computed(() => this.authState().user);
  public readonly userRole = computed(() => this.authState().role);
  public readonly isAdmin = computed(() => this.userRole() === UserRole.ADMIN);
  public readonly isBuyer = computed(() => this.userRole() === UserRole.BUYER);
  
  // BehaviorSubject para compatibilidad con observables
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null
  });
  
  public readonly authState$ = this.authStateSubject.asObservable();
  
  // Timer para inactividad
  private inactivityTimer?: ReturnType<typeof setTimeout>;
  
  constructor() {
    this.initializeAuth();
    this.setupInactivityTimer();
  }
  
  // ===================================
  // INITIALIZATION
  // ===================================
  
  private initializeAuth(): void {
    const session = this.checkSession();
    if (session) {
      this.updateAuthState(session);
    }
  }
  
  // ===================================
  // AUTHENTICATION METHODS
  // ===================================
  
  /**
   * @description
   * Autentica un usuario con sus credenciales (email/username y contraseña).
   * Valida las credenciales contra los usuarios almacenados, aplica límite de intentos fallidos,
   * crea una sesión activa y actualiza el estado de autenticación en toda la aplicación.
   * 
   * @async
   * @param {LoginCredentials} credentials - Objeto con email/username y password del usuario
   * @param {boolean} [rememberMe=false] - Si es true, persiste la sesión en localStorage
   * 
   * @returns {Promise<{success: boolean, message: string}>} Objeto con resultado de la operación
   *   - success: true si login exitoso, false si falló
   *   - message: Mensaje descriptivo del resultado (éxito o error)
   * 
   * @usageNotes
   * - Se puede usar email o username en el campo credentials.email
   * - Después de 5 intentos fallidos, la cuenta se bloquea por 15 minutos
   * - Solo usuarios con active=true pueden hacer login
   * - Si rememberMe es false, la sesión solo dura hasta cerrar el navegador
   * - Si rememberMe es true, la sesión persiste hasta que expire por timeout o logout manual
   * - El método es asíncrono pero actualmente no hace llamadas HTTP (datos en localStorage)
   * - En producción, las contraseñas deberían estar hasheadas
   * 
   * @example
   * ```typescript
   * // Login básico sin recordar sesión
   * const result = await this.authService.login({
   *   email: 'user@example.com',
   *   password: 'myPassword123'
   * });
   * 
   * if (result.success) {
   *   console.log('Login exitoso!');
   *   this.router.navigate(['/dashboard']);
   * } else {
   *   this.showError(result.message);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Login con "recordarme" activado
   * const result = await this.authService.login({
   *   email: 'admin@shiken.com',
   *   password: 'admin123'
   * }, true);
   * 
   * if (result.success) {
   *   // La sesión persistirá después de cerrar el navegador
   *   console.log(result.message); // "¡Bienvenido, Admin!"
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Manejo de cuenta bloqueada
   * const result = await this.authService.login(credentials);
   * if (!result.success && result.message.includes('bloqueada')) {
   *   // Usuario ha excedido intentos, esperar 15 minutos
   *   this.showBlockedAccountWarning();
   * }
   * ```
   */
  async login(credentials: LoginCredentials, rememberMe = false): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar si la cuenta está bloqueada
      if (this.isAccountLocked()) {
        return {
          success: false,
          message: 'Cuenta bloqueada por múltiples intentos fallidos. Intenta nuevamente más tarde.'
        };
      }
      
      // Llamar al backend API
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
          ...credentials,
          rememberMe
        })
      );
      
      if (!response.success || !response.user || !response.token) {
        this.handleFailedLogin();
        const remainingAttempts = this.getRemainingAttempts();
        return {
          success: false,
          message: response.message || (remainingAttempts > 0 
            ? `Credenciales incorrectas. Te quedan ${remainingAttempts} intentos.`
            : 'Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos.')
        };
      }
      
      // Login exitoso - crear sesión con datos del backend
      const sessionData: SessionData = {
        isLoggedIn: true,
        userId: 0, // El backend no devuelve ID numérico, usar 0
        username: response.user.email,
        email: response.user.email,
        name: response.user.name,
        fullName: response.user.fullName || response.user.name,
        role: response.user.role as UserRole,
        token: response.token,
        loginTime: Date.now(),
        rememberMe
      };
      
      this.setSession(sessionData);
      this.clearLoginAttempts();
      
      // Migrar carrito local al backend
      await this.dataService.migrateLocalCartToBackend(response.user.email);
      await this.dataService.loadUserOrders(response.user.email);
      
      return {
        success: true,
        message: response.message || `¡Bienvenido, ${response.user.name}!`
      };
      
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del sistema. Intenta nuevamente.'
      };
    }
  }
  
  /**
   * @description
   * Registra un nuevo usuario en el sistema creando una cuenta con rol de comprador (buyer).
   * Valida que el email no exista, verifica que las contraseñas coincidan, crea el usuario
   * y lo almacena en localStorage. El usuario queda activo inmediatamente después del registro.
   * 
   * @async
   * @param {RegisterData} registerData - Datos del nuevo usuario a registrar
   *   - name: Nombre del usuario
   *   - email: Email único (se valida que no exista)
   *   - password: Contraseña del usuario
   *   - confirmPassword: Confirmación de la contraseña (debe coincidir)
   * 
   * @returns {Promise<{success: boolean, message: string}>} Objeto con resultado del registro
   *   - success: true si registro exitoso, false si falló
   *   - message: Mensaje descriptivo del resultado
   * 
   * @usageNotes
   * - Los usuarios registrados obtienen automáticamente el rol 'buyer'
   * - El email debe ser único en el sistema (case-sensitive)
   * - Las contraseñas deben coincidir exactamente
   * - En producción, la contraseña debe hashearse antes de almacenar
   * - El usuario queda activo (active: true) inmediatamente
   * - Se asigna la fecha actual como registeredAt
   * - Después de un registro exitoso, el usuario aún debe hacer login
   * 
   * @example
   * ```typescript
   * // Registro básico de nuevo usuario
   * const registerData: RegisterData = {
   *   name: 'Juan Pérez',
   *   email: 'juan@example.com',
   *   password: 'securePass123',
   *   confirmPassword: 'securePass123'
   * };
   * 
   * const result = await this.authService.register(registerData);
   * 
   * if (result.success) {
   *   console.log('Cuenta creada exitosamente');
   *   this.router.navigate(['/login']);
   * } else {
   *   this.showError(result.message);
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Manejo de email duplicado
   * const result = await this.authService.register(data);
   * if (!result.success && result.message.includes('ya existe')) {
   *   this.showEmailExistsError();
   *   this.suggestLogin();
   * }
   * ```
   * 
   * @example
   * ```typescript
   * // Validación de contraseñas no coincidentes
   * const result = await this.authService.register({
   *   name: 'Usuario',
   *   email: 'user@test.com',
   *   password: 'pass123',
   *   confirmPassword: 'pass456' // No coinciden
   * });
   * 
   * if (!result.success) {
   *   console.log(result.message); // "Las contraseñas no coinciden."
   * }
   * ```
   */
  async register(registerData: RegisterData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔧 [AUTH-SERVICE] Iniciando proceso de registro en API...');

      // Llamar al backend API
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, registerData)
      );
      
      if (!response.success) {
        console.log('❌ [AUTH-SERVICE] Registro fallido:', response.message);
        return {
          success: false,
          message: response.message || response.error || 'Error en el registro'
        };
      }
      
      console.log('✅ [AUTH-SERVICE] Usuario registrado exitosamente en API');
      
      // Si el registro incluye auto-login (tiene token)
      if (response.user && response.token) {
        const sessionData: SessionData = {
          isLoggedIn: true,
          userId: 0,
          username: response.user.email,
          email: response.user.email,
          name: response.user.name,
          fullName: response.user.fullName || response.user.name,
          role: response.user.role as UserRole,
          token: response.token,
          loginTime: Date.now(),
          rememberMe: false
        };
        
        this.setSession(sessionData);
      }
      
      // Verificar que se guardó correctamente
      const savedUsers = this.getUsersFromStorage();
      const savedUser = savedUsers.find(u => u.email === registerData.email);
      console.log('✅ [AUTH-SERVICE] Verificación - usuario guardado:', !!savedUser);
      
      if (savedUser) {
        // Iniciar sesión automáticamente después del registro exitoso
        console.log('🔐 [AUTH-SERVICE] Iniciando sesión automática después del registro...');
        this.createSession(savedUser, false); // No recordar por defecto
        console.log('🎯 [AUTH-SERVICE] Sesión automática creada exitosamente');
        
        return {
          success: true,
          message: `¡Bienvenido a ShikenShop, ${savedUser.name}! Tu cuenta ha sido creada exitosamente.`
        };
      } else {
        console.log('⚠️ [AUTH-SERVICE] No se pudo verificar el usuario guardado');
        return {
          success: true,
          message: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.'
        };
      }
      
    } catch (error) {
      console.error('💥 [AUTH-SERVICE] Error en registro:', error);
      return {
        success: false,
        message: 'Error interno del sistema. Intenta nuevamente.'
      };
    }
  }
  
  logout(): void {
    this.clearSession();
    this.clearInactivityTimer();
    this.notificationService.info('Sesión cerrada correctamente');
    this.router.navigate(['/']);
  }
  
  // ===================================
  // SESSION MANAGEMENT
  // ===================================
  
  private checkSession(): SessionData | null {
    const session = localStorage.getItem(StorageKeys.SESSION);
    
    if (!session) {
      return null;
    }
    
    try {
      const sessionData: SessionData = JSON.parse(session);
      
      // Verificar si la sesión es válida
      const now = new Date().getTime();
      const sessionAge = now - sessionData.loginTime;
      
      if (sessionAge > this.config.sessionTimeout) {
        // Sesión expirada
        this.clearSession();
        return null;
      }
      
      // Renovar timestamp de la sesión
      sessionData.loginTime = now;
      localStorage.setItem(StorageKeys.SESSION, JSON.stringify(sessionData));
      
      return sessionData;
    } catch (error) {
      console.error('Error al parsear sesión:', error);
      this.clearSession();
      return null;
    }
  }
  
  private createSession(user: User, rememberMe: boolean): void {
    const sessionData: SessionData = {
      isLoggedIn: true,
      userId: Math.random(), // En una app real sería el ID real del usuario
      username: user.name,
      email: user.email,
      name: user.name,
      fullName: user.name,
      role: user.role as UserRole,
      token: this.generateToken(),
      loginTime: new Date().getTime(),
      rememberMe
    };
    
    localStorage.setItem(StorageKeys.SESSION, JSON.stringify(sessionData));
    this.updateAuthState(sessionData);
    this.setupInactivityTimer();
  }

  private setSession(sessionData: SessionData): void {
    localStorage.setItem(StorageKeys.SESSION, JSON.stringify(sessionData));
    this.updateAuthState(sessionData);
    this.setupInactivityTimer();
  }
  
  private clearSession(): void {
    localStorage.removeItem(StorageKeys.SESSION);
    this.authStateSignal.set({
      isAuthenticated: false,
      user: null,
      role: null
    });
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      role: null
    });
  }
  
  private updateAuthState(session: SessionData): void {
    const user: User = {
      name: session.fullName,
      email: session.email,
      password: '', // No almacenar password en el estado
      role: session.role as UserRole,
      active: true,
      registeredAt: ''
    };
    
    const newState: AuthState = {
      isAuthenticated: true,
      user,
      role: session.role
    };
    
    this.authStateSignal.set(newState);
    this.authStateSubject.next(newState);
  }
  
  // ===================================
  // LOGIN ATTEMPTS & LOCKOUT
  // ===================================
  
  private isAccountLocked(): boolean {
    const lockoutTime = localStorage.getItem('lockoutTime');
    if (!lockoutTime) return false;
    
    const now = new Date().getTime();
    const lockTime = parseInt(lockoutTime);
    const isLocked = (now - lockTime) < this.config.lockoutTime;
    
    // Si el bloqueo ha expirado, limpiarlo automáticamente
    if (!isLocked) {
      this.clearLockout();
    }
    
    return isLocked;
  }
  
  private handleFailedLogin(): void {
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    const newAttempts = attempts + 1;
    
    localStorage.setItem('loginAttempts', newAttempts.toString());
    
    if (newAttempts >= this.config.maxLoginAttempts) {
      localStorage.setItem('lockoutTime', new Date().getTime().toString());
    }
  }
  
  private getRemainingAttempts(): number {
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    return Math.max(0, this.config.maxLoginAttempts - attempts);
  }
  
  private clearLoginAttempts(): void {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTime');
  }
  
  /**
   * Limpia el bloqueo de cuenta (público para debugging)
   */
  public clearLockout(): void {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTime');
    console.log('🔓 AuthService: Bloqueo de cuenta eliminado');
  }
  
  // ===================================
  // INACTIVITY TIMER
  // ===================================
  
  private setupInactivityTimer(): void {
    if (!this.isAuthenticated()) return;
    
    this.clearInactivityTimer();
    
    // Eventos que resetean el timer
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const activity$ = merge(...activityEvents.map(event => fromEvent(document, event)));
    
    const resetTimer = () => {
      this.clearInactivityTimer();
      this.inactivityTimer = setTimeout(() => {
        this.notificationService.warning('Sesión cerrada por inactividad');
        this.logout();
      }, this.config.sessionTimeout);
    };
    
    // Suscribirse a eventos de actividad
    activity$.subscribe(() => resetTimer());
    
    // Iniciar timer
    resetTimer();
  }
  
  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = undefined;
    }
  }
  
  // ===================================
  // UTILITY METHODS
  // ===================================
  
  private getUsersFromStorage(): User[] {
    const users = localStorage.getItem(StorageKeys.USERS);
    return users ? JSON.parse(users) : [];
  }
  
  private generateToken(): string {
    return 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  // ===================================
  // PUBLIC UTILITY METHODS
  // ===================================
  
  public getCurrentUser(): User | null {
    return this.currentUser();
  }
  
  public hasRole(role: UserRole): boolean {
    return this.userRole() === role;
  }
  
  public canAccess(allowedRoles: UserRole[]): boolean {
    if (!this.isAuthenticated()) return false;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(this.userRole()!);
  }
  
  public redirectToDashboard(): void {
    const role = this.userRole();
    if (role === UserRole.ADMIN) {
      this.router.navigate(['/admin']);
    } else if (role === UserRole.BUYER) {
      this.router.navigate(['/buyer']);
    } else {
      this.router.navigate(['/']);
    }
  }
}