/**
 * Tests unitarios para el detector de colisiones
 * Pruebas de colisión con paredes, ladrillos y paleta
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createCollisionDetector } from '../../../../adapters/secondary/arkanoid/collision-detector-functional';
import type { Ball, Brick, Paddle } from '../../../../core/domain/entities/arkanoid';

describe('CollisionDetector', () => {
  // Inicializar el detector de colisiones y los objetos del juego
  let collisionDetector: ReturnType<typeof createCollisionDetector>;
  let ball: Ball;
  let paddle: Paddle;
  let bricks: Brick[][];
  
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 640;
  const BRICK_WIDTH = 50;
  const BRICK_HEIGHT = 20;
  
  beforeEach(() => {
    // Crear una nueva instancia del detector para cada prueba
    collisionDetector = createCollisionDetector();
    
    // Configurar la pelota, la paleta y los ladrillos con valores iniciales
    ball = {
      x: 240,
      y: 400,
      radius: 10,
      speedX: 4,
      speedY: -4
    };
    
    paddle = {
      x: 200,
      y: 600,
      width: 80,
      height: 15,
      speed: 7
    };
    
    // Configurar una matriz de ladrillos para las pruebas
    bricks = Array(3).fill(0).map((_, colIndex) => 
      Array(2).fill(0).map((_, rowIndex) => ({
        x: colIndex * (BRICK_WIDTH + 10) + 50,
        y: rowIndex * (BRICK_HEIGHT + 10) + 50,
        status: 1
      }))
    );
  });
  
  describe('detectWallCollision', () => {
    it('debería detectar colisión con la pared izquierda', () => {
      ball.x = 5; // Radio es 10, así que esto debería colisionar con la pared izquierda (x=0)
      expect(collisionDetector.detectWallCollision(ball, CANVAS_WIDTH)).toBe(true);
    });
    
    it('debería detectar colisión con la pared derecha', () => {
      ball.x = CANVAS_WIDTH - 5; // Casi al borde derecho
      expect(collisionDetector.detectWallCollision(ball, CANVAS_WIDTH)).toBe(true);
    });
    
    it('no debería detectar colisión con paredes cuando la pelota está en medio', () => {
      ball.x = CANVAS_WIDTH / 2; // Centro del canvas
      expect(collisionDetector.detectWallCollision(ball, CANVAS_WIDTH)).toBe(false);
    });
  });
  
  describe('detectCeilingCollision', () => {
    it('debería detectar colisión con el techo', () => {
      ball.y = 5; // Radio es 10, así que esto debería colisionar con el techo (y=0)
      expect(collisionDetector.detectCeilingCollision(ball)).toBe(true);
    });
    
    it('no debería detectar colisión con el techo cuando la pelota está más abajo', () => {
      ball.y = 50;
      expect(collisionDetector.detectCeilingCollision(ball)).toBe(false);
    });
  });
  
  describe('detectBottomCollision', () => {
    it('debería detectar colisión con el fondo', () => {
      ball.y = CANVAS_HEIGHT - 5;
      expect(collisionDetector.detectBottomCollision(ball, CANVAS_HEIGHT)).toBe(true);
    });
    
    it('no debería detectar colisión con el fondo cuando la pelota está más arriba', () => {
      ball.y = CANVAS_HEIGHT / 2;
      expect(collisionDetector.detectBottomCollision(ball, CANVAS_HEIGHT)).toBe(false);
    });
  });
  
  describe('detectPaddleCollision', () => {
    it('debería detectar colisión con la paleta', () => {
      // Colocar la pelota justo encima de la paleta
      ball.x = paddle.x + paddle.width / 2;
      ball.y = paddle.y - ball.radius;
      
      expect(collisionDetector.detectPaddleCollision(ball, paddle)).toBe(true);
    });
    
    it('no debería detectar colisión cuando la pelota está lejos de la paleta', () => {
      ball.x = paddle.x + paddle.width * 2; // Lejos de la paleta horizontalmente
      ball.y = paddle.y;
      
      expect(collisionDetector.detectPaddleCollision(ball, paddle)).toBe(false);
    });
  });
  
  describe('detectBrickCollision', () => {
    it('debería detectar colisión con un ladrillo activo', () => {
      // Posicionar la pelota para colisionar con el primer ladrillo
      ball.x = bricks[0][0].x + BRICK_WIDTH / 2;
      ball.y = bricks[0][0].y + BRICK_HEIGHT + ball.radius;
      
      const result = collisionDetector.detectBrickCollision(ball, bricks, BRICK_WIDTH, BRICK_HEIGHT);
      
      expect(result).not.toBeNull();
      expect(result?.collided).toBe(true);
      expect(result?.colIndex).toBe(0);
      expect(result?.rowIndex).toBe(0);
    });
    
    it('no debería detectar colisión con un ladrillo destruido', () => {
      // Reiniciar la matriz de ladrillos para cada prueba
      bricks = Array(3).fill(0).map((_, colIndex) => 
        Array(2).fill(0).map((_, rowIndex) => ({
          x: colIndex * (BRICK_WIDTH + 10) + 50,
          y: rowIndex * (BRICK_HEIGHT + 10) + 50,
          status: 1
        }))
      );
      
      // Marcar el ladrillo específico como destruido (status=0)
      bricks[0][0].status = 0;
      
      // Posicionar la pelota para colisionar con el ladrillo destruido
      ball.x = bricks[0][0].x + BRICK_WIDTH / 2;
      ball.y = bricks[0][0].y + BRICK_HEIGHT / 2;
      
      const result = collisionDetector.detectBrickCollision(ball, bricks, BRICK_WIDTH, BRICK_HEIGHT);
      
      // Al estar destruido, no debería detectar colisión
      expect(result).toBeNull();
    });
    
    it('no debería detectar colisión cuando la pelota está lejos de los ladrillos', () => {
      // Posicionar la pelota lejos de los ladrillos
      ball.x = CANVAS_WIDTH / 2;
      ball.y = CANVAS_HEIGHT / 2;
      
      const result = collisionDetector.detectBrickCollision(ball, bricks, BRICK_WIDTH, BRICK_HEIGHT);
      
      expect(result).toBeNull();
    });
  });
});
