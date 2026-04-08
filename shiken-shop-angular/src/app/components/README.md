# Components

Esta carpeta contiene todos los componentes Angular de ShikenShop, organizados por funcionalidad:

## Estructura de Carpetas:

### `layout/`
- Componentes de diseño general (Header, Footer, Navigation, Sidebar)
- Componentes reutilizables de UI (Modal, Loading, etc.)

### `auth/`
- Componentes de autenticación (Login, Register, ForgotPassword)
- Formularios de autenticación y validaciones

### `catalog/`
- Componentes del catálogo de productos
- ProductList, ProductCard, ProductDetail, CategoryGrid

### `cart/`
- Componentes del carrito de compras
- Cart, CartItem, Checkout, OrderSummary

### `admin/`
- Componentes del panel administrativo
- Dashboard, ProductsManagement, UsersManagement, SalesManagement

### `buyer/`
- Componentes específicos del comprador
- BuyerDashboard, MyPurchases, MyAccount

## Convenciones de Naming:
- PascalCase para nombres de componentes
- kebab-case para nombres de archivos
- Sufijo "Component" en las clases TypeScript

Ejemplo:
```
header/
  ├── header.component.ts
  ├── header.component.html
  ├── header.component.scss
  └── header.component.spec.ts
```