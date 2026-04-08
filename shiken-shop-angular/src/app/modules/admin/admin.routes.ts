import { Routes } from '@angular/router';
import { AdminGuard } from '../../guards';
import { AdminResolverFn } from './admin.resolver'; 

export const adminRoutes: Routes = [
  {
    path: '',
    canActivate: [AdminGuard],
    resolve: {
      adminData: AdminResolverFn
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../../pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Dashboard Administrativo - ShikenShop',
        data: { 
          breadcrumb: 'Dashboard',
          preload: true,
          permissions: ['admin.dashboard.view']
        }
      },
      {
        path: 'productos',
        loadComponent: () => import('../../pages/admin-products/admin-products.component').then(m => m.AdminProductsComponent),
        title: 'Gestión de Productos - ShikenShop',
        data: { 
          breadcrumb: 'Productos',
          permissions: ['admin.products.view', 'admin.products.manage']
        }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('../../pages/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
        title: 'Gestión de Usuarios - ShikenShop',
        data: { 
          breadcrumb: 'Usuarios',
          permissions: ['admin.users.view', 'admin.users.manage']
        }
      },
      {
        path: 'ventas',
        loadComponent: () => import('../../pages/admin-sales/admin-sales.component').then(m => m.AdminSalesComponent),
        title: 'Gestión de Ventas - ShikenShop',
        data: { 
          breadcrumb: 'Ventas',
          permissions: ['admin.sales.view', 'admin.sales.reports']
        }
      },
      {
        path: 'configuracion',
        loadComponent: () => import('../../pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), // Temporal
        title: 'Configuración del Sistema - ShikenShop',
        data: { 
          breadcrumb: 'Configuración',
          permissions: ['admin.settings.manage']
        }
      }
    ]
  }
];