import { Context } from 'hono';
import { sign } from 'hono/jwt';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const register = async (c: Context) => {
  const body = await c.req.json();
  try {
    const newUser = await User.create(body);
    return c.json({ message: 'Usuario creado', id: newUser._id }, 201);
  } catch (error) {
    return c.json({ error: 'Error al registrar usuario' }, 400);
  }
};

export const login = async (c: Context) => {
  const { email, password } = await c.req.json();

  // Buscamos usuario incluyendo el campo password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: 'Credenciales inválidas' }, 401);
  }

  // Generar Token JWT (Válido por 24h)
  const payload = {
    id: user._id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
  };

  const token = await sign(payload, process.env.JWT_SECRET!);
  return c.json({ token, role: user.role, name: user.name });
};
