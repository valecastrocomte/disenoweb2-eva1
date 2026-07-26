// src/app.ts
// Configuración central de Express + Handlebars + Session

import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mountRoutes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(): Application {
  const app: Application = express();

  // ─── Motor de plantillas Handlebars ─────────────────────────────
  app.engine(
    'hbs',
    engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: path.join(__dirname, 'views', 'layouts'),
      partialsDir: path.join(__dirname, 'views', 'partials'),
      helpers: {
        eq(a: unknown, b: unknown): boolean { return a === b; },
        lte(a: unknown, b: unknown): boolean { return Number(a) <= Number(b); },
        gte(a: unknown, b: unknown): boolean { return Number(a) >= Number(b); },
        inArray(value: unknown, arr: unknown): boolean {
          return Array.isArray(arr) && arr.includes(value);
        },
      },
    })
  );
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, 'views'));

  // ─── Middleware built-in ─────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ─── Archivos estáticos ──────────────────────────────────────────
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // ─── Sesiones ────────────────────────────────────────────────────
  app.use(
    session({
      secret: process.env['SESSION_SECRET'] ?? 'fallback-secret-dev',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,        // true en producción con HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
      },
    })
  );



  // ─── Ruta raíz: redirige a /books ────────────────────────────────
  app.get('/', (_req: Request, res: Response): void => {
    res.redirect('/books');
  });

  // ─── Health check ────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response): void => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  // ─── Rutas de la aplicación ─────────────────────────────────────
  mountRoutes(app);

  // ─── 404: ruta no encontrada ─────────────────────────────────────
  app.use((_req: Request, res: Response): void => {
    res.status(404).render('error', {
      title: '404 — No encontrado',
      message: 'La página que buscas no existe.',
    });
  });

  // ─── Manejador de errores global ─────────────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error('Error no controlado:', err);
    res.status(500).render('error', {
      title: '500 — Error del servidor',
      message: 'Algo salió mal. Intenta de nuevo más tarde.',
    });
  });

  return app;
}
