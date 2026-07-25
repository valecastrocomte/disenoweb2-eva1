// src/models/book.service.ts
// Servicio Prisma para el modelo Book

import { PrismaClient, type Book, type User } from '@prisma/client';

const prisma = new PrismaClient();

type BookWithUser = Book & { user: Pick<User, 'id' | 'name'> };

export class BookService {
  async findAll(): Promise<BookWithUser[]> {
    return prisma.book.findMany({
      include: { user: { select: { id: true, name: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async findById(id: number): Promise<BookWithUser | null> {
    return prisma.book.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async findByUserId(userId: number): Promise<Book[]> {
    return prisma.book.findMany({
      where: { userId },
      orderBy: { title: 'asc' },
    });
  }

  async create(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    return prisma.book.create({ data });
  }

  async update(id: number, data: Partial<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Book> {
    return prisma.book.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Book> {
    return prisma.book.delete({ where: { id } });
  }
}
