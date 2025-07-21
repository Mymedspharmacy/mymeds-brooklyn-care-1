import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import prescriptionRoutes from './routes/prescriptions';
import appointmentRoutes from './routes/appointments';
import blogRoutes from './routes/blogs';
import contactRoutes from './routes/contact';
import rateLimit from 'express-rate-limit';
import { AuthRequest } from './types/express';
import paymentsRoutes from './routes/payments';

// Load env vars
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? 'https://your-frontend-domain.com' : '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

// Rate limiting for auth and contact
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Try a simple DB query
    await prisma.user.findFirst();
    res.json({ status: 'ok', message: 'MyMeds backend and DB are running!' });
  } catch (err) {
    console.error('DB health check failed:', err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 