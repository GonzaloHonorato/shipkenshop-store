# Interfaces

Esta carpeta contiene las interfaces TypeScript que definen contratos y tipos para la aplicación ShikenShop.

## Interfaces Principales:

### Core Interfaces
- `IUser.ts` - Interfaz para usuarios del sistema
- `IProduct.ts` - Interfaz para productos
- `ICategory.ts` - Interfaz para categorías
- `ICartItem.ts` - Interfaz para ítems del carrito
- `IOrder.ts` - Interfaz para órdenes

### Service Interfaces
- `IAuthService.ts` - Contrato para servicios de autenticación
- `IDataService.ts` - Contrato para servicios de datos
- `IStorageService.ts` - Contrato para servicios de almacenamiento

### API Interfaces
- `IApiResponse.ts` - Respuesta estándar de API
- `IErrorResponse.ts` - Respuesta de error
- `IPaginatedResponse.ts` - Respuesta paginada

### Configuration Interfaces
- `IAppConfig.ts` - Configuración de la aplicación
- `IThemeConfig.ts` - Configuración de temas
- `IRouteConfig.ts` - Configuración de rutas

## Convenciones:
- Prefijo `I` para interfaces (IUserInterface)
- Sufijo `.interface.ts` para archivos
- Usar export default cuando sea apropiado
- Documentar propiedades con comentarios JSDoc
- Propiedades opcionales con `?` cuando corresponda

## Ejemplos:
```typescript
export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
}
```