import { Component } from '@angular/core';
import { CategoryBaseComponent, CategoryConfig } from '../category-base.component';
import { ProductCategoryEnum } from '../../../models';

@Component({
  selector: 'app-estrategia',
  standalone: true,
  imports: [CategoryBaseComponent],
  template: `
    <app-category-base [config]="categoryConfig"></app-category-base>
  `
})
export class EstrategiaComponent {
  categoryConfig: CategoryConfig = {
    category: ProductCategoryEnum.ESTRATEGIA,
    title: 'Juegos de Estrategia',
    description: 'Pon a prueba tu mente con desafíos tácticos y estratégicos',
    icon: `<svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 11H7v9a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-3V5a2 2 0 00-2-2H9a2 2 0 00-2 2v6z"/>
      <path d="M9 7h3v2H9V7z"/>
    </svg>`,
    gradientFrom: 'blue',
    gradientTo: 'indigo',
    borderColor: 'blue-500',
    accentColor: 'green-400'
  };
}