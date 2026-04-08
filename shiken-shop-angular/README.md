# 🎮 ShikenShop Angular

**Tienda de videojuegos moderna desarrollada en Angular 20 con Tailwind CSS**

ShikenShop es una aplicación de e-commerce especializada en videojuegos, migrada desde HTML/CSS/JavaScript vanilla a Angular con arquitectura moderna, estado reactivo y componentes standalone.

## ✨ Características Principales

- 🎮 **Catálogo de Juegos**: Navegación por categorías (Acción, RPG, Estrategia, Aventura)
- 🛒 **Carrito de Compras**: Sistema completo con gestión de estado reactivo
- 👤 **Autenticación**: Login/Registro con roles de administrador y comprador
- 📱 **Responsive Design**: Diseño adaptativo con Tailwind CSS
- 🔔 **Notificaciones**: Sistema de toast notifications con animaciones
- 🎨 **UI Moderna**: Gradientes, efectos glassmorphism y animaciones suaves

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- Angular CLI 20.3.9+

### Instalación

```bash
# Clonar repositorio
git clone [repo-url]
cd shiken-shop-angular

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: Angular 20.3.9 (Standalone Components)
- **Styling**: Tailwind CSS 3.4.17
- **Estado**: Angular Signals + Services
- **Persistencia**: localStorage
- **Testing**: Jasmine + Karma

### Estructura del Proyecto

```
src/app/
├── components/          # Componentes reutilizables
│   ├── cart/           # Componente carrito
│   └── layout/         # Header, Footer, Notifications
├── pages/              # Páginas principales
│   ├── auth/          # Login, Registro
│   ├── categories/    # Páginas de categorías
│   ├── admin/         # Panel administrativo
│   └── buyer/         # Panel de comprador
├── services/          # Servicios de negocio
│   ├── auth.service.ts
│   ├── data.service.ts
│   └── notification.service.ts
├── models/            # Interfaces TypeScript
├── guards/            # Guards de rutas
└── utils/             # Utilidades
```

## 📋 Estado del Proyecto

### ✅ Completado (Tareas 1-16)
- [x] **Configuración Base**: Tailwind CSS, estructura, routing
- [x] **Componentes Layout**: Header dinámico, Footer, Notificaciones
- [x] **Autenticación**: Login, Registro con validaciones
- [x] **Catálogo**: Páginas de categorías con filtros y carrito
- [x] **Carrito**: Sistema completo con checkout y notificaciones

### 🚧 En Desarrollo (Tareas 17-28)
- [ ] **Forgot Password**: Recuperación de contraseña
- [ ] **Mi Cuenta**: Gestión de perfil y cambio de contraseña
- [ ] **Admin Dashboard**: Panel principal con métricas
- [ ] **Admin Productos**: CRUD completo de productos
- [ ] **Admin Usuarios**: Gestión de usuarios del sistema
- [ ] **Admin Ventas**: Reportes y historial de ventas
- [ ] **Buyer Dashboard**: Panel personal de comprador
- [ ] **Buyer Compras**: Historial de pedidos y seguimiento

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm start              # Servidor de desarrollo (puerto 4200)
npm run build         # Construcción de producción
npm run watch         # Construcción en modo watch
npm test             # Tests unitarios con Karma
npm run lint         # Análisis de código con ESLint

# Análisis
npm run analyze      # Análisis del bundle
npm run build:stats  # Estadísticas de construcción
```

## 🔧 Configuración del Entorno

### Variables de Entorno
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  storagePrefix: 'shiken_'
};
```

### Cuentas de Prueba
```
Admin:
- Email: admin@shikenshop.com
- Password: Admin123

Comprador:
- Email: comprador@test.com  
- Password: Comprador123
```

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
