import { Window } from 'happy-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArkanoidHUD } from '../../../src/components/akanoid/ArkanoidHUD';

describe('ArkanoidHUD', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let hud: ArkanoidHUD;

  beforeEach(() => {
    // Crear una instancia de Window de happy-dom
    const window = new Window();
    const document = window.document;

    // Configurar el canvas y el contexto para las pruebas
    // @ts-ignore - Ignorar errores de tipo para el canvas
    canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 640;

    // Mock para getContext
    ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      rect: vi.fn(),
      fillRect: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: '',
      strokeStyle: '',
      lineWidth: 1,
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 100 }),
    } as unknown as CanvasRenderingContext2D;

    // Crear una instancia de ArkanoidHUD
    hud = new ArkanoidHUD(canvas, ctx);

    // Espiar los métodos del contexto para verificar las llamadas
    vi.spyOn(ctx, 'fillText');
    vi.spyOn(ctx, 'clearRect');
    vi.spyOn(ctx, 'fillRect');
  });

  it('debería inicializarse correctamente con valores por defecto', () => {
    // Definir un tipo para acceder a las propiedades privadas
    type HUDPrivateProps = {
      score: number;
      lives: number;
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
    };

    expect(hud).toBeDefined();
    expect((hud as unknown as HUDPrivateProps).score).toBe(0);
    expect((hud as unknown as HUDPrivateProps).lives).toBe(3);
    expect((hud as unknown as HUDPrivateProps).canvas).toBe(canvas);
    expect((hud as unknown as HUDPrivateProps).ctx).toBe(ctx);
  });

  it('debería actualizar la puntuación correctamente', () => {
    type HUDPrivateProps = { score: number };

    hud.updateScore(100);
    expect((hud as unknown as HUDPrivateProps).score).toBe(100);

    hud.updateScore(150);
    expect((hud as unknown as HUDPrivateProps).score).toBe(150);
  });

  it('debería decrementar vidas correctamente y devolver el número restante', () => {
    type HUDPrivateProps = { lives: number };

    // Inicialmente hay 3 vidas
    expect(hud.decrementLives()).toBe(2);
    expect((hud as unknown as HUDPrivateProps).lives).toBe(2);

    expect(hud.decrementLives()).toBe(1);
    expect((hud as unknown as HUDPrivateProps).lives).toBe(1);

    expect(hud.decrementLives()).toBe(0);
    expect((hud as unknown as HUDPrivateProps).lives).toBe(0);

    // Las vidas no deberían bajar de 0
    expect(hud.decrementLives()).toBe(0);
    expect((hud as unknown as HUDPrivateProps).lives).toBe(0);
  });

  it('debería mostrar un mensaje en el centro del canvas', () => {
    hud.showMessage('Test Message');

    // Verificar que se configuró correctamente el estilo de texto
    expect(ctx.font).toBe('36px Arial');
    expect(ctx.fillStyle).toBe('#0095DD');
    expect(ctx.textAlign).toBe('start'); // Después de mostrar el mensaje, se restaura a 'start'

    // Verificar que se llamó a fillText con los parámetros correctos
    expect(ctx.fillText).toHaveBeenCalledWith('Test Message', canvas.width / 2, canvas.height / 2);
  });

  it('debería mostrar la pantalla inicial con un fondo y mensaje', () => {
    hud.showStartScreen('Pantalla Inicial');

    // Verificar que se limpió el canvas
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);

    // Verificar que se estableció el color de fondo
    // El color puede ser representado de diferentes formas por el navegador
    // así que en lugar de verificar el valor exacto, verificamos que se llamó al método
    expect(ctx.fillStyle).toBe('#0095DD');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);

    // Verificar que se mostró el mensaje
    expect(ctx.fillText).toHaveBeenCalledWith(
      'Pantalla Inicial',
      canvas.width / 2,
      canvas.height / 2,
    );
  });

  it('debería actualizar el tamaño del canvas correctamente', () => {
    type HUDPrivateProps = { canvas: HTMLCanvasElement };

    const newWidth = 800;
    const newHeight = 600;

    hud.updateCanvasSize(newWidth, newHeight);

    expect((hud as unknown as HUDPrivateProps).canvas.width).toBe(newWidth);
    expect((hud as unknown as HUDPrivateProps).canvas.height).toBe(newHeight);
  });

  it('debería dibujar la puntuación y las vidas', () => {
    hud.updateScore(500);

    // Llamar a los métodos que dibujan la puntuación y las vidas
    hud.drawScore();
    hud.drawLives();

    // Verificar que se dibujó la puntuación
    expect(ctx.fillText).toHaveBeenCalledWith('Puntos: 500', 8, 20);

    // Verificar que se dibujaron las vidas
    expect(ctx.fillText).toHaveBeenCalledWith('Vidas: 3', canvas.width - 80, 20);
  });
});
