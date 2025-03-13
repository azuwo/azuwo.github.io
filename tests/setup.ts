// Configuración global para los tests
import { vi, beforeAll, afterAll } from 'vitest';
import { Window } from 'happy-dom';

// Configurar el entorno global para simular el navegador
const happyDomWindow = new Window({
  url: 'http://localhost:4321',
  width: 1024,
  height: 768
});

// Exponer el objeto global para las pruebas
// @ts-ignore - Ignorar errores de tipo para los objetos globales
global.window = happyDomWindow;
// @ts-ignore - Ignorar errores de tipo para los objetos globales
global.document = happyDomWindow.document;

// Configurar mocks para el DOM
vi.stubGlobal('HTMLElement', happyDomWindow.HTMLElement);
vi.stubGlobal('HTMLCanvasElement', happyDomWindow.HTMLCanvasElement);
vi.stubGlobal('MouseEvent', happyDomWindow.MouseEvent);
vi.stubGlobal('Event', happyDomWindow.Event);

// Mock para el método getContext de canvas
// @ts-ignore - Ignorar error de tipado para el mock
HTMLCanvasElement.prototype.getContext = () => {
  return {
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
  };
};

// Mock para el objeto window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Ya hemos configurado el mock para getContext arriba, no necesitamos esta duplicación

// Mock para getBoundingClientRect
Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
  width: 480,
  height: 640,
  top: 0,
  left: 0,
  bottom: 640,
  right: 480,
  x: 0,
  y: 0,
  toJSON: vi.fn(),
});

// Mock para requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(0), 0) as unknown as number;
});

// Limpiar mocks después de cada test
beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});
