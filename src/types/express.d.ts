// src/types/express.d.ts
// Extensiones de tipos para express-session

import type { User } from '@prisma/client';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  }
}
