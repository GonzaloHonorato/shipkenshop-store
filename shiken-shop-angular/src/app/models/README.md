# Models

Esta carpeta contiene las clases modelo que representan las entidades del dominio de ShikenShop.

## Modelos Principales:

### Core Models
- `user.model.ts` - Modelo de usuario (Admin, Buyer)
- `product.model.ts` - Modelo de producto con propiedades completas
- `category.model.ts` - Modelo de categoría de juegos
- `cart-item.model.ts` - Ítem del carrito con cantidad y precio
- `order.model.ts` - Modelo de orden de compra

### Authentication Models
- `login-request.model.ts` - Datos de solicitud de login
- `auth-response.model.ts` - Respuesta de autenticación
- `user-session.model.ts` - Información de sesión del usuario

### Commerce Models
- `checkout.model.ts` - Datos del proceso de compra
- `payment-info.model.ts` - Información de pago
- `shipping-info.model.ts` - Información de envío

## Características:
- Clases TypeScript con tipado fuerte
- Constructores con parámetros opcionales
- Métodos de validación cuando sea necesario
- Métodos de serialización/deserialización para localStorage
- Implementación de interfaces cuando corresponda

## Convención:
- Sufijo `.model.ts` para archivos de modelos
- PascalCase para nombres de clases
- Propiedades public readonly cuando sea apropiado