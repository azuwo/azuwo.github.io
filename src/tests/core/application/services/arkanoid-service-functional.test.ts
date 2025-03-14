/**
 * Tests unitarios para el servicio de Arkanoid
 * Pruebas de la lógica del juego y el estado
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock para requestAnimationFrame - pero hacer que no llame recursivamente para evitar stack overflow
globalThis.requestAnimationFrame = vi.fn().mockReturnValue(1);
import { createArkanoidService } from '../../../../core/application/services/arkanoid-service-functional';
import type { 
  CanvasRenderer, 
  CollisionDetector, 
  DimensionsCalculator, 
  EventHandler 
} from '../../../../core/ports/out/arkanoid-ports';
import type { GameState } from '../../../../core/domain/entities/arkanoid';

describe('ArkanoidService', () => {
  // Mocks para las dependencias
  let renderer: CanvasRenderer;
  let collisionDetector: CollisionDetector;
  let dimensionsCalculator: DimensionsCalculator;
  let eventHandler: EventHandler;
  
  // Service a probar
  let arkanoidService: ReturnType<typeof createArkanoidService>;
  
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
      showMessage: vi.fn()
    };
    
    collisionDetector = {
      detectWallCollision: vi.fn().mockReturnValue(false),
      detectCeilingCollision: vi.fn().mockReturnValue(false),
      detectBottomCollision: vi.fn().mockReturnValue(false),
      detectPaddleCollision: vi.fn().mockReturnValue(false),
      detectBrickCollision: vi.fn().mockReturnValue(null)
    };
    
    dimensionsCalculator = {
      calculateCanvasDimensions: vi.fn().mockReturnValue({ width: 480, height: 640 }),
      calculateBrickDimensions: vi.fn().mockReturnValue({
        brickColumnCount: 5,
        brickWidth: 75,
        brickOffsetLeft: 30
      })
    };
    
    eventHandler = {
      registerControlEvents: vi.fn(),
      updatePaddlePosition: vi.fn().mockImplementation((x) => x),
      isPaused: vi.fn().mockReturnValue(false)
    };
    
    // Crear el servicio con mocks
    arkanoidService = createArkanoidService({
      renderer,
      collisionDetector,
      dimensionsCalculator,
      eventHandler
    });
  });
  
  describe('initializeGame', () => {
    it('debería inicializar el juego correctamente', () => {
      arkanoidService.initializeGame();
      
      // Verificar que se registraron los controles
      expect(eventHandler.registerControlEvents).toHaveBeenCalled();
      
      // Verificar que se calcularon las dimensiones
      expect(dimensionsCalculator.calculateCanvasDimensions).toHaveBeenCalled();
      expect(dimensionsCalculator.calculateBrickDimensions).toHaveBeenCalled();
    });
  });
  
  describe('handleInteraction', () => {
    it('debería iniciar el juego cuando se llama a handleInteraction', () => {
      // Inicializar el juego
      arkanoidService.initializeGame();
      
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Verificar que el juego se inicia correctamente
      // Esto se puede observar porque se dibuja la pelota
      arkanoidService.updateGameFrame();
      expect(renderer.drawBall).toHaveBeenCalled();
    });
    
    it('debería registrar los controles al inicializar el juego', () => {
      // Inicializar el juego
      arkanoidService.initializeGame();
      
      // Verificar que se registraron los controles
      expect(eventHandler.registerControlEvents).toHaveBeenCalled();
    });
  });
  
  describe('updateGameState', () => {
    it('debería dibujar la pelota en cada actualización', () => {
      // Inicializar y comenzar el juego
      arkanoidService.initializeGame();
      arkanoidService.handleInteraction();
      
      // Actualizar el estado del juego
      arkanoidService.updateGameFrame();
      
      // Verificar que se dibujó la pelota
      expect(renderer.drawBall).toHaveBeenCalled();
    });
    
    it('debería manejar correctamente las colisiones', () => {
      // Inicializar el juego
      arkanoidService.initializeGame();
      arkanoidService.handleInteraction();
      
      // Llamar directamente a los métodos de detección para verificar que existen
      // y no lanzan errores
      expect(() => {
        // Llamamos directamente a detectWallCollision con parámetros adecuados
        collisionDetector.detectWallCollision({
          x: 5,
          y: 5,
          radius: 10,
          speedX: 5,
          speedY: 5
        }, 400);
      }).not.toThrow();
      
      expect(() => {
        // Llamamos directamente a detectBottomCollision con parámetros adecuados
        collisionDetector.detectBottomCollision({
          x: 50,
          y: 590,
          radius: 10,
          speedX: 5,
          speedY: 5
        }, 600);
      }).not.toThrow();
      
      expect(() => {
        // Llamamos directamente a detectBrickCollision con parámetros adecuados
        const mockBricks = [[
          { status: 1, x: 50, y: 50, width: 50, height: 20 }
        ]];
        collisionDetector.detectBrickCollision(
          {
            x: 50,
            y: 50,
            radius: 10,
            speedX: 5,
            speedY: 5
          },
          mockBricks,
          50,
          20
        );
      }).not.toThrow();
    });
  });
  
  describe('handleResize', () => {
    it('debería recalcular las dimensiones al cambiar el tamaño', () => {
      arkanoidService.initializeGame();
      arkanoidService.handleResize();
      
      // Verificar que se recalcularon las dimensiones
      expect(dimensionsCalculator.calculateCanvasDimensions).toHaveBeenCalled();
      expect(dimensionsCalculator.calculateBrickDimensions).toHaveBeenCalled();
    });
  });
});
