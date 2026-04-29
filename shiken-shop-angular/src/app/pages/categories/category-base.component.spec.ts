import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CategoryBaseComponent, CategoryConfig } from './category-base.component';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductCategoryEnum, UserRole, User } from '../../models';

const testConfig: CategoryConfig = {
  category: ProductCategoryEnum.ACCION,
  title: 'Acción',
  description: 'Juegos de acción',
  icon: '',
  gradientFrom: 'red',
  gradientTo: 'orange',
  borderColor: 'red-500',
  accentColor: 'red-400'
};

const mockProduct = {
  id: 'p1', name: 'Action Game', description: '', price: 29990, originalPrice: 39990,
  discount: 25, category: ProductCategoryEnum.ACCION, platform: ['PC'],
  image: '', rating: 4.5, reviews: 10, stock: 5, featured: true, active: true,
  releaseDate: '2024-01-01', developer: 'Dev', tags: [], createdAt: '2024-01-01', updatedAt: '2024-01-01'
} as unknown as Product;

const mockUser: User = { name: 'User', email: 'user@test.com', password: '', role: UserRole.BUYER, active: true, registeredAt: '2024-01-01' };

@Component({
  standalone: true,
  imports: [CategoryBaseComponent],
  template: `<app-category-base [config]="config"></app-category-base>`
})
class TestHostComponent {
  config = testConfig;
}

describe('CategoryBaseComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: CategoryBaseComponent;
  let productsSignal: ReturnType<typeof signal<Product[]>>;
  let isAuthenticatedFn: jasmine.Spy;
  let currentUserFn: jasmine.Spy;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let dataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    productsSignal = signal([mockProduct]);
    isAuthenticatedFn = jasmine.createSpy('isAuthenticated').and.returnValue(true);
    currentUserFn = jasmine.createSpy('currentUser').and.returnValue(mockUser);

    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    authSpy.isAuthenticated = isAuthenticatedFn;
    authSpy.currentUser = currentUserFn;

    const dataServiceSpy = jasmine.createSpyObj('DataService', ['addToCartHTTP']);
    Object.defineProperty(dataServiceSpy, 'products', { get: () => productsSignal });
    dataServiceSpy.addToCartHTTP.and.returnValue(Promise.resolve(true));

    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance as CategoryBaseComponent;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filteredProducts computed', () => {
    it('should return products in configured category', () => {
      expect(component.filteredProducts().length).toBe(1);
    });

    it('should exclude products from other categories', () => {
      productsSignal.set([{ ...mockProduct, category: ProductCategoryEnum.RPG }]);
      expect(component.filteredProducts().length).toBe(0);
    });

    it('should sort by name by default', () => {
      const products = [
        { ...mockProduct, id: 'p2', name: 'Zebra Game' },
        { ...mockProduct, id: 'p1', name: 'Action Game' }
      ];
      productsSignal.set(products);
      const result = component.filteredProducts();
      expect(result[0].name).toBe('Action Game');
    });
  });

  describe('onPriceFilterChange()', () => {
    it('should apply price filter', () => {
      const event = { target: { value: '0-30000' } } as unknown as Event;
      component.onPriceFilterChange(event);
      expect(component.filteredProducts().length).toBe(1);
    });

    it('should clear price filter when empty value', () => {
      const event = { target: { value: '' } } as unknown as Event;
      component.onPriceFilterChange(event);
      expect(component.filteredProducts().length).toBe(1);
    });

    it('should exclude products outside price range', () => {
      const event = { target: { value: '50000-100000' } } as unknown as Event;
      component.onPriceFilterChange(event);
      expect(component.filteredProducts().length).toBe(0);
    });
  });

  describe('onSortChange()', () => {
    it('should sort by price ascending', () => {
      const products = [
        { ...mockProduct, id: 'p2', name: 'Game B', price: 50000 },
        { ...mockProduct, id: 'p1', name: 'Game A', price: 29990 }
      ];
      productsSignal.set(products);
      const event = { target: { value: 'price-asc' } } as unknown as Event;
      component.onSortChange(event);
      expect(component.filteredProducts()[0].price).toBe(29990);
    });

    it('should sort by price descending', () => {
      const products = [
        { ...mockProduct, id: 'p1', name: 'Game A', price: 29990 },
        { ...mockProduct, id: 'p2', name: 'Game B', price: 50000 }
      ];
      productsSignal.set(products);
      const event = { target: { value: 'price-desc' } } as unknown as Event;
      component.onSortChange(event);
      expect(component.filteredProducts()[0].price).toBe(50000);
    });

    it('should sort by rating', () => {
      const event = { target: { value: 'rating' } } as unknown as Event;
      component.onSortChange(event);
      expect(component.filteredProducts().length).toBe(1);
    });

    it('should sort by newest', () => {
      const event = { target: { value: 'newest' } } as unknown as Event;
      component.onSortChange(event);
      expect(component.filteredProducts().length).toBe(1);
    });
  });

  describe('onDiscountFilterChange()', () => {
    it('should filter products with discount', () => {
      const event = { target: { checked: true } } as unknown as Event;
      component.onDiscountFilterChange(event);
      expect(component.filteredProducts().length).toBe(1);
    });

    it('should show all when discount filter unchecked', () => {
      productsSignal.set([
        mockProduct,
        { ...mockProduct, id: 'p2', name: 'No Discount', discount: 0, originalPrice: mockProduct.price }
      ]);
      const event = { target: { checked: false } } as unknown as Event;
      component.onDiscountFilterChange(event);
      expect(component.filteredProducts().length).toBe(2);
    });
  });

  describe('clearFilters()', () => {
    it('should reset all filters', () => {
      component.clearFilters();
      expect(notificationService.info).toHaveBeenCalledWith('Filtros limpiados');
    });
  });

  describe('addToCart()', () => {
    it('should add product to cart for authenticated user', async () => {
      await component.addToCart(mockProduct);
      expect(dataService.addToCartHTTP).toHaveBeenCalledWith(mockUser.email, mockProduct.id, 1);
      expect(notificationService.success).toHaveBeenCalled();
    });

    it('should show warning when user not authenticated', async () => {
      isAuthenticatedFn.and.returnValue(false);
      await component.addToCart(mockProduct);
      expect(notificationService.warning).toHaveBeenCalled();
      expect(dataService.addToCartHTTP).not.toHaveBeenCalled();
    });

    it('should not call addToCartHTTP when user is null', async () => {
      currentUserFn.and.returnValue(null);
      await component.addToCart(mockProduct);
      expect(dataService.addToCartHTTP).not.toHaveBeenCalled();
    });
  });

  describe('formatPrice()', () => {
    it('should format price', () => {
      expect(component.formatPrice(29990)).toContain('29');
    });
  });

  describe('trackByProductId()', () => {
    it('should return product id', () => {
      expect(component.trackByProductId(0, mockProduct)).toBe('p1');
    });
  });

  describe('isProductAdded()', () => {
    it('should return false initially', () => {
      expect(component.isProductAdded('p1')).toBeFalse();
    });
  });

  describe('getStars()', () => {
    it('should return 5 stars total for rating 4.5', () => {
      const stars = component.getStars(4.5);
      expect(stars.length).toBe(5);
      expect(stars.filter(s => s === '★').length).toBe(4);
    });

    it('should return all full stars for rating 5', () => {
      const stars = component.getStars(5);
      expect(stars.every(s => s === '★')).toBeTrue();
    });

    it('should return all empty stars for rating 0', () => {
      const stars = component.getStars(0);
      expect(stars.every(s => s === '☆')).toBeTrue();
    });
  });

  describe('getPriceColor()', () => {
    it('should return color for red-400 accent', () => {
      expect(component.getPriceColor()).toBeTruthy();
    });
  });

  describe('getPageBackground()', () => {
    it('should return background for red-400 accent', () => {
      expect(component.getPageBackground()).toContain('linear-gradient');
    });
  });

  describe('getBannerBackground()', () => {
    it('should return banner background', () => {
      expect(component.getBannerBackground()).toContain('linear-gradient');
    });
  });

  describe('sort by newest with missing releaseDate', () => {
    it('should fall back to createdAt when releaseDate is missing', () => {
      const noRelease = { ...mockProduct as any, releaseDate: undefined, createdAt: '2024-03-01' } as unknown as Product;
      const older = { ...mockProduct as any, id: 'p2', name: 'Older', releaseDate: undefined, createdAt: '2024-01-01' } as unknown as Product;
      productsSignal.set([older, noRelease]);
      const event = { target: { value: 'newest' } } as unknown as Event;
      component.onSortChange(event);
      expect(component.filteredProducts()[0].id).toBe('p1');
    });
  });

  describe('getPriceColor() for known accent colors', () => {
    it('should return color for red-400 accent', () => {
      expect(component.getPriceColor()).toBe('#f87171');
    });
  });

  describe('getPageBackground() for red-400', () => {
    it('should return specific background for red-400', () => {
      expect(component.getPageBackground()).toContain('7f1d1d');
    });
  });

  describe('getBannerBackground() for red-400', () => {
    it('should return specific banner for red-400', () => {
      expect(component.getBannerBackground()).toContain('991b1b');
    });
  });

  describe('getButtonClasses() and getBadgeClasses()', () => {
    it('should return button classes', () => {
      expect(component.getButtonClasses()).toContain('rounded-lg');
    });

    it('should return badge classes', () => {
      expect(component.getBadgeClasses()).toContain('rounded-full');
    });
  });
});

