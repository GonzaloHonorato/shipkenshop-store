import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CartItem, Product, Order, OrderStatus } from '../../models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  // ===================================
  // DEPENDENCY INJECTION
  // ===================================
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // ===================================
  // REACTIVE STATE
  // ===================================
  public cart = this.dataService.cart;
  public cartCount = this.dataService.cartCount;
  public isLoggedIn = this.authService.isAuthenticated;
  public currentUser = this.authService.currentUser;

  // Component state
  public isProcessingCheckout = signal(false);
  public showCheckoutModal = signal(false);
  public orderNumber = signal('');

  // ===================================
  // COMPUTED VALUES
  // ===================================
  public cartSummary = computed(() => {
    const items = this.cart();
    let subtotal = 0;
    let totalDiscount = 0;
    
    items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      if (item.discount && item.originalPrice) {
        const discountAmount = (item.originalPrice - item.price) * item.quantity;
        totalDiscount += discountAmount;
      }
    });
    
    return {
      subtotal,
      totalDiscount,
      total: subtotal,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
    };
  });

  public isEmpty = computed(() => this.cart().length === 0);

  // ===================================
  // LIFECYCLE METHODS
  // ===================================
  ngOnInit(): void {
    // Component initialization complete
  }

  // ===================================
  // CART OPERATIONS
  // ===================================

  /**
   * Incrementa la cantidad de un producto en el carrito
   */
  async increaseQuantity(index: number): Promise<void> {
    const cart = [...this.cart()];
    const item = cart[index];
    const user = this.currentUser();
    
    if (!user) {
      this.notificationService.warning('Debes iniciar sesión');
      return;
    }
    
    if (item && item.quantity < item.maxStock) {
      const newQuantity = item.quantity + 1;
      const success = await this.dataService.updateCartItemHTTP(user.email, item.id, newQuantity);
      if (success) {
        this.notificationService.success(`Cantidad actualizada: ${item.name}`);
      }
    } else {
      this.notificationService.warning('Stock máximo alcanzado');
    }
  }

  /**
   * Decrementa la cantidad de un producto en el carrito
   */
  async decreaseQuantity(index: number): Promise<void> {
    const cart = [...this.cart()];
    const item = cart[index];
    const user = this.currentUser();
    
    if (!user) {
      this.notificationService.warning('Debes iniciar sesión');
      return;
    }
    
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      const success = await this.dataService.updateCartItemHTTP(user.email, item.id, newQuantity);
      if (success) {
        this.notificationService.success(`Cantidad actualizada: ${item.name}`);
      }
    } else {
      this.removeFromCart(index);
    }
  }

  /**
   * Elimina un producto del carrito
   */
  async removeFromCart(index: number): Promise<void> {
    const cart = [...this.cart()];
    const item = cart[index];
    const user = this.currentUser();
    
    if (!user) {
      this.notificationService.warning('Debes iniciar sesión');
      return;
    }
    
    if (item) {
      const success = await this.dataService.removeFromCartHTTP(user.email, item.id);
      if (success) {
        this.notificationService.success(`${item.name} eliminado del carrito`);
      }
    }
  }

  /**
   * Vacía completamente el carrito
   */
  async clearCart(): Promise<void> {
    if (this.isEmpty()) {
      this.notificationService.info('El carrito ya está vacío');
      return;
    }

    const user = this.currentUser();
    if (!user) {
      this.notificationService.warning('Debes iniciar sesión');
      return;
    }

    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      const success = await this.dataService.clearCartHTTP(user.email);
      if (success) {
        this.notificationService.success('Carrito vaciado correctamente');
      }
    }
  }

  // ===================================
  // CHECKOUT PROCESS
  // ===================================

  /**
   * Inicia el proceso de checkout
   */
  processCheckout(): void {
    if (this.isEmpty()) {
      this.notificationService.warning('Tu carrito está vacío');
      return;
    }

    if (!this.isLoggedIn()) {
      this.notificationService.info('Debes iniciar sesión para completar la compra');
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/cart' }
      });
      return;
    }

    this.isProcessingCheckout.set(true);

    // Simular procesamiento del pago (2 segundos)
    setTimeout(() => {
      this.completeOrder();
    }, 2000);
  }

  /**
   * Completa la orden y guarda en el historial
   */
  private async completeOrder(): Promise<void> {
    const cart = this.cart();
    const user = this.currentUser();
    const summary = this.cartSummary();

    if (!user || cart.length === 0) {
      this.isProcessingCheckout.set(false);
      return;
    }

    try {
      // Crear la orden usando el método HTTP del servicio
      const order = await this.dataService.createOrderHTTP({
        userId: user.email,
        items: cart,
        shippingAddress: {},
        paymentMethod: 'card',
        subtotal: summary.subtotal,
        discount: summary.totalDiscount,
        total: summary.total
      });

      if (order) {
        // Limpiar el carrito vía API
        await this.dataService.clearCartHTTP(user.email);

        // Mostrar modal de éxito
        this.orderNumber.set(order.orderNumber);
        this.showCheckoutModal.set(true);
        this.notificationService.success('¡Compra realizada con éxito!');
      } else {
        this.notificationService.error('Error al crear la orden');
      }
    } catch (error) {
      console.error('Error creando orden:', error);
      this.notificationService.error('Error al procesar la compra');
    } finally {
      this.isProcessingCheckout.set(false);
    }
  }



  // ===================================
  // MODAL MANAGEMENT
  // ===================================

  /**
   * Cierra el modal de checkout y redirige
   */
  closeCheckoutModal(): void {
    this.showCheckoutModal.set(false);
    this.router.navigate(['/']);
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  /**
   * Formatea precios para mostrar
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Calcula el descuento de un item
   */
  getDiscountPercent(item: CartItem): number {
    if (!item.originalPrice || item.originalPrice <= item.price) return 0;
    return Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  }

  /**
   * Navega a las categorías de productos
   */
  goToCategories(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navega al detalle de un producto (futuro feature)
   */
  goToProduct(productId: string): void {
    // TODO: Implementar cuando tengamos página de detalle de producto
    console.log('Navigating to product:', productId);
  }
}