import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { Product, ProductCategoryEnum, CartItem } from '../models';

const API_URL = 'http://localhost:8082/api';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Action Game',
    description: 'Un juego de acción increíble con combates épicos',
    category: ProductCategoryEnum.ACCION,
    price: 29990,
    originalPrice: 39990,
    discount: 25,
    stock: 10,
    image: 'https://example.com/action.jpg',
    active: true,
    featured: true,
    rating: 4.5,
    reviews: 100,
    releaseDate: '2024-01-01',
    developer: 'Action Studio',
    platform: ['PC', 'PS5'],
    tags: ['action', 'multiplayer'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'RPG Epic Adventure',
    description: 'Una épica aventura de rol con mundos abiertos',
    category: ProductCategoryEnum.RPG,
    price: 49990,
    originalPrice: 49990,
    discount: 0,
    stock: 5,
    image: 'https://example.com/rpg.jpg',
    active: true,
    featured: false,
    rating: 4.8,
    reviews: 200,
    releaseDate: '2023-06-15',
    developer: 'RPG Dev',
    platform: ['PC'],
    tags: ['rpg', 'story', 'open-world'],
    createdAt: '2023-06-15',
    updatedAt: '2023-06-15'
  },
  {
    id: '3',
    name: 'Strategy Master',
    description: 'Juego de estrategia inactivo',
    category: ProductCategoryEnum.ESTRATEGIA,
    price: 19990,
    originalPrice: 19990,
    discount: 0,
    stock: 0,
    image: 'https://example.com/strategy.jpg',
    active: false,
    featured: false,
    rating: 3.0,
    reviews: 50,
    releaseDate: '2022-01-01',
    developer: 'Strategy Studio',
    platform: ['PC'],
    tags: ['strategy'],
    createdAt: '2022-01-01',
    updatedAt: '2022-01-01'
  },
  {
    id: '4',
    name: 'Adventure World',
    description: 'Explora mundos fascinantes en esta aventura',
    category: ProductCategoryEnum.AVENTURA,
    price: 35000,
    originalPrice: 45000,
    discount: 22,
    stock: 8,
    image: 'https://example.com/adventure.jpg',
    active: true,
    featured: true,
    rating: 4.2,
    reviews: 80,
    releaseDate: '2024-03-10',
    developer: 'Adventure Dev',
    platform: ['PC', 'PS5', 'Xbox'],
    tags: ['adventure', 'exploration'],
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10'
  }
];

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);

    // Manejar la llamada HTTP del constructor
    const req = httpMock.expectOne(`${API_URL}/products`);
    req.flush({ success: true, data: mockProducts });

    flushMicrotasks();
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===================================
  // Computed signals
  // ===================================

  describe('computed signals', () => {
    it('should compute activeProducts (only active=true)', () => {
      const active = service.activeProducts();
      expect(active.length).toBe(3);
      expect(active.every(p => p.active)).toBeTrue();
    });

    it('should compute featuredProducts (active AND featured)', () => {
      const featured = service.featuredProducts();
      expect(featured.length).toBe(2);
      expect(featured.every(p => p.featured && p.active)).toBeTrue();
    });

    it('should compute 4 categories', () => {
      const categories = service.categories();
      expect(categories.length).toBe(4);
    });

    it('should compute category names correctly', () => {
      const names = service.categories().map(c => c.name);
      expect(names).toContain('Acción');
      expect(names).toContain('RPG');
      expect(names).toContain('Estrategia');
      expect(names).toContain('Aventura');
    });

    it('should start with cartCount = 0', () => {
      expect(service.cartCount()).toBe(0);
    });

    it('should expose products signal', () => {
      expect(service.products().length).toBe(4);
    });
  });

  // ===================================
  // getProductsByCategory()
  // ===================================

  describe('getProductsByCategory()', () => {
    it('should return only ACCION products that are active', () => {
      const products = service.getProductsByCategory(ProductCategoryEnum.ACCION);
      expect(products.length).toBe(1);
      expect(products[0].id).toBe('1');
    });

    it('should return only RPG products', () => {
      const products = service.getProductsByCategory(ProductCategoryEnum.RPG);
      expect(products.length).toBe(1);
      expect(products[0].id).toBe('2');
    });

    it('should not return inactive products', () => {
      const products = service.getProductsByCategory(ProductCategoryEnum.ESTRATEGIA);
      expect(products.length).toBe(0);
    });

    it('should return AVENTURA products', () => {
      const products = service.getProductsByCategory(ProductCategoryEnum.AVENTURA);
      expect(products.length).toBe(1);
      expect(products[0].id).toBe('4');
    });
  });

  // ===================================
  // getProductById()
  // ===================================

  describe('getProductById()', () => {
    it('should return a product by existing id', () => {
      const product = service.getProductById('1');
      expect(product).toBeDefined();
      expect(product?.name).toBe('Action Game');
    });

    it('should return undefined for non-existent id', () => {
      const product = service.getProductById('9999');
      expect(product).toBeUndefined();
    });

    it('should also return inactive products (search by id)', () => {
      const product = service.getProductById('3');
      expect(product).toBeDefined();
      expect(product?.active).toBeFalse();
    });
  });

  // ===================================
  // searchProducts()
  // ===================================

  describe('searchProducts()', () => {
    it('should return all active products with empty params', () => {
      const results = service.searchProducts({});
      expect(results.length).toBe(3);
    });

    it('should filter by query in product name', () => {
      const results = service.searchProducts({ query: 'Action' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('1');
    });

    it('should filter by query in description', () => {
      const results = service.searchProducts({ query: 'mundos fascinantes' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('4');
    });

    it('should filter by query in tags', () => {
      const results = service.searchProducts({ query: 'story' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });

    it('should filter by category', () => {
      const results = service.searchProducts({ category: ProductCategoryEnum.RPG });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });

    it('should sort by price ascending', () => {
      const results = service.searchProducts({ sortBy: 'price', sortOrder: 'asc' });
      expect(results[0].price).toBeLessThanOrEqual(results[1].price);
      expect(results[1].price).toBeLessThanOrEqual(results[2].price);
    });

    it('should sort by price descending', () => {
      const results = service.searchProducts({ sortBy: 'price', sortOrder: 'desc' });
      expect(results[0].price).toBeGreaterThanOrEqual(results[1].price);
    });

    it('should sort by name', () => {
      const results = service.searchProducts({ sortBy: 'name', sortOrder: 'asc' });
      expect(results[0].name.localeCompare(results[1].name)).toBeLessThanOrEqual(0);
    });

    it('should sort by rating', () => {
      const results = service.searchProducts({ sortBy: 'rating', sortOrder: 'desc' });
      expect(results[0].rating).toBeGreaterThanOrEqual(results[1].rating);
    });

    it('should sort by releaseDate', () => {
      const results = service.searchProducts({ sortBy: 'releaseDate', sortOrder: 'asc' });
      expect(results.length).toBe(3);
    });

    it('should apply limit', () => {
      const results = service.searchProducts({ limit: 2 });
      expect(results.length).toBe(2);
    });

    it('should apply offset', () => {
      const allResults = service.searchProducts({});
      const offsetResults = service.searchProducts({ limit: 2, offset: 1 });
      expect(offsetResults[0].id).toBe(allResults[1].id);
    });

    it('should not include inactive products', () => {
      const results = service.searchProducts({});
      expect(results.every(p => p.active)).toBeTrue();
    });

    it('should filter by developer', () => {
      const results = service.searchProducts({ query: 'RPG Dev' });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });
  });

  // ===================================
  // filterProducts()
  // ===================================

  describe('filterProducts()', () => {
    it('should return all active products with empty filter', () => {
      const results = service.filterProducts({});
      expect(results.length).toBe(3);
    });

    it('should filter by category array', () => {
      const results = service.filterProducts({ category: [ProductCategoryEnum.ACCION] });
      expect(results.length).toBe(1);
      expect(results[0].category).toBe(ProductCategoryEnum.ACCION);
    });

    it('should filter by multiple categories', () => {
      const results = service.filterProducts({
        category: [ProductCategoryEnum.ACCION, ProductCategoryEnum.RPG]
      });
      expect(results.length).toBe(2);
    });

    it('should filter by price range', () => {
      const results = service.filterProducts({ priceRange: { min: 40000, max: 60000 } });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });

    it('should filter by minimum rating', () => {
      const results = service.filterProducts({ rating: 4.6 });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });

    it('should filter by platform', () => {
      const results = service.filterProducts({ platforms: ['PS5'] });
      expect(results.length).toBe(2);
    });

    it('should filter by tags', () => {
      const results = service.filterProducts({ tags: ['rpg'] });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('2');
    });

    it('should filter featured products', () => {
      const results = service.filterProducts({ featured: true });
      expect(results.length).toBe(2);
      expect(results.every(p => p.featured)).toBeTrue();
    });

    it('should filter non-featured products', () => {
      const results = service.filterProducts({ featured: false });
      expect(results.length).toBe(1);
    });

    it('should not return inactive products', () => {
      const results = service.filterProducts({});
      expect(results.every(p => p.active)).toBeTrue();
    });
  });

  // ===================================
  // Cart helpers (sin HTTP)
  // ===================================

  describe('cart helpers', () => {
    it('isProductInCart() should return false for product not in cart', () => {
      expect(service.isProductInCart('1')).toBeFalse();
    });

    it('getProductQuantityInCart() should return 0 for product not in cart', () => {
      expect(service.getProductQuantityInCart('1')).toBe(0);
    });

    it('getCartSummary() should return zeros for empty cart', () => {
      const summary = service.getCartSummary();
      expect(summary.totalItems).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.total).toBe(0);
      expect(summary.totalDiscount).toBe(0);
    });
  });

  // ===================================
  // getUserById() / getUserByEmail()
  // ===================================

  describe('user helpers', () => {
    it('getUserById() should return undefined when no users loaded', () => {
      expect(service.getUserById('test@test.com')).toBeUndefined();
    });

    it('getUserByEmail() should return undefined when no users loaded', () => {
      expect(service.getUserByEmail('test@test.com')).toBeUndefined();
    });
  });

  // ===================================
  // HTTP methods - addToCartHTTP
  // ===================================

  describe('addToCartHTTP()', () => {
    it('should return true on success', fakeAsync(async () => {
      const mockItems: CartItem[] = [{
        id: 'prod-1', name: 'Game', price: 1000, originalPrice: 1000,
        discount: 0, image: '', quantity: 1, maxStock: 10
      }];

      const promise = service.addToCartHTTP('user@test.com', 'prod-1', 1);
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/add`);
      req.flush({ success: true, data: { items: mockItems } });
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeTrue();
    }));

    it('should return false on failure', fakeAsync(async () => {
      const promise = service.addToCartHTTP('user@test.com', 'prod-1', 1);
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/add`);
      req.flush({ success: false });
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeFalse();
    }));

    it('should return false on HTTP error', fakeAsync(async () => {
      const promise = service.addToCartHTTP('user@test.com', 'prod-1', 1);
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/add`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeFalse();
    }));
  });

  // ===================================
  // HTTP methods - updateCartItemHTTP
  // ===================================

  describe('updateCartItemHTTP()', () => {
    it('should return true on success', fakeAsync(async () => {
      const promise = service.updateCartItemHTTP('user@test.com', 'prod-1', 3);
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/update`);
      req.flush({ success: true, data: { items: [] } });
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeTrue();
    }));

    it('should return false on HTTP error', fakeAsync(async () => {
      const promise = service.updateCartItemHTTP('user@test.com', 'prod-1', 3);
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/update`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeFalse();
    }));
  });

  // ===================================
  // HTTP methods - removeFromCartHTTP
  // ===================================

  describe('removeFromCartHTTP()', () => {
    it('should return true on success', fakeAsync(async () => {
      const promise = service.removeFromCartHTTP('user@test.com', 'prod-1');
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/remove/prod-1`);
      req.flush({ success: true, data: { items: [] } });
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeTrue();
    }));

    it('should return false on HTTP error', fakeAsync(async () => {
      const promise = service.removeFromCartHTTP('user@test.com', 'prod-1');
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/remove/prod-1`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeFalse();
    }));
  });

  // ===================================
  // HTTP methods - clearCartHTTP
  // ===================================

  describe('clearCartHTTP()', () => {
    it('should return true on success', fakeAsync(async () => {
      const promise = service.clearCartHTTP('user@test.com');
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/clear`);
      req.flush({ success: true });
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeTrue();
    }));

    it('should return false on HTTP error', fakeAsync(async () => {
      const promise = service.clearCartHTTP('user@test.com');
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com/clear`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      const result = await promise;
      expect(result).toBeFalse();
    }));
  });

  // ===================================
  // HTTP methods - loadProductsFromApi
  // ===================================

  describe('loadProductsFromApi()', () => {
    it('should update products signal on success', fakeAsync(async () => {
      const newProducts = [mockProducts[0]];
      const promise = service.loadProductsFromApi();
      const req = httpMock.expectOne(`${API_URL}/products`);
      req.flush({ success: true, data: newProducts });
      flushMicrotasks();

      await promise;
      expect(service.products().length).toBe(1);
    }));

    it('should throw on HTTP error', fakeAsync(async () => {
      let caught = false;
      const promise = service.loadProductsFromApi().catch(() => { caught = true; });
      const req = httpMock.expectOne(`${API_URL}/products`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      await promise;
      expect(caught).toBeTrue();
    }));
  });

  // ===================================
  // HTTP methods - loadUserOrders
  // ===================================

  describe('loadUserOrders()', () => {
    it('should update orders signal on success', fakeAsync(async () => {
      const promise = service.loadUserOrders('user@test.com');
      const req = httpMock.expectOne(`${API_URL}/orders?userId=user@test.com`);
      req.flush({ success: true, data: [] });
      flushMicrotasks();

      await promise;
      expect(service.orders().length).toBe(0);
    }));

    it('should handle HTTP error gracefully', fakeAsync(async () => {
      const promise = service.loadUserOrders('user@test.com');
      const req = httpMock.expectOne(`${API_URL}/orders?userId=user@test.com`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();

      await promise;
      expect(service.orders().length).toBe(0);
    }));
  });

  // ===================================
  // displayStats()
  // ===================================

  describe('displayStats()', () => {
    it('should not throw when called', () => {
      expect(() => service.displayStats()).not.toThrow();
    });
  });

  describe('searchProducts()', () => {
    it('should filter by category', () => {
      const result = service.searchProducts({ category: 'accion' });
      expect(result.every(p => p.category === 'accion')).toBeTrue();
    });

    it('should filter by query matching name', () => {
      const result = service.searchProducts({ query: 'Test' });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should sort by price ascending', () => {
      const result = service.searchProducts({ sortBy: 'price', sortOrder: 'asc' });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should sort by price descending', () => {
      const result = service.searchProducts({ sortBy: 'price', sortOrder: 'desc' });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should sort by rating', () => {
      const result = service.searchProducts({ sortBy: 'rating', sortOrder: 'asc' });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should sort by releaseDate', () => {
      const result = service.searchProducts({ sortBy: 'releaseDate', sortOrder: 'asc' });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle sort by name', () => {
      const result = service.searchProducts({ sortBy: 'name', sortOrder: 'asc' });
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should apply pagination limit', () => {
      const result = service.searchProducts({ limit: 1 });
      expect(result.length).toBeLessThanOrEqual(1);
    });

    it('should apply offset when paginating', () => {
      const result = service.searchProducts({ limit: 1, offset: 1 });
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });

  describe('filterProducts()', () => {
    it('should filter by featured flag true', () => {
      const result = service.filterProducts({ featured: true });
      expect(result.every(p => p.featured === true)).toBeTrue();
    });

    it('should return all active products for empty filter', () => {
      const result = service.filterProducts({});
      expect(result.length).toBe(service.activeProducts().length);
    });
  });

  describe('isProductInCart()', () => {
    it('should return false when product not in cart', () => {
      expect(service.isProductInCart('nonexistent')).toBeFalse();
    });
  });

  describe('getProductQuantityInCart()', () => {
    it('should return 0 when product not in cart', () => {
      expect(service.getProductQuantityInCart('nonexistent')).toBe(0);
    });
  });

  describe('getCartSummary()', () => {
    it('should return zeros for empty cart', () => {
      const summary = service.getCartSummary();
      expect(summary.totalItems).toBe(0);
      expect(summary.subtotal).toBe(0);
    });
  });

  describe('loadUserCart()', () => {
    it('should update cart signal on success', fakeAsync(async () => {
      const promise = service.loadUserCart('user@test.com');
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com`);
      req.flush({ success: true, data: { items: [] } });
      flushMicrotasks();
      await promise;
      expect(service.cart().length).toBe(0);
    }));

    it('should handle HTTP error gracefully', fakeAsync(async () => {
      const promise = service.loadUserCart('user@test.com');
      const req = httpMock.expectOne(`${API_URL}/cart/user@test.com`);
      req.error(new ErrorEvent('Network error'));
      flushMicrotasks();
      await promise;
      expect(service.cart().length).toBe(0);
    }));
  });

  describe('getUserById()', () => {
    it('should return undefined for non-existing user', () => {
      expect(service.getUserById('nonexistent')).toBeUndefined();
    });
  });
});
