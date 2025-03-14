/**
 * Puertos de salida para el juego Arkanoid
 * Siguiendo arquitectura hexagonal y enfoque funcional
 */

import type { Ball, Brick, Paddle } from '../../domain/entities/arkanoid';

export interface CanvasRenderer {
  clear: () => void;
  drawBall: (ball: Ball) => void;
  drawPaddle: (paddle: Paddle) => void;
  drawBricks: (bricks: Brick[][]) => void;
  drawScore: (score: number) => void;
  drawLives: (lives: number) => void;
  showMessage: (message: string, color?: string) => void;
}

export interface CollisionDetector {
  detectWallCollision: (ball: Ball, canvasWidth: number) => boolean;
  detectCeilingCollision: (ball: Ball) => boolean;
  detectPaddleCollision: (ball: Ball, paddle: Paddle) => boolean;
  detectBottomCollision: (ball: Ball, canvasHeight: number) => boolean;
  detectBrickCollision: (
    ball: Ball,
    bricks: Brick[][],
    brickWidth: number,
    brickHeight: number,
  ) => { collided: boolean; colIndex: number; rowIndex: number } | null;
}

export interface DimensionsCalculator {
  calculateCanvasDimensions: () => { width: number; height: number };
  calculateBrickDimensions: (canvasWidth: number) => {
    brickColumnCount: number;
    brickWidth: number;
    brickOffsetLeft: number;
  };
}

export interface EventHandler {
  registerControlEvents: (
    moveLeft: () => void,
    moveRight: () => void,
    stopMoving: () => void,
    handleInteraction: () => void,
    handleResize: () => void,
  ) => void;
  updatePaddlePosition: (currentX: number, canvasWidth: number) => number;
  isPaused: () => boolean;
}
