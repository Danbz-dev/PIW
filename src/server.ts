import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

app.use(express.json());

// Configura as rotas da aplicação
app.use('/api', authRoutes);

// Obtém a porta do arquivo .env ou usa a porta 3000 como padrão
const PORT = process.env.PORT || 3000;

// Inicia o servidor na porta especificada
app.listen(PORT, () => console.log(`🔥 Server is running on port ${PORT}`));
