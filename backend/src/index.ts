import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import * as dotenv from 'dotenv';
import { connectDB } from './config/db';

// Importación de Rutas
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';

// Importación de Middlewares de Seguridad
import { verifyJWT, isAdmin } from './middlewares/authMiddleware';

// 1. Configuración de entorno
dotenv.config();

// 2. Conexión a la Base de Datos (MongoDB Local)
connectDB();

const app = new Hono();

// 3. Middlewares Globales
app.use('*', logger()); // Registro de peticiones en consola
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://psychesync.vercel.app'], // Permite local y producción
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// 4. Rutas Públicas (Sin autenticación)
app.get('/health', (c) => {
  return c.json({
    status: 'online',
    service: 'PsycheSync Backend',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Montamos las rutas de autenticación (Register/Login)
app.route('/api/auth', authRoutes);
app.route('/api/patients', patientRoutes);
app.route('/api/appointments', appointmentRoutes);

// 5. Rutas Protegidas (Solo Psicólogos/Admin)
// Estas rutas requieren el Header: Authorization: Bearer <TOKEN>
app.get('/api/admin/check', verifyJWT, isAdmin, (c) => {
  const payload = c.get('jwtPayload');
  return c.json({
    message: 'Token válido y permisos de Administrador confirmados.',
    user: payload
  });
});

// 6. Manejo de Errores Global (Clean Code)
app.onError((err, c) => {
  console.error(`[SERVER ERROR]: ${err.message}`);
  return c.json({
    error: 'Error interno del servidor',
    message: err.message
  }, 500);
});

import { serve } from '@hono/node-server';

// 7. Inicio del servidor
const port = Number(process.env.PORT) || 3000;
console.log(`🚀 Servidor iniciando en http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});