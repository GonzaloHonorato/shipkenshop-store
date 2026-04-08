# Instrucciones para Resetear Datos

## Productos con Reseñas e Imágenes Múltiples

Los siguientes productos tienen reseñas y galería de imágenes configuradas:

1. **accion-1** - Cyberpunk Fury (3 reseñas, 4 imágenes)
2. **accion-2** - Warzone Elite (1 reseña, 3 imágenes)
3. **rpg-1** - Dragon's Quest Legends (2 reseñas, 4 imágenes)
4. **aventura-2** - Uncharted Odyssey (3 reseñas, 4 imágenes)
5. **estrategia-1** - Civilization Empire (2 reseñas, 4 imágenes)

## Cómo ver las reseñas

### Método 1: Usar la función de reset integrada (MÁS FÁCIL Y RECOMENDADO) ⭐

1. Abre la aplicación en el navegador
2. Abre las herramientas de desarrollador (F12 o Ctrl+Shift+I)
3. Ve a la pestaña "Console"
4. Ejecuta el siguiente comando:

```javascript
resetShikenData()
```

¡Eso es todo! La aplicación limpiará los datos y se recargará automáticamente con los datos frescos desde el JSON.

### Método 2: Limpiar localStorage manualmente

Si prefieres hacerlo manualmente:

```javascript
localStorage.clear();
location.reload();
```

### Método 3: Limpiar desde Application/Storage

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Application" (Chrome) o "Storage" (Firefox)
3. En el panel izquierdo, busca "Local Storage"
4. Haz clic derecho en el dominio y selecciona "Clear"
5. Recarga la página (F5 o Ctrl+R)

### Método 4: Modo incógnito

1. Abre la aplicación en una ventana de incógnito/privada
2. Los datos se cargarán frescos desde los archivos JSON

## Verificar que las reseñas se cargaron

Después de resetear los datos:

1. Ve a cualquier categoría (Acción, RPG, Estrategia, Aventura)
2. Haz clic en "Ver" o en la imagen de uno de los productos mencionados arriba
3. Desplázate hacia abajo hasta la sección "Reseñas de Usuarios"
4. Deberías ver las reseñas con:
   - Nombre del usuario
   - Calificación por estrellas
   - Comentario
   - Fecha de publicación
   - Contador de "útil"

## Debug

Si aún no ves las reseñas, abre la consola y busca estos logs:

```
📦 [PRODUCT-DETAIL] Producto cargado: [nombre del producto]
📝 [PRODUCT-DETAIL] Reseñas: [array de reseñas]
🖼️ [PRODUCT-DETAIL] Imágenes: [array de imágenes]
```

Si `Reseñas: undefined` o `Reseñas: []`, entonces el problema está en la carga de datos desde localStorage.

## Solución Definitiva

Ejecuta en la consola del navegador:

```javascript
// Limpiar todo el localStorage
Object.keys(localStorage).forEach(key => localStorage.removeItem(key));

// Recargar la página
window.location.reload();
```

Esto forzará la aplicación a cargar los datos frescos desde `/public/data/products.json`.
