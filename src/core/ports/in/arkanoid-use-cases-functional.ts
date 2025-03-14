/**
 * Puertos de entrada (casos de uso) para el juego Arkanoid
 * Siguiendo arquitectura hexagonal y enfoque funcional
 */

export type GameUseCases = {
  // Inicialización del juego
  initializeGame: () => void;
  
  // Control del juego
  startGame: () => void;
  resetGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  
  // Manejo de la paleta
  moveLeft: () => void;
  moveRight: () => void;
  stopMoving: () => void;
  
  // Manejo del bucle del juego
  updateGameFrame: () => void;
  
  // Manejo de interacciones del usuario
  handleInteraction: () => void;
  handleResize: () => void;
};
