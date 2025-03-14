/**
 * Implementación funcional del detector de colisiones para Arkanoid
 * Optimizado con memoización y técnicas funcionales
 */

import type { Ball, Brick, Paddle } from "../../../core/domain/entities/arkanoid";
import type { CollisionDetector } from "../../../core/ports/out/arkanoid-ports";
import { memoize } from "../../../core/utils/functional";

/**
 * Factory function para crear un detector de colisiones
 * con optimizaciones de rendimiento
 */
export const createCollisionDetector = (): CollisionDetector => {
  // Memoización de cálculos repetitivos para mejorar rendimiento
  const calculateBallBounds = memoize((ball: Ball) => {
    return {
      left: ball.x - ball.radius,
      right: ball.x + ball.radius,
      top: ball.y - ball.radius,
      bottom: ball.y + ball.radius
    };
  });

  // Implementación del detector de colisiones
  return {
    detectWallCollision: (ball: Ball, canvasWidth: number): boolean => {
      const bounds = calculateBallBounds(ball);
      return bounds.left <= 0 || bounds.right >= canvasWidth;
    },

    detectCeilingCollision: (ball: Ball): boolean => {
      const bounds = calculateBallBounds(ball);
      return bounds.top <= 0;
    },

    detectBottomCollision: (ball: Ball, canvasHeight: number): boolean => {
      const bounds = calculateBallBounds(ball);
      return bounds.bottom >= canvasHeight;
    },

    detectPaddleCollision: (ball: Ball, paddle: Paddle): boolean => {
      const bounds = calculateBallBounds(ball);
      
      return (
        bounds.bottom >= paddle.y &&
        bounds.top <= paddle.y + paddle.height &&
        bounds.right >= paddle.x &&
        bounds.left <= paddle.x + paddle.width
      );
    },

    detectBrickCollision: (
      ball: Ball,
      bricks: Brick[][],
      brickWidth: number,
      brickHeight: number
    ) => {
      // Implementación optimizada con early returns
      const bounds = calculateBallBounds(ball);
      
      // Buscamos algún ladrillo activo con el que colisione la bola
      for (let colIndex = 0; colIndex < bricks.length; colIndex++) {
        for (let rowIndex = 0; rowIndex < bricks[colIndex].length; rowIndex++) {
          const brick = bricks[colIndex][rowIndex];
          
          // Verificar primero si el ladrillo está activo (status=1)
          if (brick.status === 1) {
            // Verificar colisión entre bola y ladrillo
            if (
              bounds.right >= brick.x &&
              bounds.left <= brick.x + brickWidth &&
              bounds.bottom >= brick.y &&
              bounds.top <= brick.y + brickHeight
            ) {
              return { collided: true, colIndex, rowIndex };
            }
          }
        }
      }
      
      // No se detectó colisión
      return null;
    }
  };
};
