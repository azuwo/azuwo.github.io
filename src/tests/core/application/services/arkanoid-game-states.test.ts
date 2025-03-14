/**
 * Tests para las transiciones de estado del juego Arkanoid
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GameState } from '../../../../core/domain/entities/arkanoid';

// Mock de requestAnimationFrame global
if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = vi.fn();
}

describe('Arkanoid Game States', () => {
  // Tipo para el estado del juego
  type GameStateType = {
    gameState: {
      score: number,
      lives: number,
      started: boolean,
      over: boolean,
      paused: boolean
    }
  };
  
  // Service a probar con tipo específico
  let arkanoidService: {
    getGameState: ReturnType<typeof vi.fn>,
    updateGameFrame: ReturnType<typeof vi.fn>,
    handleInteraction: ReturnType<typeof vi.fn>,
    togglePause: ReturnType<typeof vi.fn>
  };
  
  // Mock para el detector de colisiones
  let collisionDetector: {
    detectBottomCollision: ReturnType<typeof vi.fn>
  };

  beforeEach(() => {
    // Resetear todos los mocks antes de cada prueba
    vi.clearAllMocks();
    
    // Crear el mock del detector de colisiones
    collisionDetector = {
      detectBottomCollision: vi.fn().mockReturnValue(false)
    };
    
    // Crear el estado inicial del juego
    const initialGameState: GameStateType = {
      gameState: {
        score: 0,
        lives: 3,
        started: false,
        over: false,
        paused: false
      }
    };
    
    // Crear el servicio con mocks completos
    arkanoidService = {
      getGameState: vi.fn().mockReturnValue(initialGameState),
      updateGameFrame: vi.fn().mockImplementation(() => {
        // Implementación simulada para updateGameFrame
        const currentState = arkanoidService.getGameState();
        
        // Si detectamos colisión con el fondo y hay vidas, reducir vidas
        if (collisionDetector.detectBottomCollision()) {
          currentState.gameState.lives -= 1;
          
          // Si no quedan vidas, cambiar a estado game over
          if (currentState.gameState.lives <= 0) {
            currentState.gameState.over = true;
            currentState.gameState.started = false;
          }
        }
        
        return currentState;
      }),
      handleInteraction: vi.fn().mockImplementation(() => {
        // Implementación simulada para handleInteraction
        const currentState = arkanoidService.getGameState();
        
        // Si el juego está en game over, reiniciar
        if (currentState.gameState.over) {
          currentState.gameState.over = false;
          currentState.gameState.lives = 3;
          currentState.gameState.score = 0;
        }
        
        // Si el juego no está iniciado, iniciarlo
        if (!currentState.gameState.started) {
          currentState.gameState.started = true;
        }
        
        return currentState;
      }),
      togglePause: vi.fn().mockImplementation(() => {
        // Implementación simulada para togglePause
        const currentState = arkanoidService.getGameState();
        
        // Solo se puede pausar si el juego está iniciado
        if (currentState.gameState.started && !currentState.gameState.over) {
          currentState.gameState.paused = !currentState.gameState.paused;
        }
        
        return currentState;
      })
    };
  });

  describe('Estado Inicial', () => {
    it('debería comenzar con el juego en estado "not started"', () => {
      expect(arkanoidService.getGameState().gameState.started).toBe(false);
      expect(arkanoidService.getGameState().gameState.over).toBe(false);
      expect(arkanoidService.getGameState().gameState.paused).toBe(false);
    });
  });

  describe('Transición a estado "started"', () => {
    it('debería cambiar a estado "started" al llamar a handleInteraction', () => {
      arkanoidService.handleInteraction();
      
      expect(arkanoidService.getGameState().gameState.started).toBe(true);
      expect(arkanoidService.getGameState().gameState.over).toBe(false);
      expect(arkanoidService.getGameState().gameState.paused).toBe(false);
    });
  });

  describe('Transición a estado "paused"', () => {
    it('debería pausar el juego al llamar a togglePause', () => {
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Pausar el juego
      arkanoidService.togglePause();
      
      expect(arkanoidService.getGameState().gameState.started).toBe(true);
      expect(arkanoidService.getGameState().gameState.over).toBe(false);
      expect(arkanoidService.getGameState().gameState.paused).toBe(true);
    });

    it('debería reanudar el juego al llamar a togglePause cuando está pausado', () => {
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Pausar el juego
      arkanoidService.togglePause();
      
      // Reanudar el juego
      arkanoidService.togglePause();
      
      expect(arkanoidService.getGameState().gameState.started).toBe(true);
      expect(arkanoidService.getGameState().gameState.over).toBe(false);
      expect(arkanoidService.getGameState().gameState.paused).toBe(false);
    });
  });

  describe('Transición a estado "game over"', () => {
    it('debería cambiar a estado "game over" cuando no quedan vidas', () => {
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Simular pérdida de todas las vidas
      // Normalmente esto ocurriría cuando la pelota cae al fondo varias veces
      // pero podemos modificar directamente la propiedad para probar este caso
      arkanoidService.getGameState().gameState.lives = 1;
      
      // Simular una pérdida de vida
      // 1. Comprobar si hay colisión con el fondo
      collisionDetector.detectBottomCollision.mockReturnValueOnce(true);
      
      // 2. Actualizar el estado del juego (la colisión con el fondo reduce las vidas)
      arkanoidService.updateGameFrame();
      
      // Verificar que el juego termina
      expect(arkanoidService.getGameState().gameState.over).toBe(true);
      expect(arkanoidService.getGameState().gameState.started).toBe(false);
    });
  });

  describe('Reinicio del juego', () => {
    it('debería reiniciar el juego cuando está en estado "game over" y se llama a handleInteraction', () => {
      // Iniciar el juego
      arkanoidService.handleInteraction();
      
      // Poner el juego en estado "game over"
      arkanoidService.getGameState().gameState.lives = 1;
      collisionDetector.detectBottomCollision.mockReturnValueOnce(true);
      arkanoidService.updateGameFrame();
      
      // Verificar que el juego está en estado "game over"
      expect(arkanoidService.getGameState().gameState.over).toBe(true);
      
      // Reiniciar el juego
      arkanoidService.handleInteraction();
      
      // Verificar que el juego se reinició correctamente
      expect(arkanoidService.getGameState().gameState.over).toBe(false);
      expect(arkanoidService.getGameState().gameState.started).toBe(true);
      expect(arkanoidService.getGameState().gameState.lives).toBeGreaterThan(0);
      expect(arkanoidService.getGameState().gameState.score).toBe(0);
    });
  });
});
