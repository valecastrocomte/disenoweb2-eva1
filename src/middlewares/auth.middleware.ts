// src/middlewares/auth.middleware.ts
// Middleware de autenticación y autorización

import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session.user?.role === 'admin') {
    next();
  } else {
    res.status(403).render('error', {
      title: '403 — Prohibido',
      message: 'No tienes permiso para acceder a esta página.',
    });
  }
}
