/**
 * ArkanoidControls.ts
 * Gestiona todos los controles del juego Arkanoid (teclado, ratón, táctil)
 */

export class ArkanoidControls {
  private canvas: HTMLCanvasElement;
  private leftBtn: HTMLElement;
  private rightBtn: HTMLElement;
  private paddleWidth: number;
  private doc: Document;

  // Estado de los controles
  private rightArrowPressed = false;
  private leftArrowPressed = false;
  private isPaused = false;
  private spacePressed = false;

  /**
   * Constructor de la clase de controles
   * @param canvas Elemento canvas del juego
   * @param leftBtn Botón izquierdo para móviles
   * @param rightBtn Botón derecho para móviles
   * @param paddleWidth Ancho de la paleta (necesario para calcular posición)
   */
  constructor(
    canvas: HTMLCanvasElement,
    leftBtn: HTMLElement,
    rightBtn: HTMLElement,
    paddleWidth: number,
    doc?: Document,
  ) {
    this.canvas = canvas;
    this.leftBtn = leftBtn;
    this.rightBtn = rightBtn;
    this.paddleWidth = paddleWidth;
    this.doc = doc || document;

    // Inicializar todos los eventos
    this.setupEventListeners();
  }

  /**
   * Configura todos los event listeners
   */
  private setupEventListeners(): void {
    // Eventos de teclado
    this.doc.addEventListener('keydown', this.keyDownHandler.bind(this));
    this.doc.addEventListener('keyup', this.keyUpHandler.bind(this));

    // Eventos táctiles para móviles
    this.leftBtn.addEventListener('touchstart', this.handleLeftButtonDown.bind(this));
    this.leftBtn.addEventListener('touchend', this.handleLeftButtonUp.bind(this));
    this.rightBtn.addEventListener('touchstart', this.handleRightButtonDown.bind(this));
    this.rightBtn.addEventListener('touchend', this.handleRightButtonUp.bind(this));

    // También soportar clicks para pruebas en desktop
    this.leftBtn.addEventListener('mousedown', this.handleLeftButtonDown.bind(this));
    this.leftBtn.addEventListener('mouseup', this.handleLeftButtonUp.bind(this));
    this.rightBtn.addEventListener('mousedown', this.handleRightButtonDown.bind(this));
    this.rightBtn.addEventListener('mouseup', this.handleRightButtonUp.bind(this));

    // Soporte para touch y mouse en el canvas
    this.canvas.addEventListener('touchmove', this.touchMoveHandler.bind(this), { passive: false });
    this.canvas.addEventListener('mousemove', this.mouseMoveHandler.bind(this));
  }

  /**
   * Maneja eventos de tecla presionada
   */
  private keyDownHandler(e: KeyboardEvent): void {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      this.rightArrowPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      this.leftArrowPressed = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      // Evitar múltiples pulsaciones manteniendo la tecla
      if (!this.spacePressed) {
        this.spacePressed = true;
        this.isPaused = !this.isPaused; // Alternar estado de pausa
      }
    }
  }

  /**
   * Maneja eventos de tecla liberada
   */
  private keyUpHandler(e: KeyboardEvent): void {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
      this.rightArrowPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
      this.leftArrowPressed = false;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      this.spacePressed = false;
    }
  }

  // Variable para almacenar la posición del ratón
  private mouseX: number = null;

  /**
   * Maneja eventos de movimiento del ratón
   */
  private mouseMoveHandler(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mousePositionX = e.clientX - rect.left;

    // Guardar la posición del ratón si está dentro del canvas
    if (mousePositionX > 0 && mousePositionX < this.canvas.width) {
      this.mouseX = mousePositionX;
    }
  }

  /**
   * Maneja eventos de movimiento táctil
   */
  private touchMoveHandler(e: TouchEvent): void {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touchPositionX = e.touches[0].clientX - rect.left;

    // Guardar la posición del toque si está dentro del canvas
    if (touchPositionX > 0 && touchPositionX < this.canvas.width) {
      this.mouseX = touchPositionX; // Usamos la misma variable que para el ratón
    }
  }

  /**
   * Maneja el evento de presionar el botón izquierdo
   */
  private handleLeftButtonDown(): void {
    this.leftArrowPressed = true;
  }

  /**
   * Maneja el evento de soltar el botón izquierdo
   */
  private handleLeftButtonUp(): void {
    this.leftArrowPressed = false;
  }

  /**
   * Maneja el evento de presionar el botón derecho
   */
  private handleRightButtonDown(): void {
    this.rightArrowPressed = true;
  }

  /**
   * Maneja el evento de soltar el botón derecho
   */
  private handleRightButtonUp(): void {
    this.rightArrowPressed = false;
  }

  /**
   * Comprueba si la flecha derecha está presionada
   */
  isRightPressed(): boolean {
    return this.rightArrowPressed;
  }

  /**
   * Comprueba si la flecha izquierda está presionada
   */
  isLeftPressed(): boolean {
    return this.leftArrowPressed;
  }

  /**
   * Comprueba si el juego está pausado
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * Establece el estado de pausa
   */
  setPausedState(paused: boolean): void {
    this.isPaused = paused;
  }

  /**
   * Actualiza la posición de la paleta según los controles
   * @param currentPaddleX Posición actual de la paleta
   * @param canvasWidth Ancho del canvas
   * @param paddleSpeed Velocidad de movimiento de la paleta
   * @returns Nueva posición X de la paleta
   */
  updatePaddlePosition(currentPaddleX: number, canvasWidth: number, paddleSpeed = 7): number {
    let newPosition = currentPaddleX;

    // Si hay una posición de ratón/touch válida, usarla con prioridad
    if (this.mouseX !== null) {
      // Calcular la nueva posición basándose en el ratón/touch
      newPosition = this.mouseX - this.paddleWidth / 2;

      // Limitar la posición dentro del canvas
      if (newPosition < 0) {
        newPosition = 0;
      } else if (newPosition > canvasWidth - this.paddleWidth) {
        newPosition = canvasWidth - this.paddleWidth;
      }

      // Reiniciar la posición del ratón para que no se siga usando
      // a menos que el usuario mueva el ratón de nuevo
      this.mouseX = null;
    } else {
      // Si no hay posición de ratón, usar los controles de teclado
      if (this.rightArrowPressed && currentPaddleX < canvasWidth - this.paddleWidth) {
        newPosition += paddleSpeed;
      } else if (this.leftArrowPressed && currentPaddleX > 0) {
        newPosition -= paddleSpeed;
      }
    }

    return newPosition;
  }
}
