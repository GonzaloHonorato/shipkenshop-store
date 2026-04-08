import { Product } from './product.model';

// ===================================
// CART ITEM INTERFACE
// Estructura de datos para items del carrito
// ===================================

/**
 * @description
 * Representa un item individual en el carrito de compras del usuario.
 * Contiene la información esencial del producto y la cantidad seleccionada.
 * Es una versión simplificada del Product con datos específicos del carrito.
 * 
 * @interface CartItem
 * 
 * @property {string} id - ID del producto original (referencia a Product.id)
 * @property {string} name - Nombre del producto para mostrar en el carrito
 * @property {number} price - Precio actual con descuento aplicado
 * @property {number} originalPrice - Precio original sin descuento
 * @property {number} discount - Porcentaje de descuento (0-100)
 * @property {string} image - URL o path de la imagen del producto
 * @property {number} quantity - Cantidad de unidades en el carrito
 * @property {number} maxStock - Stock máximo disponible del producto
 * 
 * @usageNotes
 * - La quantity no debe exceder maxStock
 * - El subtotal se calcula como: price * quantity
 * - Se sincroniza con localStorage para persistencia
 * - Cuando el stock del producto cambia, maxStock debe actualizarse
 * - Si maxStock < quantity, se debe ajustar automáticamente
 * 
 * @example
 * ```typescript
 * const cartItem: CartItem = {
 *   id: 'prod-001',
 *   name: 'The Legend of Heroes',
 *   price: 39990,
 *   originalPrice: 59990,
 *   discount: 33,
 *   image: '/assets/images/heroes.jpg',
 *   quantity: 2,
 *   maxStock: 50
 * };
 * 
 * const itemTotal = cartItem.price * cartItem.quantity; // 79980
 * ```
 * 
 * @example
 * ```typescript
 * // Item sin descuento
 * const regularItem: CartItem = {
 *   id: 'prod-002',
 *   name: 'Racing Champions',
 *   price: 49990,
 *   originalPrice: 49990,
 *   discount: 0,
 *   image: '/assets/images/racing.jpg',
 *   quantity: 1,
 *   maxStock: 100
 * };
 * ```
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  quantity: number;
  maxStock: number;
}

// ===================================
// CART INTERFACE
// Estructura completa del carrito
// ===================================

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
  updatedAt: string;
}

// ===================================
// CART OPERATIONS
// Tipos para operaciones del carrito
// ===================================

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  total: number;
}

// ===================================
// CART UTILS
// Funciones utilitarias para el carrito
// ===================================

export class CartUtils {
  static calculateItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  static calculateCartSummary(items: CartItem[]): CartSummary {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = subtotal - total;

    return {
      totalItems,
      subtotal,
      totalDiscount,
      total
    };
  }

  static createCartItemFromProduct(product: Product, quantity = 1): CartItem {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      discount: product.discount,
      image: product.image,
      quantity,
      maxStock: product.stock
    };
  }
}