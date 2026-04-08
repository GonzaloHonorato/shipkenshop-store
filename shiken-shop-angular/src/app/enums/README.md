# Enums

Esta carpeta contiene las enumeraciones TypeScript que definen conjuntos de valores constantes utilizados en ShikenShop.

## Enums Principales:

### User & Authentication
- `user-role.enum.ts` - Roles de usuario (Admin, Buyer, Guest)
- `user-status.enum.ts` - Estados de usuario (Active, Inactive, Banned)
- `auth-provider.enum.ts` - Proveedores de autenticación (Local, Google, Facebook)

### Product & Catalog
- `game-genre.enum.ts` - Géneros de videojuegos (Action, RPG, Strategy, Adventure)
- `game-platform.enum.ts` - Plataformas (PC, PlayStation, Xbox, Nintendo, Mobile)
- `product-status.enum.ts` - Estados de producto (Active, Inactive, Discontinued)
- `age-rating.enum.ts` - Clasificaciones por edad (E, T, M, RP)

### Commerce & Orders
- `order-status.enum.ts` - Estados de orden (Pending, Processing, Shipped, Delivered, Cancelled)
- `payment-status.enum.ts` - Estados de pago (Pending, Paid, Failed, Refunded)
- `payment-method.enum.ts` - Métodos de pago (CreditCard, PayPal, BankTransfer)
- `shipping-method.enum.ts` - Métodos de envío (Standard, Express, Digital)

### System & UI
- `notification-type.enum.ts` - Tipos de notificación (Success, Error, Warning, Info)
- `loading-state.enum.ts` - Estados de carga (Idle, Loading, Success, Error)
- `sort-direction.enum.ts` - Direcciones de ordenamiento (ASC, DESC)
- `theme-mode.enum.ts` - Modos de tema (Light, Dark, Auto)

### Validation & Errors
- `error-code.enum.ts` - Códigos de error de la aplicación
- `validation-type.enum.ts` - Tipos de validación (Required, Email, MinLength, etc.)
- `http-status.enum.ts` - Códigos de estado HTTP personalizados

## Convenciones:
- Sufijo `.enum.ts` para archivos
- PascalCase para nombres de enum
- PascalCase para valores del enum
- Usar valores string cuando sean legibles
- Usar valores numéricos cuando el orden importe
- Documentar enums complejos con comentarios

## Ejemplos:
```typescript
// String Enum - Más legible en debugging
export enum UserRole {
  ADMIN = 'admin',
  BUYER = 'buyer',
  GUEST = 'guest'
}

// Numeric Enum - Cuando el orden importa
export enum OrderStatus {
  PENDING = 0,
  PROCESSING = 1,
  SHIPPED = 2,
  DELIVERED = 3,
  CANCELLED = 4
}

// Enum con métodos helper
export enum GameGenre {
  ACTION = 'action',
  RPG = 'rpg',
  STRATEGY = 'strategy',
  ADVENTURE = 'adventure'
}

export namespace GameGenre {
  export function getDisplayName(genre: GameGenre): string {
    switch (genre) {
      case GameGenre.ACTION: return 'Acción';
      case GameGenre.RPG: return 'RPG';
      case GameGenre.STRATEGY: return 'Estrategia';
      case GameGenre.ADVENTURE: return 'Aventura';
      default: return 'Desconocido';
    }
  }
}
```