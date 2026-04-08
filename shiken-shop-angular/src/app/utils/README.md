# Utils

Esta carpeta contiene funciones utilitarias, helpers y constantes reutilizables en toda la aplicación ShikenShop.

## Utilitarios Principales:

### Data Utilities
- `data-helpers.ts` - Funciones para manipulación de datos
- `validation-helpers.ts` - Funciones de validación reutilizables
- `format-helpers.ts` - Funciones de formateo (fechas, precios, texto)
- `array-helpers.ts` - Utilidades para manipulación de arrays
- `object-helpers.ts` - Utilidades para manipulación de objetos

### Storage Utilities
- `local-storage-helpers.ts` - Funciones para localStorage con tipado
- `session-helpers.ts` - Manejo de sesión del usuario
- `cache-helpers.ts` - Funciones de caché temporal
- `migration-helpers.ts` - Migración de datos entre versiones

### UI Utilities
- `dom-helpers.ts` - Manipulación del DOM
- `animation-helpers.ts` - Funciones para animaciones
- `responsive-helpers.ts` - Utilidades para diseño responsive
- `theme-helpers.ts` - Funciones para manejo de temas

### Business Logic Utilities
- `price-calculator.ts` - Cálculos de precios, descuentos, impuestos
- `cart-helpers.ts` - Funciones para lógica del carrito
- `game-helpers.ts` - Utilidades específicas de videojuegos
- `user-helpers.ts` - Funciones para manejo de usuarios

### Constants
- `app-constants.ts` - Constantes globales de la aplicación
- `api-endpoints.ts` - URLs y endpoints de API
- `validation-patterns.ts` - Patrones de validación (regex, etc.)
- `error-messages.ts` - Mensajes de error estándar

### Environment Utilities
- `environment-helpers.ts` - Funciones para manejo de entornos
- `feature-flags.ts` - Flags de características
- `config-helpers.ts` - Configuración dinámica

## Convenciones:
- Usar nombres descriptivos para funciones
- Funciones puras sin efectos secundarios cuando sea posible
- Documentar con JSDoc para funciones complejas
- Exportar como named exports, no default
- Usar TypeScript para tipado fuerte
- Incluir tests unitarios para funciones críticas

## Ejemplo:
```typescript
/**
 * Calcula el precio total con descuentos e impuestos
 * @param basePrice - Precio base del producto
 * @param discount - Porcentaje de descuento (0-1)
 * @param taxRate - Tasa de impuesto (0-1)
 * @returns Precio final calculado
 */
export function calculateFinalPrice(
  basePrice: number, 
  discount: number = 0, 
  taxRate: number = 0
): number {
  if (basePrice < 0) throw new Error('Base price cannot be negative');
  
  const discountedPrice = basePrice * (1 - discount);
  return discountedPrice * (1 + taxRate);
}
```