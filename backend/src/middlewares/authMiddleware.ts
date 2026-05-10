import { jwt } from 'hono/jwt';
import { Context, Next } from 'hono';

// 1. Verificador de Token (Usando el built-in de Hono)
export const verifyJWT = (c: Context, next: Next) => {
  const jwtMiddleware = jwt({ secret: process.env.JWT_SECRET!, alg: 'HS256' });
  return jwtMiddleware(c, next);
};

// 2. Guardián de Roles (RBAC)
export const isAdmin = async (c: Context, next: Next) => {
  const payload = c.get('jwtPayload') as { role: string };
  if (payload.role !== 'ADMIN') {
    return c.json({ error: 'Acceso denegado: Se requiere rol de Psicólogo' }, 403);
  }
  await next();
};