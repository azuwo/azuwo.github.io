/**
 * Utilidades funcionales para optimización
 * Enfoque en memoización y throttling
 */

/**
 * Función de memoización que almacena en caché los resultados de funciones
 * para evitar cálculos redundantes
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    // Crear una clave única para los argumentos
    const key = JSON.stringify(args);
    
    // Verificar si el resultado ya está en caché
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    // Calcular el resultado, almacenar en caché y devolver
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Función de throttling para limitar la frecuencia de ejecución
 * de funciones, útil para optimizar bucles de renderizado
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: number | null = null;
  
  return (...args: Parameters<T>): void => {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    
    // Si ha pasado suficiente tiempo, ejecutar inmediatamente
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastCall = now;
      fn(...args);
    } 
    // De lo contrario, programar para más tarde si no hay ya un timeout
    else if (!timeoutId) {
      timeoutId = window.setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}
