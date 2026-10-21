import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess, sendError } from './utils/response';

const app: Application = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible tile loading for Leaflet maps
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true, // Dynamically mirror request origin for Vercel, localhost, and custom domains
    credentials: true,
  })
);

// Payload Compression
app.use(compression());

// Logging
app.use(morgan('dev'));

// Body Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Auth rate limiting (100 requests per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});
app.use(['/api/auth/login', '/auth/login'], authLimiter);
app.use(['/api/auth/register', '/auth/register'], authLimiter);

// Health Check
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      institution: 'Geethanjali Institute of Science & Technology (Autonomous)',
      department: 'Department of CSE (Data Science)',
    },
    'Smart Crime Mapping API is healthy and operational'
  );
});

// API Routes (supports both direct and /api prefixed routes)
app.use('/api', routes);
app.use('/', routes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global Error Handler
app.use(errorHandler);

export default app;
