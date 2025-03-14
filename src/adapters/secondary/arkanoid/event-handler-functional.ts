/**
 * Implementación funcional del manejador de eventos para Arkanoid
 * Optimizado para rendimiento con enfoque funcional
 */

import type { EventHandler } from '../../../core/ports/out/arkanoid-ports';

/**
 * Factory function para crear un manejador de eventos
 * que controla las interacciones del usuario con el juego
 */
export function createEventHandler(
  canvas: HTMLCanvasElement,
  leftButton?: HTMLElement,
  rightButton?: HTMLElement,
): EventHandler {
  // Estado interno del manejador de eventos
  const state = {
    rightPressed: false,
    leftPressed: false,
    paused: false,
    moveLeftCallback: () => {},
    moveRightCallback: () => {},
    stopMovingCallback: () => {},
    handleInteractionCallback: () => {},
    handleResizeCallback: () => {},
    paddleSpeed: 7,
  };

  // Funciones internas de manejo de eventos
  function keyDownHandler(e: KeyboardEvent): void {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      state.rightPressed = true;
      state.moveRightCallback();
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      state.leftPressed = true;
      state.moveLeftCallback();
    } else if (e.key === 'p' || e.key === 'P') {
      state.paused = !state.paused;
    }
  }

  function keyUpHandler(e: KeyboardEvent): void {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      state.rightPressed = false;
      state.stopMovingCallback();
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      state.leftPressed = false;
      state.stopMovingCallback();
    }
  }

  function mouseClickHandler(): void {
    state.handleInteractionCallback();
  }

  function touchHandler(): void {
    state.handleInteractionCallback();
  }

  function resizeHandler(): void {
    state.handleResizeCallback();
  }

  // Gestión de eventos de botones táctiles (para móviles)
  function initTouchButtons(): void {
    if (leftButton) {
      leftButton.addEventListener(
        'touchstart',
        () => {
          state.leftPressed = true;
          state.moveLeftCallback();
        },
        { passive: true },
      );

      leftButton.addEventListener(
        'touchend',
        () => {
          state.leftPressed = false;
          state.stopMovingCallback();
        },
        { passive: true },
      );
    }

    if (rightButton) {
      rightButton.addEventListener(
        'touchstart',
        () => {
          state.rightPressed = true;
          state.moveRightCallback();
        },
        { passive: true },
      );

      rightButton.addEventListener(
        'touchend',
        () => {
          state.rightPressed = false;
          state.stopMovingCallback();
        },
        { passive: true },
      );
    }
  }

  // Implementación de la interfaz EventHandler
  return {
    registerControlEvents: (
      moveLeft: () => void,
      moveRight: () => void,
      stopMoving: () => void,
      handleInteraction: () => void,
      handleResize: () => void,
    ): void => {
      // Guardar callbacks
      state.moveLeftCallback = moveLeft;
      state.moveRightCallback = moveRight;
      state.stopMovingCallback = stopMoving;
      state.handleInteractionCallback = handleInteraction;
      state.handleResizeCallback = handleResize;

      // Registrar eventos de teclado
      document.addEventListener('keydown', keyDownHandler, false);
      document.addEventListener('keyup', keyUpHandler, false);

      // Registrar eventos de interacción de usuario
      canvas.addEventListener('click', mouseClickHandler, false);
      canvas.addEventListener('touchstart', touchHandler, { passive: true });

      // Optimización: usar passive: true para mejorar rendimiento
      // en eventos táctiles y de scroll
      window.addEventListener('resize', resizeHandler, { passive: true });

      // Inicializar botones táctiles para móviles
      initTouchButtons();
    },

    updatePaddlePosition: (currentX: number, canvasWidth: number): number => {
      // Mover paleta según teclas presionadas
      // Retorna la nueva posición X de la paleta

      let newX = currentX;

      if (state.rightPressed) {
        newX = Math.min(currentX + state.paddleSpeed, canvasWidth);
      } else if (state.leftPressed) {
        newX = Math.max(currentX - state.paddleSpeed, 0);
      }

      return newX;
    },

    isPaused: (): boolean => {
      return state.paused;
    },
  };
}
