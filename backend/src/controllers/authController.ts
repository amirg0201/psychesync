import { Context } from 'hono';
import { sign } from 'hono/jwt';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export const register = async (c: Context) => {
  const { name, email, password, role, document } = await c.req.json();

  // 🛡️ VALIDACIÓN DE SEGURIDAD CORE (BACK-END)
  if (role === 'PATIENT' && document) {
    const documentRegex = /^[0-9]{10}$/; // Ejemplo: 10 dígitos exactos
    if (!documentRegex.test(document)) {
      return c.json({ error: "Seguridad: El formato de cédula es inválido." }, 400);
    }
  }

  // Verificar si el documento ya existe
  const existingDoc = await User.findOne({ document });
  if (existingDoc) return c.json({ error: "Esta cédula ya está registrada." }, 400);

  const newUser = await User.create({ name, email, password, role, document });
  return c.json({ message: "Usuario creado", id: newUser._id }, 201);
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
