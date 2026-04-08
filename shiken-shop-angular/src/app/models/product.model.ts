// ===================================
// PRODUCT INTERFACE
// Estructura de datos para productos
// ===================================

/**
 * @description
 * Define la estructura completa de un producto en la tienda ShikenShop.
 * Incluye información básica, pricing, inventario, categorización y metadatos.
 * Los productos representan videojuegos disponibles para la venta.
 * 
 * @interface Product
 * 
 * @property {string} id - Identificador único del producto (UUID o similar)
 * @property {string} name - Nombre comercial del producto/videojuego
 * @property {string} description - Descripción detallada del producto, características y sinopsis
 * @property {ProductCategory} category - Categoría principal del juego (accion, rpg, estrategia, aventura)
 * @property {number} price - Precio actual de venta en la moneda del sistema
 * @property {number} originalPrice - Precio original antes de descuentos
 * @property {number} discount - Porcentaje de descuento aplicado (0-100)
 * @property {number} stock - Cantidad disponible en inventario
 * @property {string} image - URL o path de la imagen principal del producto
 * @property {boolean} active - Si el producto está activo y visible en la tienda
 * @property {boolean} featured - Si el producto aparece como destacado en la página principal
 * @property {number} rating - Calificación promedio del producto (0-5)
 * @property {number} reviews - Número total de reseñas/calificaciones recibidas
 * @property {string} releaseDate - Fecha de lanzamiento del juego en formato ISO 8601
 * @property {string} developer - Nombre del estudio desarrollador del juego
 * @property {string[]} platform - Array de plataformas compatibles (PC, PS5, Xbox, etc.)
 * @property {string[]} tags - Etiquetas descriptivas para búsqueda y filtrado
 * @property {string} createdAt - Fecha ISO 8601 de creación del registro en el sistema
 * @property {string} updatedAt - Fecha ISO 8601 de última actualización del producto
 * 
 * @usageNotes
 * - El campo 'id' debe ser único en todo el sistema
 * - El 'discount' se calcula como: ((originalPrice - price) / originalPrice) * 100
 * - Los productos con stock <= 0 no deberían permitir compra
 * - Los productos con active=false no aparecen en búsquedas de clientes
 * - El rating debe estar entre 0 y 5, con decimales permitidos
 * - Las fechas deben estar en formato ISO 8601 para consistencia
 * - Las plataformas comunes incluyen: 'PC', 'PS5', 'PS4', 'Xbox Series X', 'Xbox One', 'Switch'
 * 
 * @example
 * ```typescript
 * // Producto completo
 * const product: Product = {
 *   id: 'prod-001',
 *   name: 'The Legend of Heroes',
 *   description: 'Un épico RPG de aventuras con sistema de combate por turnos...',
 *   category: 'rpg',
 *   price: 39990,
 *   originalPrice: 59990,
 *   discount: 33,
 *   stock: 50,
 *   image: '/assets/images/heroes.jpg',
 *   active: true,
 *   featured: true,
 *   rating: 4.7,
 *   reviews: 1250,
 *   releaseDate: '2024-03-15T00:00:00.000Z',
 *   developer: 'Nihon Falcom',
 *   platform: ['PC', 'PS5', 'Switch'],
 *   tags: ['RPG', 'Turn-Based', 'Story-Rich', 'Japanese'],
 *   createdAt: '2024-01-10T08:00:00.000Z',
 *   updatedAt: '2024-11-28T14:30:00.000Z'
 * };
 * ```
 * 
 * @example
 * ```typescript
 * // Producto sin descuento
 * const newProduct: Product = {
 *   id: 'prod-002',
 *   name: 'Racing Champions',
 *   description: 'Simulador de carreras realista...',
 *   category: 'accion',
 *   price: 49990,
 *   originalPrice: 49990,
 *   discount: 0,
 *   stock: 100,
 *   image: '/assets/images/racing.jpg',
 *   active: true,
 *   featured: false,
 *   rating: 4.2,
 *   reviews: 580,
 *   releaseDate: '2024-06-20T00:00:00.000Z',
 *   developer: 'Speed Studios',
 *   platform: ['PC', 'PS5', 'Xbox Series X'],
 *   tags: ['Racing', 'Simulation', 'Multiplayer'],
 *   createdAt: '2024-05-01T10:00:00.000Z',
 *   updatedAt: '2024-05-01T10:00:00.000Z'
 * };
 * ```
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  discount: number;
  stock: number;
  image: string;
  images?: string[];
  active: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  productReviews?: ProductReview[];
  releaseDate: string;
  developer: string;
  platform: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ===================================
// PRODUCT CATEGORIES
// Categorías de productos disponibles
// ===================================

export type ProductCategory = 'accion' | 'rpg' | 'estrategia' | 'aventura';

export enum ProductCategoryEnum {
  ACCION = 'accion',
  RPG = 'rpg',
  ESTRATEGIA = 'estrategia',
  AVENTURA = 'aventura'
}

// ===================================
// CATEGORY INTERFACE
// Información sobre categorías
// ===================================

export interface Category {
  id: ProductCategory;
  name: string;
  description: string;
  color: string;
  icon: string;
  gradient: string;
}

// ===================================
// PRODUCT FILTERS
// Interfaces para filtrado de productos
// ===================================

export interface ProductFilter {
  category?: ProductCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  platforms?: string[];
  tags?: string[];
  featured?: boolean;
  active?: boolean;
}

export interface ProductSearchParams {
  query?: string;
  category?: ProductCategory;
  sortBy?: 'name' | 'price' | 'rating' | 'releaseDate';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ===================================
// PRODUCT REVIEWS
// Interfaz para reseñas de productos
// ===================================

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful?: number;
}