
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export class AuthService {
  static async register(username: string, password: string) {
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new Error("Usuário já existe.");
    }

    // Cria o usuário no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return user;
  }

  static async login(username: string, password: string) {
    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Senha incorreta.");
    }

    // Gera o token JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    });

    return token;
  }
}
