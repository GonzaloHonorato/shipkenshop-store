import { Component } from '@angular/core';
import { CategoryBaseComponent, CategoryConfig } from '../category-base.component';
import { ProductCategoryEnum } from '../../../models';

@Component({
  selector: 'app-rpg',
  standalone: true,
  imports: [CategoryBaseComponent],
  template: `
    <app-category-base [config]="categoryConfig"></app-category-base>
  `
})
export class RpgComponent {
  categoryConfig: CategoryConfig = {
    category: ProductCategoryEnum.RPG,
    title: 'Juegos de RPG',
    description: 'Sumérgete en mundos épicos donde tú eres el héroe de la historia',
    icon: `<svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`,
    gradientFrom: 'purple',
    gradientTo: 'indigo',
    borderColor: 'purple-500',
    accentColor: 'purple-400'
  };
}