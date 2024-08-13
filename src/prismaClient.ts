import { PrismaClient } from '@prisma/client';

// Instancia o PrismaClient com logs para queries e erros
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Fecha a conexão do Prisma quando o processo Node.js termina (em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default prisma;