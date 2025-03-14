/**
 * Implementación funcional del servicio de juego Arkanoid
 * Siguiendo los principios SOLID y la arquitectura hexagonal
 * Optimizado para rendimiento con memoización y throttling
 */

import type {
  Ball,
  Brick,
  GameDimensions,
  GameState,
  Paddle,
} from '../../domain/entities/arkanoid';
import type { GameUseCases } from '../../ports/in/arkanoid-use-cases-functional';
import type {
  CanvasRenderer,
  CollisionDetector,
  DimensionsCalculator,
  EventHandler,
} from '../../ports/out/arkanoid-ports';
import { memoize, throttle } from '../../utils/functional';

// Tipos para las dependencias y el estado
type Dependencies = {
  renderer: CanvasRenderer;
  collisionDetector: CollisionDetector;
  dimensionsCalculator: DimensionsCalculator;
  eventHandler: EventHandler;
};

type GameServiceState = {
  ball: Ball;
  paddle: Paddle;
  bricks: Brick[][];
  gameState: GameState;
  dimensions: GameDimensions;
  animationFrameId: number | null;
  lastFrameTime: number;
  renderingData: {
    bricksModified: boolean;
    staticElementsRendered: boolean;
  };
};

// Constantes para la configuración del juego
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS; // tiempo entre frames en ms

/**
 * Factory function para crear el servicio de juego
 * Utiliza closures para mantener el estado encapsulado
 */
