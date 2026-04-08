import { Component } from '@angular/core';
import { CategoryBaseComponent, CategoryConfig } from '../category-base.component';
import { ProductCategoryEnum } from '../../../models';

@Component({
  selector: 'app-accion',
  standalone: true,
  imports: [CategoryBaseComponent],
  template: `
    <app-category-base [config]="categoryConfig"></app-category-base>
  `
})
export class AccionComponent {
  categoryConfig: CategoryConfig = {
    category: ProductCategoryEnum.ACCION,
    title: 'Juegos de Acción',
    description: 'Experimenta la adrenalina pura con los juegos de acción más emocionantes',
    icon: `<svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>`,
    gradientFrom: 'red',
    gradientTo: 'orange',
    borderColor: 'red-500',
    accentColor: 'red-400'
  };
}