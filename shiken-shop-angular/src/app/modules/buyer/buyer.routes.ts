import { Routes } from '@angular/router';
import { BuyerGuard } from '../../guards';
import { BuyerResolverFn } from './buyer.resolver';

export const buyerRoutes: Routes = [
  {
    path: '',
    canActivate: [BuyerGuard],
    resolve: {
      buyerData: BuyerResolverFn
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../../pages/buyer-dashboard/buyer-dashboard.component').then(m => m.BuyerDashboardComponent),
        title: 'Mi Dashboard - ShikenShop',
        data: { 
          breadcrumb: 'Dashboard',
          preload: true,
          permissions: ['buyer.dashboard.view']
        }
      },
      {
        path: 'mis-compras',
        loadComponent: () => import('../../pages/buyer-purchases/buyer-purchases.component').then(m => m.BuyerPurchasesComponent),
        title: 'Mis Compras - ShikenShop',
        data: { 
          breadcrumb: 'Mis Compras',
          permissions: ['buyer.purchases.view']
        }
      },
      {
        path: 'favoritos',
        loadComponent: () => import('../../pages/buyer-dashboard/buyer-dashboard.component').then(m => m.BuyerDashboardComponent), // Temporal
        title: 'Mis Favoritos - ShikenShop',
        data: { 
          breadcrumb: 'Favoritos',
          permissions: ['buyer.favorites.view']
        }
      },
      {
        path: 'perfil',
        loadComponent: () => import('../../pages/my-account/my-account.component').then(m => m.MyAccountComponent), // Temporal
        title: 'Mi Perfil - ShikenShop',
        data: { 
          breadcrumb: 'Perfil',
          permissions: ['buyer.profile.edit']
        }
      }
    ]
  }
];