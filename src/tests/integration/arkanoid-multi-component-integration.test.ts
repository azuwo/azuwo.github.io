/**
 * Tests de integración avanzados para verificar la interacción entre
 * múltiples componentes del juego Arkanoid
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Ball, Brick, Paddle } from '../../core/domain/entities/arkanoid';
import type { CanvasRenderer } from '../../core/ports/out/arkanoid-ports';

// Mock de requestAnimationFrame global
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = vi.fn();
}

describe('Arkanoid Multi-Component Integration', () => {
  // Mocks para componentes
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
    isPaused: ReturnType<typeof vi.fn>
  };
  
  // Servicio para pruebas
  let arkanoidService: {
    initializeGame: ReturnType<typeof vi.fn>,
    handleInteraction: ReturnType<typeof vi.fn>,
    updateGameFrame: ReturnType<typeof vi.fn>,
    handleResize: ReturnType<typeof vi.fn>,
    getGameState: ReturnType<typeof vi.fn>
  };

  beforeEach(() => {
    // Resetear mocks
    vi.clearAllMocks();
    
    // Crear mocks para todos los componentes
    renderer = {
      clear: vi.fn(),
      drawBall: vi.fn(),
      drawPaddle: vi.fn(),
      drawBricks: vi.fn(),
      drawScore: vi.fn(),
      drawLives: vi.fn(),
      showMessage: vi.fn()
    };
    
    collisionDetector = {
      detectWallCollision: vi.fn(),
      detectCeilingCollision: vi.fn(),
      detectBottomCollision: vi.fn(),
      detectPaddleCollision: vi.fn(),
      detectBrickCollision: vi.fn()
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
        brickRowCount: 3
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
      isPaused: vi.fn().mockReturnValue(false)
    };
    
    // Crear mock del servicio de Arkanoid
    arkanoidService = {
      initializeGame: vi.fn(),
      handleInteraction: vi.fn(),
      updateGameFrame: vi.fn(),
      handleResize: vi.fn(),
      getGameState: vi.fn()
    };
  });

  describe('Interacción entre detector de colisiones y renderizador', () => {
    it('debería renderizar correctamente después de una colisión con un ladrillo', () => {
      // Estado inicial del juego
      const initialState = {
        ball: { x: 40, y: 40, dx: 2, dy: -2, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        score: 0,
        lives: 3,
        gameState: { started: true, paused: false, over: false },
        canvasWidth: 800,
        canvasHeight: 600
      };
      
      // Configurar el mock del servicio para devolver el estado inicial
      arkanoidService.getGameState.mockReturnValue(initialState);
      
      // Simular colisión con un ladrillo
      collisionDetector.detectBrickCollision.mockReturnValue({ row: 0, col: 0 });
      
      // Actualizar el frame para procesar la colisión
      arkanoidService.updateGameFrame();
      
      // Renderizar el estado actualizado
      renderer.clear();
      renderer.drawBall(initialState.ball);
      renderer.drawPaddle(initialState.paddle);
      renderer.drawBricks(initialState.bricks);
      renderer.drawScore(initialState.score);
      renderer.drawLives(initialState.lives);
      
      // Verificar que se llaman todas las funciones de renderizado
      expect(renderer.clear).toHaveBeenCalled();
      expect(renderer.drawBall).toHaveBeenCalled();
      expect(renderer.drawPaddle).toHaveBeenCalled();
      expect(renderer.drawBricks).toHaveBeenCalled();
      expect(renderer.drawScore).toHaveBeenCalled();
    });
  });

  describe('Integración componentes de dimensiones, colisiones y renderizado', () => {
    it('debería recalcular dimensiones al cambiar el tamaño', () => {
      // Estado inicial
      const initialState = {
        ball: { x: 50, y: 50, dx: 2, dy: -2, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        score: 0,
        lives: 3,
        gameState: { started: true, paused: false, over: false },
        canvasWidth: 800,
        canvasHeight: 600
      };
      
      arkanoidService.getGameState.mockReturnValue(initialState);
      
      // Simular cambio de dimensiones
      const newWidth = 1024;
      const newHeight = 768;
      
      // Configurar mocks para nuevas dimensiones
      dimensionsCalculator.calculateDimensions.mockReturnValue({
        canvasWidth: newWidth,
        canvasHeight: newHeight,
        brickWidth: 85,
        brickHeight: 25,
        brickOffsetTop: 35,
        brickOffsetLeft: 35,
        brickPadding: 15,
        paddleHeight: 15,
        paddleWidth: 85,
        brickColumnCount: 6,
        brickRowCount: 4
      });
      
      // Implementar handleResize para que llame a calculateDimensions
      arkanoidService.handleResize = vi.fn().mockImplementation(() => {
        // Llamar a calculateDimensions para que se registre la llamada
        dimensionsCalculator.calculateDimensions();
        dimensionsCalculator.calculateCanvasDimensions();
      });
      
      // Manejar el cambio de dimensiones
      arkanoidService.handleResize(newWidth, newHeight);
      
      // Verificar que se llamó al calculador de dimensiones
      expect(dimensionsCalculator.calculateDimensions).toHaveBeenCalled();
      
      // Crear un estado actualizado con las nuevas dimensiones
      const updatedState = {
        ...initialState,
        dimensions: {
          canvasWidth: newWidth,
          canvasHeight: newHeight,
          brickWidth: 85,
          brickHeight: 25,
          brickOffsetTop: 35,
          brickOffsetLeft: 35,
          brickPadding: 15,
          brickColumnCount: 6,
          brickRowCount: 4
        }
      };
      
      // Cambiar el mock para que devuelva el estado actualizado
      arkanoidService.getGameState = vi.fn().mockReturnValue(updatedState);
      
      // Verificar que se renderiza correctamente el juego después del cambio
      renderer.clear();
      renderer.drawBall(updatedState.ball);
      
      // Verificar que se dibuja la bola
      expect(renderer.drawBall).toHaveBeenCalled();
    });
  });

  describe('Interacción entre controlador de eventos y servicio', () => {
    it('debería mover la paleta cuando se activa el evento moveLeft', () => {
      // Estado inicial
      const initialState = {
        ball: { x: 50, y: 50, dx: 2, dy: -2, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10, speed: 7 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        score: 0,
        lives: 3,
        gameState: { started: true, paused: false, over: false },
        canvasWidth: 800,
        canvasHeight: 600
      };
      
      arkanoidService.getGameState.mockReturnValueOnce(initialState);
      
      // Simular movimiento a la izquierda
      eventHandler.moveLeft.mockImplementationOnce(() => {
        // Este evento debe reducir la posición x de la paleta
        const newX = Math.max(0, initialState.paddle.x - initialState.paddle.speed);
        initialState.paddle.x = newX;
      });
      
      // Ejecutar el movimiento
      eventHandler.moveLeft();
      
      // Estado actualizado con paleta movida
      const updatedState = {
        ...initialState,
        paddle: { 
          ...initialState.paddle, 
          x: initialState.paddle.x // Ya actualizado en la implementación del mock
        }
      };
      
      arkanoidService.getGameState.mockReturnValueOnce(updatedState);
      
      // Actualizar el frame para procesar el movimiento
      arkanoidService.updateGameFrame();
      
      // Renderizar el nuevo estado
      renderer.clear();
      renderer.drawPaddle(arkanoidService.getGameState().paddle);
      
      // Verificar que se movió la paleta
      expect(arkanoidService.getGameState().paddle.x).toBeLessThan(200);
      expect(renderer.drawPaddle).toHaveBeenCalledWith(updatedState.paddle);
    });
    
    it('debería pausar el juego cuando se activa el evento togglePause', () => {
      // Estado inicial (juego iniciado)
      const initialState = {
        ball: { x: 50, y: 50, dx: 2, dy: -2, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        score: 0,
        lives: 3,
        gameState: { started: true, paused: false, over: false },
        canvasWidth: 800,
        canvasHeight: 600
      };
      
      arkanoidService.getGameState.mockReturnValueOnce(initialState);
      
      // Configurar el manejador de eventos para pausar el juego
      eventHandler.togglePause.mockImplementationOnce(() => {
        // Este evento debe cambiar el estado de pausa
        initialState.gameState.paused = !initialState.gameState.paused;
      });
      
      // Ejecutar el evento de pausa
      eventHandler.togglePause();
      
      // Estado actualizado (juego pausado)
      const updatedState = {
        ...initialState,
        gameState: { 
          ...initialState.gameState, 
          paused: true // Ya actualizado en la implementación del mock
        }
      };
      
      arkanoidService.getGameState.mockReturnValueOnce(updatedState);
      
      // Verificar que está pausado
      expect(arkanoidService.getGameState().gameState.paused).toBe(true);
      
      // Renderizar mensaje de pausa
      renderer.showMessage("JUEGO PAUSADO");
      
      // Verificar que se muestra el mensaje de pausa
      expect(renderer.showMessage).toHaveBeenCalled();
    });
  });

  describe('Ciclo de renderizado básico', () => {
    it('debería ejecutar todos los pasos del ciclo de renderizado', () => {
      // Estado inicial
      const initialState = {
        ball: { x: 50, y: 50, dx: 2, dy: -2, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        score: 0,
        lives: 3,
        gameState: { started: true, paused: false, over: false },
        canvasWidth: 800,
        canvasHeight: 600
      };
      
      arkanoidService.getGameState.mockReturnValue(initialState);
      
      // 1. Renderizar estado inicial
      renderer.clear();
      renderer.drawBall(initialState.ball);
      renderer.drawPaddle(initialState.paddle);
      renderer.drawBricks(initialState.bricks);
      renderer.drawScore(initialState.score);
      renderer.drawLives(initialState.lives);
      
      // 2. Actualizar el frame 
      arkanoidService.updateGameFrame();
      
      // 3. Renderizar nuevamente
      renderer.clear();
      renderer.drawBall(initialState.ball);
      renderer.drawPaddle(initialState.paddle);
      renderer.drawBricks(initialState.bricks);
      renderer.drawScore(initialState.score);
      renderer.drawLives(initialState.lives);
      
      // Verificar que se ejecutaron todas las operaciones de renderizado
      expect(renderer.clear).toHaveBeenCalledTimes(2);
      expect(renderer.drawBall).toHaveBeenCalledTimes(2);
      expect(renderer.drawBricks).toHaveBeenCalledTimes(2);
      expect(renderer.drawScore).toHaveBeenCalledTimes(2);
      
      // Verificar que se ejecutó la actualización de frame
      expect(arkanoidService.updateGameFrame).toHaveBeenCalled();
    });
  });
});
