import { Component, OnInit, OnDestroy, signal, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductCategoryEnum } from '../../models';

// Interface para configuración de categoría
export interface CategoryConfig {
  category: ProductCategoryEnum;
  title: string;
  description: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  accentColor: string;
}

@Component({
  selector: 'app-category-base',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-base.component.html',
  styleUrls: ['./category-base.component.scss']
})
export class CategoryBaseComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Input para configuración de la categoría
  config = input.required<CategoryConfig>();

  // Signals para filtros
  private priceFilter = signal<{ min: number; max: number } | null>(null);
  private sortBy = signal<string>('name');
  private showOnlyDiscount = signal<boolean>(false);
  
  // Signal para controlar botones "Añadido"
  private addedProducts = signal<Set<string>>(new Set());

  // Computed para productos filtrados
  private categoryProducts = computed(() => 
    this.dataService.products().filter((p: Product) => 
      p.category === this.config().category && p.active
    )
  );

  filteredProducts = computed(() => {
    let products = [...this.categoryProducts()];

    // Filtro por precio
    const priceRange = this.priceFilter();
    if (priceRange) {
      products = products.filter((p: Product) => 
        p.price >= priceRange.min && p.price <= priceRange.max
      );
    }

    // Filtro por descuentos
    if (this.showOnlyDiscount()) {
      products = products.filter((p: Product) => p.discount && p.discount > 0);
    }

    // Ordenamiento
    const sort = this.sortBy();
    switch (sort) {
      case 'price-asc':
        products = products.sort((a: Product, b: Product) => a.price - b.price);
        break;
      case 'price-desc':
        products = products.sort((a: Product, b: Product) => b.price - a.price);
        break;
      case 'rating':
        products = products.sort((a: Product, b: Product) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        products = products.sort((a: Product, b: Product) => 
          new Date(b.releaseDate || b.createdAt).getTime() - 
          new Date(a.releaseDate || a.createdAt).getTime()
        );
        break;
      default: // name
        products = products.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
        break;
    }

    return products;
  });

  ngOnInit(): void {
    console.log('🎮 [CATEGORY] Inicializando categoría:', this.config().category);
    
    // Log de productos disponibles
    console.log('📦 [CATEGORY] Productos en categoría:', {
      category: this.config().category,
      total: this.categoryProducts().length,
      products: this.categoryProducts().map((p: Product) => ({ name: p.name, price: p.price }))
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPriceFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    
    if (!value) {
      this.priceFilter.set(null);
      return;
    }

    const [min, max] = value.split('-').map(Number);
    this.priceFilter.set({ min, max });
    
    console.log('💰 [CATEGORY] Filtro de precio aplicado:', { min, max });
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sortBy.set(value);
    
    console.log('🔀 [CATEGORY] Ordenamiento aplicado:', value);
  }

  onDiscountFilterChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.showOnlyDiscount.set(checked);
    
    console.log('🏷️ [CATEGORY] Filtro de ofertas:', checked ? 'activado' : 'desactivado');
  }

  clearFilters(): void {
    this.priceFilter.set(null);
    this.sortBy.set('name');
    this.showOnlyDiscount.set(false);
    
    // Reset form controls
    const selects = document.querySelectorAll('select');
    selects.forEach(select => select.selectedIndex = 0);
    
    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
    
    console.log('🧹 [CATEGORY] Filtros limpiados');
    this.notificationService.info('Filtros limpiados');
  }

  async addToCart(product: Product): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    console.log('🛒 [CATEGORY] Agregando al carrito:', product.name);
    
    // Agregar producto al set de "añadidos" para cambiar el botón
    const currentAdded = this.addedProducts();
    const newAdded = new Set(currentAdded);
    newAdded.add(product.id);
    this.addedProducts.set(newAdded);
    
    // Usar el método addToCartHTTP del DataService
    const user = this.authService.currentUser();
    if (user) {
      await this.dataService.addToCartHTTP(user.email, product.id, 1);
    }
    
    // Mostrar notificación
    this.notificationService.success(`${product.name} agregado al carrito 🛒`);
    
    // Restaurar el botón después de 2 segundos
    setTimeout(() => {
      const updated = new Set(this.addedProducts());
      updated.delete(product.id);
      this.addedProducts.set(updated);
    }, 2000);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL').format(price);
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  getPriceColor(): string {
    const colorMap: Record<string, string> = {
      'red-400': '#f87171',      // Acción
      'purple-400': '#c084fc',   // RPG
      'green-400': '#4ade80',    // Estrategia
      'amber-400': '#fbbf24'     // Aventura
    };
    return colorMap[this.config().accentColor] || '#f87171';
  }

  isProductAdded(productId: string): boolean {
    return this.addedProducts().has(productId);
  }

  getButtonClasses(): string {
    return `bg-gradient-to-r from-${this.config().gradientFrom}-600 to-${this.config().gradientTo}-600 hover:from-${this.config().gradientFrom}-700 hover:to-${this.config().gradientTo}-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`;
  }

  getBadgeClasses(): string {
    return `bg-${this.config().accentColor}-600 px-3 py-1 rounded-full text-sm font-bold pulse text-white`;
  }

  getPageBackground(): string {
    const backgroundMap: Record<string, string> = {
      'red-400': 'linear-gradient(to bottom right, #111827, #7f1d1d, #111827)',      // Acción: gray-900, red-900, gray-900  
      'purple-400': 'linear-gradient(to bottom right, #111827, #581c87, #111827)',   // RPG: gray-900, purple-900, gray-900
      'green-400': 'linear-gradient(to bottom right, #111827, #1e3a8a, #111827)',    // Estrategia: gray-900, blue-900, gray-900 (como en original)
      'amber-400': 'linear-gradient(to bottom right, #111827, #14532d, #111827)'     // Aventura: gray-900, green-900, gray-900 (como en original)
    };
    return backgroundMap[this.config().accentColor] || backgroundMap['red-400'];
  }

  getBannerBackground(): string {
    // El banner es más sutil, solo usa el color principal
    const bannerMap: Record<string, string> = {
      'red-400': 'linear-gradient(to bottom right, #111827, #991b1b, #111827)',      // Acción: red-800
      'purple-400': 'linear-gradient(to bottom right, #111827, #6b21a8, #111827)',   // RPG: purple-800  
      'green-400': 'linear-gradient(to bottom right, #111827, #1e40af, #111827)',    // Estrategia: blue-800 (como en original)
      'amber-400': 'linear-gradient(to bottom right, #111827, #166534, #111827)'     // Aventura: green-800 (como en original)
    };
    return bannerMap[this.config().accentColor] || bannerMap['red-400'];
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const stars: string[] = [];
    
    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    // Media estrella
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }
    
    return stars;
  }
}