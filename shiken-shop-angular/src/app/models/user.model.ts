// ===================================
// USER INTERFACE
// Estructura de datos para usuarios
// ===================================

/**
 * @description
 * Define la estructura de datos para un usuario del sistema ShikenShop.
 * Incluye información básica, credenciales, rol y datos opcionales de perfil extendido.
 * Esta interface es utilizada en toda la aplicación para tipado de usuarios.
 * 
 * @interface User
 * 
 * @property {string} name - Nombre del usuario (requerido para registro)
 * @property {string} email - Email único del usuario, usado para login (requerido)
 * @property {string} password - Contraseña del usuario, debe ser hasheada antes de almacenar (requerido)
 * @property {'admin' | 'buyer'} role - Rol del usuario que determina permisos: 'admin' o 'buyer'
 * @property {boolean} active - Estado activo/inactivo del usuario (true = puede acceder al sistema)
 * @property {string} registeredAt - Fecha ISO 8601 de registro del usuario en el sistema
 * @property {string} [fullName] - Nombre completo del usuario (opcional, para perfil extendido)
 * @property {string} [username] - Nombre de usuario único (opcional, alternativo al email)
 * @property {string} [phone] - Número de teléfono de contacto (opcional)
 * @property {string} [birthdate] - Fecha de nacimiento en formato ISO 8601 (opcional)
 * @property {string} [address] - Dirección postal completa (opcional)
 * @property {string} [updatedAt] - Fecha ISO 8601 de última actualización del perfil (opcional)
 * 
 * @usageNotes
 * - El email debe ser único en el sistema y se valida en registro/actualización
 * - La contraseña debe hashearse antes de guardarse (nunca almacenar texto plano)
 * - Los campos opcionales pueden agregarse/actualizarse después del registro inicial
 * - El campo 'active' permite deshabilitar usuarios sin eliminar sus datos
 * - Las fechas deben estar en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
 * 
 * @example
 * ```typescript
 * // Usuario básico en registro
 * const newUser: User = {
 *   name: 'Juan Pérez',
 *   email: 'juan@example.com',
 *   password: 'hashed_password_here',
 *   role: 'buyer',
 *   active: true,
 *   registeredAt: new Date().toISOString()
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Usuario con perfil completo
 * const fullUser: User = {
 *   name: 'María González',
 *   email: 'maria@example.com',
 *   password: 'hashed_password',
 *   role: 'admin',
 *   active: true,
 *   registeredAt: '2024-01-15T10:30:00.000Z',
 *   fullName: 'María José González Rodríguez',
 *   username: 'mariag',
 *   phone: '+56912345678',
 *   birthdate: '1990-05-20T00:00:00.000Z',
 *   address: 'Av. Principal 123, Santiago, Chile',
 *   updatedAt: '2024-03-10T15:45:00.000Z'
 * };
 * ```
 */
export interface User {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'buyer';
  active: boolean;
  registeredAt: string;
  // Propiedades adicionales para perfil completo
  fullName?: string;
  username?: string;
  phone?: string;
  birthdate?: string;
  address?: string;
  updatedAt?: string;
}

// ===================================
// USER ROLES ENUM
// Roles disponibles en el sistema
// ===================================

/**
 * @description
 * Enumeración de roles de usuario disponibles en el sistema ShikenShop.
 * Define los dos tipos de usuarios con sus respectivos permisos y accesos.
 * 
 * @enum {string}
 * 
 * @property {string} ADMIN - Rol de administrador con acceso completo al sistema
 * @property {string} BUYER - Rol de comprador con acceso limitado a funciones de cliente
 * 
 * @usageNotes
 * - ADMIN: Puede gestionar usuarios, productos, categorías y ver todas las ventas
 * - BUYER: Puede ver productos, agregar al carrito, realizar compras y ver su historial
 * - Los roles determinan qué rutas y funcionalidades están disponibles para cada usuario
 * - Se usa en guards, servicios y componentes para control de acceso
 * 
 * @example
 * ```typescript
 * // Asignar rol a usuario
 * const user: User = {
 *   name: 'Admin User',
 *   email: 'admin@shiken.com',
 *   role: UserRole.ADMIN,
 *   // ...otros campos
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Verificar rol en guard
 * if (user.role === UserRole.ADMIN) {
 *   // Permitir acceso a panel de administración
 *   return true;
 * }
 * ```
 */
export enum UserRole {
  ADMIN = 'admin',
  BUYER = 'buyer'
}

// ===================================
// AUTH TYPES
// Tipos relacionados con autenticación
// ===================================

/**
 * @description
 * Interface para las credenciales de login de usuario.
 * Contiene los datos mínimos requeridos para autenticación.
 * 
 * @interface LoginCredentials
 * 
 * @property {string} email - Email del usuario para identificación
 * @property {string} password - Contraseña en texto plano (se hashea al validar)
 * 
 * @usageNotes
 * - La contraseña se envía en texto plano pero debe hashearse antes de comparar
 * - El email debe ser válido y existir en el sistema
 * - Se usa en el método login() del AuthService
 * 
 * @example
 * ```typescript
 * const credentials: LoginCredentials = {
 *   email: 'user@example.com',
 *   password: 'mySecurePassword123'
 * };
 * 
 * this.authService.login(credentials, false).subscribe();
 * ```
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * @description
 * Interface que representa el estado completo de autenticación del usuario actual.
 * Contiene información sobre si hay un usuario autenticado y sus datos básicos.
 * 
 * @interface AuthState
 * 
 * @property {boolean} isAuthenticated - Indica si hay un usuario autenticado actualmente
 * @property {User | null} user - Datos completos del usuario autenticado, o null si no hay sesión
 * @property {UserRole | null} role - Rol del usuario autenticado, o null si no hay sesión
 * 
 * @usageNotes
 * - Se actualiza automáticamente en login, logout y restauración de sesión
 * - Los tres campos deben ser consistentes (si isAuthenticated es true, user y role deben existir)
 * - Se usa en signals, observables y guards para control de acceso
 * - No contiene información sensible como contraseñas
 * 
 * @example
 * ```typescript
 * // Estado de usuario autenticado
 * const authState: AuthState = {
 *   isAuthenticated: true,
 *   user: {
 *     name: 'Juan Pérez',
 *     email: 'juan@example.com',
 *     role: 'buyer',
 *     // ...otros campos
 *   },
 *   role: UserRole.BUYER
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Estado sin autenticación
 * const noAuthState: AuthState = {
 *   isAuthenticated: false,
 *   user: null,
 *   role: null
 * };
 * ```
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
}

/**
 * @description
 * Interface para los datos requeridos en el registro de nuevo usuario.
 * Contiene los campos mínimos necesarios para crear una cuenta.
 * 
 * @interface RegisterData
 * 
 * @property {string} name - Nombre del nuevo usuario
 * @property {string} email - Email único para el nuevo usuario
 * 
 * @usageNotes
 * - Se complementa con password y otros campos durante el registro
 * - El email debe ser único en el sistema
 * - Se valida en el componente de registro antes de enviar
 * - Por defecto, los nuevos usuarios obtienen rol 'buyer' y estado activo
 * 
 * @example
 * ```typescript
 * const registerData: RegisterData = {
 *   name: 'Carlos López',
 *   email: 'carlos@example.com'
 * };
 * ```
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}