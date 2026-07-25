// src/routes/book.routes.ts
// Rutas CRUD para libros (protegidas con requireAuth)

import { Router } from 'express';
import { BookController } from '../controllers/book.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const bookRouter = Router();
const bookController = new BookController();

// Todas las rutas de libros requieren autenticación
bookRouter.use(requireAuth);

// Rutas específicas ANTES de las dinámicas para evitar conflictos
bookRouter.get('/new', (req, res) => bookController.getNew(req, res));
bookRouter.post('/', (req, res) => bookController.postCreate(req, res));
bookRouter.get('/:id/edit', (req, res) => bookController.getEdit(req, res));
bookRouter.post('/:id/edit', (req, res) => bookController.postUpdate(req, res));
bookRouter.post('/:id/delete', (req, res) => bookController.postDelete(req, res));
bookRouter.get('/', (req, res) => bookController.getAll(req, res));

export { bookRouter };
