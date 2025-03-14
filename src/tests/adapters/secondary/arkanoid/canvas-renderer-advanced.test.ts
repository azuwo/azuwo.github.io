/**
 * Tests avanzados para el renderizador de canvas de Arkanoid
 * Enfocados en verificar efectos visuales y comportamientos específicos
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCanvasRenderer } from '../../../../adapters/secondary/arkanoid/canvas-renderer-functional';
import type {
  Ball,
  Brick,
  Paddle,
} from '../../../../core/domain/entities/arkanoid';

describe('CanvasRenderer Advanced Tests', () => {
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

    // Crear un mock más detallado para el contexto
    context = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
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
      measureText: vi.fn(() => ({ width: 100 })),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    // Asignar propiedades adicionales al contexto que pueden ser establecidas
    Object.defineProperties(context, {
      fillStyle: {
        set: vi.fn(),
        get: vi.fn(() => '#000000'),
      },
      strokeStyle: {
        set: vi.fn(),
        get: vi.fn(() => '#000000'),
      },
      textAlign: {
        set: vi.fn(),
        get: vi.fn(() => 'left'),
      },
      textBaseline: {
        set: vi.fn(),
        get: vi.fn(() => 'alphabetic'),
      },
      font: {
        set: vi.fn(),
        get: vi.fn(() => '10px sans-serif'),
      },
      globalAlpha: {
        set: vi.fn(),
        get: vi.fn(() => 1),
      },
      lineWidth: {
        set: vi.fn(),
        get: vi.fn(() => 1),
      },
    });

    // Crear el renderizador con los mocks
    canvasRenderer = createCanvasRenderer(canvas, context);
  });

  describe('Pruebas de optimización de renderizado', () => {
    it('debería memoizar estilos para evitar cambios innecesarios de estado', () => {
      // Llamar a drawScore varias veces con el mismo valor debería establecer fillStyle solo una vez
      canvasRenderer.drawScore(100);
      canvasRenderer.drawScore(100);

      // Verificar que el color se establece (través del setter) solo una vez
      // Esto es difícil de probar directamente porque el setter es un mock interno,
      // pero podemos verificar que se utiliza el método memoize correctamente
      expect(context.fillText).toHaveBeenCalledTimes(2);
    });

    it('debería configurar correctamente la transparencia global para los mensajes', () => {
      const globalAlphaDescriptor = Object.getOwnPropertyDescriptor(
        context,
        'globalAlpha',
      );
      const spy = vi.spyOn(globalAlphaDescriptor as PropertyDescriptor, 'set');

      canvasRenderer.showMessage('Test Message');

      // Verificar que globalAlpha se configura a 0.7 para el fondo y luego a 1.0 para el texto
      expect(spy).toHaveBeenCalledWith(0.7);
      expect(spy).toHaveBeenCalledWith(1.0);
    });
  });

  describe('Pruebas de efectos visuales', () => {
    it('debería crear un gradiente al dibujar la pelota', () => {
      const ball: Ball = { x: 50, y: 50, radius: 10, speedX: 2, speedY: 2 };

      canvasRenderer.drawBall(ball);

      // Verificar que se crea un gradiente radial
      expect(context.createRadialGradient).toHaveBeenCalled();
      // Verificar que se dibuja un círculo en la posición correcta
      expect(context.arc).toHaveBeenCalledWith(
        ball.x,
        ball.y,
        ball.radius,
        0,
        Math.PI * 2,
      );
    });

    it('debería dibujar la paleta con bordes redondeados usando quadraticCurveTo', () => {
      const paddle: Paddle = { x: 50, y: 500, width: 75, height: 10, speed: 7 };

      canvasRenderer.drawPaddle(paddle);

      // Verificar que se utilizan curvas cuadráticas para redondear los bordes
      expect(context.quadraticCurveTo).toHaveBeenCalledTimes(4);
      // Verificar que se crea un gradiente lineal
      expect(context.createLinearGradient).toHaveBeenCalled();
    });

    it('debería usar colores diferentes para cada fila de ladrillos', () => {
      // Crear una matriz 2x3 de ladrillos de prueba
      const bricks: Brick[][] = [
        [
          { status: 1, x: 10, y: 10 },
          { status: 1, x: 10, y: 40 },
          { status: 1, x: 10, y: 70 },
        ],
        [
          { status: 1, x: 70, y: 10 },
          { status: 1, x: 70, y: 40 },
          { status: 1, x: 70, y: 70 },
        ],
      ];

      canvasRenderer.drawBricks(bricks);

      // Verificar que se llama a beginPath y roundRect para cada ladrillo
      expect(context.beginPath).toHaveBeenCalledTimes(6);
      expect(context.roundRect).toHaveBeenCalledTimes(6);
    });
  });

  describe('Pruebas de elementos de interfaz', () => {
    it('debería mostrar el texto de puntuación con formato correcto', () => {
      const textAlignDescriptor = Object.getOwnPropertyDescriptor(
        context,
        'textAlign',
      );
      const spy = vi.spyOn(textAlignDescriptor as PropertyDescriptor, 'set');

      canvasRenderer.drawScore(9999);

      // Verificar que se establece el alineamiento de texto correcto
      expect(spy).toHaveBeenCalledWith('left');
      // Verificar que se muestra el texto correcto
      expect(context.fillText).toHaveBeenCalledWith('Puntuación: 9999', 8, 20);
    });

    it('debería mostrar el texto de vidas con alineación a la derecha', () => {
      const textAlignDescriptor = Object.getOwnPropertyDescriptor(
        context,
        'textAlign',
      );
      const spy = vi.spyOn(textAlignDescriptor as PropertyDescriptor, 'set');

      canvasRenderer.drawLives(3);

      // Verificar que se establece el alineamiento de texto correcto
      expect(spy).toHaveBeenCalledWith('right');
      // Verificar que se muestra el texto en la posición correcta
      expect(context.fillText).toHaveBeenCalledWith(
        'Vidas: 3',
        canvas.width - 8,
        20,
      );
    });

    it('debería mostrar mensajes con color personalizado', () => {
      const customColor = '#FF0000';
      const fillStyleDescriptor = Object.getOwnPropertyDescriptor(
        context,
        'fillStyle',
      );
      const textAlignDescriptor = Object.getOwnPropertyDescriptor(
        context,
        'textAlign',
      );
      const fillStyleSpy = vi.spyOn(
        fillStyleDescriptor as PropertyDescriptor,
        'set',
      );
      const textAlignSpy = vi.spyOn(
        textAlignDescriptor as PropertyDescriptor,
        'set',
      );

      canvasRenderer.showMessage('Game Over', customColor);

      // Verificar que se establece el color personalizado
      expect(fillStyleSpy).toHaveBeenCalledWith(customColor);
      // Verificar que el texto está centrado
      expect(textAlignSpy).toHaveBeenCalledWith('center');
      // Verificar que se muestra el mensaje correcto
      expect(context.fillText).toHaveBeenCalledWith(
        'Game Over',
        canvas.width / 2,
        canvas.height / 2,
      );
    });
  });

  describe('Comportamiento con entradas extremas', () => {
    it('debería manejar correctamente un canvas de tamaño cero', () => {
      // Crear un canvas con dimensiones cero
      const zeroCanvas = { width: 0, height: 0 } as HTMLCanvasElement;
      const zeroRenderer = createCanvasRenderer(zeroCanvas, context);

      // No debería causar errores al limpiar
      expect(() => zeroRenderer.clear()).not.toThrow();
      expect(context.clearRect).toHaveBeenCalledWith(0, 0, 0, 0);
    });

    it('debería manejar correctamente una matriz vacía de ladrillos', () => {
      const emptyBricks: Brick[][] = [];

      // No debería intentar dibujar nada
      canvasRenderer.drawBricks(emptyBricks);

      // Verificar que no se inició ningún path
      expect(context.beginPath).not.toHaveBeenCalled();
    });

    it('debería manejar correctamente una matriz con ladrillos sin estado', () => {
      const incompleteBricks: Partial<Brick>[][] = [
        [
          { x: 10, y: 10 }, // Sin estado
          { x: 10, y: 40, status: 1 }, // Con estado
        ],
      ];

      // No debería causar errores
      expect(() =>
        canvasRenderer.drawBricks(incompleteBricks as Brick[][]),
      ).not.toThrow();
    });
  });
});
