# Pipes

Esta carpeta contiene pipes personalizados de Angular para transformación de datos en templates.

## Pipes Principales:

### Formatting Pipes
- `currency-format.pipe.ts` - Formateo de precios y moneda
- `date-format.pipe.ts` - Formateo de fechas personalizado
- `text-truncate.pipe.ts` - Truncar texto con puntos suspensivos
- `capitalize.pipe.ts` - Capitalizar primera letra

### Game-specific Pipes
- `genre-format.pipe.ts` - Formatear géneros de juegos
- `platform-format.pipe.ts` - Formatear plataformas de juegos
- `rating-stars.pipe.ts` - Convertir rating numérico a estrellas
- `difficulty-level.pipe.ts` - Mostrar nivel de dificultad

### Utility Pipes
- `safe-html.pipe.ts` - Sanitizar HTML para mostrar contenido seguro
- `search-highlight.pipe.ts` - Resaltar términos de búsqueda
- `file-size.pipe.ts` - Formatear tamaños de archivo
- `time-ago.pipe.ts` - Mostrar tiempo relativo ("hace 2 horas")

### Array/Object Pipes
- `filter.pipe.ts` - Filtrar arrays dinámicamente
- `sort.pipe.ts` - Ordenar arrays por propiedad
- `group-by.pipe.ts` - Agrupar elementos por propiedad
- `unique.pipe.ts` - Eliminar duplicados de arrays

## Convenciones:
- Sufijo `.pipe.ts` para archivos
- Implementar PipeTransform interface
- Usar @Pipe decorator con nombre único
- Manejar casos de valores null/undefined
- Hacer pipes pure cuando sea posible para mejor performance

## Ejemplo:
```typescript
@Pipe({
  name: 'currencyFormat',
  pure: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD'): string {
    if (!value) return '0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  }
}
```