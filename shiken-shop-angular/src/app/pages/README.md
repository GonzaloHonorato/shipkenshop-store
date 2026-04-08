# Pages

Esta carpeta contiene los componentes de página principales de ShikenShop, organizados por funcionalidad y rutas.

## Estructura de Páginas:

### Public Pages
- `home/` - Página principal con hero y catálogo
- `login/` - Página de inicio de sesión
- `register/` - Página de registro
- `categories/` - Páginas de categorías (acción, rpg, etc.)
- `product-detail/` - Página de detalle de producto
- `cart/` - Página del carrito de compras
- `checkout/` - Página de proceso de compra

### Protected Pages
- `my-account/` - Página de perfil del usuario
- `order-history/` - Historial de órdenes

### Admin Pages
- `admin-dashboard/` - Dashboard principal del administrador
- `admin-products/` - Gestión de productos
- `admin-users/` - Gestión de usuarios
- `admin-orders/` - Gestión de órdenes

### Buyer Pages
- `buyer-dashboard/` - Dashboard del comprador
- `my-purchases/` - Mis compras y descargas

### Error Pages
- `not-found/` - Página 404
- `unauthorized/` - Página 403
- `error/` - Página de error general

## Convenciones:
- Cada página es un componente standalone
- Usar kebab-case para nombres de carpetas
- Incluir routing module cuando sea necesario
- Implementar lazy loading para páginas complejas
- Seguir patrón container/presentational cuando aplique

## Mapeo de Rutas Original:
```
/ → home/
/login → login/
/registro → register/
/accion → categories/action/
/rpg → categories/rpg/
/estrategia → categories/strategy/
/aventura → categories/adventure/
/carrito → cart/
/admin → admin-dashboard/
/buyer → buyer-dashboard/
```