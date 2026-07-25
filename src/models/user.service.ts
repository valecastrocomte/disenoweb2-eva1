// src/models/user.service.ts
// Servicio Prisma para el modelo User

import { PrismaClient, type User } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { resetToken: token } });
  }

  async create(data: { name: string; email: string; password: string }): Promise<User> {
    return prisma.user.create({ data });
  }

  async setResetToken(id: number, token: string, expiry: Date): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
  }

  async clearResetToken(id: number): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { resetToken: null, resetTokenExpiry: null },
    });
  }

  async updatePassword(id: number, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
