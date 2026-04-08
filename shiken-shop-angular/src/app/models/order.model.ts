import { CartItem } from './cart.model';
import { User } from './user.model';

// ===================================
// ORDER INTERFACE
// Estructura de datos para órdenes
// ===================================

export interface Order {
  orderNumber: string;
  items: CartItem[];
  total: number;
  date: string;
  status: OrderStatus;
  user?: User;
  shippingAddress?: ShippingAddress;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

// ===================================
// ORDER STATUS
// Estados posibles de una orden
// ===================================

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// ===================================
// SHIPPING ADDRESS
// Dirección de envío
// ===================================

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

// ===================================
// PAYMENT METHOD
// Método de pago
// ===================================

export interface PaymentMethod {
  type: PaymentType;
  cardNumber?: string;  // Los últimos 4 dígitos
  cardHolder?: string;
  expiryDate?: string;
  transactionId?: string;
}

export enum PaymentType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer'
}

// ===================================
// ORDER CREATION
// Datos necesarios para crear una orden
// ===================================

export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

// ===================================
// ORDER SUMMARY
// Resumen de la orden
// ===================================

export interface OrderSummary {
  orderNumber: string;
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  date: string;
}

// ===================================
// ORDER UTILS
// Funciones utilitarias para órdenes
// ===================================

export class OrderUtils {
  static generateOrderNumber(): string {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  static calculateOrderTotal(items: CartItem[], shipping = 0, tax = 0): number {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal + shipping + tax;
  }

  static getOrderSummary(order: Order): OrderSummary {
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      orderNumber: order.orderNumber,
      totalItems,
      subtotal,
      shipping: 0, // Por ahora sin shipping
      tax: 0,      // Por ahora sin tax
      total: order.total,
      status: order.status,
      date: order.date
    };
  }
}