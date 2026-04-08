import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';
import { Product, ProductCategoryEnum } from '../../models';
import { 
  positiveNumberValidator, 
  integerValidator, 
  percentageValidator,
  productNameValidator 
} from '../../validators/custom-validators';

// ===================================
// ADMIN PRODUCTS COMPONENT
// ===================================

interface ProductFilter {
  search: string;
  category: string;
  stock: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // ===================================
  // REACTIVE STATE
  // ===================================
  
  // State signals
  readonly isLoading = signal(false);
  readonly isModalOpen = signal(false);
  readonly filter = signal<ProductFilter>({
    search: '',
    category: '',
    stock: ''
  });
  readonly editingProduct = signal<Product | null>(null);

  // Product form con validadores mejorados
  readonly productForm: FormGroup = this.fb.group({
    name: new FormControl('', [
      Validators.required, 
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(/^[a-zA-Z0-9\s\-:]+$/), // Solo letras, números, espacios, guiones y dos puntos
      productNameValidator // Validador personalizado
    ]),
    category: new FormControl('', [
      Validators.required
    ]),
    description: new FormControl('', [
      Validators.required, 
      Validators.minLength(10),
      Validators.maxLength(500)
    ]),
    price: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.max(1000000),
      positiveNumberValidator // Validador personalizado
    ]),
    discount: new FormControl(0, [
      Validators.min(0),
      Validators.max(100),
      percentageValidator // Validador personalizado
    ]),
    stock: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.max(9999),
      integerValidator // Validador personalizado para números enteros
    ]),
    image: new FormControl('', [
      Validators.pattern(/^https?:\/\/.+/) // Pattern para URL válida
    ]),
    active: new FormControl(true),
    featured: new FormControl(false)
  });

  // Filter form
  readonly filterForm: FormGroup = this.fb.group({
    search: [''],
    category: [''],
    stock: ['']
  });

  // Computed properties
  readonly products = computed(() => this.dataService.products());
  readonly filteredProducts = computed(() => this.applyFilters());
  readonly isEditing = computed(() => this.editingProduct() !== null);
  readonly modalTitle = computed(() => this.isEditing() ? 'Editar Producto' : 'Nuevo Producto');

  // Categories for dropdown
  readonly categories = [
    { value: ProductCategoryEnum.ACCION, label: 'Acción' },
    { value: ProductCategoryEnum.RPG, label: 'RPG' },
    { value: ProductCategoryEnum.ESTRATEGIA, label: 'Estrategia' },
    { value: ProductCategoryEnum.AVENTURA, label: 'Aventura' }
  ];

  // Stock options for filter
  readonly stockOptions = [
    { value: '', label: 'Todos' },
    { value: 'available', label: 'Disponible' },
    { value: 'out-of-stock', label: 'Sin Stock' }
  ];

  // ===================================
  // LIFECYCLE
  // ===================================

  ngOnInit(): void {
    console.log('🛠️ Admin Products - Inicializando...');
    
    // Verify admin access
    if (!this.authService.isAdmin()) {
      this.notificationService.error('Acceso denegado: Se requieren permisos de administrador');
      this.router.navigate(['/']);
      return;
    }

    this.setupFilterSubscription();
    this.setupProductFormListeners();
  }

  // ===================================
  // LISTENERS DE FORMULARIO DE PRODUCTO
  // ===================================

  private setupProductFormListeners(): void {
    // Listener para actualizar precio final cuando cambia precio o descuento
    this.productForm.get('price')?.valueChanges.subscribe(() => {
      this.updateFinalPrice();
    });

    this.productForm.get('discount')?.valueChanges.subscribe(() => {
      this.updateFinalPrice();
    });
  }

  private updateFinalPrice(): void {
    const price = this.productForm.get('price')?.value;
    const discount = this.productForm.get('discount')?.value || 0;
    
    if (price && discount > 0) {
      const finalPrice = this.calculateFinalPrice(Number(price), Number(discount));
      console.log(`💰 Precio: $${price} - Descuento: ${discount}% = Precio Final: $${finalPrice}`);
    }
  }

  // ===================================
  // FILTER MANAGEMENT
  // ===================================

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges.subscribe(filterValue => {
      this.filter.set(filterValue);
    });
  }

  private applyFilters(): Product[] {
    const products = this.products();
    const currentFilter = this.filter();

    return products.filter(product => {
      // Search filter
      const matchesSearch = !currentFilter.search || 
        product.name.toLowerCase().includes(currentFilter.search.toLowerCase()) ||
        product.description.toLowerCase().includes(currentFilter.search.toLowerCase());

      // Category filter  
      const matchesCategory = !currentFilter.category || 
        product.category === currentFilter.category;

      // Stock filter
      const matchesStock = !currentFilter.stock ||
        (currentFilter.stock === 'available' && product.stock > 0) ||
        (currentFilter.stock === 'out-of-stock' && product.stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      search: '',
      category: '',
      stock: ''
    });
  }

  // ===================================
  // PRODUCT MANAGEMENT
  // ===================================

  openNewProductModal(): void {
    this.editingProduct.set(null);
    this.productForm.reset({
      name: '',
      category: '',
      description: '',
      price: '',
      discount: 0,
      stock: '',
      image: '',
      active: true,
      featured: false
    });
    this.isModalOpen.set(true);
  }

  editProduct(product: Product): void {
    console.log('✏️ Editando producto:', product);
    
    this.editingProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      discount: product.discount || 0,
      stock: product.stock,
      image: product.image || '',
      active: product.active,
      featured: product.featured || false
    });
    this.isModalOpen.set(true);
    
    console.log('✏️ Formulario poblado con valores:', this.productForm.value);
  }

  async deleteProduct(product: Product): Promise<void> {
    console.log('🗑️ Intentando eliminar producto:', product);
    
    if (!confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
      return;
    }

    this.isLoading.set(true);

    try {
      const result = await this.dataService.deleteProduct(product.id);
      console.log('🗑️ Resultado eliminación:', result);
      
      if (result) {
        this.notificationService.success(`Producto "${product.name}" eliminado correctamente`);
      } else {
        this.notificationService.error('No se pudo encontrar el producto para eliminar');
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      this.notificationService.error('Error al eliminar el producto');
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleProductStatus(product: Product): Promise<void> {
    this.isLoading.set(true);

    try {
      const updatedProduct: Product = {
        ...product,
        active: !product.active
      };

      await this.dataService.updateProduct(product.id, updatedProduct);
      
      const status = updatedProduct.active ? 'activado' : 'desactivado';
      this.notificationService.success(`Producto ${status} correctamente`);
    } catch (error) {
      console.error('Error actualizando estado del producto:', error);
      this.notificationService.error('Error al actualizar el estado del producto');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSaveProduct(): Promise<void> {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    this.isLoading.set(true);
    const formValue = this.productForm.value;

    try {
      const productData: Partial<Product> = {
        name: formValue.name,
        category: formValue.category,
        description: formValue.description,
        price: Number(formValue.price),
        originalPrice: Number(formValue.price), // Set original price same as price initially
        discount: Number(formValue.discount) || 0,
        stock: Number(formValue.stock),
        image: formValue.image || this.generateDefaultImage(formValue.name),
        active: formValue.active,
        featured: formValue.featured
      };

      if (this.isEditing()) {
        // Update existing product
        const product = this.editingProduct()!;
        const updatedProduct = { ...product, ...productData };
        await this.dataService.updateProduct(product.id, updatedProduct);
        this.notificationService.success('Producto actualizado correctamente');
        console.log('✅ Producto actualizado:', updatedProduct);
      } else {
        // Create new product with all required fields
        const newProduct: Omit<Product, 'id'> = {
          name: productData.name!,
          description: productData.description!,
          category: productData.category!,
          price: productData.price!,
          originalPrice: productData.originalPrice!,
          discount: productData.discount!,
          stock: productData.stock!,
          image: productData.image!,
          active: productData.active!,
          featured: productData.featured!,
          rating: 0,
          reviews: 0,
          releaseDate: new Date().toISOString().split('T')[0],
          developer: 'ShikenShop',
          platform: ['PC'],
          tags: [productData.category!],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await this.dataService.createProduct(newProduct);
        this.notificationService.success('Producto creado correctamente');
        console.log('✅ Producto creado:', newProduct);
      }

      this.closeModal();
    } catch (error) {
      console.error('Error guardando producto:', error);
      this.notificationService.error('Error al guardar el producto');
    } finally {
      this.isLoading.set(false);
    }
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
    this.productForm.reset();
  }

  // ===================================
  // UTILITY METHODS
  // ===================================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  calculateFinalPrice(price: number, discount: number): number {
    return discount > 0 ? price * (1 - discount / 100) : price;
  }

  getCategoryLabel(category: string): string {
    const categoryObj = this.categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : category.toUpperCase();
  }

  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (stock <= 5) return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    return 'bg-green-500/20 text-green-400 border border-green-500/30';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return `Poco stock (${stock})`;
    return `${stock} disponibles`;
  }

  private generateDefaultImage(productName: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(productName)}&size=400&background=7c3aed&color=fff`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // ===================================
  // MANEJO DE EVENTOS MODERNOS DEL FORMULARIO DE PRODUCTO
  // ===================================

  /**
   * Evento (change) - Validar y formatear al cambiar
   */
  onProductFieldChange(fieldName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log(`📝 Producto - Campo ${fieldName} cambió:`, input.value);
    
    // Formatear nombre del producto (capitalizar)
    if (fieldName === 'name') {
      const formatted = this.capitalizeProductName(input.value);
      if (formatted !== input.value) {
        this.productForm.get('name')?.setValue(formatted, { emitEvent: false });
      }
    }

    // Validar que el precio sea un número válido
    if (fieldName === 'price' && input.value) {
      const numValue = Number(input.value);
      if (isNaN(numValue) || numValue < 0) {
        this.notificationService.warning('El precio debe ser un número positivo');
      }
    }

    // Validar que el stock sea un entero
    if (fieldName === 'stock' && input.value) {
      const numValue = Number(input.value);
      if (!Number.isInteger(numValue) || numValue < 0) {
        this.notificationService.warning('El stock debe ser un número entero positivo');
      }
    }
  }

  /**
   * Evento (keydown) - Prevenir caracteres no deseados
   */
  onProductFieldKeyDown(fieldName: string, event: KeyboardEvent): void {
    // Prevenir caracteres especiales en el nombre del producto
    if (fieldName === 'name') {
      const invalidChars = ['<', '>', '/', '\\', '{', '}', '[', ']'];
      if (invalidChars.includes(event.key)) {
        event.preventDefault();
        return;
      }
    }

    // Solo permitir números, punto y teclas de control en campos numéricos
    if (['price', 'stock', 'discount'].includes(fieldName)) {
      const isNumber = /^\d$/.test(event.key);
      const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key);
      const isPeriod = event.key === '.' && fieldName !== 'stock'; // Permitir punto solo en price y discount
      
      if (!isNumber && !isControlKey && !isPeriod) {
        event.preventDefault();
      }
    }

    // Submit con Enter (solo si no es textarea)
    if (event.key === 'Enter' && fieldName !== 'description') {
      event.preventDefault();
      this.onSaveProduct();
    }
  }

  /**
   * Evento (input) - Validación en tiempo real
   */
  onProductFieldInput(fieldName: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    
    // Limitar longitud de caracteres en tiempo real
    if (fieldName === 'name' && input.value.length > 100) {
      input.value = input.value.substring(0, 100);
      this.productForm.get('name')?.setValue(input.value);
    }

    if (fieldName === 'description' && input.value.length > 500) {
      input.value = input.value.substring(0, 500);
      this.productForm.get('description')?.setValue(input.value);
    }
  }

  /**
   * Evento (blur) - Marcar como touched y validar
   */
  onProductFieldBlur(fieldName: string): void {
    const control = this.productForm.get(fieldName);
    
    if (control) {
      control.markAsTouched();
      
      // Validaciones específicas al perder el foco
      if (fieldName === 'price' && control.value) {
        const price = Number(control.value);
        if (price > 0 && price < 100) {
          console.log('⚠️ Precio bajo detectado');
        }
      }

      if (fieldName === 'stock' && control.value !== null && control.value !== undefined && control.value !== '') {
        const stock = Number(control.value);
        if (stock === 0) {
          this.notificationService.warning('El producto quedará sin stock');
        }
      }
    }
  }

  /**
   * Evento (focus) - Mostrar ayuda contextual
   */
  onProductFieldFocus(fieldName: string): void {
    console.log(`🎯 Foco en campo de producto: ${fieldName}`);
  }

  // ===================================
  // FORM VALIDATION HELPERS
  // ===================================

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `Formato inválido`;
      if (field.errors['positiveNumber']) return `Debe ser un número positivo`;
      if (field.errors['integer']) return `Debe ser un número entero`;
      if (field.errors['percentage']) return `Debe ser un porcentaje entre 0 y 100`;
      if (field.errors['startsWithNumber']) return `No debe comenzar con un número`;
    }
    return '';
  }

  private capitalizeProductName(text: string): string {
    return text.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // ===================================
  // NAVIGATION
  // ===================================

  navigateToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  onLogout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  // ===================================
  // TRACKING FUNCTION
  // ===================================

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}