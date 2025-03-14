/**
 * Entidades del dominio para el juego Arkanoid
 */

export type Ball = {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
};

export type Paddle = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
};

export type Brick = {
  x: number;
  y: number;
  status: number;
};

export type GameState = {
  score: number;
  lives: number;
  started: boolean;
  over: boolean;
  paused: boolean;
};

export type GameDimensions = {
  canvasWidth: number;
  canvasHeight: number;
  brickRowCount: number;
  brickColumnCount: number;
  brickWidth: number;
  brickHeight: number;
  brickPadding: number;
  brickOffsetTop: number;
  brickOffsetLeft: number;
};
