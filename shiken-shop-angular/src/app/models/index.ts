// ===================================
// MODELS INDEX
// Exportación centralizada de todos los modelos
// ===================================

// User models
export * from './user.model';

// Product models  
export * from './product.model';

// Cart models
export * from './cart.model';

// Order models
export * from './order.model';

// ===================================
// COMMON TYPES
// Tipos compartidos entre modelos
// ===================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===================================
// LOCALSTORAGE KEYS
// Claves utilizadas en localStorage
// ===================================

export enum StorageKeys {
  USERS = 'users',
  PRODUCTS = 'products',
  CART = 'cart',
  ORDERS = 'orders',
  SESSION = 'session',
  AUTH_TOKEN = 'authToken',
  USER_PREFERENCES = 'userPreferences'
}