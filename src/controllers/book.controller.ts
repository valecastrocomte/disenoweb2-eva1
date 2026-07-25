// src/controllers/book.controller.ts
// Controller CRUD para libros

import type { Request, Response } from 'express';
import { BookService } from '../models/book.service.js';

const bookService = new BookService();

export class BookController {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const books = await bookService.findAll();
      res.render('books/index', { title: 'Libros', books });
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al obtener los libros.' });
    }
  }

  async getNew(_req: Request, res: Response): Promise<void> {
    try {
      res.render('books/form', { title: 'Nuevo Libro', isEdit: false });
    } catch (error) {
      console.error('Error rendering new book form:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el formulario.' });
    }
  }

  async postCreate(req: Request, res: Response): Promise<void> {
    try {
      const { title, author, isbn, description, genre, year, quantity, price, coverUrl } = req.body as Record<string, string | undefined>;
      const userId = req.session.user?.id;

      if (!userId) {
        res.redirect('/login');
        return;
      }

      if (!title || !author || !isbn) {
        res.render('books/form', {
          title: 'Nuevo Libro',
          isEdit: false,
          error: 'Título, autor e ISBN son obligatorios.',
        });
        return;
      }

      await bookService.create({
        title,
        author,
        isbn,
        description: description ?? null,
        genre: genre ?? null,
        year: year ? parseInt(year, 10) : null,
        quantity: quantity ? parseInt(quantity, 10) : 0,
        price: price ? parseFloat(price) : null,
        coverUrl: coverUrl ?? null,
        userId,
      });

      res.redirect('/books');
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al crear el libro.' });
    }
  }

  async getEdit(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params['id'] ?? ''), 10);
      if (isNaN(id)) {
        res.redirect('/books');
        return;
      }

      const book = await bookService.findById(id);
      if (!book) {
        res.status(404).render('error', { title: '404', message: 'Libro no encontrado.' });
        return;
      }

      res.render('books/form', { title: 'Editar Libro', book, isEdit: true });
    } catch (error) {
      console.error('Error fetching book for edit:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el libro.' });
    }
  }

  async postUpdate(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params['id'] ?? ''), 10);
      if (isNaN(id)) {
        res.redirect('/books');
        return;
      }

      const { title, author, isbn, description, genre, year, quantity, price, coverUrl } = req.body as Record<string, string | undefined>;

      if (!title || !author || !isbn) {
        const book = await bookService.findById(id);
        res.render('books/form', {
          title: 'Editar Libro',
          book: book ? { ...book, title, author, isbn } : undefined,
          isEdit: true,
          error: 'Título, autor e ISBN son obligatorios.',
        });
        return;
      }

      await bookService.update(id, {
        title,
        author,
        isbn,
        description: description ?? null,
        genre: genre ?? null,
        year: year ? parseInt(year, 10) : null,
        quantity: quantity ? parseInt(quantity, 10) : 0,
        price: price ? parseFloat(price) : null,
        coverUrl: coverUrl ?? null,
      });

      res.redirect('/books');
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al actualizar el libro.' });
    }
  }

  async postDelete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params['id'] ?? ''), 10);
      if (isNaN(id)) {
        res.redirect('/books');
        return;
      }

      await bookService.delete(id);
      res.redirect('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al eliminar el libro.' });
    }
  }
}
