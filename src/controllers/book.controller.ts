// src/controllers/book.controller.ts
// Controller CRUD para libros

import type { Request, Response } from 'express';
import { BookService } from '../models/book.service.js';

const bookService = new BookService();

const GENRES = [
  'Novela',
  'Ciencia Ficción',
  'Fantasía',
  'Misterio',
  'Terror',
  'Romance',
  'Acción',
  'Aventura',
  'Histórica',
  'Infantil',
  'Poesía',
  'Drama',
  'Ensayo',
  'Otro',
] as const;

type BookFormData = {
  title: string;
  author: string;
  isbn: string;
  description: string;
  genre: string;
  year: string;
  quantity: string;
  price: string;
  coverUrl: string;
};

type ValidationError = string;

function validateBookFields(data: BookFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmedTitle = data.title.trim();
  const trimmedAuthor = data.author.trim();
  const trimmedIsbn = data.isbn.trim();

  if (!trimmedTitle) errors.push('El título es obligatorio.');
  else if (trimmedTitle.length > 200) errors.push('El título no puede exceder 200 caracteres.');

  if (!trimmedAuthor) errors.push('El autor es obligatorio.');
  else if (trimmedAuthor.length > 150) errors.push('El autor no puede exceder 150 caracteres.');

  if (!trimmedIsbn) errors.push('El ISBN es obligatorio.');
  else if (trimmedIsbn.length > 20) errors.push('El ISBN no puede exceder 20 caracteres.');

  if (data.genre && data.genre !== '' && !GENRES.includes(data.genre as typeof GENRES[number])) {
    errors.push('El género seleccionado no es válido.');
  }

  if (data.year) {
    const yearNum = parseInt(data.year, 10);
    if (isNaN(yearNum) || yearNum < 1000 || yearNum > new Date().getFullYear()) {
      errors.push('El año debe estar entre 1000 y el año actual.');
    }
  }

  if (data.quantity !== undefined && data.quantity !== '') {
    const qtyNum = parseInt(data.quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      errors.push('La cantidad en stock no puede ser negativa.');
    }
  }

  if (data.price !== undefined && data.price !== '') {
    const priceNum = parseFloat(data.price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.push('El precio no puede ser negativo.');
    }
  }

  return errors;
}

function buildFormData(body: Record<string, string | undefined>): BookFormData {
  return {
    title: (body['title'] ?? '').trim(),
    author: (body['author'] ?? '').trim(),
    isbn: (body['isbn'] ?? '').trim(),
    description: (body['description'] ?? '').trim(),
    genre: body['genre'] ?? '',
    year: body['year'] ?? '',
    quantity: body['quantity'] ?? '',
    price: body['price'] ?? '',
    coverUrl: (body['coverUrl'] ?? '').trim(),
  };
}

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
      res.render('books/form', { title: 'Nuevo Libro', isEdit: false, genres: GENRES });
    } catch (error) {
      console.error('Error rendering new book form:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el formulario.' });
    }
  }

  async postCreate(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.session.user?.id;
      if (!userId) { res.redirect('/login'); return; }

      const formData = buildFormData(req.body as Record<string, string | undefined>);
      const errors = validateBookFields(formData);

      if (errors.length > 0) {
        res.render('books/form', {
          title: 'Nuevo Libro',
          isEdit: false,
          genres: GENRES,
          error: errors.join(' '),
          book: formData,
        });
        return;
      }

      await bookService.create({
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        description: formData.description || null,
        genre: formData.genre || null,
        year: formData.year ? parseInt(formData.year, 10) : null,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : 0,
        price: formData.price ? parseFloat(formData.price) : null,
        coverUrl: formData.coverUrl || null,
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
      if (isNaN(id)) { res.redirect('/books'); return; }

      const book = await bookService.findById(id);
      if (!book) {
        res.status(404).render('error', { title: '404', message: 'Libro no encontrado.' });
        return;
      }

      res.render('books/form', { title: 'Editar Libro', book, isEdit: true, genres: GENRES });
    } catch (error) {
      console.error('Error fetching book for edit:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el libro.' });
    }
  }

  async postUpdate(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params['id'] ?? ''), 10);
      if (isNaN(id)) { res.redirect('/books'); return; }

      const existing = await bookService.findById(id);
      if (!existing) {
        res.status(404).render('error', { title: '404', message: 'Libro no encontrado.' });
        return;
      }

      const formData = buildFormData(req.body as Record<string, string | undefined>);
      const errors = validateBookFields(formData);

      if (errors.length > 0) {
        res.render('books/form', {
          title: 'Editar Libro',
          isEdit: true,
          genres: GENRES,
          error: errors.join(' '),
          book: { ...existing, ...formData },
        });
        return;
      }

      await bookService.update(id, {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        description: formData.description || null,
        genre: formData.genre || null,
        year: formData.year ? parseInt(formData.year, 10) : null,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : 0,
        price: formData.price ? parseFloat(formData.price) : null,
        coverUrl: formData.coverUrl || null,
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
      if (isNaN(id)) { res.redirect('/books'); return; }

      await bookService.delete(id);
      res.redirect('/books');
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al eliminar el libro.' });
    }
  }
}

