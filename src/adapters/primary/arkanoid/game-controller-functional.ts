/**
 * Adaptador primario para el juego Arkanoid
 * Conecta la interfaz de usuario con el núcleo de la aplicación
 * siguiendo principios de arquitectura hexagonal y programación funcional
 */

import { createArkanoidService } from '../../../core/application/services/arkanoid-service-functional';
import type { GameUseCases } from '../../../core/ports/in/arkanoid-use-cases-functional';
import { createCanvasRenderer } from '../../secondary/arkanoid/canvas-renderer-functional';
import { createCollisionDetector } from '../../secondary/arkanoid/collision-detector-functional';
import { createDimensionsCalculator } from '../../secondary/arkanoid/dimensions-calculator-functional';
import { createEventHandler } from '../../secondary/arkanoid/event-handler-functional';

/**
 * Factory function para crear un controlador del juego Arkanoid
 * Este adaptador primario conecta la interfaz de usuario con el dominio
 */
export function createArkanoidGameController(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  leftButton?: HTMLElement,
  rightButton?: HTMLElement,
): GameUseCases {
  // Obtener el contexto del canvas
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('No se pudo obtener el contexto 2D del canvas');
  }

  // Crear los adaptadores secundarios (implements ports)
  const renderer = createCanvasRenderer(canvas, context);
  const collisionDetector = createCollisionDetector();
  const dimensionsCalculator = createDimensionsCalculator(canvas, container);
  const eventHandler = createEventHandler(canvas, leftButton, rightButton);

  // Crear e inicializar el servicio de juego
  const gameService = createArkanoidService({
    renderer,
    collisionDetector,
    dimensionsCalculator,
    eventHandler,
  });

  return gameService;
}
