import 'dotenv/config';
import Fastify from 'fastify'
import fastifyCors from '@fastify/cors';
import { logger } from './config/logger.js'

const app = Fastify({
  loggerInstance: logger,
  connectionTimeout: 5000,
})

const allowedOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';

app.register(fastifyCors, {
  origin: allowedOrigins,
  credentials: true,
});

export default app
