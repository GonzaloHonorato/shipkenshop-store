import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { DataService } from '../../services/data.service';
import { Product } from '../../models';

interface HeroSlide {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string;
  cta?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private carouselSubscription?: Subscription;

  // Hero Carousel
  currentSlideIndex = signal<number>(0);
  heroSlides: HeroSlide[] = [
    {
      title: 'Múltiples Métodos de Pago',
      subtitle: 'Paga como prefieras',
      description: 'Aceptamos tarjetas de crédito, débito, transferencias y más. Tu comodidad es nuestra prioridad.',
      icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>`,
      gradient: 'from-blue-600 to-cyan-500',
      cta: 'Ver métodos de pago'
    },
    {
      title: 'Envío Digital Instantáneo',
      subtitle: 'Juega de inmediato',
      description: 'Recibe tu código de activación al instante por email. Sin esperas, sin complicaciones.',
      icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>`,
      gradient: 'from-purple-600 to-pink-600',
      cta: 'Conoce más'
    },
    {
      title: 'Códigos de Descuento',
      subtitle: 'Ahorra en grande',
      description: 'Usa cupones exclusivos y aprovecha descuentos de hasta 50% en tus juegos favoritos.',
      icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>`,
      gradient: 'from-green-600 to-teal-500',
      cta: 'Ver ofertas'
    },
    {
      title: 'Garantía de Satisfacción',
      subtitle: 'Compra sin riesgos',
      description: 'Si no estás satisfecho, te devolvemos tu dinero. Tu confianza es lo más importante.',
      icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>`,
      gradient: 'from-red-600 to-orange-500',
      cta: 'Leer más'
    }
  ];

  // Product sections
  featuredProducts = computed(() =>
    this.dataService.featuredProducts().slice(0, 4)
  );

  randomProducts = computed(() => {
    const products = [...this.dataService.activeProducts()];
    return this.shuffleArray(products).slice(0, 4);
  });

  bestSellerProducts = computed(() =>
    [...this.dataService.activeProducts()]
      .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
      .slice(0, 4)
  );

  newReleaseProducts = computed(() =>
    [...this.dataService.activeProducts()]
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 4)
  );

  currentSlide = computed(() => this.heroSlides[this.currentSlideIndex()]);

  ngOnInit(): void {
    // Auto-rotate carousel every 5 seconds
    this.carouselSubscription = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }

  ngOnDestroy(): void {
    this.carouselSubscription?.unsubscribe();
  }

  nextSlide(): void {
    const current = this.currentSlideIndex();
    const next = (current + 1) % this.heroSlides.length;
    this.currentSlideIndex.set(next);
  }

  prevSlide(): void {
    const current = this.currentSlideIndex();
    const prev = current === 0 ? this.heroSlides.length - 1 : current - 1;
    this.currentSlideIndex.set(prev);
  }

  goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL').format(price);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}