/**
 * Utilidades funcionales para optimización
 * Enfoque en memoización y throttling
 */

/**
 * Función de memoización que almacena en caché los resultados de funciones
 * para evitar cálculos redundantes
 */
// biome-ignore lint/suspicious/noExplicitAny: Necesario para la función de memoización genérica
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
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
// biome-ignore lint/suspicious/noExplicitAny: Necesario para la función de throttling genérica
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    const now = Date.now();
    const remaining = limit - (now - lastCall);

    // Si ha pasado suficiente tiempo, ejecutar inmediatamente
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      lastCall = now;
      return fn(...args);
    }
    // Programar para más tarde si no hay ya un timeout
    if (!timeoutId) {
      timeoutId = globalThis.setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
        return undefined;
      }, remaining);
    }
  };
}
