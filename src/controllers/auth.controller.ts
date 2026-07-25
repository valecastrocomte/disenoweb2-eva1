// src/controllers/auth.controller.ts
// Controller de autenticación (login, registro, logout)

import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { UserService } from '../models/user.service.js';

const userService = new UserService();

export class AuthController {
  async getLogin(_req: Request, res: Response): Promise<void> {
    try {
      res.render('auth/login', { title: 'Iniciar sesión' });
    } catch (error) {
      console.error('Error rendering login:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el formulario de inicio de sesión.' });
    }
  }

  async postLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.render('auth/login', { title: 'Iniciar sesión', error: 'Email y contraseña son obligatorios.', email: email?.trim() ?? '' });
        return;
      }

      const user = await userService.findByEmail(email);
      if (!user) {
        res.render('auth/login', { title: 'Iniciar sesión', error: 'Credenciales inválidas.', email: email.trim() });
        return;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.render('auth/login', { title: 'Iniciar sesión', error: 'Credenciales inválidas.', email: email.trim() });
        return;
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.redirect('/books');
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al iniciar sesión.' });
    }
  }

  async getRegister(_req: Request, res: Response): Promise<void> {
    try {
      res.render('auth/register', { title: 'Registrarse' });
    } catch (error) {
      console.error('Error rendering register:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el formulario de registro.' });
    }
  }

  async postRegister(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, confirmPassword } = req.body as {
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
      };

      // 1. Todos los campos obligatorios
      if (!name?.trim() || !email?.trim() || !password || !confirmPassword) {
        res.render('auth/register', { title: 'Registrarse', error: 'Todos los campos son obligatorios.', name: name?.trim() ?? '', email: email?.trim() ?? '' });
        return;
      }

      // 2. Formato de email válido
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        res.render('auth/register', { title: 'Registrarse', error: 'El formato del correo electrónico no es válido.', name: name.trim(), email: email.trim() });
        return;
      }

      // 3. Contraseña: mínimo 8 caracteres, al menos 1 letra y 1 número
      if (password.length < 8) {
        res.render('auth/register', { title: 'Registrarse', error: 'La contraseña debe tener al menos 8 caracteres.', name: name.trim(), email: email.trim() });
        return;
      }
      if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        res.render('auth/register', { title: 'Registrarse', error: 'La contraseña debe contener al menos una letra y un número.', name: name.trim(), email: email.trim() });
        return;
      }

      // 4. Confirmación de contraseña
      if (password !== confirmPassword) {
        res.render('auth/register', { title: 'Registrarse', error: 'Las contraseñas no coinciden.', name: name.trim(), email: email.trim() });
        return;
      }

      // 5. Email duplicado
      const existing = await userService.findByEmail(email.trim());
      if (existing) {
        res.render('auth/register', { title: 'Registrarse', error: 'El correo electrónico ya está registrado.', name: name.trim(), email: email.trim() });
        return;
      }

      // 6. Hash con bcrypt (salt 10) y crear usuario
      const hashed = await bcrypt.hash(password, 10);
      const user = await userService.create({ name: name.trim(), email: email.trim().toLowerCase(), password: hashed });

      // 7. Login automático
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      res.redirect('/books');
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al registrarse.' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.redirect('/login');
      });
    } catch (error) {
      console.error('Error during logout:', error);
      res.redirect('/login');
    }
  }

  // ─── Recuperar contraseña ──────────────────────────────────────

  async getForgotPassword(_req: Request, res: Response): Promise<void> {
    try {
      res.render('auth/forgot-password', { title: 'Recuperar contraseña' });
    } catch (error) {
      console.error('Error rendering forgot password:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el formulario.' });
    }
  }

  async postForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as { email?: string };

      if (!email?.trim()) {
        res.render('auth/forgot-password', { title: 'Recuperar contraseña', error: 'Ingresa tu correo electrónico.' });
        return;
      }

      const user = await userService.findByEmail(email.trim().toLowerCase());

      // Siempre mostrar mensaje de éxito por seguridad (no revelar si el email existe)
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hora
        await userService.setResetToken(user.id, token, expiry);

        const resetLink = `/reset-password/${token}`;
        res.render('auth/forgot-password', {
          title: 'Recuperar contraseña',
          success: true,
          message: 'Si el correo está registrado, recibirás un enlace de recuperación.',
          resetLink,
        });
      } else {
        res.render('auth/forgot-password', {
          title: 'Recuperar contraseña',
          success: true,
          message: 'Si el correo está registrado, recibirás un enlace de recuperación.',
        });
      }
    } catch (error) {
      console.error('Error during forgot password:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al procesar la solicitud.' });
    }
  }

  async getResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params as { token?: string };

      if (!token) {
        res.render('error', { title: 'Token inválido', message: 'El enlace de recuperación no es válido.' });
        return;
      }

      const user = await userService.findByResetToken(token);
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        res.render('auth/reset-password', { title: 'Restablecer contraseña', expired: true, error: 'El enlace ha expirado o no es válido. Solicita uno nuevo.' });
        return;
      }

      res.render('auth/reset-password', { title: 'Restablecer contraseña', token });
    } catch (error) {
      console.error('Error rendering reset password:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al cargar el formulario.' });
    }
  }

  async postResetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params as { token?: string };
      const { password, confirmPassword } = req.body as { password?: string; confirmPassword?: string };

      if (!token) {
        res.render('error', { title: 'Token inválido', message: 'El enlace de recuperación no es válido.' });
        return;
      }

      const user = await userService.findByResetToken(token);
      if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        res.render('auth/reset-password', { title: 'Restablecer contraseña', expired: true, error: 'El enlace ha expirado o no es válido. Solicita uno nuevo.' });
        return;
      }

      if (!password || !confirmPassword) {
        res.render('auth/reset-password', { title: 'Restablecer contraseña', token, error: 'Todos los campos son obligatorios.' });
        return;
      }

      if (password.length < 8) {
        res.render('auth/reset-password', { title: 'Restablecer contraseña', token, error: 'La contraseña debe tener al menos 8 caracteres.' });
        return;
      }

      if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
        res.render('auth/reset-password', { title: 'Restablecer contraseña', token, error: 'La contraseña debe contener al menos una letra y un número.' });
        return;
      }

      if (password !== confirmPassword) {
        res.render('auth/reset-password', { title: 'Restablecer contraseña', token, error: 'Las contraseñas no coinciden.' });
        return;
      }

      const hashed = await bcrypt.hash(password, 10);
      await userService.updatePassword(user.id, hashed);
      await userService.clearResetToken(user.id);

      res.render('auth/login', { title: 'Iniciar sesión', success: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
    } catch (error) {
      console.error('Error during password reset:', error);
      res.status(500).render('error', { title: 'Error', message: 'Error al restablecer la contraseña.' });
    }
  }
}
