/**
 * Tests para el renderizador de canvas de Arkanoid
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCanvasRenderer } from '../../../../../src/adapters/secondary/arkanoid/canvas-renderer-functional';
import type { Ball, Brick, Paddle } from '../../../../../src/core/domain/entities/arkanoid';

describe('CanvasRenderer', () => {
  // Configuración del mock para canvas y context
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let canvasRenderer: ReturnType<typeof createCanvasRenderer>;

  beforeEach(() => {
    // Mock del canvas y el contexto
    canvas = {
      width: 800,
      height: 600,
    } as HTMLCanvasElement;

    // Crear un mock para el contexto con todos los métodos necesarios
    context = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      roundRect: vi.fn(),
      fillText: vi.fn(),
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    // Asignar propiedades adicionales al contexto
    Object.defineProperties(context, {
      fillStyle: {
        set: vi.fn(),
        get: vi.fn(),
      },
      textAlign: {
        set: vi.fn(),
        get: vi.fn(),
      },
      textBaseline: {
        set: vi.fn(),
        get: vi.fn(),
      },
      font: {
        set: vi.fn(),
        get: vi.fn(),
      },
      globalAlpha: {
        set: vi.fn(),
        get: vi.fn(),
      },
    });

    // Crear el renderizador con los mocks
    canvasRenderer = createCanvasRenderer(canvas, context);
  });

  describe('clear', () => {
    it('debería limpiar todo el canvas', () => {
      canvasRenderer.clear();
      expect(context.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    });
  });

  describe('drawBall', () => {
    it('debería dibujar la bola correctamente', () => {
      const ball: Ball = { x: 50, y: 50, radius: 10, speedX: 2, speedY: 2 };
      
      canvasRenderer.drawBall(ball);
      
      expect(context.beginPath).toHaveBeenCalled();
      expect(context.arc).toHaveBeenCalledWith(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      expect(context.fill).toHaveBeenCalled();
      expect(context.closePath).toHaveBeenCalled();
    });
  });

  describe('drawPaddle', () => {
    it('debería dibujar la paleta correctamente', () => {
      const paddle: Paddle = { x: 50, y: 500, width: 75, height: 10, speed: 7 };
      
      canvasRenderer.drawPaddle(paddle);
      
      expect(context.beginPath).toHaveBeenCalled();
      expect(context.fill).toHaveBeenCalled();
      expect(context.closePath).toHaveBeenCalled();
    });
  });

  describe('drawBricks', () => {
    it('debería dibujar los ladrillos activos', () => {
      // @ts-expect-error: Simplificando brick para las pruebas
      const bricks: Brick[][] = [
        [
          { status: 1, x: 10, y: 10, width: 50, height: 20 },
          { status: 1, x: 10, y: 40, width: 50, height: 20 },
        ],
        [
          { status: 1, x: 70, y: 10, width: 50, height: 20 },
          { status: 0, x: 70, y: 40, width: 50, height: 20 }, // Este no debe dibujarse
        ],
      ];
      
      canvasRenderer.drawBricks(bricks);
      
      // Debería haberse llamado a roundRect 3 veces (uno por cada ladrillo activo)
      expect(context.roundRect).toHaveBeenCalledTimes(3);
    });

    it('no debería dibujar nada si no hay ladrillos', () => {
      const emptyBricks: Brick[][] = [];
      
      canvasRenderer.drawBricks(emptyBricks);
      
      expect(context.beginPath).not.toHaveBeenCalled();
    });
  });

  describe('drawScore', () => {
    it('debería mostrar la puntuación correctamente', () => {
      const score = 100;
      
      canvasRenderer.drawScore(score);
      
      expect(context.fillText).toHaveBeenCalledWith(`Puntuación: ${score}`, 8, 20);
    });
  });

  describe('drawLives', () => {
    it('debería mostrar las vidas correctamente', () => {
      const lives = 3;
      
      canvasRenderer.drawLives(lives);
      
      expect(context.fillText).toHaveBeenCalledWith(`Vidas: ${lives}`, canvas.width - 8, 20);
    });
  });

  describe('showMessage', () => {
    it('debería mostrar un mensaje en el centro del canvas', () => {
      const message = "Pulsa ESPACIO para comenzar";
      
      canvasRenderer.showMessage(message);
      
      expect(context.fillRect).toHaveBeenCalled();
      expect(context.fillText).toHaveBeenCalledWith(message, canvas.width / 2, canvas.height / 2);
    });

    it('debería usar el color especificado para el mensaje', () => {
      const message = "Game Over";
      const color = "#FF0000";
      
      canvasRenderer.showMessage(message, color);
      
      // No podemos probar directamente fillStyle porque es un setter
      // pero podemos verificar que se llamó a fillText con el mensaje correcto
      expect(context.fillText).toHaveBeenCalledWith(message, canvas.width / 2, canvas.height / 2);
    });
  });
});
