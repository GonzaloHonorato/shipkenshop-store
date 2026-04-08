import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-white mb-4">404</h1>
        <h2 class="text-2xl text-purple-400 mb-6">Página no encontrada</h2>
        <p class="text-gray-300 mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <a 
          routerLink="/home" 
          class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  `,
  styles: []
})
export class NotFoundComponent {

}