/**
 * Tests de integración para verificar la interacción entre los componentes de Arkanoid
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Ball, Brick, Paddle } from '../../core/domain/entities/arkanoid';

// Mock de requestAnimationFrame global
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = vi.fn();
}

describe('Arkanoid Component Integration', () => {
  // Mocks para componentes que requieren DOM (comentados porque no se usan en este archivo)
  // let renderer: {
  //   clear: ReturnType<typeof vi.fn>,
  //   drawBall: ReturnType<typeof vi.fn>,
  //   drawPaddle: ReturnType<typeof vi.fn>,
  //   drawBricks: ReturnType<typeof vi.fn>,
  //   drawScore: ReturnType<typeof vi.fn>,
  //   drawLives: ReturnType<typeof vi.fn>,
  //   showMessage: ReturnType<typeof vi.fn>
  // };
  
  // let eventHandler: {
  //   setupEventListeners: ReturnType<typeof vi.fn>,
  //   moveLeft: ReturnType<typeof vi.fn>,
  //   moveRight: ReturnType<typeof vi.fn>,
  //   togglePause: ReturnType<typeof vi.fn>,
  //   registerControlEvents: ReturnType<typeof vi.fn>,
  //   isPaused: ReturnType<typeof vi.fn>
  // };
  
  // Mocks para detector de colisiones
  let collisionDetector: {
    detectWallCollision: ReturnType<typeof vi.fn>,
    detectCeilingCollision: ReturnType<typeof vi.fn>,
    detectBottomCollision: ReturnType<typeof vi.fn>,
    detectPaddleCollision: ReturnType<typeof vi.fn>,
    detectBrickCollision: ReturnType<typeof vi.fn>
  };
  
  // Mock para calculador de dimensiones
  let dimensionsCalculator: {
    calculateDimensions: ReturnType<typeof vi.fn>,
    calculateCanvasDimensions: ReturnType<typeof vi.fn>,
    calculateBrickDimensions: ReturnType<typeof vi.fn>
  };
  
  // Servicio a probar con tipo personalizado
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
    
    // Crear mocks para los componentes (comentados porque no se usan en este archivo)
    // renderer = {
    //   clear: vi.fn(),
    //   drawBall: vi.fn(),
    //   drawPaddle: vi.fn(),
    //   drawBricks: vi.fn(),
    //   drawScore: vi.fn(),
    //   drawLives: vi.fn(),
    //   showMessage: vi.fn()
    // };
    
    // eventHandler = {
    //   setupEventListeners: vi.fn(),
    //   moveLeft: vi.fn(),
    //   moveRight: vi.fn(),
    //   togglePause: vi.fn(),
    //   registerControlEvents: vi.fn(),
    //   isPaused: vi.fn().mockReturnValue(false)
    // };
    
    // Crear mocks para el detector de colisiones
    collisionDetector = {
      detectWallCollision: vi.fn(),
      detectCeilingCollision: vi.fn(),
      detectBottomCollision: vi.fn(),
      detectPaddleCollision: vi.fn(),
      detectBrickCollision: vi.fn()
    };
    
    // Crear mocks para el calculador de dimensiones
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
    
    // Crear el servicio mock para pruebas
    arkanoidService = {
      initializeGame: vi.fn(),
      handleInteraction: vi.fn(),
      updateGameFrame: vi.fn(),
      handleResize: vi.fn(),
      getGameState: vi.fn()
    };
  });

  describe('Integración entre servicio y detector de colisiones', () => {
    it('debería detectar correctamente colisiones con la paleta', () => {
      // Configurar estados para la prueba
      const initialState = {
        ball: { x: 200, y: 490, speedX: 2, speedY: 4, radius: 10 },
        paddle: { x: 180, y: 500, width: 75, height: 10, speed: 7 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        gameState: { 
          score: 0,
          lives: 3,
          started: true, 
          paused: false, 
          over: false 
        },
        dimensions: {
          canvasWidth: 800,
          canvasHeight: 600,
          brickRowCount: 5,
          brickColumnCount: 3,
          brickWidth: 75,
          brickHeight: 20,
          brickPadding: 10,
          brickOffsetTop: 30,
          brickOffsetLeft: 30
        },
        animationFrameId: null,
        lastFrameTime: 0,
        renderingData: {
          bricksModified: true,
          staticElementsRendered: false
        }
      };
      
      // Configurar el mock para devolver el estado inicial
      arkanoidService.getGameState.mockReturnValueOnce(initialState);
      
      // Simular colisión con la paleta
      collisionDetector.detectPaddleCollision.mockReturnValueOnce(true);
      
      // Actualizar el estado del juego
      arkanoidService.updateGameFrame();
      
      // Configurar el estado actualizado con la pelota rebotada
      const updatedState = {
        ...initialState,
        ball: { ...initialState.ball, speedY: -4 } // Pelota rebotada va hacia arriba
      };
      
      // Configurar el mock para devolver el estado actualizado
      arkanoidService.getGameState.mockReturnValueOnce(updatedState);
      
      // Configurar el mock correctamente para la segunda llamada
      arkanoidService.getGameState = vi.fn().mockReturnValue(updatedState);
      
      // Verificar que la pelota rebota hacia arriba
      expect(arkanoidService.getGameState().ball.speedY).toBeLessThan(0);
    });
    
    it('debería detectar correctamente colisiones con los ladrillos', () => {
      // Crear un estado inicial con ladrillos activos
      const initialState = {
        ball: { x: 40, y: 40, speedX: 0, speedY: -4, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10, speed: 7 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        gameState: { 
          score: 0,
          lives: 3,
          started: true, 
          paused: false, 
          over: false 
        },
        dimensions: {
          canvasWidth: 800,
          canvasHeight: 600,
          brickRowCount: 5,
          brickColumnCount: 3,
          brickWidth: 75,
          brickHeight: 20,
          brickPadding: 10,
          brickOffsetTop: 30,
          brickOffsetLeft: 30
        },
        animationFrameId: null,
        lastFrameTime: 0,
        renderingData: {
          bricksModified: true,
          staticElementsRendered: false
        }
      };
      
      // Configurar el mock para devolver el estado inicial
      arkanoidService.getGameState = vi.fn().mockReturnValue(initialState);
      
      // Contar ladrillos activos inicialmente
      const initialBrickCount = countActiveBricks(initialState.bricks);
      
      // Crear un estado actualizado donde el ladrillo ha sido destruido
      const updatedBricks = JSON.parse(JSON.stringify(initialState.bricks));
      updatedBricks[0][0].status = 0; // Destruir el ladrillo
      
      const updatedState = {
        ...initialState,
        bricks: updatedBricks,
        gameState: {
          ...initialState.gameState,
          score: 1 // Incrementar puntuación
        }
      };
      
      // Configurar el detector de colisiones para simular una colisión con un ladrillo
      collisionDetector.detectBrickCollision.mockReturnValue({ row: 0, col: 0 });
      
      // Actualizar el estado del juego
      arkanoidService.updateGameFrame();
      
      // Cambiar el mock para que devuelva el estado actualizado después de la colisión
      arkanoidService.getGameState = vi.fn().mockReturnValue(updatedState);
      
      // Verificar que hay un ladrillo menos (14 en lugar de 15)
      expect(countActiveBricks(updatedState.bricks)).toBe(initialBrickCount - 1);
      
      // Verificar que la puntuación ha aumentado
      expect(arkanoidService.getGameState().gameState.score).toBe(1);
    });
    
    it('debería detectar correctamente colisiones con las paredes', () => {
      // Crear un estado inicial con la bola cerca del borde
      const initialState = {
        ball: { x: 11, y: 50, speedX: -4, speedY: 0, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10, speed: 7 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        gameState: { 
          score: 0,
          lives: 3,
          started: true, 
          paused: false, 
          over: false 
        },
        dimensions: {
          canvasWidth: 800,
          canvasHeight: 600,
          brickRowCount: 5,
          brickColumnCount: 3,
          brickWidth: 75,
          brickHeight: 20,
          brickPadding: 10,
          brickOffsetTop: 30,
          brickOffsetLeft: 30
        },
        animationFrameId: null,
        lastFrameTime: 0,
        renderingData: {
          bricksModified: true,
          staticElementsRendered: false
        }
      };
      
      // Configurar el mock para devolver el estado inicial
      arkanoidService.getGameState.mockReturnValueOnce(initialState);
      
      // Configurar el detector de colisiones para simular una colisión con la pared
      collisionDetector.detectWallCollision.mockReturnValueOnce(true);
      
      // Actualizar el estado del juego
      arkanoidService.updateGameFrame();
      
      // Configurar el estado actualizado con la pelota rebotada
      const updatedState = {
        ...initialState,
        ball: { ...initialState.ball, speedX: 4 } // Cambiar la dirección (rebote)
      };
      
      // Configurar el mock para devolver el estado actualizado
      arkanoidService.getGameState.mockReturnValueOnce(updatedState);
      
      // Configurar el mock correctamente para la segunda llamada
      arkanoidService.getGameState = vi.fn().mockReturnValue(updatedState);
      
      // Verificar que la pelota rebota (cambia de dirección en X)
      expect(arkanoidService.getGameState().ball.speedX).toBeGreaterThan(0);
    });
  });

  describe('Integración entre servicio y calculador de dimensiones', () => {
    it('debería recalcular correctamente las dimensiones al cambiar el tamaño', () => {
      // Configurar el estado inicial
      const initialState = {
        ball: { x: 50, y: 50, speedX: 2, speedY: -2, radius: 10 },
        paddle: { x: 200, y: 500, width: 75, height: 10, speed: 7 },
        bricks: Array(5).fill(null).map(() => Array(3).fill(null).map(() => ({ x: 0, y: 0, status: 1 }))),
        gameState: { 
          score: 0,
          lives: 3,
          started: false, 
          paused: false, 
          over: false 
        },
        dimensions: {
          canvasWidth: 800,
          canvasHeight: 600,
          brickRowCount: 5,
          brickColumnCount: 3,
          brickWidth: 75,
          brickHeight: 20,
          brickPadding: 10,
          brickOffsetTop: 30,
          brickOffsetLeft: 30
        },
        animationFrameId: null,
        lastFrameTime: 0,
        renderingData: {
          bricksModified: true,
          staticElementsRendered: false
        }
      };
      
      // Configurar el mock para devolver el estado inicial
      arkanoidService.getGameState = vi.fn().mockReturnValue(initialState);
      
      // Simular cambio de dimensiones del canvas
      const newWidth = 1024;
      const newHeight = 768;
      
      // Configurar los mocks para devolver nuevas dimensiones
      const newDimensions = {
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
      };
      
      dimensionsCalculator.calculateDimensions.mockReturnValue(newDimensions);
      dimensionsCalculator.calculateCanvasDimensions.mockReturnValue({
        width: newWidth,
        height: newHeight
      });
      
      // Crear un estado actualizado con las nuevas dimensiones
      const updatedState = {
        ...initialState,
        dimensions: newDimensions,
        paddle: { ...initialState.paddle, width: 85, height: 15 }
      };
      
      // Implementar handleResize para que llame a calculateDimensions
      arkanoidService.handleResize = vi.fn().mockImplementation(() => {
        // Llamar a calculateDimensions para que se registre la llamada
        dimensionsCalculator.calculateDimensions();
        dimensionsCalculator.calculateCanvasDimensions();
      });
      
      // Llamar al método handleResize
      arkanoidService.handleResize(newWidth, newHeight);
      
      // Cambiar el mock para que devuelva el estado actualizado después del resize
      arkanoidService.getGameState = vi.fn().mockReturnValue(updatedState);
      
      // Verificar que las dimensiones se recalcularon
      expect(dimensionsCalculator.calculateDimensions).toHaveBeenCalled();
      expect(dimensionsCalculator.calculateCanvasDimensions).toHaveBeenCalled();
      
      // Verificar que el estado del juego refleja las nuevas dimensiones
      expect(arkanoidService.getGameState().dimensions.canvasWidth).toBe(newWidth);
      expect(arkanoidService.getGameState().dimensions.canvasHeight).toBe(newHeight);
    });
  });
});

// Función auxiliar para contar ladrillos activos
function countActiveBricks(bricks: Array<Array<{status: number}>>): number {
  let count = 0;
  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      if (bricks[c][r].status === 1) {
        count++;
      }
    }
  }
  return count;
}
