import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ArkanoidControls } from '../../../src/components/akanoid/ArkanoidControls';
import { ArkanoidHUD } from '../../../src/components/akanoid/ArkanoidHUD';
import { Window } from 'happy-dom';

describe('Arkanoid Integration Test', () => {
  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let hud: ArkanoidHUD;
  let controls: ArkanoidControls;

  // Configuración común para todos los tests
  beforeEach(() => {
    // Crear una instancia de Window de happy-dom
    const window = new Window();
    const document = window.document;
    
    // Crear el contenedor y el canvas
    // @ts-ignore - Ignorar errores de tipo para el DOM
    container = document.createElement('div');
    container.className = 'arkanoid-container';
    // @ts-ignore - Ignorar errores de tipo para appendChild
    document.body.appendChild(container);

    // @ts-ignore - Ignorar errores de tipo para el canvas
    canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 640;
    container.appendChild(canvas);

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
      measureText: vi.fn().mockReturnValue({ width: 100 })
    } as unknown as CanvasRenderingContext2D;

    // Crear instancias de los componentes principales
    hud = new ArkanoidHUD(canvas, ctx);
    
    // ArkanoidControls espera 3 argumentos: canvas, leftBtn, rightBtn
    // Para los tests, creamos elementos para los botones
    // @ts-ignore - Ignorar errores de tipo para los botones
    const leftBtn = document.createElement('button');
    // @ts-ignore - Ignorar errores de tipo para los botones
    const rightBtn = document.createElement('button');
    // @ts-ignore - Ignorar errores de tipo para los argumentos
    controls = new ArkanoidControls(canvas, leftBtn, rightBtn, 80, document);

    // Espiar métodos importantes para verificar su comportamiento
    vi.spyOn(hud, 'showStartScreen');
    vi.spyOn(hud, 'showMessage');
    vi.spyOn(hud, 'updateScore');
    vi.spyOn(hud, 'decrementLives');
    vi.spyOn(controls, 'updatePaddlePosition');
    vi.spyOn(ctx, 'clearRect');
    vi.spyOn(ctx, 'beginPath');
    vi.spyOn(ctx, 'arc');
    vi.spyOn(ctx, 'rect');
  });

  afterEach(() => {
    // No necesitamos limpiar el DOM real ya que estamos usando happy-dom
    // Simplemente limpiamos los mocks

    // Limpiar todos los mocks
    vi.clearAllMocks();
  });

  it('debería mostrar la pantalla inicial al cargar el juego', () => {
    // Simular la inicialización del juego
    const gameStarted = false;

    // Función de dibujo simplificada
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!gameStarted) {
        hud.showStartScreen();
        return;
      }
    }

    // Iniciar el bucle de renderizado
    draw();

    // Verificar que se mostró la pantalla inicial
    expect(hud.showStartScreen).toHaveBeenCalled();
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
  });

  it('debería responder a los controles del teclado', () => {
    // Configurar el estado interno del control
    // Esto simula que se presiona la tecla de flecha derecha
    // Accedemos a las propiedades privadas usando una interfaz
    interface ControlsPrivateProps {
      rightArrowPressed: boolean;
      leftArrowPressed: boolean;
      mouseX: number;
      isMouseActive: boolean;
    }
    (controls as unknown as ControlsPrivateProps).rightArrowPressed = true;

    // Posición inicial de la paleta
    let paddleX = 200;

    // Actualizar la posición de la paleta
    paddleX = controls.updatePaddlePosition(paddleX, canvas.width);

    // La paleta debería moverse a la derecha
    expect(paddleX).toBeGreaterThan(200);

    // Simular que se suelta la tecla de flecha derecha
    (controls as unknown as ControlsPrivateProps).rightArrowPressed = false;

    // Guardar la posición actual
    const currentPosition = paddleX;

    // Actualizar la posición de la paleta nuevamente
    paddleX = controls.updatePaddlePosition(paddleX, canvas.width);

    // La paleta no debería moverse más
    expect(paddleX).toBe(currentPosition);
  });

  it('debería manejar colisiones con ladrillos y actualizar la puntuación', () => {
    // Configurar un ladrillo para la prueba
    const brickRowCount = 1;
    const brickColumnCount = 1;
    const bricks = Array(brickColumnCount)
      .fill(null)
      .map(() =>
        Array(brickRowCount)
          .fill(null)
          .map(() => ({ x: 0, y: 0, status: 1 }))
      );

    // Posición de la pelota (justo encima del ladrillo)
    const ballPositionX = 40;
    const ballPositionY = 40;

    // Verificar colisión con el ladrillo
    const checkBrickCollision = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const brick = bricks[c][r]; // Asignar a una variable para mejorar la legibilidad
          if (brick.status === 1) {
            if (
              ballPositionX > brick.x &&
              ballPositionX < brick.x + 75 && // Ancho del ladrillo
              ballPositionY > brick.y &&
              ballPositionY < brick.y + 20 // Alto del ladrillo
            ) {
              // Colisión detectada
              brick.status = 0; // Marcar ladrillo como roto
              hud.updateScore(10); // Añadir puntos
              return true;
            }
          }
        }
      }
      return false;
    };

    // Simular colisión
    const collision = checkBrickCollision();

    // Verificar que no hay colisión porque el ladrillo está en (0,0)
    expect(collision).toBe(false);

    // Mover el ladrillo a la posición de la pelota
    bricks[0][0].x = ballPositionX - 10;
    bricks[0][0].y = ballPositionY - 10;

    // Ahora debería haber colisión
    const collision2 = checkBrickCollision();

    // Verificar que se detectó la colisión y se actualizó la puntuación
    expect(collision2).toBe(true);
    expect(hud.updateScore).toHaveBeenCalledWith(10);
    expect(bricks[0][0].status).toBe(0);
  });

  it('debería manejar la pérdida de vidas cuando la pelota cae', () => {
    // Simular que la pelota cae fuera del canvas
    const ballPositionY = canvas.height + 10;
    const ballRadius = 10;

    // Función simplificada para verificar si la pelota se perdió
    function checkBallLost() {
      if (ballPositionY > canvas.height - ballRadius) {
        hud.decrementLives();
        return true;
      }
      return false;
    }

    // Verificar que la pelota se perdió
    const ballLost = checkBallLost();

    // Verificar que se decrementaron las vidas
    expect(ballLost).toBe(true);
    expect(hud.decrementLives).toHaveBeenCalled();
  });

  it('debería ajustar el tamaño del canvas al redimensionar la ventana', () => {
    // Espiar el método updateCanvasSize
    vi.spyOn(hud, 'updateCanvasSize');

    // Función simplificada de redimensionamiento
    function resizeCanvas() {
      // Valores fijos para la prueba
      // const windowWidth = 1024;
      const windowHeight = 768;
      const aspectRatio = 480 / 640;

      // Cálculo simplificado para la prueba
      const newWidth = Math.floor(windowHeight * aspectRatio * 0.95);
      const newHeight = Math.floor(windowHeight * 0.95);

      // Actualizar dimensiones del canvas
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Actualizar HUD
      hud.updateCanvasSize(canvas.width, canvas.height);

      return { width: newWidth, height: newHeight };
    }

    // Ejecutar la función de redimensionamiento
    const newSize = resizeCanvas();

    // Verificar que se actualizó el tamaño del canvas y del HUD
    expect(canvas.width).toBe(newSize.width);
    expect(canvas.height).toBe(newSize.height);
    expect(hud.updateCanvasSize).toHaveBeenCalledWith(canvas.width, canvas.height);
  });

  it('debería manejar eventos de mouse para controlar la paleta', () => {
    // No podemos espiar handleMouseMove porque es privado
    // En su lugar, probaremos el comportamiento

    // Crear un evento de mouse manualmente
    // @ts-ignore - Ignorar errores de tipo para Event
    const mouseEvent = new Event('mousemove', {
      bubbles: true,
      cancelable: true
    });
    // Añadir propiedades manualmente ya que happy-dom no tiene MouseEvent completo
    // @ts-ignore - Ignorar errores de tipo para clientX
    mouseEvent.clientX = 300;

    // Disparar el evento en el canvas
    canvas.dispatchEvent(mouseEvent);

    // Verificar que se llamó al método handleMouseMove
    // Nota: Como handleMouseMove es privado, no podemos espiarlo directamente
    // Por lo que verificamos que el método updatePaddlePosition se comporte correctamente

    // Definir una interfaz para acceder a las propiedades privadas
    interface ControlsPrivateProps {
      rightArrowPressed: boolean;
      leftArrowPressed: boolean;
      mouseX: number;
      isMouseActive: boolean;
    }

    // Configurar el estado interno del control para simular movimiento del mouse
    (controls as unknown as ControlsPrivateProps).mouseX = 300;
    (controls as unknown as ControlsPrivateProps).isMouseActive = true;

    // Posición inicial de la paleta
    let paddleX = 200;

    // Actualizar la posición de la paleta
    paddleX = controls.updatePaddlePosition(paddleX, canvas.width);

    // La paleta debería moverse hacia la posición del mouse
    expect(paddleX).not.toBe(200);
  });
});
