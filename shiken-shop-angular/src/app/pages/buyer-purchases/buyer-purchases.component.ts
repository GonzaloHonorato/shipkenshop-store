import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus, Product } from '../../models';

@Component({
  selector: 'app-buyer-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buyer-purchases.component.html',
  styleUrls: ['./buyer-purchases.component.scss']
})
export class BuyerPurchasesComponent implements OnInit {
  // Inyección de dependencias
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estado reactivo
  searchTerm = signal('');
  statusFilter = signal<OrderStatus | ''>('');
  selectedOrder = signal<Order | null>(null);
  showModal = signal(false);

  // Computed properties
  currentUser = computed(() => this.authService.currentUser());
  allOrders = computed(() => this.dataService.orders());
  products = computed(() => this.dataService.products());
  cartCount = computed(() => this.dataService.cart().length);

  // Órdenes del usuario actual
  userOrders = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    return this.allOrders().filter(order => order.user?.email === user.email);
  });

  // Órdenes filtradas
  filteredOrders = computed(() => {
    const orders = this.userOrders();
    const search = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return orders
      .filter(order => {
        const matchesSearch = !search || order.items.some(item => 
          this.getProductName(item.id).toLowerCase().includes(search)
        );
        const matchesStatus = !status || order.status === status;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Estadísticas del usuario
  userStats = computed(() => {
    const orders = this.userOrders();
    
    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
      totalGames: orders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      )
    };
  });

  // Estados de orden disponibles
  orderStatuses: { value: OrderStatus | '', label: string }[] = [
    { value: '', label: 'Todos' },
    { value: OrderStatus.PENDING, label: 'Pendiente' },
    { value: OrderStatus.CONFIRMED, label: 'Confirmado' },
    { value: OrderStatus.PROCESSING, label: 'Procesando' },
    { value: OrderStatus.SHIPPED, label: 'Enviado' },
    { value: OrderStatus.DELIVERED, label: 'Entregado' },
    { value: OrderStatus.CANCELLED, label: 'Cancelado' }
  ];

  ngOnInit() {
    // Verificar autenticación
    if (!this.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
  }

  // Obtener nombre del producto por ID
  getProductName(itemId: string): string {
    const products = this.products();
    const item = products.find(p => p.id === itemId);
    return item?.name || 'Producto no encontrado';
  }

  // Obtener producto por ID
  getProduct(itemId: string): Product | undefined {
    return this.products().find(p => p.id === itemId);
  }

  // Obtener imagen del producto
  getProductImage(itemId: string): string {
    const product = this.getProduct(itemId);
    return product?.image || '/assets/images/placeholder-game.jpg';
  }

  // Obtener precio del producto
  getProductPrice(itemId: string): number {
    const product = this.getProduct(itemId);
    return product?.price || 0;
  }

  // Formatear fecha
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtener clase de estado
  getStatusClass(status: OrderStatus): string {
    const classes: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      [OrderStatus.CONFIRMED]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      [OrderStatus.PROCESSING]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      [OrderStatus.SHIPPED]: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      [OrderStatus.DELIVERED]: 'bg-green-500/20 text-green-300 border-green-500/30',
      [OrderStatus.CANCELLED]: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return classes[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }

  // Obtener etiqueta de estado
  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.PROCESSING]: 'Procesando',
      [OrderStatus.SHIPPED]: 'Enviado',
      [OrderStatus.DELIVERED]: 'Entregado',
      [OrderStatus.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  // Filtrar por búsqueda
  onSearchChange(value: string) {
    this.searchTerm.set(value);
  }

  // Filtrar por estado
  onStatusChange(status: string) {
    this.statusFilter.set(status as OrderStatus | '');
  }

  // Mostrar detalles de orden
  showOrderDetails(order: Order) {
    this.selectedOrder.set(order);
    this.showModal.set(true);
  }

  // Cerrar modal
  closeModal() {
    this.showModal.set(false);
    this.selectedOrder.set(null);
  }

  // Navegar a categoría
  goToCategory(category: string) {
    this.router.navigate(['/categories', category]);
  }

  // Navegar al catálogo
  goToCatalog() {
    this.router.navigate(['/home']);
  }

  // Navegar al carrito
  goToCart() {
    this.router.navigate(['/cart']);
  }

  // Cerrar sesión
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Obtener ID corto de orden
  getShortOrderId(orderId: string): string {
    return orderId.substring(0, 8).toUpperCase();
  }

  // Calcular subtotal de item
  getItemSubtotal(itemId: string, quantity: number): number {
    return this.getProductPrice(itemId) * quantity;
  }

  // Obtener primeros 3 items de la orden
  getFirstThreeItems(items: any[]): any[] {
    return items.slice(0, 3);
  }

  // Obtener cantidad de items restantes
  getRemainingItemsCount(items: any[]): number {
    return Math.max(0, items.length - 3);
  }

  // Recomprar orden
  async reorderItems(order: Order): Promise<void> {
    const user = this.currentUser();
    if (!user) return;

    // Limpiar carrito actual
    await this.dataService.clearCartHTTP(user.email);
    
    // Agregar items de la orden al carrito
    for (const item of order.items) {
      await this.dataService.addToCartHTTP(user.email, item.id, item.quantity);
    }

    // Navegar al carrito
    this.router.navigate(['/cart']);
  }

  // Descargar comprobante (simulado)
  downloadReceipt(order: Order) {
    // Crear contenido del comprobante
    const receiptContent = `
      SHIKENSHOP - COMPROBANTE DE COMPRA
      ===================================
      
      Orden: #${this.getShortOrderId(order.orderNumber)}
      Fecha: ${this.formatDate(order.date)}
      Estado: ${this.getStatusLabel(order.status)}
      
      PRODUCTOS:
      ${order.items.map(item => 
        `- ${this.getProductName(item.id)} x${item.quantity} - $${this.getItemSubtotal(item.id, item.quantity).toFixed(2)}`
      ).join('\n')}
      
      TOTAL: $${order.total.toFixed(2)}
      
      Gracias por tu compra en ShikenShop
    `;

    // Crear y descargar archivo
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comprobante-ShikenShop-${this.getShortOrderId(order.orderNumber)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Cancelar orden (solo si está pendiente)
  cancelOrder(order: Order) {
    if (order.status !== OrderStatus.PENDING) return;
    
    if (confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      this.dataService.updateOrderStatus(order.orderNumber, OrderStatus.CANCELLED);
    }
  }

  // Verificar si una orden se puede cancelar
  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDING;
  }

  // Verificar si una orden se puede recomprar
  canReorderItems(order: Order): boolean {
    return order.status === OrderStatus.DELIVERED;
  }
}