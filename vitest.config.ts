import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    environmentOptions: {
      happyDOM: {
        // Configuración específica para happy-dom
        // Esto asegura que el DOM esté disponible en las pruebas
        url: 'http://localhost:4321',
        width: 1024,
        height: 768
      }
    },
    // Asegurar que se incluye el DOM en los tests
    browser: {
      enabled: true,
      name: 'happy-dom',
      provider: 'happy-dom'
    },
    // Ignorar errores relacionados con el canvas
    onConsoleLog(log) {
      if (log.includes('canvas') || log.includes('Canvas')) {
        return false;
      }
    }
  },
});
