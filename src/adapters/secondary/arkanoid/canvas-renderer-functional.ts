/**
 * Implementación funcional del renderizador de canvas para Arkanoid
 * Optimizado para rendimiento con técnicas funcionales
 */

import type {
  Ball,
  Brick,
  Paddle,
} from '../../../core/domain/entities/arkanoid';
import type { CanvasRenderer } from '../../../core/ports/out/arkanoid-ports';
import { memoize } from '../../../core/utils/functional';

/**
 * Factory function para crear un renderizador de canvas optimizado
 * para el juego Arkanoid
 */
export function createCanvasRenderer(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): CanvasRenderer {
  // Paleta de colores para los ladrillos
  const BRICK_COLORS = ['#FF5252', '#FF7043', '#FFCA28', '#66BB6A', '#42A5F5'];

  // Memoización de estilos para evitar cambios de estado innecesarios del contexto
  const setFillStyle = memoize((color: string) => {
    context.fillStyle = color;
    return color;
  });

  // Memoización de fuentes para evitar cambios de estado innecesarios del contexto
  const setFont = memoize((font: string) => {
    context.font = font;
    return font;
  });

  return {
    clear: () => {
      // Limpiar todo el canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
    },

    drawBall: (ball: Ball) => {
      // Dibujar la bola con gradiente para un aspecto más atractivo
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

      // Crear gradiente para la pelota
      const gradient = context.createRadialGradient(
        ball.x - ball.radius / 3,
        ball.y - ball.radius / 3,
        0,
        ball.x,
        ball.y,
        ball.radius,
      );
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(1, '#2196F3');

      context.fillStyle = gradient;
      context.fill();
      context.closePath();
    },

    drawPaddle: (paddle: Paddle) => {
      // Dibujar la paleta con gradiente y bordes redondeados
      const radius = paddle.height / 2;

      // Crear un path redondeado para la paleta
      context.beginPath();
      context.moveTo(paddle.x + radius, paddle.y);
      context.lineTo(paddle.x + paddle.width - radius, paddle.y);
      context.quadraticCurveTo(
        paddle.x + paddle.width,
        paddle.y,
        paddle.x + paddle.width,
        paddle.y + radius,
      );
      context.lineTo(
        paddle.x + paddle.width,
        paddle.y + paddle.height - radius,
      );
      context.quadraticCurveTo(
        paddle.x + paddle.width,
        paddle.y + paddle.height,
        paddle.x + paddle.width - radius,
        paddle.y + paddle.height,
      );
      context.lineTo(paddle.x + radius, paddle.y + paddle.height);
      context.quadraticCurveTo(
        paddle.x,
        paddle.y + paddle.height,
        paddle.x,
        paddle.y + paddle.height - radius,
      );
      context.lineTo(paddle.x, paddle.y + radius);
      context.quadraticCurveTo(paddle.x, paddle.y, paddle.x + radius, paddle.y);
      context.closePath();

      // Crear gradiente para la paleta
      const gradient = context.createLinearGradient(
        paddle.x,
        paddle.y,
        paddle.x,
        paddle.y + paddle.height,
      );
      gradient.addColorStop(0, '#E1F5FE');
      gradient.addColorStop(1, '#0288D1');

      context.fillStyle = gradient;
      context.fill();
    },

    drawBricks: (bricks: Brick[][]) => {
      // Optimización: solo iterar sobre filas y columnas que pueden contener ladrillos
      const columnCount = bricks.length;
      if (columnCount === 0) return;

      const rowCount = bricks[0].length;

      for (let c = 0; c < columnCount; c++) {
        for (let r = 0; r < rowCount; r++) {
          const brick = bricks[c][r];

          // Solo dibujar ladrillos activos
          if (brick.status === 1) {
            // Usar color basado en la fila para una apariencia más atractiva
            const colorIndex = r % BRICK_COLORS.length;
            setFillStyle(BRICK_COLORS[colorIndex]);

            // Calcular dimensiones del ladrillo a partir de la primera fila/columna
            const brickWidth =
              c > 0
                ? bricks[c][r].x - bricks[c - 1][r].x
                : c + 1 < columnCount
                  ? bricks[c + 1][r].x - bricks[c][r].x
                  : 50;

            const brickHeight =
              r > 0
                ? bricks[c][r].y - bricks[c][r - 1].y - 10
                : r + 1 < rowCount
                  ? bricks[c][r + 1].y - bricks[c][r].y - 10
                  : 20;

            // Dibujar el ladrillo con bordes redondeados
            context.beginPath();
            context.roundRect(
              brick.x,
              brick.y,
              brickWidth,
              brickHeight,
              4, // radio para las esquinas redondeadas
            );
            context.fill();
            context.closePath();
          }
        }
      }
    },

    drawScore: (score: number) => {
      setFillStyle('#FFFFFF');
      setFont('16px Arial');
      context.textAlign = 'left';
      context.fillText(`Puntuación: ${score}`, 8, 20);
    },

    drawLives: (lives: number) => {
      setFillStyle('#FFFFFF');
      setFont('16px Arial');
      context.textAlign = 'right';
      context.fillText(`Vidas: ${lives}`, canvas.width - 8, 20);
    },

    showMessage: (message: string, color = '#FFFFFF') => {
      // Mostrar mensaje con fondo semitransparente para legibilidad
      context.globalAlpha = 0.7;
      context.fillStyle = '#000000';
      context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
      context.globalAlpha = 1.0;

      setFillStyle(color);
      setFont('bold 18px Arial');
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(message, canvas.width / 2, canvas.height / 2);
    },
  };
}
