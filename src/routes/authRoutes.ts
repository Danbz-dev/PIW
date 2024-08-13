import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';
import AuthenticationError from '../errors/AuthenticationError';

const router = Router();

// Rota de registro
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já cadastrado' });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o novo usuário
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso', user });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Rota de login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new AuthenticationError('Credenciais inválidas');
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

    return res.status(200).json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
});

export default router;
