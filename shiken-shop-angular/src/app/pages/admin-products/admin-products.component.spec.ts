import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { AdminProductsComponent } from './admin-products.component';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductCategoryEnum } from '../../models';

// ===================================
// ADMIN PRODUCTS COMPONENT - UNIT TESTS
// ===================================

describe('AdminProductsComponent', () => {
  let component: AdminProductsComponent;
  let fixture: ComponentFixture<AdminProductsComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let dataService: jasmine.SpyObj<DataService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Game',
    description: 'Test Description with sufficient length for validation',
    category: ProductCategoryEnum.ACCION,
    price: 50000,
    originalPrice: 50000,
    discount: 0,
    stock: 10,
    image: 'https://example.com/test.jpg',
    active: true,
    featured: false,
    rating: 4.5,
    reviews: 10,
    releaseDate: '2024-01-01',
    developer: 'Test Dev',
    platform: ['PC'],
    tags: ['action'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  // ===================================
  // CONFIGURACIÓN DEL TESTBED
  // ===================================

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isAdmin',
      'currentUser',
      'logout'
    ]);
    const dataServiceSpy = jasmine.createSpyObj('DataService', [
      'products',
      'createProduct',
      'updateProduct',
      'deleteProduct'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning',
      'info'
    ]);
    
    // CORREGIDO: Mock completo del Router con todos los métodos necesarios
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    routerSpy.createUrlTree.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('/mocked-url');

    authServiceSpy.isAdmin.and.returnValue(true);
    authServiceSpy.currentUser.and.returnValue({
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin'
    } as any);
    
    // CORREGIDO: products debe ser un signal que retorna el array directamente
    Object.defineProperty(dataServiceSpy, 'products', {
      get: () => signal([mockProduct])
    });

    await TestBed.configureTestingModule({
      imports: [AdminProductsComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DataService, useValue: dataServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(AdminProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ===================================
  // TESTS DE CREACIÓN E INICIALIZACIÓN
  // ===================================

  describe('Component Creation and Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize product form with empty values', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('category')?.value).toBe('');
      expect(component.productForm.get('description')?.value).toBe('');
      expect(component.productForm.get('price')?.value).toBe('');
      expect(component.productForm.get('discount')?.value).toBe(0);
      expect(component.productForm.get('stock')?.value).toBe('');
      expect(component.productForm.get('active')?.value).toBe(true);
      expect(component.productForm.get('featured')?.value).toBe(false);
    });

    it('should initialize filter form', () => {
      expect(component.filterForm).toBeDefined();
      expect(component.filterForm.get('search')?.value).toBe('');
      expect(component.filterForm.get('category')?.value).toBe('');
      expect(component.filterForm.get('stock')?.value).toBe('');
    });

    it('should redirect non-admin users', () => {
      authService.isAdmin.and.returnValue(false);
      
      component.ngOnInit();
      
      expect(notificationService.error).toHaveBeenCalledWith(
        'Acceso denegado: Se requieren permisos de administrador'
      );
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should have modal closed initially', () => {
      expect(component.isModalOpen()).toBe(false);
    });

    it('should have isLoading false initially', () => {
      expect(component.isLoading()).toBe(false);
    });
  });

  // ===================================
  // TESTS DE VALIDACIONES DEL FORMULARIO DE PRODUCTO
  // ===================================

  describe('Product Form Validation - Required Fields', () => {
    it('should be invalid when form is empty', () => {
      expect(component.productForm.valid).toBeFalsy();
    });

    it('should require name', () => {
      const nameControl = component.productForm.get('name');
      expect(nameControl?.hasError('required')).toBeTruthy();
    });

    it('should require category', () => {
      const categoryControl = component.productForm.get('category');
      expect(categoryControl?.hasError('required')).toBeTruthy();
    });

    it('should require description', () => {
      const descriptionControl = component.productForm.get('description');
      expect(descriptionControl?.hasError('required')).toBeTruthy();
    });

    it('should require price', () => {
      const priceControl = component.productForm.get('price');
      expect(priceControl?.hasError('required')).toBeTruthy();
    });

    it('should require stock', () => {
      const stockControl = component.productForm.get('stock');
      expect(stockControl?.hasError('required')).toBeTruthy();
    });
  });

  describe('Product Form Validation - MinLength and MaxLength', () => {
    it('should validate name minLength (3 characters)', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('Ab');
      expect(nameControl?.hasError('minlength')).toBeTruthy();
      
      nameControl?.setValue('Abc');
      expect(nameControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate name maxLength (100 characters)', () => {
      const nameControl = component.productForm.get('name');
      const longName = 'A'.repeat(101);
      nameControl?.setValue(longName);
      expect(nameControl?.hasError('maxlength')).toBeTruthy();
    });

    it('should validate description minLength (10 characters)', () => {
      const descControl = component.productForm.get('description');
      descControl?.setValue('Short');
      expect(descControl?.hasError('minlength')).toBeTruthy();
      
      descControl?.setValue('This is a valid description');
      expect(descControl?.hasError('minlength')).toBeFalsy();
    });

    it('should validate description maxLength (500 characters)', () => {
      const descControl = component.productForm.get('description');
      const longDesc = 'A'.repeat(501);
      descControl?.setValue(longDesc);
      expect(descControl?.hasError('maxlength')).toBeTruthy();
    });
  });

  describe('Product Form Validation - Custom Validators', () => {
    it('should validate positive number for price', () => {
      const priceControl = component.productForm.get('price');
      
      priceControl?.setValue(-100);
      expect(priceControl?.hasError('min') || priceControl?.hasError('positiveNumber')).toBeTruthy();
      
      priceControl?.setValue(100);
      expect(priceControl?.hasError('positiveNumber')).toBeFalsy();
    });

    it('should validate integer for stock', () => {
      const stockControl = component.productForm.get('stock');
      
      stockControl?.setValue(10.5);
      expect(stockControl?.hasError('integer')).toBeTruthy();
      
      stockControl?.setValue(10);
      expect(stockControl?.hasError('integer')).toBeFalsy();
    });

    it('should validate percentage for discount (0-100)', () => {
      const discountControl = component.productForm.get('discount');
      
      discountControl?.setValue(-5);
      expect(discountControl?.hasError('min') || discountControl?.hasError('percentage')).toBeTruthy();
      
      discountControl?.setValue(150);
      expect(discountControl?.hasError('max') || discountControl?.hasError('percentage')).toBeTruthy();
      
      discountControl?.setValue(50);
      expect(discountControl?.hasError('percentage')).toBeFalsy();
    });

    it('should validate product name does not start with number', () => {
      const nameControl = component.productForm.get('name');
      
      nameControl?.setValue('123 Game');
      expect(nameControl?.hasError('startsWithNumber')).toBeTruthy();
      
      nameControl?.setValue('Game 123');
      expect(nameControl?.hasError('startsWithNumber')).toBeFalsy();
    });

    it('should validate URL pattern for image', () => {
      const imageControl = component.productForm.get('image');
      
      imageControl?.setValue('not-a-url');
      expect(imageControl?.hasError('pattern')).toBeTruthy();
      
      imageControl?.setValue('https://example.com/image.jpg');
      expect(imageControl?.hasError('pattern')).toBeFalsy();
    });
  });

  // ===================================
  // TESTS DE MANEJO DE EVENTOS
  // ===================================

  describe('Event Handling Methods', () => {
    it('should capitalize product name on change', () => {
      const mockEvent = {
        target: { value: 'test game' }
      } as any;
      
      component.productForm.get('name')?.setValue('test game');
      component.onProductFieldChange('name', mockEvent);
      fixture.detectChanges();
      
      expect(component.productForm.get('name')?.value).toBe('Test Game');
    });

    it('should warn about positive price on change', () => {
      const mockEvent = {
        target: { value: '-100' }
      } as any;
      
      component.productForm.get('price')?.setValue('-100');
      component.onProductFieldChange('price', mockEvent);
      
      expect(notificationService.warning).toHaveBeenCalledWith(
        'El precio debe ser un número positivo'
      );
    });

    it('should warn about integer stock on change', () => {
      const mockEvent = {
        target: { value: '10.5' }
      } as any;
      
      component.productForm.get('stock')?.setValue('10.5');
      component.onProductFieldChange('stock', mockEvent);
      
      expect(notificationService.warning).toHaveBeenCalledWith(
        'El stock debe ser un número entero positivo'
      );
    });

    it('should prevent special characters in name on keydown', () => {
      const mockEvent = {
        key: '<',
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      component.onProductFieldKeyDown('name', mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should only allow numbers in numeric fields on keydown', () => {
      const mockEvent = {
        key: 'a',
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      component.onProductFieldKeyDown('price', mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should allow control keys in numeric fields', () => {
      const mockEvent = {
        key: 'Backspace',
        preventDefault: jasmine.createSpy('preventDefault')
      } as any;
      
      component.onProductFieldKeyDown('price', mockEvent);
      
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should limit name length on input', () => {
      const longName = 'A'.repeat(150);
      const mockEvent = {
        target: { value: longName }
      } as any;
      
      component.onProductFieldInput('name', mockEvent);
      
      expect(mockEvent.target.value.length).toBeLessThanOrEqual(100);
    });

    it('should mark field as touched on blur', () => {
      const nameControl = component.productForm.get('name');
      expect(nameControl?.touched).toBeFalsy();
      
      component.onProductFieldBlur('name');
      
      expect(nameControl?.touched).toBeTruthy();
    });

    it('should warn about zero stock on blur', () => {
      component.productForm.get('stock')?.setValue(0);
      component.onProductFieldBlur('stock');
      
      expect(notificationService.warning).toHaveBeenCalledWith(
        'El producto quedará sin stock'
      );
    });
  });

  // ===================================
  // TESTS DE GESTIÓN DE PRODUCTOS
  // ===================================

  describe('Product Management', () => {
    it('should open modal for new product', () => {
      component.openNewProductModal();
      fixture.detectChanges();
      
      expect(component.isModalOpen()).toBe(true);
      expect(component.editingProduct()).toBeNull();
      expect(component.modalTitle()).toBe('Nuevo Producto');
    });

    it('should open modal for editing product', () => {
      component.editProduct(mockProduct);
      fixture.detectChanges();
      
      expect(component.isModalOpen()).toBe(true);
      expect(component.editingProduct()).toEqual(mockProduct);
      expect(component.modalTitle()).toBe('Editar Producto');
      expect(component.productForm.get('name')?.value).toBe(mockProduct.name);
    });

    it('should close modal and reset form', () => {
      component.openNewProductModal();
      component.productForm.get('name')?.setValue('Test');
      
      component.closeModal();
      fixture.detectChanges();
      
      expect(component.isModalOpen()).toBe(false);
      expect(component.editingProduct()).toBeNull();
    });

    it('should not save invalid product form', () => {
      component.onSaveProduct();
      
      expect(dataService.createProduct).not.toHaveBeenCalled();
      expect(notificationService.warning).toHaveBeenCalledWith(
        'Por favor completa todos los campos requeridos'
      );
    });

    it('should create new product with valid form', fakeAsync(() => {
      component.openNewProductModal();
      component.productForm.patchValue({
        name: 'New Game',
        category: ProductCategoryEnum.ACCION,
        description: 'A great game with lots of action',
        price: 50000,
        discount: 10,
        stock: 20,
        image: 'https://example.com/game.jpg',
        active: true,
        featured: false
      });

      component.onSaveProduct();
      tick();

      expect(dataService.createProduct).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith(
        'Producto creado correctamente'
      );
      expect(component.isModalOpen()).toBe(false);
    }));

    it('should update existing product', fakeAsync(() => {
      component.editProduct(mockProduct);
      component.productForm.patchValue({
        name: 'Updated Game',
        price: 60000
      });

      component.onSaveProduct();
      tick();

      expect(dataService.updateProduct).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith(
        'Producto actualizado correctamente'
      );
    }));

    it('should delete product with confirmation', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      dataService.deleteProduct.and.returnValue(Promise.resolve(true));

      component.deleteProduct(mockProduct);
      tick();

      expect(dataService.deleteProduct).toHaveBeenCalledWith(mockProduct.id);
      expect(notificationService.success).toHaveBeenCalled();
    }));

    it('should not delete product if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteProduct(mockProduct);

      expect(dataService.deleteProduct).not.toHaveBeenCalled();
    });

    it('should toggle product status', fakeAsync(() => {
      component.toggleProductStatus(mockProduct);
      tick();

      expect(dataService.updateProduct).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalled();
    }));
  });

  // ===================================
  // TESTS DE FILTROS
  // ===================================

  describe('Product Filtering', () => {
    const filterProducts: Product[] = [
      { ...mockProduct, id: '1', name: 'Action Game', category: ProductCategoryEnum.ACCION, stock: 10 },
      { ...mockProduct, id: '2', name: 'RPG Game', category: ProductCategoryEnum.RPG, stock: 0 },
      { ...mockProduct, id: '3', name: 'Strategy Game', category: ProductCategoryEnum.ESTRATEGIA, stock: 5 }
    ];

    beforeEach(() => {
      // Crear un nuevo signal con los productos de filtro
      const productsSignal = signal(filterProducts);
      Object.defineProperty(dataService, 'products', {
        get: () => productsSignal,
        configurable: true
      });
      fixture = TestBed.createComponent(AdminProductsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should filter products by search term', () => {
      component.filterForm.patchValue({ search: 'Action' });
      fixture.detectChanges();

      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Action Game');
    });

    it('should filter products by category', () => {
      component.filterForm.patchValue({ category: ProductCategoryEnum.RPG });
      fixture.detectChanges();

      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].category).toBe(ProductCategoryEnum.RPG);
    });

    it('should filter products by stock availability', () => {
      component.filterForm.patchValue({ stock: 'out-of-stock' });
      fixture.detectChanges();

      const filtered = component.filteredProducts();
      expect(filtered.length).toBe(1);
      expect(filtered[0].stock).toBe(0);
    });

    it('should clear filters', () => {
      component.filterForm.patchValue({
        search: 'test',
        category: ProductCategoryEnum.ACCION,
        stock: 'available'
      });

      component.clearFilters();

      expect(component.filterForm.get('search')?.value).toBe('');
      expect(component.filterForm.get('category')?.value).toBe('');
      expect(component.filterForm.get('stock')?.value).toBe('');
    });
  });

  // ===================================
  // TESTS DE MÉTODOS DE UTILIDAD
  // ===================================

  describe('Utility Methods', () => {
    it('should format currency correctly', () => {
      const formatted = component.formatCurrency(50000);
      expect(formatted).toContain('50');
      expect(formatted).toContain('000');
    });

    it('should calculate final price with discount', () => {
      const finalPrice = component.calculateFinalPrice(10000, 20);
      expect(finalPrice).toBe(8000);
    });

    it('should calculate final price without discount', () => {
      const finalPrice = component.calculateFinalPrice(10000, 0);
      expect(finalPrice).toBe(10000);
    });

    it('should get category label', () => {
      const label = component.getCategoryLabel(ProductCategoryEnum.ACCION);
      expect(label).toBe('Acción');
    });

    it('should return correct stock badge class', () => {
      expect(component.getStockBadgeClass(0)).toContain('red');
      expect(component.getStockBadgeClass(3)).toContain('yellow');
      expect(component.getStockBadgeClass(10)).toContain('green');
    });

    it('should return correct stock text', () => {
      expect(component.getStockText(0)).toBe('Sin stock');
      expect(component.getStockText(3)).toContain('Poco stock');
      expect(component.getStockText(10)).toContain('10 disponibles');
    });

    it('should validate field invalid status', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.markAsTouched();
      
      expect(component.isFieldInvalid('name')).toBe(true);
      
      nameControl?.setValue('Valid Name');
      expect(component.isFieldInvalid('name')).toBe(false);
    });

    it('should get field error message', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.markAsTouched();
      
      const error = component.getFieldError('name');
      expect(error).toContain('requerido');
    });
  });

  // ===================================
  // TESTS DE INTEGRACIÓN CON detectChanges()
  // ===================================

  describe('Integration Tests with detectChanges()', () => {
    it('should update view when filter changes', () => {
      component.filterForm.get('search')?.setValue('test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const searchInput = compiled.querySelector('input[formControlName="search"]') as HTMLInputElement;
      
      expect(searchInput.value).toBe('test');
    });

    it('should show modal when opened', () => {
      component.openNewProductModal();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const modal = compiled.querySelector('.fixed.inset-0');
      
      expect(modal).toBeTruthy();
    });

    it('should display product count', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const countText = compiled.textContent;
      
      expect(countText).toContain('1');
    });

    it('should show validation errors after form submission attempt', () => {
      component.openNewProductModal();
      component.onSaveProduct();
      fixture.detectChanges();

      const nameControl = component.productForm.get('name');
      expect(nameControl?.touched).toBeTruthy();
    });
  });
});
