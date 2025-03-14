/**
 * Tests unitarios para las funciones de utilidad
 * Testing para memoize y throttle
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { memoize, throttle } from '../../../core/utils/functional';

describe('Funciones de utilidad', () => {
  describe('memoize', () => {
    it('debería devolver el mismo resultado para los mismos parámetros', () => {
      // Función de prueba con un cálculo costoso
      const sumaCostosa = vi.fn((a: number, b: number) => a + b);
      const sumaMemoizada = memoize(sumaCostosa);
      
      // Primera llamada debería calcular el resultado
      expect(sumaMemoizada(5, 3)).toBe(8);
      expect(sumaCostosa).toHaveBeenCalledTimes(1);
      
      // Segunda llamada con los mismos parámetros debería usar el resultado en caché
      expect(sumaMemoizada(5, 3)).toBe(8);
      expect(sumaCostosa).toHaveBeenCalledTimes(1); // No se llama nuevamente
      
      // Llamada con diferentes parámetros debería calcular un nuevo resultado
      expect(sumaMemoizada(2, 4)).toBe(6);
      expect(sumaCostosa).toHaveBeenCalledTimes(2);
    });
    
    it('debería manejar correctamente objetos como parámetros', () => {
      // Función que toma objetos como parámetros
      const procesarObjeto = vi.fn((obj: { id: number; value: string }) => `${obj.id}-${obj.value}`);
      const procesarObjetoMemoizado = memoize(procesarObjeto);
      
      const obj1 = { id: 1, value: 'test' };
      const obj1Clone = { id: 1, value: 'test' }; // Mismo contenido pero diferente referencia
      
      // Primera llamada debería calcular el resultado
      expect(procesarObjetoMemoizado(obj1)).toBe('1-test');
      expect(procesarObjeto).toHaveBeenCalledTimes(1);
      
      // Llamada con objeto equivalente debería usar el resultado en caché
      expect(procesarObjetoMemoizado(obj1Clone)).toBe('1-test');
      expect(procesarObjeto).toHaveBeenCalledTimes(1); // No se llama nuevamente
      
      // Llamada con objeto diferente debería calcular un nuevo resultado
      expect(procesarObjetoMemoizado({ id: 2, value: 'test' })).toBe('2-test');
      expect(procesarObjeto).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('throttle', () => {
    it('debería ejecutar la función inmediatamente la primera vez', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);
      
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);
    });
    
    it('debería ignorar llamadas dentro del límite de tiempo', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);
      
      // Llamadas dentro del límite de tiempo deberían ser ignoradas
      throttledFn();
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1); // Sigue siendo 1
      
      vi.restoreAllMocks();
    });
    
    it('debería ejecutar la función después del límite de tiempo', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);
      
      // Primera llamada
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(1);
      
      // Simulamos que ha pasado el tiempo
      vi.restoreAllMocks();
      vi.spyOn(Date, 'now').mockReturnValue(now + 150);
      
      // Ahora debería ejecutarse nuevamente
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
      
      vi.restoreAllMocks();
    });
    
    it('debería mantener el contexto y los argumentos correctos', () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      fn.mockReturnValue(8);
      const throttledFn = throttle(fn, 100);
      
      expect(throttledFn(5, 3)).toBe(8);
      expect(fn).toHaveBeenCalledWith(5, 3);
      
      // Simulamos que ha pasado el tiempo
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now + 150);
      
      // Actualizar el mock para que devuelva 6 para los nuevos argumentos
      fn.mockReturnValue(6);
      
      expect(throttledFn(2, 4)).toBe(6);
      expect(fn).toHaveBeenCalledWith(2, 4);
      
      vi.restoreAllMocks();
    });
  });
});
