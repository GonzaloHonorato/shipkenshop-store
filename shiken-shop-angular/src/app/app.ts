import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { NotificationComponent } from './components/layout/notification/notification.component';
import { DataService } from './services/data.service';

// Declaración global para TypeScript
declare global {
  interface Window {
    shikenDataService: DataService;
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('shiken-shop-angular');
  private dataService = inject(DataService);

  constructor() {
    // Exponer métodos útiles en la consola para desarrollo
    if (typeof window !== 'undefined') {
      window.shikenDataService = this.dataService;

      console.log('🎮 ShikenShop Debug Tools:');
      console.log('  - shikenDataService: Acceso directo al servicio de datos');
      console.log('  - Los datos ahora se gestionan desde el backend API');
    }
  }
}
