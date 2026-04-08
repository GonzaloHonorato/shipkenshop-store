# Directives

Esta carpeta contiene directivas personalizadas de Angular para comportamientos reutilizables en elementos DOM.

## Directivas Principales:

### UI Enhancement Directives
- `click-outside.directive.ts` - Detectar clics fuera de un elemento
- `auto-focus.directive.ts` - Enfocar automáticamente elementos
- `scroll-spy.directive.ts` - Detectar scroll y posición en viewport
- `lazy-load.directive.ts` - Carga lazy de imágenes
- `tooltip.directive.ts` - Mostrar tooltips personalizados

### Form Enhancement Directives
- `form-validation.directive.ts` - Validaciones personalizadas de formularios
- `input-mask.directive.ts` - Máscaras para inputs (teléfono, tarjeta, etc.)
- `auto-complete.directive.ts` - Autocompletado en campos de texto
- `character-counter.directive.ts` - Contador de caracteres en inputs

### Shopping Specific Directives
- `add-to-cart.directive.ts` - Funcionalidad agregar al carrito
- `wishlist-toggle.directive.ts` - Toggle para lista de deseos
- `price-tracker.directive.ts` - Seguimiento de cambios de precio
- `quantity-selector.directive.ts` - Selector de cantidad mejorado

### Accessibility Directives
- `aria-expanded.directive.ts` - Manejo de aria-expanded automático
- `keyboard-navigation.directive.ts` - Navegación por teclado
- `focus-trap.directive.ts` - Trap de foco para modales
- `screen-reader.directive.ts` - Mejoras para lectores de pantalla

### Animation Directives
- `fade-in.directive.ts` - Animación de entrada con fade
- `slide-in.directive.ts` - Animación de deslizamiento
- `zoom-on-hover.directive.ts` - Efecto zoom al hacer hover
- `parallax.directive.ts` - Efecto parallax en scroll

## Tipos de Directivas:
- **Structural**: Modifican la estructura del DOM (*ngIf, *ngFor style)
- **Attribute**: Modifican comportamiento/apariencia de elementos existentes

## Convenciones:
- Sufijo `.directive.ts` para archivos
- Usar selector de atributo `[directiveName]`
- Implementar OnInit, OnDestroy cuando sea necesario
- Usar @HostListener para eventos del DOM
- Usar @HostBinding para propiedades del host
- Limpiar event listeners en OnDestroy

## Ejemplo:
```typescript
@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.clickOutside.emit();
    }
  }
}
```