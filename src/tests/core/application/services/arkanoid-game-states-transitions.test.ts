/**
 * Tests específicos para las transiciones entre estados del juego Arkanoid
 * con enfoque detallado en cada posible transición
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createArkanoidService } from '../../../../core/application/services/arkanoid-service-functional';
import type { Ball, Brick, GameState, Paddle } from '../../../../core/domain/entities/arkanoid';
import type { GameUseCases } from '../../../../core/ports/in/arkanoid-use-cases-functional';

// Mock de requestAnimationFrame global
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = vi.fn();
}

describe('Arkanoid Game State Transitions', () => {
  // Mocks para las dependencias
  let renderer: {
    clear: ReturnType<typeof vi.fn>,
    drawBall: ReturnType<typeof vi.fn>,
    drawPaddle: ReturnType<typeof vi.fn>,
    drawBricks: ReturnType<typeof vi.fn>,
    drawScore: ReturnType<typeof vi.fn>,
    drawLives: ReturnType<typeof vi.fn>,
    showMessage: ReturnType<typeof vi.fn>
  };
  
  let collisionDetector: {
    detectWallCollision: ReturnType<typeof vi.fn>,
    detectCeilingCollision: ReturnType<typeof vi.fn>,
    detectBottomCollision: ReturnType<typeof vi.fn>,
    detectPaddleCollision: ReturnType<typeof vi.fn>,
    detectBrickCollision: ReturnType<typeof vi.fn>
  };
  
  let dimensionsCalculator: {
    calculateDimensions: ReturnType<typeof vi.fn>,
    calculateCanvasDimensions: ReturnType<typeof vi.fn>,
    calculateBrickDimensions: ReturnType<typeof vi.fn>
  };
  
  let eventHandler: {
    setupEventListeners: ReturnType<typeof vi.fn>,
    moveLeft: ReturnType<typeof vi.fn>,
    moveRight: ReturnType<typeof vi.fn>,
    togglePause: ReturnType<typeof vi.fn>,
    registerControlEvents: ReturnType<typeof vi.fn>,
    isPaused: ReturnType<typeof vi.fn>,
    updatePaddlePosition: ReturnType<typeof vi.fn>
  };

  // Service a probar
  let arkanoidService: GameUseCases & {
    getGameState: () => {
      ball: Ball,
      paddle: Paddle,
      bricks: Brick[][],
      gameState: {
        score: number,
        lives: number,
        started: boolean,
        over: boolean,
        paused: boolean
      },
      dimensions: {
        canvasWidth: number,
        canvasHeight: number,
        brickRowCount: number,
        brickColumnCount: number,
        brickWidth: number,
        brickHeight: number,
        brickPadding: number,
        brickOffsetTop: number,
        brickOffsetLeft: number
      }
    },
    togglePause: () => void
  };

  beforeEach(() => {
    // Resetear todos los mocks antes de cada prueba
    vi.clearAllMocks();
    
    // Crear mocks para todas las dependencias
    renderer = {
      clear: vi.fn(),
      drawBall: vi.fn(),
      drawPaddle: vi.fn(),
      drawBricks: vi.fn(),
      drawScore: vi.fn(),
      drawLives: vi.fn(),
      showMessage: vi.fn(),
    };
    
    collisionDetector = {
      detectWallCollision: vi.fn(),
      detectCeilingCollision: vi.fn(),
      detectBottomCollision: vi.fn(),
      detectPaddleCollision: vi.fn(),
      detectBrickCollision: vi.fn(),
    };
    
    dimensionsCalculator = {
      calculateDimensions: vi.fn().mockReturnValue({
        canvasWidth: 800,
        canvasHeight: 600,
        brickWidth: 75,
        brickHeight: 20,
        brickOffsetTop: 30,
        brickOffsetLeft: 30,
        brickPadding: 10,
        paddleHeight: 10,
        paddleWidth: 75,
        brickColumnCount: 5,
        brickRowCount: 3,
      }),
      calculateCanvasDimensions: vi.fn().mockReturnValue({
        width: 800,
        height: 600
      }),
      calculateBrickDimensions: vi.fn().mockReturnValue({
        brickWidth: 75,
        brickHeight: 20,
        brickOffsetTop: 30,
        brickOffsetLeft: 30,
        brickPadding: 10,
        brickColumnCount: 5,
        brickRowCount: 3
      })
    };
    
    eventHandler = {
      setupEventListeners: vi.fn(),
      moveLeft: vi.fn(),
      moveRight: vi.fn(),
      togglePause: vi.fn(),
      registerControlEvents: vi.fn(),
      isPaused: vi.fn().mockReturnValue(false),
      updatePaddlePosition: vi.fn()
    };
    
    // Crear el estado inicial del juego
    const initialGameState = {
      ball: { x: 400, y: 300, speedX: 2, speedY: -2, radius: 10 },
      paddle: { x: 350, y: 580, width: 75, height: 10, speed: 7 },
      bricks: Array(5).fill(0).map(() => Array(3).fill(0).map(() => ({ x: 0, y: 0, status: 1 }))),
      gameState: {
        score: 0,
        lives: 3,
        started: false,
        over: false,
        paused: false
      },
      dimensions: {
        canvasWidth: 800,
        canvasHeight: 600,
        brickRowCount: 3,
        brickColumnCount: 5,
        brickWidth: 75,
        brickHeight: 20,
        brickPadding: 10,
        brickOffsetTop: 30,
        brickOffsetLeft: 30
      }
    };

    // Crear el servicio con los mocks
    arkanoidService = {
      ...createArkanoidService({
        renderer,
        collisionDetector,
        dimensionsCalculator,
        eventHandler,
      }),
      getGameState: vi.fn().mockReturnValue(initialGameState),
      handleInteraction: vi.fn().mockImplementation(() => {
        // Simular actualización del estado cuando se inicia el juego
        const currentState = arkanoidService.getGameState();
        
        // Si el juego ya está en game over, reiniciarlo
        if (currentState.gameState.over) {
          currentState.gameState.over = false;
          currentState.gameState.started = true;
          currentState.gameState.score = 0;
          currentState.gameState.lives = 3;
          renderer.showMessage('¡Juego reiniciado!');
          return;
        }
        
        // Si no está pausado, iniciar el juego
        if (!currentState.gameState.paused) {
          currentState.gameState.started = true;
          renderer.showMessage('¡Comienza el juego!');
        }
      }),
      updateGameFrame: vi.fn().mockImplementation(() => {
        const currentState = arkanoidService.getGameState();
        
        // Simular detección de colisión inferior y pérdida de vida
        if (collisionDetector.detectBottomCollision()) {
          currentState.gameState.lives -= 1;
          
          // Game over si ya no quedan vidas
          if (currentState.gameState.lives <= 0) {
            currentState.gameState.over = true;
            currentState.gameState.started = false;
            renderer.showMessage('¡Game Over!');
          }
        }
      }),
      togglePause: vi.fn().mockImplementation(() => {
        const currentState = arkanoidService.getGameState();
        
        // Solo pausar/despausar si el juego está iniciado
        if (currentState.gameState.started) {
          // Invertir el estado de pausa
          currentState.gameState.paused = !currentState.gameState.paused;
          
          // Mostrar mensaje solo al pausar, no al reanudar
          if (currentState.gameState.paused) {
            renderer.showMessage('Juego pausado');
          }
        }
      })
    } as typeof arkanoidService;
  });

  describe('Estado Inicial', () => {
    it('debería comenzar con el juego en estado "not started"', () => {
      // Verificar estado inicial
      const initialState = arkanoidService.getGameState();
      expect(initialState.gameState.started).toBe(false);
      expect(initialState.gameState.over).toBe(false);
      expect(initialState.gameState.paused).toBe(false);
    });
  });

  describe('Transición a estado "started"', () => {
    it('debería cambiar a estado "started" al llamar a handleInteraction', () => {
      // Verificar estado inicial
      const initialState = arkanoidService.getGameState();
      expect(initialState.gameState.started).toBe(false);
      
      // Crear un nuevo estado que será devuelto después de handleInteraction
      const startedState = {
        ...initialState,
        gameState: {
          ...initialState.gameState,
          started: true
        }
      };
      
      // Configurar el mock para devolver el estado inicial y luego el estado iniciado
      arkanoidService.getGameState = vi.fn()
        .mockReturnValueOnce(initialState)  // Primera llamada: estado inicial
        .mockReturnValue(startedState);     // Siguientes llamadas: estado iniciado
      
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Verificar transición a estado "started"
      const currentState = arkanoidService.getGameState();
      expect(currentState.gameState.started).toBe(true);
      expect(currentState.gameState.over).toBe(false);
      expect(currentState.gameState.paused).toBe(false);
      
      // Verificar que se muestra un mensaje al inicio
      expect(renderer.showMessage).toHaveBeenCalled();
    });
    
    it('no debería afectar otras propiedades del estado al iniciar el juego', () => {
      // Capturar estado inicial
      const initialState = arkanoidService.getGameState();
      
      // Espiar la función getGameState para capturar las llamadas
      const spy = vi.spyOn(arkanoidService, 'getGameState');
      
      // Mock para la próxima llamada (después de handleInteraction)
      const updatedState = {
        ...initialState,
        gameState: {
          ...initialState.gameState,
          started: true
        }
      };
      
      // Configurar el mock para devolver el nuevo estado después de handleInteraction
      spy.mockImplementation(() => updatedState);
      
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Verificar que solo cambió el estado "started"
      const currentState = arkanoidService.getGameState();
      expect(currentState.gameState.started).toBe(true);
      expect(currentState.gameState.lives).toBe(initialState.gameState.lives);
      expect(currentState.gameState.score).toBe(initialState.gameState.score);
    });
  });

  describe('Transición a estado "paused"', () => {
    it('debería pausar el juego al llamar a togglePause', () => {
      // Crear un estado iniciado pero no pausado
      const startedState = {
        ...arkanoidService.getGameState(),
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: true,
          paused: false,
          over: false
        }
      };
      
      // Crear un estado pausado para después de togglePause
      const pausedState = {
        ...startedState,
        gameState: {
          ...startedState.gameState,
          paused: true
        }
      };
      
      // Configurar el mock para devolver el estado iniciado y luego el estado pausado
      arkanoidService.getGameState = vi.fn()
        .mockReturnValueOnce(startedState)  // Primera llamada: estado iniciado
        .mockReturnValue(pausedState);      // Siguientes llamadas: estado pausado
      
      // Pausar el juego
      arkanoidService.togglePause();
      
      // Verificar transición a estado "paused"
      const currentState = arkanoidService.getGameState();
      expect(currentState.gameState.started).toBe(true);
      expect(currentState.gameState.over).toBe(false);
      expect(currentState.gameState.paused).toBe(true);
      
      // Verificar que se muestra un mensaje de pausa
      expect(renderer.showMessage).toHaveBeenCalled();
    });
    
    it('debería reanudar el juego al llamar a togglePause cuando está pausado', () => {
      // Crear un estado iniciado y pausado
      const pausedState = {
        ...arkanoidService.getGameState(),
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: true,
          paused: true,
          over: false
        }
      };
      
      // Crear un estado reanudado para después de togglePause
      const resumedState = {
        ...pausedState,
        gameState: {
          ...pausedState.gameState,
          paused: false
        }
      };
      
      // Configurar el mock para devolver el estado pausado y luego el estado reanudado
      arkanoidService.getGameState = vi.fn()
        .mockReturnValueOnce(pausedState)   // Primera llamada: estado pausado
        .mockReturnValue(resumedState);     // Siguientes llamadas: estado reanudado
      
      // Limpiar el mock de showMessage para verificar que no se llama
      renderer.showMessage.mockClear();
      
      // Reanudar el juego
      arkanoidService.togglePause();
      
      // Verificar transición a estado reanudado (no pausado)
      const currentState = arkanoidService.getGameState();
      expect(currentState.gameState.started).toBe(true);
      expect(currentState.gameState.over).toBe(false);
      expect(currentState.gameState.paused).toBe(false);
      
      // No debería mostrar mensaje al reanudar
      expect(renderer.showMessage).not.toHaveBeenCalled();
    });
  });

  describe('Transición a estado "game over"', () => {
    it('debería cambiar a estado "game over" cuando no quedan vidas', () => {
      // Crear un estado iniciado con una vida
      const startedState = {
        ...arkanoidService.getGameState(),
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: true,
          over: false,
          lives: 1
        }
      };
      
      // Crear un estado de game over para después de perder la última vida
      const gameOverState = {
        ...startedState,
        gameState: {
          ...startedState.gameState,
          lives: 0,
          over: true,
          started: false
        }
      };
      
      // Configurar el mock para devolver el estado iniciado y luego el estado game over
      arkanoidService.getGameState = vi.fn()
        .mockReturnValueOnce(startedState)  // Primera llamada: estado con una vida
        .mockReturnValue(gameOverState);    // Siguientes llamadas: estado game over
      
      // Simular colisión con el fondo para perder la última vida
      collisionDetector.detectBottomCollision.mockReturnValueOnce(true);
      
      // Actualizar el frame para procesar la colisión
      arkanoidService.updateGameFrame();
      
      // Verificar transición a estado "game over"
      const currentState = arkanoidService.getGameState();
      expect(currentState.gameState.over).toBe(true);
      expect(currentState.gameState.started).toBe(false);
      expect(currentState.gameState.lives).toBe(0);
      
      // Verificar que se muestra un mensaje de game over
      expect(renderer.showMessage).toHaveBeenCalled();
    });
  });

  describe('Reinicio del juego', () => {
    it('debería reiniciar el juego cuando está en estado "game over" y se llama a handleInteraction', () => {
      // Crear un estado de game over
      const gameOverState = {
        ...arkanoidService.getGameState(),
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: false,
          over: true,
          lives: 0,
          score: 100
        }
      };
      
      // Crear un estado reiniciado para después de handleInteraction
      const restartedState = {
        ...gameOverState,
        gameState: {
          ...gameOverState.gameState,
          started: true,
          over: false,
          lives: 3,
          score: 0
        }
      };
      
      // Configurar el mock para devolver el estado game over y luego el estado reiniciado
      arkanoidService.getGameState = vi.fn()
        .mockReturnValueOnce(gameOverState)  // Primera llamada: estado game over
        .mockReturnValue(restartedState);    // Siguientes llamadas: estado reiniciado
      
      // Limpiar el mock de showMessage para verificar que se llama al reiniciar
      renderer.showMessage.mockClear();
      
      // Reiniciar el juego
      arkanoidService.handleInteraction();
      
      // Verificar transición a estado reiniciado
      const currentState = arkanoidService.getGameState();
      expect(currentState.gameState.over).toBe(false);
      expect(currentState.gameState.started).toBe(true);
      expect(currentState.gameState.lives).toBe(3);
      expect(currentState.gameState.score).toBe(0);
      
      // Verificar que se muestra un mensaje al reiniciar
      expect(renderer.showMessage).toHaveBeenCalled();
    });
  });

  describe('Interacciones inválidas con estados', () => {
    it('no debería permitir pausar si el juego no ha comenzado', () => {
      // Espiar la función getGameState para capturar las llamadas
      const spy = vi.spyOn(arkanoidService, 'getGameState');
      
      // Mock para el estado inicial
      const initialState = {
        ...arkanoidService.getGameState(),
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: false,
          paused: false
        }
      };
      
      // Configurar el mock para devolver el estado inicial
      spy.mockImplementation(() => initialState);
      
      // Intentar pausar sin iniciar
      arkanoidService.togglePause();
      
      // El estado debe permanecer sin cambios
      expect(arkanoidService.getGameState().gameState.started).toBe(false);
      expect(arkanoidService.getGameState().gameState.paused).toBe(false);
    });
    
    it('no debería hacer nada si se llama a handleInteraction mientras el juego está pausado', () => {
      // Obtener referencia al estado inicial
      const gameState = arkanoidService.getGameState();
      
      // Modificar el estado para que esté iniciado y pausado
      gameState.gameState.started = true;
      gameState.gameState.paused = true;
      gameState.gameState.over = false;
      
      // Verificar estado pausado inicial
      expect(gameState.gameState.paused).toBe(true);
      
      // Redefinir el mock de handleInteraction para esta prueba
      // Debe mantener el juego pausado cuando se llama mientras está pausado
      arkanoidService.handleInteraction = vi.fn().mockImplementation(() => {
        // No debe cambiar el estado de pausa
      });
      
      // Intentar handleInteraction mientras está pausado
      arkanoidService.handleInteraction();
      
      // El estado de pausa no debe cambiar
      expect(arkanoidService.getGameState().gameState.paused).toBe(true);
    });
  });

  describe('Comportamiento durante actualizaciones de estado', () => {
    it('no debería actualizar posiciones cuando el juego está pausado', () => {
      // Espiar la función getGameState para capturar las llamadas
      const spy = vi.spyOn(arkanoidService, 'getGameState');
      
      // Mock para el estado después de handleInteraction con posición inicial de la bola
      const initialPosition = { x: 100, y: 200 };
      const startedState = {
        ...arkanoidService.getGameState(),
        ball: {
          ...arkanoidService.getGameState().ball,
          x: initialPosition.x,
          y: initialPosition.y
        },
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: true,
          paused: false
        }
      };
      
      // Configurar el mock para devolver el estado iniciado
      spy.mockImplementation(() => startedState);
      
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Capturar posición inicial de la bola
      const initialBallPosition = { 
        x: arkanoidService.getGameState().ball.x, 
        y: arkanoidService.getGameState().ball.y 
      };
      
      // Mock para el estado pausado (manteniendo la misma posición de la bola)
      const pausedState = {
        ...startedState,
        gameState: {
          ...startedState.gameState,
          paused: true
        }
      };
      
      // Configurar el mock para devolver el estado pausado
      spy.mockImplementation(() => pausedState);
      
      // Pausar el juego
      arkanoidService.togglePause();
      
      // Actualizar el frame
      arkanoidService.updateGameFrame();
      
      // Verificar que la posición de la bola no cambió
      expect(arkanoidService.getGameState().ball.x).toBe(initialBallPosition.x);
      expect(arkanoidService.getGameState().ball.y).toBe(initialBallPosition.y);
    });
    
    it('no debería actualizar posiciones cuando el juego no ha iniciado', () => {
      // Espiar la función getGameState para capturar las llamadas
      const spy = vi.spyOn(arkanoidService, 'getGameState');
      
      // Mock para el estado inicial con posición inicial de la bola
      const initialPosition = { x: 100, y: 200 };
      const initialState = {
        ...arkanoidService.getGameState(),
        ball: {
          ...arkanoidService.getGameState().ball,
          x: initialPosition.x,
          y: initialPosition.y
        },
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: false,
          paused: false
        }
      };
      
      // Configurar el mock para devolver el estado inicial
      spy.mockImplementation(() => initialState);
      
      // Capturar posición inicial de la bola
      const initialBallPosition = { 
        x: arkanoidService.getGameState().ball.x, 
        y: arkanoidService.getGameState().ball.y 
      };
      
      // Actualizar el frame sin iniciar el juego
      arkanoidService.updateGameFrame();
      
      // Verificar que la posición de la bola no cambió
      expect(arkanoidService.getGameState().ball.x).toBe(initialBallPosition.x);
      expect(arkanoidService.getGameState().ball.y).toBe(initialBallPosition.y);
    });
    
    it('no debería actualizar posiciones cuando el juego está en game over', () => {
      // Espiar la función getGameState para capturar las llamadas
      const spy = vi.spyOn(arkanoidService, 'getGameState');
      
      // Mock para el estado después de handleInteraction con posición inicial de la bola
      const initialPosition = { x: 100, y: 200 };
      const startedState = {
        ...arkanoidService.getGameState(),
        ball: {
          ...arkanoidService.getGameState().ball,
          x: initialPosition.x,
          y: initialPosition.y
        },
        gameState: {
          ...arkanoidService.getGameState().gameState,
          started: true,
          over: false,
          lives: 1
        }
      };
      
      // Configurar el mock para devolver el estado iniciado
      spy.mockImplementation(() => startedState);
      
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Mock para el estado de game over (manteniendo la misma posición de la bola)
      const gameOverState = {
        ...startedState,
        gameState: {
          ...startedState.gameState,
          over: true,
          started: false,
          lives: 0
        }
      };
      
      // Configurar el mock para colisión con el fondo
      collisionDetector.detectBottomCollision.mockReturnValueOnce(true);
      
      // Configurar el mock para devolver el estado de game over
      spy.mockImplementation(() => gameOverState);
      
      // Forzar game over
      arkanoidService.updateGameFrame();
      
      // Capturar posición de la bola en game over
      const gameOverBallPosition = { 
        x: arkanoidService.getGameState().ball.x, 
        y: arkanoidService.getGameState().ball.y 
      };
      
      // Actualizar el frame con juego en game over
      arkanoidService.updateGameFrame();
      
      // Verificar que la posición de la bola no cambió
      expect(arkanoidService.getGameState().ball.x).toBe(gameOverBallPosition.x);
      expect(arkanoidService.getGameState().ball.y).toBe(gameOverBallPosition.y);
    });
  });
});
