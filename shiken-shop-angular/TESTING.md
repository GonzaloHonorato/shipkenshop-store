# 🧪 Guía de Testing con Jasmine y Karma

Esta guía documenta todas las pruebas unitarias implementadas en el proyecto ShikenShop Angular utilizando **Jasmine** y **Karma**.

## 📋 Tabla de Contenidos

- [Configuración](#configuración)
- [Ejecutar Tests](#ejecutar-tests)
- [Estructura de Tests](#estructura-de-tests)
- [Componentes Testeados](#componentes-testeados)
- [Conceptos Clave](#conceptos-clave)
- [Ejemplos de Tests](#ejemplos-de-tests)

## 🔧 Configuración

### Prerrequisitos

```bash
# Instalar dependencias
npm install

# Verificar que Karma y Jasmine estén instalados
npm list @angular-devkit/build-angular karma jasmine
```

### Configuración de Karma

El archivo `karma.conf.js` está configurado para:
- Usar Chrome Headless para CI/CD
- Generar reportes de cobertura
- Ejecutar pruebas en modo watch para desarrollo

## 🚀 Ejecutar Tests

### Ejecutar todos los tests una vez
```bash
npm test
# o
ng test --watch=false
```

### Ejecutar tests en modo watch (desarrollo)
```bash
ng test
```

### Ejecutar tests con cobertura
```bash
ng test --code-coverage
```

### Ejecutar tests de un archivo específico
```bash
ng test --include='**/register.component.spec.ts'
```

### Ejecutar tests en modo headless (CI/CD)
```bash
ng test --browsers=ChromeHeadless --watch=false
```

## 📁 Estructura de Tests

```
src/app/
├── components/
│   └── auth/
│       ├── register.component.spec.ts    # Tests del componente de registro
│       └── login.component.spec.ts       # Tests del componente de login
├── pages/
│   └── admin-products/
│       └── admin-products.component.spec.ts  # Tests de gestión de productos
└── validators/
    └── custom-validators.spec.ts         # Tests de validadores personalizados
```

## 🧩 Componentes Testeados

### 1. RegisterComponent (120+ tests)

**Archivo**: `register.component.spec.ts`

**Cobertura**:
- ✅ Creación e inicialización del componente
- ✅ Validaciones required en todos los campos
- ✅ Validaciones minLength/maxLength
- ✅ Validaciones pattern (email, username)
- ✅ Validadores personalizados (strongPassword, minAge, noNumbers, pastDate)
- ✅ Manejo de eventos (change, keydown, input, blur, focus)
- ✅ Métodos de utilidad (togglePassword, clearForm, calculatePasswordStrength)
- ✅ Envío de formulario y manejo de respuestas
- ✅ Integración con detectChanges()

**Ejemplo de ejecución**:
```bash
ng test --include='**/register.component.spec.ts'
```

### 2. LoginComponent (50+ tests)

**Archivo**: `login.component.spec.ts`

**Cobertura**:
- ✅ Inicialización del componente
- ✅ Validaciones de campos requeridos
- ✅ Validación de formato de email
- ✅ Toggle de visibilidad de contraseña
- ✅ Envío de formulario válido/inválido
- ✅ Manejo de errores de login
- ✅ Redirección según rol de usuario
- ✅ Manejo de edge cases y errores de red

### 3. AdminProductsComponent (100+ tests)

**Archivo**: `admin-products.component.spec.ts`

**Cobertura**:
- ✅ Validaciones de formulario de producto
- ✅ Validadores personalizados (positiveNumber, integer, percentage, productName)
- ✅ CRUD de productos (crear, editar, eliminar)
- ✅ Filtrado de productos (búsqueda, categoría, stock)
- ✅ Manejo de eventos del formulario
- ✅ Toggle de estado de productos
- ✅ Métodos de utilidad (formatCurrency, calculateFinalPrice)
- ✅ Gestión de modal

### 4. Custom Validators (80+ tests)

**Archivo**: `custom-validators.spec.ts`

**Cobertura**:
- ✅ passwordMatchValidator
- ✅ strongPasswordValidator
- ✅ minAgeValidator
- ✅ usernameValidator
- ✅ positiveNumberValidator
- ✅ integerValidator
- ✅ percentageValidator
- ✅ urlValidator
- ✅ productNameValidator
- ✅ noNumbersValidator
- ✅ corporateEmailValidator
- ✅ matchFieldValidator
- ✅ pastDateValidator
- ✅ futureDateValidator
- ✅ Tests de integración con múltiples validadores

## 🔑 Conceptos Clave

### TestBed

`TestBed` es la utilidad principal de testing de Angular que configura el módulo de testing.

```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [RegisterComponent, ReactiveFormsModule],
    providers: [
      { provide: AuthService, useValue: authServiceSpy }
    ]
  }).compileComponents();
});
```

### Fixture

`ComponentFixture` proporciona acceso al componente y su template.

```typescript
fixture = TestBed.createComponent(RegisterComponent);
component = fixture.componentInstance;
fixture.detectChanges(); // Trigger change detection
```

### detectChanges()

Ejecuta la detección de cambios manualmente, actualizando la vista.

```typescript
component.registerForm.get('username')?.setValue('testuser');
fixture.detectChanges(); // Actualiza la vista
```

### describe, it, expect

- **describe**: Agrupa tests relacionados
- **it**: Define un test individual
- **expect**: Define una aserción

```typescript
describe('Form Validation', () => {
  it('should validate email format', () => {
    const control = component.registerForm.get('email');
    control?.setValue('invalid-email');
    expect(control?.hasError('email')).toBeTruthy();
  });
});
```

### Spies (Mocks)

Los spies permiten simular comportamiento de servicios.

```typescript
const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);
authServiceSpy.login.and.returnValue(Promise.resolve({ success: true }));
```

### fakeAsync y tick

Permiten controlar el tiempo asíncrono en tests.

```typescript
it('should handle async operation', fakeAsync(() => {
  component.onSubmit();
  tick(); // Simula el paso del tiempo
  expect(component.isLoading).toBe(false);
}));
```

## 📝 Ejemplos de Tests

### Ejemplo 1: Test de Validación Required

```typescript
it('should require fullName', () => {
  const fullNameControl = component.registerForm.get('fullName');
  expect(fullNameControl?.valid).toBeFalsy();
  expect(fullNameControl?.hasError('required')).toBeTruthy();
});
```

### Ejemplo 2: Test de Validador Personalizado

```typescript
it('should validate strong password', () => {
  const passwordControl = component.registerForm.get('password');
  
  passwordControl?.setValue('weak'); // No cumple requisitos
  expect(passwordControl?.hasError('strongPassword')).toBeTruthy();
  
  passwordControl?.setValue('Strong123'); // Cumple requisitos
  expect(passwordControl?.hasError('strongPassword')).toBeFalsy();
});
```

### Ejemplo 3: Test de Evento

```typescript
it('should prevent spaces in username on keydown', () => {
  const mockEvent = {
    key: ' ',
    preventDefault: jasmine.createSpy('preventDefault')
  } as any;
  
  component.onKeyDown('username', mockEvent);
  
  expect(mockEvent.preventDefault).toHaveBeenCalled();
});
```

### Ejemplo 4: Test con detectChanges()

```typescript
it('should update view when form values change', () => {
  component.registerForm.get('username')?.setValue('testuser');
  fixture.detectChanges();
  
  const compiled = fixture.nativeElement;
  const input = compiled.querySelector('#username') as HTMLInputElement;
  
  expect(input.value).toBe('testuser');
});
```

### Ejemplo 5: Test de Envío de Formulario

```typescript
it('should submit valid form successfully', fakeAsync(() => {
  // Configurar formulario válido
  component.registerForm.patchValue({
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    birthdate: '2000-01-01'
  });

  // Mock respuesta exitosa
  authService.register.and.returnValue(
    Promise.resolve({ success: true, message: 'Success' })
  );

  component.onSubmit();
  tick();

  expect(authService.register).toHaveBeenCalled();
  expect(notificationService.success).toHaveBeenCalled();
}));
```

## 📊 Cobertura de Código

Para ver el reporte de cobertura:

```bash
ng test --code-coverage --watch=false
```

El reporte se genera en: `coverage/shiken-shop-angular/index.html`

### Objetivos de Cobertura

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## 🎯 Mejores Prácticas

### 1. Naming Convention
```typescript
// ✅ Bueno: Describe qué hace el test
it('should validate email format', () => {});

// ❌ Malo: No descriptivo
it('test1', () => {});
```

### 2. Arrange-Act-Assert (AAA)
```typescript
it('should do something', () => {
  // Arrange: Preparar el escenario
  const control = component.registerForm.get('email');
  
  // Act: Ejecutar la acción
  control?.setValue('test@example.com');
  
  // Assert: Verificar el resultado
  expect(control?.valid).toBeTruthy();
});
```

### 3. Un Test, Una Aserción (Ideal)
```typescript
// ✅ Bueno: Un concepto por test
it('should require email', () => {
  const control = component.registerForm.get('email');
  expect(control?.hasError('required')).toBeTruthy();
});

it('should validate email format', () => {
  const control = component.registerForm.get('email');
  control?.setValue('invalid');
  expect(control?.hasError('email')).toBeTruthy();
});
```

### 4. Usar beforeEach para Setup Común
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Tests...
});
```

### 5. Limpiar Después de Tests
```typescript
afterEach(() => {
  fixture.destroy();
});
```

## 🐛 Debugging Tests

### Ver tests en el navegador
```bash
ng test
# Abre http://localhost:9876/debug.html
```

### Ejecutar un solo test
```typescript
// Cambiar 'it' por 'fit' (focused it)
fit('should run only this test', () => {
  // ...
});
```

### Omitir un test
```typescript
// Cambiar 'it' por 'xit' (excluded it)
xit('should skip this test', () => {
  // ...
});
```

### Logs en tests
```typescript
it('should do something', () => {
  console.log('Debug info:', component.someValue);
  expect(component.someValue).toBe(expectedValue);
});
```

## 📚 Recursos Adicionales

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Documentation](https://karma-runner.github.io/)
- [Testing Best Practices](https://angular.io/guide/testing-best-practices)

## ✅ Checklist de Testing

- [ ] Tests pasan en modo watch
- [ ] Tests pasan en modo CI (headless)
- [ ] Cobertura > 80%
- [ ] Todos los validadores tienen tests
- [ ] Todos los métodos públicos tienen tests
- [ ] Edge cases están cubiertos
- [ ] Tests son independientes (no dependen del orden)
- [ ] Mocks están bien configurados
- [ ] Tests son legibles y mantenibles

## 🎓 Conceptos Académicos Cubiertos

### 1. TestBed
- Configuración de módulos de testing
- Inyección de dependencias en tests
- Compilación de componentes

### 2. Fixture
- Acceso al componente y su instancia
- Manipulación del DOM
- Detección de cambios manual

### 3. detectChanges()
- Ciclo de vida de detección de cambios
- Actualización de vistas
- Testing de bindings

### 4. describe, it, expect
- Organización de suites de tests
- Definición de casos de prueba
- Aserciones y matchers de Jasmine

### 5. Validadores
- Validadores síncronos
- Validadores asíncronos
- Validadores personalizados
- Validadores a nivel de FormGroup

### 6. Eventos
- Testing de eventos del DOM
- Event handlers
- Propagación de eventos
- Prevención de comportamiento por defecto

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
**Framework**: Angular 20.3.9
