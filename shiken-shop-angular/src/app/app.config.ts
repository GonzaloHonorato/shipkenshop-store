import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, withRouterConfig, PreloadAllModules } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // HttpClient para peticiones al backend
    provideHttpClient(withFetch()),
    
    // Router con estrategia de preloading básica
    provideRouter(
      routes,
      // Usar estrategia de preloading estándar por ahora
      withPreloading(PreloadAllModules),
      
      // Configuración básica del router
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    ),
    
    // Animaciones asíncronas para mejor performance
    provideAnimationsAsync()
  ]
};
