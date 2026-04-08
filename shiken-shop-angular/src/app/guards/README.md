# Guards

Esta carpeta contiene los guards (guardas de ruta) de la aplicación Angular que protegen el acceso a rutas específicas basándose en la autenticación y autorización del usuario.

## Guards Disponibles:

### AuthGuard
- Protege rutas que requieren autenticación
- Redirige a login si no hay sesión activa
- Preserva URL de destino para después del login

### AdminGuard  
- Protege rutas del panel administrativo
- Solo permite acceso a usuarios con rol 'admin'
- Redirige según el rol del usuario actual

### BuyerGuard
- Protege rutas del panel de comprador
- Solo permite acceso a usuarios con rol 'buyer'
- Redirige según el rol del usuario actual

### GuestGuard
- Protege rutas de invitado (login, registro)
- Redirige a dashboard si ya está autenticado
- Evita acceso a login cuando ya hay sesión

### RoleGuard
- Guard flexible que acepta múltiples roles
- Configuración por ruta con data: { roles: [...] }
- Manejo dinámico de permisos

## Uso en Rutas:

```typescript
// En app.routes.ts
{ 
  path: 'admin', 
  canActivate: [AdminGuard], 
  loadChildren: () => import('./admin/admin.routes') 
},
{ 
  path: 'login', 
  canActivate: [GuestGuard], 
  component: LoginComponent 
},
{ 
  path: 'mi-cuenta', 
  canActivate: [RoleGuard], 
  data: { roles: [UserRole.ADMIN, UserRole.BUYER] },
  component: AccountComponent 
}
```