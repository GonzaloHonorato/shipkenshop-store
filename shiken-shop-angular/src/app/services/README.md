# Services

Esta carpeta contiene todos los servicios Angular que manejan la lógica de negocio y comunicación de datos.

## Servicios Principales:

### Core Services
- `auth.service.ts` - Manejo de autenticación y autorización
- `data.service.ts` - Gestión de datos con localStorage
- `notification.service.ts` - Sistema de notificaciones y alertas

### Feature Services
- `product.service.ts` - Gestión de productos y catálogo
- `cart.service.ts` - Lógica del carrito de compras
- `category.service.ts` - Manejo de categorías de productos
- `user.service.ts` - Gestión de usuarios y perfiles
- `order.service.ts` - Procesamiento de órdenes y compras

### Utility Services
- `storage.service.ts` - Abstracción de localStorage/sessionStorage
- `validation.service.ts` - Validaciones personalizadas
- `theme.service.ts` - Manejo de temas y configuración visual

## Convenciones:
- Usar Dependency Injection de Angular
- Implementar interfaces para contratos
- Usar RxJS para operaciones asíncronas
- Manejar errores adecuadamente
- Inyección como `providedIn: 'root'` para servicios singleton