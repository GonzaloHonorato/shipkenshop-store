import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { 
  User, 
  Product, 
  Order, 
  CartItem, 
  ProductCategory, 
  ProductCategoryEnum,
  Category,
  ProductFilter,
  ProductSearchParams,
  StorageKeys,
  UserRole 
} from '../models';
import { environment } from '../../environments/environment';

// ===================================
// DATA SERVICE CONFIGURATION
// ===================================
interface DataConfig {
  forceReset: boolean;
  version: string;
}

const DEFAULT_DATA_CONFIG: DataConfig = {
  forceReset: false,
  version: '1.0.0'
};

// ===================================
// CHEAPSHARK API INTERFACE
// ===================================
interface CheapSharkGame {
  gameID: string;
  steamAppID: string | null;
  cheapest: string;
  cheapestDealID: string;
  external: string;
  internalName: string;
  thumb: string;
}

// ===================================
// API RESPONSE INTERFACE
// ===================================
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private config: DataConfig = DEFAULT_DATA_CONFIG;

  // ===================================
  // REACTIVE STATE MANAGEMENT
  // ===================================
  
  // Signals para estado reactivo
  private usersSignal = signal<User[]>([]);
  private productsSignal = signal<Product[]>([]);
  private ordersSignal = signal<Order[]>([]);
  private cartSignal = signal<CartItem[]>([]);
  private dataReadySignal = signal<boolean>(false);
  
  // Computed signals
  public readonly users = this.usersSignal.asReadonly();
  public readonly products = this.productsSignal.asReadonly();
  public readonly orders = this.ordersSignal.asReadonly();
  public readonly cart = this.cartSignal.asReadonly();
  public readonly dataReady = this.dataReadySignal.asReadonly();
  
  // Computed properties
  public readonly featuredProducts = computed(() => 
    this.products().filter(p => p.featured && p.active)
  );
  
  public readonly activeProducts = computed(() => 
    this.products().filter(p => p.active)
  );
  
  public readonly categories = computed(() => this.getCategories());
  
  public readonly cartCount = computed(() => 
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  // BehaviorSubjects para compatibilidad con observables
  private usersSubject = new BehaviorSubject<User[]>([]);
  private productsSubject = new BehaviorSubject<Product[]>([]);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  public readonly users$ = this.usersSubject.asObservable();
  public readonly products$ = this.productsSubject.asObservable();
  public readonly orders$ = this.ordersSubject.asObservable();
  public readonly cart$ = this.cartSubject.asObservable();

  constructor() {
    // Inicializar de forma asíncrona sin bloquear
    this.initializeData().catch(err => {
      console.warn('⚠️ No se pudo conectar al backend:', err.message);
    });
  }

  // ===================================
  // INITIALIZATION
  // ===================================

  /**
   * Inicializa los datos desde el backend API
   */
  private async initializeData(): Promise<void> {
    console.log('🚀 Iniciando carga de datos desde API...');
    console.log('📡 URL del API:', this.apiUrl);
    
    try {
      // Cargar productos desde el backend con timeout
      await this.loadProductsFromApi();
      
      this.dataReadySignal.set(true);
      this.displayStats();
      console.log('✨ Datos cargados desde API correctamente');
    } catch (error: any) {
      console.error('❌ Error cargando datos desde API:', error?.message || error);
      console.warn('⚠️ La aplicación funcionará sin datos del backend. Asegúrate de que el backend esté corriendo en', this.apiUrl);
      // Marcar como listo aunque haya error para no bloquear la UI
      this.dataReadySignal.set(true);
    }
  }

  /**
   * Carga productos desde el backend API
   */
  public async loadProductsFromApi(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`)
      );
      
      if (response.success && response.data) {
        this.productsSignal.set(response.data);
        this.productsSubject.next(response.data);
        console.log(`✅ ${response.data.length} productos cargados desde API`);
      }
    } catch (error) {
      console.error('❌ Error cargando productos desde API:', error);
      throw error;
    }
  }

  /**
   * Carga órdenes del usuario desde el backend
   */
  public async loadUserOrders(userId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders?userId=${userId}`)
      );
      
      if (response.success && response.data) {
        this.ordersSignal.set(response.data);
        this.ordersSubject.next(response.data);
        console.log(`✅ ${response.data.length} órdenes cargadas desde API`);
      }
    } catch (error) {
      console.error('❌ Error cargando órdenes desde API:', error);
    }
  }

  /**
   * Carga el carrito del usuario desde el backend
   */
  public async loadUserCart(userId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<{ items: CartItem[] }>>(`${this.apiUrl}/cart/${userId}`)
      );
      
      if (response.success && response.data) {
        this.cartSignal.set(response.data.items);
        this.cartSubject.next(response.data.items);
        console.log(`✅ Carrito cargado desde API con ${response.data.items.length} items`);
      }
    } catch (error) {
      console.error('❌ Error cargando carrito desde API:', error);
    }
  }

  // ===================================
  // CHEAPSHARK API INTEGRATION
  // ===================================

  /**
   * Busca juegos en CheapShark a través del backend proxy
   */
  public async loadProductsFromCheapShark(searchTerm: string): Promise<CheapSharkGame[]> {
    console.log(`🎮 Buscando juegos en CheapShark: "${searchTerm}"...`);
    
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<CheapSharkGame[]>>(
          `${this.apiUrl}/cheapshark/search?q=${encodeURIComponent(searchTerm)}`
        )
      );
      
      if (response.success && response.data) {
        console.log(`✅ ${response.data.length} juegos encontrados en CheapShark`);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error buscando en CheapShark:', error);
      return [];
    }
  }

  /**
   * Importa juegos de CheapShark al catálogo del backend
   */
  public async importProductsFromCheapShark(
    searchTerm: string,
    category: ProductCategory = ProductCategoryEnum.AVENTURA,
    limit: number = 20
  ): Promise<Product[]> {
    console.log(`🎮 Importando productos de CheapShark...`);
    
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Product[]>>(
          `${this.apiUrl}/cheapshark/import`,
          { searchTerm, category, limit }
        )
      );
      
      if (response.success && response.data) {
        console.log(`✅ ${response.data.length} productos importados de CheapShark`);
        // Recargar productos para incluir los nuevos
        await this.loadProductsFromApi();
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error importando desde CheapShark:', error);
      return [];
    }
  }

  // ===================================
  // CART HTTP METHODS (API)
  // ===================================

  /**
   * Agrega un producto al carrito vía API
   */
  public async addToCartHTTP(userId: string, productId: string, quantity: number = 1): Promise<boolean> {
    console.log('🛒 [API] addToCartHTTP:', { userId, productId, quantity });
    
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<{ items: CartItem[] }>>(
          `${this.apiUrl}/cart/${userId}/add`,
          { productId, quantity }
        )
      );
      
      if (response.success && response.data) {
        this.cartSignal.set(response.data.items);
        this.cartSubject.next(response.data.items);
        console.log('✅ Producto agregado al carrito');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error agregando al carrito:', error);
      return false;
    }
  }

  /**
   * Actualiza la cantidad de un item en el carrito vía API
   */
  public async updateCartItemHTTP(userId: string, productId: string, quantity: number): Promise<boolean> {
    console.log('🛒 [API] updateCartItemHTTP:', { userId, productId, quantity });
    
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<{ items: CartItem[] }>>(
          `${this.apiUrl}/cart/${userId}/update`,
          { productId, quantity }
        )
      );
      
      if (response.success && response.data) {
        this.cartSignal.set(response.data.items);
        this.cartSubject.next(response.data.items);
        console.log('✅ Cantidad actualizada en carrito');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error actualizando carrito:', error);
      return false;
    }
  }

  /**
   * Elimina un item del carrito vía API
   */
  public async removeFromCartHTTP(userId: string, productId: string): Promise<boolean> {
    console.log('🛒 [API] removeFromCartHTTP:', { userId, productId });
    
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<{ items: CartItem[] }>>(
          `${this.apiUrl}/cart/${userId}/remove/${productId}`
        )
      );
      
      if (response.success && response.data) {
        this.cartSignal.set(response.data.items);
        this.cartSubject.next(response.data.items);
        console.log('✅ Producto eliminado del carrito');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error eliminando del carrito:', error);
      return false;
    }
  }

  /**
   * Limpia el carrito completo vía API
   */
  public async clearCartHTTP(userId: string): Promise<boolean> {
    console.log('🛒 [API] clearCartHTTP:', { userId });
    
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<{ items: CartItem[] }>>(
          `${this.apiUrl}/cart/${userId}/clear`
        )
      );
      
      if (response.success) {
        this.cartSignal.set([]);
        this.cartSubject.next([]);
        console.log('✅ Carrito vaciado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error vaciando carrito:', error);
      return false;
    }
  }

  // ===================================
  // ORDER HTTP METHODS (API)
  // ===================================

  /**
   * Crea una nueva orden vía API
   */
  public async createOrderHTTP(orderData: {
    userId: string;
    items: CartItem[];
    shippingAddress: any;
    paymentMethod: string;
    subtotal: number;
    discount: number;
    total: number;
  }): Promise<Order | null> {
    console.log('📦 [API] createOrderHTTP:', orderData);
    
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Order>>(
          `${this.apiUrl}/orders`,
          orderData
        )
      );
      
      if (response.success && response.data) {
        // Agregar orden a la lista local
        const currentOrders = this.orders();
        this.ordersSignal.set([...currentOrders, response.data]);
        this.ordersSubject.next([...currentOrders, response.data]);
        console.log('✅ Orden creada:', response.data.orderNumber);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error creando orden:', error);
      return null;
    }
  }

  // ===================================
  // LOCAL CART MIGRATION
  // ===================================

  /**
   * Migra carrito local al backend cuando el usuario se loguea
   */
  public async migrateLocalCartToBackend(userId: string): Promise<void> {
    const localCart = JSON.parse(localStorage.getItem(StorageKeys.CART) || '[]');
    
    if (localCart.length === 0) {
      await this.loadUserCart(userId);
      return;
    }

    console.log(`🔄 Migrando ${localCart.length} items del carrito local al backend...`);
    
    for (const item of localCart) {
      await this.addToCartHTTP(userId, item.id, item.quantity);
    }
    
    // Limpiar carrito local
    localStorage.setItem(StorageKeys.CART, JSON.stringify([]));
    console.log('✅ Carrito migrado al backend');
  }

  // ===================================
  // CATEGORIES DATA
  // ===================================
  
  private getCategories(): Category[] {
    return [
      {
        id: ProductCategoryEnum.ACCION,
        name: 'Acción',
        description: 'Vive la adrenalina de los juegos más intensos',
        color: 'from-red-600 to-orange-500',
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        gradient: 'bg-gradient-to-br from-red-600 to-orange-500'
      },
      {
        id: ProductCategoryEnum.RPG,
        name: 'RPG',
        description: 'Aventuras épicas y mundos por descubrir',
        color: 'from-purple-600 to-indigo-700',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
        gradient: 'bg-gradient-to-br from-purple-600 to-indigo-700'
      },
      {
        id: ProductCategoryEnum.ESTRATEGIA,
        name: 'Estrategia',
        description: 'Pon a prueba tu ingenio y planificación',
        color: 'from-blue-600 to-cyan-500',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        gradient: 'bg-gradient-to-br from-blue-600 to-cyan-500'
      },
      {
        id: ProductCategoryEnum.AVENTURA,
        name: 'Aventura',
        description: 'Explora mundos fascinantes y misteriosos',
        color: 'from-green-600 to-teal-500',
        icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        gradient: 'bg-gradient-to-br from-green-600 to-teal-500'
      }
    ];
  }

  // ===================================
  // PUBLIC DATA ACCESS METHODS
  // ===================================

  public getProductsByCategory(category: ProductCategory): Product[] {
    return this.products().filter(p => p.category === category && p.active);
  }

  public getProductById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  public searchProducts(params: ProductSearchParams): Product[] {
    let filteredProducts = this.activeProducts();

    // Filtrar por categoría
    if (params.category) {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }

    // Filtrar por query de búsqueda
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.developer.toLowerCase().includes(query) ||
        p.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Ordenar resultados
    if (params.sortBy) {
      filteredProducts = this.sortProducts(filteredProducts, params.sortBy, params.sortOrder || 'asc');
    }

    // Aplicar paginación
    if (params.limit) {
      const offset = params.offset || 0;
      filteredProducts = filteredProducts.slice(offset, offset + params.limit);
    }

    return filteredProducts;
  }

  public filterProducts(filter: ProductFilter): Product[] {
    let filteredProducts = this.activeProducts();

    // Filtrar por categorías
    if (filter.category && filter.category.length > 0) {
      filteredProducts = filteredProducts.filter(p => filter.category!.includes(p.category));
    }

    // Filtrar por rango de precios
    if (filter.priceRange) {
      filteredProducts = filteredProducts.filter(p => 
        p.price >= filter.priceRange!.min && p.price <= filter.priceRange!.max
      );
    }

    // Filtrar por rating
    if (filter.rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filter.rating!);
    }

    // Filtrar por plataformas
    if (filter.platforms && filter.platforms.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        filter.platforms!.some((platform: string) => p.platform.includes(platform))
      );
    }

    // Filtrar por tags
    if (filter.tags && filter.tags.length > 0) {
      filteredProducts = filteredProducts.filter(p => 
        filter.tags!.some((tag: string) => p.tags.includes(tag))
      );
    }

    // Filtrar por featured
    if (filter.featured !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.featured === filter.featured);
    }

    return filteredProducts;
  }

  private sortProducts(products: Product[], sortBy: string, sortOrder: 'asc' | 'desc'): Product[] {
    return products.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'releaseDate':
          comparison = new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  public getUserById(id: string): User | undefined {
    return this.users().find(u => u.email === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users().find(u => u.email === email);
  }

  // ===================================
  // CART LOCAL HELPERS
  // ===================================

  /**
   * Verifica si un producto está en el carrito (usa estado local)
   */
  public isProductInCart(productId: string): boolean {
    return this.cart().some(item => item.id === productId);
  }

  /**
   * Obtiene la cantidad de un producto en el carrito (usa estado local)
   */
  public getProductQuantityInCart(productId: string): number {
    const item = this.cart().find(item => item.id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Obtiene el resumen del carrito (totales, cantidades, etc.)
   */
  public getCartSummary(): {
    totalItems: number;
    subtotal: number;
    totalDiscount: number;
    total: number;
  } {
    const cartItems = this.cart();
    let subtotal = 0;
    let totalDiscount = 0;
    let totalItems = 0;

    cartItems.forEach((item: CartItem) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      if (item.originalPrice && item.originalPrice > item.price) {
        const discountAmount = (item.originalPrice - item.price) * item.quantity;
        totalDiscount += discountAmount;
      }
    });

    return {
      totalItems,
      subtotal,
      totalDiscount,
      total: subtotal
    };
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  /**
   * Muestra estadísticas de los datos cargados
   */
  public displayStats(): void {
    const users = this.users();
    const products = this.products();
    const orders = this.orders();
    const cart = this.cart();
    
    console.log('\n📊 ESTADÍSTICAS DE DATOS:');
    console.log('👥 Usuarios:', users.length);
    console.log('📦 Productos:', products.length);
    console.log('🛒 Órdenes:', orders.length);
    console.log('🛍️ Items en carrito:', cart.length);
    console.log('\n🔐 CUENTAS DE PRUEBA:');
    console.log('Admin: admin@shikenshop.com / Admin123');
    console.log('Comprador: comprador@test.com / Comprador123');
    console.log('Comprador 2: maria.gomez@test.com / Maria123\n');
  }

  // ===================================
  // ADMIN PRODUCT METHODS (API)
  // ===================================

  /**
   * Crea un nuevo producto vía API
   */
  public async createProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
    console.log('📦 [API] createProduct:', productData);
    
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Product>>(
          `${this.apiUrl}/products`,
          productData
        )
      );
      
      if (response.success && response.data) {
        // Actualizar lista local
        await this.loadProductsFromApi();
        console.log('✅ Producto creado:', response.data.name);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error creando producto:', error);
      return null;
    }
  }

  /**
   * Actualiza un producto vía API
   */
  public async updateProduct(productId: string, updatedData: Partial<Product>): Promise<Product | null> {
    console.log('📦 [API] updateProduct:', { productId, updatedData });
    
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Product>>(
          `${this.apiUrl}/products/${productId}`,
          updatedData
        )
      );
      
      if (response.success && response.data) {
        // Actualizar lista local
        await this.loadProductsFromApi();
        console.log('✅ Producto actualizado:', response.data.name);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      return null;
    }
  }

  /**
   * Elimina un producto vía API
   */
  public async deleteProduct(productId: string): Promise<boolean> {
    console.log('📦 [API] deleteProduct:', productId);
    
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<void>>(
          `${this.apiUrl}/products/${productId}`
        )
      );
      
      if (response.success) {
        // Actualizar lista local
        await this.loadProductsFromApi();
        console.log('✅ Producto eliminado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      return false;
    }
  }

  // ===================================
  // ADMIN ORDER METHODS (API)
  // ===================================

  /**
   * Actualiza el estado de una orden vía API
   */
  public async updateOrderStatus(orderNumber: string, newStatus: string): Promise<boolean> {
    console.log('📦 [API] updateOrderStatus:', { orderNumber, newStatus });
    
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Order>>(
          `${this.apiUrl}/orders/${orderNumber}/status`,
          { status: newStatus }
        )
      );
      
      if (response.success && response.data) {
        // Actualizar lista local de órdenes
        const currentOrders = this.orders();
        const updatedOrders = currentOrders.map(o => 
          o.orderNumber === orderNumber ? response.data! : o
        );
        this.ordersSignal.set(updatedOrders);
        this.ordersSubject.next(updatedOrders);
        console.log('✅ Estado de orden actualizado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error actualizando estado de orden:', error);
      return false;
    }
  }

  // ===================================
  // ADMIN USER METHODS (API)
  // ===================================

  /**
   * Carga usuarios desde el backend (solo admin)
   */
  public async loadUsers(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`)
      );
      
      if (response.success && response.data) {
        this.usersSignal.set(response.data);
        this.usersSubject.next(response.data);
        console.log(`✅ ${response.data.length} usuarios cargados desde API`);
      }
    } catch (error) {
      console.error('❌ Error cargando usuarios desde API:', error);
    }
  }

  /**
   * Actualiza el rol de un usuario vía API
   */
  public async updateUserRole(userEmail: string, newRole: UserRole): Promise<boolean> {
    console.log('👤 [API] updateUserRole:', { userEmail, newRole });
    
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<User>>(
          `${this.apiUrl}/users/${userEmail}/role`,
          { role: newRole }
        )
      );
      
      if (response.success && response.data) {
        // Actualizar lista local
        await this.loadUsers();
        console.log('✅ Rol de usuario actualizado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error actualizando rol de usuario:', error);
      return false;
    }
  }

  /**
   * Actualiza el perfil de un usuario vía API
   */
  public async updateUserProfile(userEmail: string, profileData: Partial<User>): Promise<User | null> {
    console.log('👤 [API] updateUserProfile:', { userEmail, profileData });
    
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<User>>(
          `${this.apiUrl}/users/${userEmail}`,
          profileData
        )
      );
      
      if (response.success && response.data) {
        // Actualizar lista local
        const currentUsers = this.users();
        const updatedUsers = currentUsers.map(u => 
          u.email === userEmail ? response.data! : u
        );
        this.usersSignal.set(updatedUsers);
        this.usersSubject.next(updatedUsers);
        console.log('✅ Perfil de usuario actualizado');
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error actualizando perfil de usuario:', error);
      return null;
    }
  }

  /**
   * Cambia la contraseña de un usuario vía API
   */
  public async changeUserPassword(userEmail: string, currentPassword: string, newPassword: string): Promise<boolean> {
    console.log('👤 [API] changeUserPassword:', { userEmail });
    
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<void>>(
          `${this.apiUrl}/users/${userEmail}/password`,
          { currentPassword, newPassword }
        )
      );
      
      return response.success;
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      return false;
    }
  }
}
