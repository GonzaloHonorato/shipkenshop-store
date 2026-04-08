import { Component } from '@angular/core';
import { CategoryBaseComponent, CategoryConfig } from '../category-base.component';
import { ProductCategoryEnum } from '../../../models';

@Component({
  selector: 'app-aventura',
  standalone: true,
  imports: [CategoryBaseComponent],
  template: `
    <app-category-base [config]="categoryConfig"></app-category-base>
  `
})
export class AventuraComponent {
  categoryConfig: CategoryConfig = {
    category: ProductCategoryEnum.AVENTURA,
    title: 'Juegos de Aventura',
    description: 'Explora mundos fascinantes llenos de misterios y descubrimientos',
    icon: `<svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`,
    gradientFrom: 'green',
    gradientTo: 'emerald',
    borderColor: 'green-500',
    accentColor: 'amber-400'
  };
}