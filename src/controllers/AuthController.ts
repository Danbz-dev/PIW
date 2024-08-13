// src/controllers/AuthController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import AuthenticationError from '../errors/AuthenticationError'; // Importa a classe corretamente

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Verifica se o usuário já existe
      const userExists = await prisma.user.findUnique({
        where: { username },
      });

      if (userExists) {
        res.status(409).json({ error: 'Usuário já cadastrado' });
        return;
      }

      // Criptografa a senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Cria o novo usuário no banco de dados
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });

      res.status(201).json({ message: 'Usuário criado com sucesso', user });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  // Método de login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // Verifica se o usuário existe
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new AuthenticationError('Usuário inválido');
      }

      // Compara a senha fornecida com a armazenada
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AuthenticationError('Credenciais inválidas');
      }

      // Gera um token JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });

      res.status(200).json({ message: 'Login bem-sucedido', token });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Erro ao fazer login' });
      }
    }
  }
}
