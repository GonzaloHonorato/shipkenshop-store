import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductReview } from '../../models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  product = signal<Product | null>(null);
  currentImageIndex = signal<number>(0);
  quantity = signal<number>(1);
  isAddedToCart = signal<boolean>(false);

  images = computed(() => {
    const prod = this.product();
    if (!prod) return [];

    const productImages = prod.images && prod.images.length > 0 ? prod.images : [prod.image];
    return productImages;
  });

  currentImage = computed(() => {
    const imgs = this.images();
    const index = this.currentImageIndex();
    return imgs[index] || '';
  });

  reviews = computed(() => {
    const prod = this.product();
    return prod?.productReviews || [];
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = params.get('id');
        if (productId) {
          this.loadProduct(productId);
        } else {
          this.router.navigate(['/404']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(productId: string): void {
    const products = this.dataService.products();
    const foundProduct = products.find(p => p.id === productId);

    if (foundProduct && foundProduct.active) {
      this.product.set(foundProduct);
      console.log('📦 [PRODUCT-DETAIL] Producto cargado:', foundProduct.name);
      console.log('📝 [PRODUCT-DETAIL] Reseñas:', foundProduct.productReviews);
      console.log('🖼️ [PRODUCT-DETAIL] Imágenes:', foundProduct.images);
    } else {
      console.error('❌ [PRODUCT-DETAIL] Producto no encontrado:', productId);
      this.router.navigate(['/404']);
    }
  }

  nextImage(): void {
    const imgs = this.images();
    const currentIndex = this.currentImageIndex();
    const nextIndex = (currentIndex + 1) % imgs.length;
    this.currentImageIndex.set(nextIndex);
  }

  previousImage(): void {
    const imgs = this.images();
    const currentIndex = this.currentImageIndex();
    const prevIndex = currentIndex === 0 ? imgs.length - 1 : currentIndex - 1;
    this.currentImageIndex.set(prevIndex);
  }

  selectImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  increaseQuantity(): void {
    const prod = this.product();
    if (prod && this.quantity() < prod.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  async addToCart(): Promise<void> {
    const prod = this.product();

    if (!this.authService.isAuthenticated()) {
      this.notificationService.warning('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    if (!prod) return;

    console.log('🛒 [PRODUCT-DETAIL] Agregando al carrito:', prod.name, 'Cantidad:', this.quantity());

    this.isAddedToCart.set(true);
    
    const user = this.authService.currentUser();
    if (user) {
      await this.dataService.addToCartHTTP(user.email, prod.id, this.quantity());
    }
    
    this.notificationService.success(`${prod.name} agregado al carrito 🛒`);

    setTimeout(() => {
      this.isAddedToCart.set(false);
    }, 2000);
  }

  goBack(): void {
    const prod = this.product();
    if (prod) {
      this.router.navigate(['/categories', prod.category]);
    } else {
      this.router.navigate(['/home']);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL').format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars: string[] = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }

    if (hasHalfStar) {
      stars.push('half');
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }

    return stars;
  }

  getCategoryColor(category: string): { gradient: string, accent: string, border: string } {
    const colorMap: Record<string, { gradient: string, accent: string, border: string }> = {
      'accion': {
        gradient: 'linear-gradient(to bottom right, #dc2626, #f97316)',
        accent: '#f87171',
        border: '#ef4444'
      },
      'rpg': {
        gradient: 'linear-gradient(to bottom right, #9333ea, #c026d3)',
        accent: '#c084fc',
        border: '#a855f7'
      },
      'estrategia': {
        gradient: 'linear-gradient(to bottom right, #2563eb, #14b8a6)',
        accent: '#4ade80',
        border: '#10b981'
      },
      'aventura': {
        gradient: 'linear-gradient(to bottom right, #f59e0b, #eab308)',
        accent: '#fbbf24',
        border: '#f59e0b'
      }
    };
    return colorMap[category] || colorMap['accion'];
  }

  getPageBackground(category: string): string {
    const backgroundMap: Record<string, string> = {
      'accion': 'linear-gradient(to bottom right, #111827, #7f1d1d, #111827)',
      'rpg': 'linear-gradient(to bottom right, #111827, #581c87, #111827)',
      'estrategia': 'linear-gradient(to bottom right, #111827, #1e3a8a, #111827)',
      'aventura': 'linear-gradient(to bottom right, #111827, #14532d, #111827)'
    };
    return backgroundMap[category] || backgroundMap['accion'];
  }
}
