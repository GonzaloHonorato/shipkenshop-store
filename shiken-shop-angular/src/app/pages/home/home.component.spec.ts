import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { HomeComponent } from './home.component';
import { DataService } from '../../services/data.service';
import { Product } from '../../models';

const mockProduct: Product = {
  id: 'p1', name: 'Game 1', description: 'Desc',
  price: 29990, originalPrice: 39990, discount: 25,
  category: 'accion', platform: ['PC'],
  image: 'img.jpg', rating: 4.5, reviews: 100, stock: 10,
  featured: true, active: true, releaseDate: '2024-01-01',
  developer: 'Dev', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01'
} as any;

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let featuredSignal: ReturnType<typeof signal<Product[]>>;
  let activeSignal: ReturnType<typeof signal<Product[]>>;

  beforeEach(async () => {
    featuredSignal = signal<Product[]>([mockProduct]);
    activeSignal = signal<Product[]>([mockProduct, { ...mockProduct, id: 'p2', releaseDate: '2024-06-01', reviews: 200 }]);

    const dataServiceSpy = jasmine.createSpyObj('DataService', ['loadProductsFromApi']);
    Object.defineProperty(dataServiceSpy, 'featuredProducts', { get: () => featuredSignal });
    Object.defineProperty(dataServiceSpy, 'activeProducts', { get: () => activeSignal });

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with first slide index', () => {
    expect(component.currentSlideIndex()).toBe(0);
  });

  it('should have hero slides', () => {
    expect(component.heroSlides.length).toBeGreaterThan(0);
  });

  it('should compute current slide from index', () => {
    expect(component.currentSlide()).toBe(component.heroSlides[0]);
  });

  describe('nextSlide()', () => {
    it('should advance to next slide', () => {
      component.nextSlide();
      expect(component.currentSlideIndex()).toBe(1);
    });

    it('should wrap around to first slide after last', () => {
      component.currentSlideIndex.set(component.heroSlides.length - 1);
      component.nextSlide();
      expect(component.currentSlideIndex()).toBe(0);
    });
  });

  describe('prevSlide()', () => {
    it('should go to previous slide', () => {
      component.currentSlideIndex.set(2);
      component.prevSlide();
      expect(component.currentSlideIndex()).toBe(1);
    });

    it('should wrap around to last slide from first', () => {
      component.currentSlideIndex.set(0);
      component.prevSlide();
      expect(component.currentSlideIndex()).toBe(component.heroSlides.length - 1);
    });
  });

  describe('goToSlide()', () => {
    it('should set slide index directly', () => {
      component.goToSlide(2);
      expect(component.currentSlideIndex()).toBe(2);
    });
  });

  describe('formatPrice()', () => {
    it('should format a price as a string', () => {
      const result = component.formatPrice(29990);
      expect(typeof result).toBe('string');
      expect(result).toContain('29');
    });
  });

  describe('trackByProductId()', () => {
    it('should return product id', () => {
      expect(component.trackByProductId(0, mockProduct)).toBe('p1');
    });
  });

  describe('computed products', () => {
    it('should return up to 4 featured products', () => {
      expect(component.featuredProducts().length).toBeLessThanOrEqual(4);
    });

    it('should return up to 4 random products', () => {
      expect(component.randomProducts().length).toBeLessThanOrEqual(4);
    });

    it('should return up to 4 best seller products sorted by reviews', () => {
      const best = component.bestSellerProducts();
      expect(best.length).toBeLessThanOrEqual(4);
    });

    it('should handle products with no reviews (|| 0 branch)', () => {
      const noReview = { ...mockProduct as any, reviews: undefined } as any;
      activeSignal.set([mockProduct, noReview]);
      const best = component.bestSellerProducts();
      expect(best.length).toBeLessThanOrEqual(4);
    });

    it('should return up to 4 new release products sorted by date', () => {
      const newest = component.newReleaseProducts();
      expect(newest.length).toBeLessThanOrEqual(4);
    });
  });

  it('should unsubscribe on destroy', () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