export function createArkanoidService(
  dependencies: Dependencies
): GameUseCases {
  // Estado encapsulado mediante closure
  const state: GameServiceState = {
    ball: { x: 0, y: 0, radius: 10, speedX: 4, speedY: -4 },
    paddle: { x: 0, y: 0, width: 75, height: 10, speed: 7 },
    bricks: [],
    gameState: {
      score: 0,
      lives: 3,
      started: false,
      over: false,
      paused: false,
    },
    dimensions: {
      canvasWidth: 0,
      canvasHeight: 0,
      brickRowCount: 5,
      brickColumnCount: 0,
      brickWidth: 0,
      brickHeight: 20,
      brickPadding: 10,
      brickOffsetTop: 30,
      brickOffsetLeft: 0,
    },
    animationFrameId: null,
    lastFrameTime: 0,
    renderingData: {
      bricksModified: true,
      staticElementsRendered: false,
    },
  };

  // Funciones privadas (no expuestas en la interfaz)
  const initializeBricks = memoize((): void => {
    // Limpiar el array de ladrillos
    state.bricks = [];

    // Crear la matriz de ladrillos con las dimensiones actuales
    for (
      let columnIndex = 0;
      columnIndex < state.dimensions.brickColumnCount;
      columnIndex++
    ) {
      state.bricks[columnIndex] = [];
      for (
        let rowIndex = 0;
        rowIndex < state.dimensions.brickRowCount;
        rowIndex++
      ) {
        // Calcular la posición de cada ladrillo
        const brickPositionX =
          columnIndex *
            (state.dimensions.brickWidth + state.dimensions.brickPadding) +
          state.dimensions.brickOffsetLeft;
        const brickPositionY =
          rowIndex *
            (state.dimensions.brickHeight + state.dimensions.brickPadding) +
          state.dimensions.brickOffsetTop;

        // Guardar la posición en el objeto del ladrillo
        state.bricks[columnIndex][rowIndex] = {
          x: brickPositionX,
          y: brickPositionY,
          status: 1, // status: 1=activo, 0=destruido
        };
      }
    }
    
    // Marcar los ladrillos como modificados para que se vuelvan a renderizar
    state.renderingData.bricksModified = true;
    state.renderingData.staticElementsRendered = false;
  });
  
  // Crear una versión throttled de la función de actualización para mantener un FPS constante
  const throttledUpdate = throttle((timestamp: number) => {
    // Calcular el tiempo transcurrido desde el último frame
    const deltaTime = timestamp - state.lastFrameTime;
    
    // Actualizar solo si ha pasado suficiente tiempo y el juego no está pausado
    if (deltaTime >= FRAME_TIME && !dependencies.eventHandler.isPaused()) {
      // Actualizar posiciones
      updatePositions();
      
      // Detectar colisiones
      detectCollisions();
      
      // Actualizar el tiempo del último frame
      state.lastFrameTime = timestamp;
    }
  }, FRAME_TIME / 2); // Usar la mitad del tiempo de frame para asegurar que no se saltan frames

  function updatePositions(): void {
    // Actualizar la posición de la paleta según los controles
    const newPaddleX = dependencies.eventHandler.updatePaddlePosition(
      state.paddle.x,
      state.dimensions.canvasWidth
    );
    
    // Solo actualizar si cambió la posición para evitar re-renders innecesarios
    if (newPaddleX !== state.paddle.x) {
      state.paddle.x = newPaddleX;
    }

    // Actualizar posición de la pelota según su velocidad
    state.ball.x += state.ball.speedX;
    state.ball.y += state.ball.speedY;
  }

  function detectCollisions(): void {
    // Detectar colisión con paredes laterales
    if (
      dependencies.collisionDetector.detectWallCollision(
        state.ball,
        state.dimensions.canvasWidth
      )
    ) {
      state.ball.speedX = -state.ball.speedX;
    }

    // Detectar colisión con el techo
    if (dependencies.collisionDetector.detectCeilingCollision(state.ball)) {
      state.ball.speedY = -state.ball.speedY;
    }

    // Detectar colisión con la paleta
    if (
      dependencies.collisionDetector.detectPaddleCollision(
        state.ball,
        state.paddle
      )
    ) {
      state.ball.speedY = -state.ball.speedY;

      // Ajustar ángulo según donde golpee la pelota en la paleta
      const paddleHitPosition =
        (state.ball.x - state.paddle.x) / state.paddle.width;
      state.ball.speedX = 8 * (paddleHitPosition - 0.5); // -4 a 4 dependiendo de dónde golpee
    }

    // Detectar si la pelota cayó por debajo del canvas
    if (
      dependencies.collisionDetector.detectBottomCollision(
        state.ball,
        state.dimensions.canvasHeight
      )
    ) {
      state.gameState.lives--;

      if (state.gameState.lives === 0) {
        state.gameState.over = true;
      } else {
        // Reiniciar posición para nueva vida
        state.ball.x = state.dimensions.canvasWidth / 2;
        state.ball.y = state.dimensions.canvasHeight - 30;
        state.ball.speedX = 4;
        state.ball.speedY = -4;
        state.paddle.x =
          (state.dimensions.canvasWidth - state.paddle.width) / 2;
      }
    }

    // Detectar colisión con ladrillos
    const collision = dependencies.collisionDetector.detectBrickCollision(
      state.ball,
      state.bricks,
      state.dimensions.brickWidth,
      state.dimensions.brickHeight
    );

    if (collision && collision.collided) {
      // Cambiar dirección de la pelota
      state.ball.speedY = -state.ball.speedY;

      // Marcar el ladrillo como inactivo (desaparece)
      state.bricks[collision.colIndex][collision.rowIndex].status = 0;
      
      // Marcar que los ladrillos han sido modificados para re-renderizar
      state.renderingData.bricksModified = true;

      // Aumentar puntuación
      state.gameState.score++;

      // Victoria si todos los ladrillos están destruidos
      if (
        state.gameState.score ===
        state.dimensions.brickRowCount * state.dimensions.brickColumnCount
      ) {
        state.gameState.over = true;
      }
    }
  }

  // Implementación de los casos de uso (expuestos en la interfaz)
  const useCases: GameUseCases = {
    initializeGame: () => {
      // Obtener dimensiones del canvas
      const { width, height } =
        dependencies.dimensionsCalculator.calculateCanvasDimensions();

      // Actualizar dimensiones del juego
      state.dimensions.canvasWidth = width;
      state.dimensions.canvasHeight = height;

      // Calcular dimensiones de los ladrillos basadas en el ancho del canvas
      const brickDimensions =
        dependencies.dimensionsCalculator.calculateBrickDimensions(width);
      Object.assign(state.dimensions, brickDimensions);

      // Inicializar la posición de la paleta
      state.paddle.x = (state.dimensions.canvasWidth - state.paddle.width) / 2;
      state.paddle.y = state.dimensions.canvasHeight - state.paddle.height - 10;

      // Inicializar la posición de la bola
      state.ball.x = state.dimensions.canvasWidth / 2;
      state.ball.y = state.dimensions.canvasHeight - 30;

      // Inicializar bloques
      initializeBricks();

      // Registrar eventos de control (solo una vez)
      dependencies.eventHandler.registerControlEvents(
        useCases.moveLeft,
        useCases.moveRight,
        useCases.stopMoving,
        useCases.handleInteraction,
        useCases.handleResize
      );
    },

    startGame: () => {
      if (!state.gameState.started) {
        state.gameState.started = true;
        state.lastFrameTime = performance.now();
        useCases.updateGameFrame();
      }
    },

    resetGame: () => {
      // Recalcular dimensiones de los ladrillos
      const brickDimensions =
        dependencies.dimensionsCalculator.calculateBrickDimensions(
          state.dimensions.canvasWidth
        );
      Object.assign(state.dimensions, brickDimensions);

      // Reiniciar variables del juego
      state.ball.x = state.dimensions.canvasWidth / 2;
      state.ball.y = state.dimensions.canvasHeight - 30;
      state.ball.speedX = 4;
      state.ball.speedY = -4;
      state.paddle.x = (state.dimensions.canvasWidth - state.paddle.width) / 2;
      state.gameState.over = false;
      state.gameState.score = 0;
      state.gameState.lives = 3;
      state.lastFrameTime = performance.now();
      
      // Resetear datos de renderizado
      state.renderingData.bricksModified = true;
      state.renderingData.staticElementsRendered = false;

      // Recrear la matriz de ladrillos con el nuevo número de columnas
      initializeBricks();
    },

    moveLeft: () => {
      // La implementación del movimiento está delegada al EventHandler
    },

    moveRight: () => {
      // La implementación del movimiento está delegada al EventHandler
    },

    stopMoving: () => {
      // Implementado por el EventHandler
    },

    pauseGame: () => {
      state.gameState.paused = true;
    },

    resumeGame: () => {
      state.gameState.paused = false;
    },

    updateGameFrame: () => {
      // Obtener el timestamp actual para controlar el throttling
      const timestamp = performance.now();
      
      // Si el juego está pausado, solo mostrar mensaje sin actualizaciones de lógica
      if (dependencies.eventHandler.isPaused()) {
        dependencies.renderer.showMessage('PAUSA', '#FFC107');
        state.animationFrameId = requestAnimationFrame(
          useCases.updateGameFrame
        );
        return;
      }

      // Si el juego ha terminado, mostramos el mensaje correspondiente
      if (state.gameState.over) {
        if (
          state.gameState.score ===
          state.dimensions.brickRowCount * state.dimensions.brickColumnCount
        ) {
          dependencies.renderer.showMessage(
            '¡GANASTE! - Toca para reiniciar',
            '#4CAF50'
          );
        } else {
          dependencies.renderer.showMessage(
            'GAME OVER - Toca para reiniciar',
            '#FF5252'
          );
        }
        state.animationFrameId = requestAnimationFrame(
          useCases.updateGameFrame
        );
        return;
      }

      // Solo limpiar el canvas cuando es necesario (optimización de rendimiento)
      dependencies.renderer.clear();
      
      // Estrategia de renderizado optimizada
      // Solo redibujar los ladrillos si han cambiado (colisiones)
      if (state.renderingData.bricksModified) {
        dependencies.renderer.drawBricks(state.bricks);
        state.renderingData.bricksModified = false;
      }
      
      // Siempre dibujar elementos dinámicos (pelota y paleta)
      dependencies.renderer.drawBall(state.ball);
      dependencies.renderer.drawPaddle(state.paddle);
      
      // UI estático que no cambia con frecuencia
      dependencies.renderer.drawScore(state.gameState.score);
      dependencies.renderer.drawLives(state.gameState.lives);

      // Aplicar throttling a las actualizaciones de la lógica del juego
      // para mantener una tasa de actualización constante
      throttledUpdate(timestamp);

      // Continuar el ciclo de animación
      state.animationFrameId = requestAnimationFrame(useCases.updateGameFrame);
    },

    handleInteraction: () => {
      // Si el juego no ha comenzado, inicializarlo y comenzar
      if (!state.gameState.started) {
        useCases.initializeGame();
        useCases.startGame();
        return;
      }

      // Si el juego terminó (game over), reiniciarlo
      if (state.gameState.over) {
        useCases.resetGame();
        state.gameState.started = true;
      }
    },

    handleResize: () => {
      // Obtener nuevas dimensiones del canvas
      const { width, height } =
        dependencies.dimensionsCalculator.calculateCanvasDimensions();

      // Verificar si cambiaron las dimensiones
      const canvasSizeChanged =
        width !== state.dimensions.canvasWidth ||
        height !== state.dimensions.canvasHeight;

      if (canvasSizeChanged) {
        // Dimensiones del canvas cambiadas, recalculando bloques...

        state.dimensions.canvasWidth = width;
        state.dimensions.canvasHeight = height;

        // Recalcular dimensiones de los ladrillos
        const brickDimensions =
          dependencies.dimensionsCalculator.calculateBrickDimensions(width);
        Object.assign(state.dimensions, brickDimensions);

        // Reposicionar la pala y la bola
        state.paddle.x =
          (state.dimensions.canvasWidth - state.paddle.width) / 2;
        state.ball.x = state.dimensions.canvasWidth / 2;
        state.ball.y = state.dimensions.canvasHeight - 30;

        // Recalcular posiciones de los ladrillos
        initializeBricks();
      }
    },
  };

  return useCases;
}
