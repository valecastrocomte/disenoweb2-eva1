// src/server.ts
// Punto de entrada — inicia el servidor Express

import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';

const PORT: number = Number(process.env['PORT']) || 3000;

const app = createApp();

app.listen(PORT, (): void => {
  console.log(`\n🚀 Servidor arrancado en http://localhost:${PORT}`);
  console.log(`📚 Gestor de Inventario de Libros — listo\n`);
});
