// src/routes/auth.routes.ts
// Rutas de autenticación (login, registro, logout)

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const authRouter = Router();
const authController = new AuthController();

authRouter.get('/login', (req, res) => authController.getLogin(req, res));
authRouter.post('/login', (req, res) => authController.postLogin(req, res));
authRouter.get('/register', (req, res) => authController.getRegister(req, res));
authRouter.post('/register', (req, res) => authController.postRegister(req, res));
authRouter.get('/forgot-password', (req, res) => authController.getForgotPassword(req, res));
authRouter.post('/forgot-password', (req, res) => authController.postForgotPassword(req, res));
authRouter.get('/reset-password/:token', (req, res) => authController.getResetPassword(req, res));
authRouter.post('/reset-password/:token', (req, res) => authController.postResetPassword(req, res));
authRouter.get('/logout', (req, res) => authController.logout(req, res));

export { authRouter };
