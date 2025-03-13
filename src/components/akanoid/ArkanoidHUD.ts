/**
 * ArkanoidHUD.ts
 * Contiene todas las funciones y lógica relacionadas con el HUD del juego Arkanoid
 */

export class ArkanoidHUD {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private score = 0;
  private lives = 3;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  /**
   * Dibuja la puntuación actual en la esquina superior izquierda
   */
  drawScore(): void {
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#0095DD';
    this.ctx.fillText(`Puntos: ${this.score}`, 8, 20);
  }

  /**
   * Dibuja las vidas restantes en la esquina superior derecha
   */
  drawLives(): void {
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = '#0095DD';
    this.ctx.fillText(`Vidas: ${this.lives}`, this.canvas.width - 80, 20);
  }

  /**
   * Muestra un mensaje en el centro de la pantalla
   * @param text Texto a mostrar
   * @param color Color del texto (opcional)
   */
  showMessage(text: string, color = '#0095DD'): void {
    this.ctx.font = '36px Arial';
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    // Restaurar alineación de texto para no afectar otros textos
    this.ctx.textAlign = 'start';
  }
  
  /**
   * Muestra la pantalla inicial con un mensaje
   * @param message Mensaje a mostrar (opcional)
   */
  showStartScreen(message = 'Toca para comenzar'): void {
    // Limpiar el canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Fondo azul claro para la pantalla inicial
    this.ctx.fillStyle = 'rgba(0, 149, 221, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Mostrar mensaje de inicio
    this.showMessage(message, '#0095DD');
  }

  /**
   * Actualiza la puntuación
   * @param newScore Nueva puntuación
   */
  updateScore(newScore: number): void {
    this.score = newScore;
  }

  /**
   * Obtiene la puntuación actual
   * @returns Puntuación actual
   */
  getScore() {
    return this.score;
  }

  /**
   * Incrementa la puntuación en 1 punto
   */
  incrementScore(): void {
    this.score++;
  }

  /**
   * Actualiza las vidas
   * @param newLives Nuevo número de vidas
   */
  updateLives(newLives: number): void {
    this.lives = newLives;
  }

  /**
   * Obtiene el número de vidas actual
   * @returns Número de vidas
   */
  getLives() {
    return this.lives;
  }

  /**
   * Decrementa las vidas en 1, pero no permite que bajen de 0
   * @returns Vidas restantes
   */
  decrementLives() {
    if (this.lives > 0) {
      this.lives--;
    }
    return this.lives;
  }

  /**
   * Dibuja todos los elementos del HUD
   */
  drawHUD(): void {
    this.drawScore();
    this.drawLives();
  }
  
  /**
   * Actualiza las dimensiones del canvas para ajustar el HUD
   * @param width Nuevo ancho del canvas
   * @param height Nuevo alto del canvas
   */
  updateCanvasSize(width: number, height: number): void {
    // Actualizar las referencias de tamaño del canvas
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Ajustar el tamaño de la fuente según las dimensiones del canvas
    const baseFontSize = Math.max(12, Math.min(16, width / 30));
    const messageFontSize = Math.max(24, Math.min(36, width / 15));
    
    // Actualizar estilos de texto para score y vidas
    this.ctx.font = `${baseFontSize}px Arial`;
    
    // Actualizar estilos para mensajes
    this.ctx.font = `${messageFontSize}px Arial`;
  }
}
