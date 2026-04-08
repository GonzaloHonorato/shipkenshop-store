import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil, fromEvent } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { DataService } from '../../../services/data.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-opacity-90 bg-gray-900 backdrop-blur-sm fixed w-full top-0 z-50 shadow-lg border-b-2 border-purple-500">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          
          <!-- Logo -->
          <a routerLink="/home" class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 logo-animation">
            ShikenShop
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex space-x-6 items-center">
            <!-- Main Navigation Links -->
            <a routerLink="/home" routerLinkActive="text-purple-400" [routerLinkActiveOptions]="{exact: true}" 
               class="text-white hover:text-purple-400 transition-colors duration-300">
              Inicio
            </a>
            <div class="relative group">
              <button class="text-white hover:text-purple-400 transition-colors duration-300 flex items-center space-x-1">
                <span>Categorías</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <!-- Categories Dropdown -->
              <div class="absolute left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <a routerLink="/accion" class="block px-4 py-2 text-white hover:bg-purple-600 rounded-t-lg transition-colors duration-300">
                  🔥 Acción
                </a>
                <a routerLink="/rpg" class="block px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-300">
                  ⚔️ RPG
                </a>
                <a routerLink="/estrategia" class="block px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-300">
                  🧠 Estrategia
                </a>
                <a routerLink="/aventura" class="block px-4 py-2 text-white hover:bg-purple-600 rounded-b-lg transition-colors duration-300">
                  🗺️ Aventura
                </a>
              </div>
            </div>
            <a href="#contacto" class="text-white hover:text-purple-400 transition-colors duration-300">
              Contacto
            </a>

            <!-- Guest Menu (No autenticado) -->
            @if (!isAuthenticated()) {
              <div class="flex space-x-4 items-center">
                <a routerLink="/login" class="text-white hover:text-purple-400 transition-colors duration-300">
                  Iniciar Sesión
                </a>
                <a routerLink="/register" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                  Registrarse
                </a>
              </div>
            }

            <!-- User Menu (Autenticado) -->
            @if (isAuthenticated()) {
              <div class="flex space-x-4 items-center">
                
                <!-- Carrito -->
                <a routerLink="/cart" class="text-white hover:text-purple-400 transition-colors duration-300 relative">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  @if (cartCount() > 0) {
                    <span class="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {{ cartCount() }}
                    </span>
                  }
                </a>

                <!-- User Profile Dropdown -->
                <div class="relative group">
                  <button class="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors duration-300">
                    <div class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {{ userInitial() }}
                    </div>
                    <span class="text-sm font-medium hidden lg:inline">{{ userName() }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  <!-- User Dropdown Menu -->
                  <div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-purple-500/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <a [routerLink]="dashboardRoute()" class="block px-4 py-2 text-white hover:bg-purple-600 rounded-t-lg transition-colors duration-300">
                      📊 Mi Panel
                    </a>
                    <a routerLink="/mi-cuenta" class="block px-4 py-2 text-white hover:bg-purple-600 transition-colors duration-300">
                      👤 Mi Cuenta
                    </a>
                    <button (click)="handleLogout()" class="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white rounded-b-lg transition-colors duration-300">
                      🚪 Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Mobile Menu Button -->
          <button (click)="toggleMobileMenu()" class="md:hidden text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Menu -->
        @if (isMobileMenuOpen()) {
          <div class="md:hidden mt-4 pb-4 border-t border-purple-500/20">
            <div class="flex flex-col space-y-2 pt-4">
              <a routerLink="/home" (click)="closeMobileMenu()" class="text-white hover:text-purple-400 transition-colors duration-300 py-2">
                Inicio
              </a>
              
              <!-- Mobile Categories -->
              <div class="py-2">
                <span class="text-purple-400 font-semibold">Categorías</span>
                <div class="ml-4 mt-2 space-y-1">
                  <a routerLink="/accion" (click)="closeMobileMenu()" class="block text-white hover:text-purple-400 transition-colors duration-300 py-1">
                    🔥 Acción
                  </a>
                  <a routerLink="/rpg" (click)="closeMobileMenu()" class="block text-white hover:text-purple-400 transition-colors duration-300 py-1">
                    ⚔️ RPG
                  </a>
                  <a routerLink="/estrategia" (click)="closeMobileMenu()" class="block text-white hover:text-purple-400 transition-colors duration-300 py-1">
                    🧠 Estrategia
                  </a>
                  <a routerLink="/aventura" (click)="closeMobileMenu()" class="block text-white hover:text-purple-400 transition-colors duration-300 py-1">
                    🗺️ Aventura
                  </a>
                </div>
              </div>

              @if (!isAuthenticated()) {
                <a routerLink="/login" (click)="closeMobileMenu()" class="text-white hover:text-purple-400 transition-colors duration-300 py-2">
                  Iniciar Sesión
                </a>
                <a routerLink="/register" (click)="closeMobileMenu()" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-center">
                  Registrarse
                </a>
              } @else {
                <a routerLink="/cart" (click)="closeMobileMenu()" class="text-white hover:text-purple-400 transition-colors duration-300 py-2 flex items-center">
                  🛒 Carrito
                  @if (cartCount() > 0) {
                    <span class="ml-2 bg-pink-600 text-white text-xs rounded-full px-2 py-1">
                      {{ cartCount() }}
                    </span>
                  }
                </a>
                <a [routerLink]="dashboardRoute()" (click)="closeMobileMenu()" class="text-white hover:text-purple-400 transition-colors duration-300 py-2">
                  📊 Mi Panel
                </a>
                <a routerLink="/mi-cuenta" (click)="closeMobileMenu()" class="text-white hover:text-purple-400 transition-colors duration-300 py-2">
                  👤 Mi Cuenta
                </a>
                <button (click)="handleLogout()" class="text-left text-red-400 hover:text-red-300 transition-colors duration-300 py-2">
                  🚪 Cerrar Sesión
                </button>
              }
            </div>
          </div>
        }
      </nav>
    </header>
  `,
  styles: [`
    .logo-animation {
      animation: logoGlow 3s ease-in-out infinite alternate;
    }

    @keyframes logoGlow {
      0% {
        filter: drop-shadow(0 0 5px rgba(168, 85, 247, 0.4));
      }
      100% {
        filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.8));
      }
    }

    /* Smooth dropdown transitions */
    .group:hover .group-hover\\:opacity-100 {
      animation: fadeInUp 0.3s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  // Signals para el estado del componente
  private mobileMenuOpen = signal(false);

  // Usar los signals del AuthService y DataService directamente para reactividad completa
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());
  userName = computed(() => {
    const user = this.currentUser();
    return user?.name || user?.email?.split('@')[0] || 'Usuario';
  });
  userInitial = computed(() => this.userName().charAt(0).toUpperCase());
  cartCount = computed(() => this.dataService.cartCount());
  dashboardRoute = computed(() => {
    const user = this.currentUser();
    return user?.role === 'admin' ? '/admin/dashboard' : '/buyer/dashboard';
  });
  isMobileMenuOpen = computed(() => this.mobileMenuOpen());

  ngOnInit() {
    console.log('🚀 [HEADER] Inicializando header...');
    
    // Log inicial del estado de autenticación
    console.log('🔐 [HEADER] Estado inicial de autenticación:', {
      isAuthenticated: this.isAuthenticated(),
      currentUser: this.currentUser()
    });

    // Monitorear cambios en el estado de autenticación
    let previousAuth = this.isAuthenticated();
    let previousUser = this.currentUser();
    
    setInterval(() => {
      const currentAuth = this.isAuthenticated();
      const currentUserData = this.currentUser();
      
      if (currentAuth !== previousAuth || currentUserData !== previousUser) {
        console.log('🔄 [HEADER] Cambio detectado en autenticación:', {
          wasAuth: previousAuth,
          isAuth: currentAuth,
          previousUser: previousUser?.name,
          currentUser: currentUserData?.name
        });
        
        previousAuth = currentAuth;
        previousUser = currentUserData;
      }
    }, 500); // Cada 500ms para detectar cambios rápidos
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cart data is now handled by DataService

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  handleLogout() {
    const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
    
    if (confirmLogout) {
      console.log('🚪 [HEADER] Usuario confirmó logout');
      
      // Usar el AuthService para hacer logout
      this.authService.logout();
      this.closeMobileMenu();
      
      // Mostrar notificación
      this.notificationService.success('Sesión cerrada correctamente');
      console.log('✅ [HEADER] Logout completado, redirigiendo a home');
      
      // Redirigir a home
      this.router.navigate(['/home']);
    }
  }
}