@Component({
  standalone: true,
  imports: [CategoryBaseComponent],
  template: `<app-category-base [config]="config"></app-category-base>`
})
class TestHostRpgComponent {
  config: CategoryConfig = {
    category: ProductCategoryEnum.RPG,
    title: 'RPG',
    description: 'Juegos RPG',
    icon: '',
    gradientFrom: 'purple',
    gradientTo: 'indigo',
    borderColor: 'purple-500',
    accentColor: 'purple-400'
  };
}

describe('CategoryBaseComponent with purple-400 config', () => {
  let fixture: ComponentFixture<TestHostRpgComponent>;
  let component: CategoryBaseComponent;
  let productsSignal: ReturnType<typeof signal<Product[]>>;

  beforeEach(async () => {
    productsSignal = signal([]);

    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'currentUser']);
    authSpy.isAuthenticated = jasmine.createSpy().and.returnValue(false);
    authSpy.currentUser = jasmine.createSpy().and.returnValue(null);

    const dataServiceSpy = jasmine.createSpyObj('DataService', ['addToCartHTTP']);
    Object.defineProperty(dataServiceSpy, 'products', { get: () => productsSignal });

    const notifSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [TestHostRpgComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: NotificationService, useValue: notifSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostRpgComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance as CategoryBaseComponent;
  });

  it('should return purple color from getPriceColor', () => {
    expect(component.getPriceColor()).toBe('#c084fc');
  });

  it('should return purple background from getPageBackground', () => {
    expect(component.getPageBackground()).toContain('581c87');
  });

  it('should return purple banner from getBannerBackground', () => {
    expect(component.getBannerBackground()).toContain('6b21a8');
  });
});
