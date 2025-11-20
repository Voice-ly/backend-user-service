import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Aquí irán tus rutas

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// app.use('/api/auth', authRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

export default app;
