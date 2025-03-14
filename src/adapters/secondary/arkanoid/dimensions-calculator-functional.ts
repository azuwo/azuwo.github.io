/**
 * Implementación funcional del calculador de dimensiones para Arkanoid
 * Optimizado con memoización para mejorar el rendimiento
 */

import type { DimensionsCalculator } from '../../../core/ports/out/arkanoid-ports';
import { memoize } from '../../../core/utils/functional';

/**
 * Factory function para crear un calculador de dimensiones
 * que determina el tamaño del canvas y los ladrillos según el dispositivo
 */
export function createDimensionsCalculator(
  _canvas: HTMLCanvasElement,
  container: HTMLElement,
): DimensionsCalculator {
  // Uso de memoización para evitar recálculos innecesarios
  // cuando las dimensiones no han cambiado
  const getContainerDimensions = memoize(() => {
    return {
      width: container.clientWidth,
      height: container.clientHeight,
    };
  });

  // Calcular dimensiones del canvas de manera óptima
  const calculateCanvasDimensions = () => {
    const { width: containerWidth } = getContainerDimensions();

    // Determinar ancho máximo (responsive)
    const maxWidth = 480;
    const scaledWidth = Math.min(containerWidth, maxWidth);

    // Mantener proporción aspecto (4:3 o similar)
    const aspectRatio = 4 / 3;
    const scaledHeight = scaledWidth * aspectRatio;

    return {
      width: scaledWidth,
      height: scaledHeight,
    };
  };

  // Memoizar el cálculo de dimensiones de los ladrillos
  // para evitar recálculos cuando el ancho no cambia
  const calculateBrickDimensionsInternal = memoize((canvasWidth: number) => {
    // Calcular el número de columnas basado en el ancho del canvas
    // para mantener una densidad similar de ladrillos en diferentes dispositivos
    let brickColumnCount = Math.floor(canvasWidth / 60);

    // Asegurar un mínimo y máximo de columnas
    brickColumnCount = Math.max(3, Math.min(10, brickColumnCount));

    // Calcular el ancho del ladrillo según el número de columnas
    // teniendo en cuenta el padding entre ladrillos (10px)
    const availableWidth = canvasWidth - 30; // 15px de margen a cada lado
    const brickWidth = Math.floor(
      (availableWidth - (brickColumnCount - 1) * 10) / brickColumnCount,
    );

    // Calcular el offset izquierdo para centrar los ladrillos
    const brickOffsetLeft = 15;

    return {
      brickColumnCount,
      brickWidth,
      brickOffsetLeft,
    };
  });

  return {
    calculateCanvasDimensions,
    calculateBrickDimensions: (canvasWidth: number) => {
      return calculateBrickDimensionsInternal(canvasWidth);
    },
  };
}
