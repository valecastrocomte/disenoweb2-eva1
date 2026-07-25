// src/routes/index.ts
// Montaje central de rutas + middleware global de sesión para vistas

import type { Application, Request, Response, NextFunction } from 'express';
import { authRouter } from './auth.routes.js';
import { bookRouter } from './book.routes.js';

export function mountRoutes(app: Application): void {
  // Middleware global: inyecta usuario y año en res.locals para todas las vistas
  app.use((req: Request, res: Response, next: NextFunction): void => {
    res.locals.user = req.session.user ?? null;
    res.locals.year = new Date().getFullYear();
    next();
  });

  // Rutas de autenticación en la raíz
  app.use('/', authRouter);

  // Rutas de libros bajo /books
  app.use('/books', bookRouter);
}
