import { Context } from 'hono';
import { sign } from 'hono/jwt';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { BurnoutService } from '../services/BurnoutService'; // ← NEW

// Instancia del servicio (podría inyectarse via DI container)
const burnoutService = new BurnoutService();

export const register = async (c: Context) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: "Todos los campos (nombre, correo, contraseña) son obligatorios." }, 400);
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return c.json({ error: "Este correo electrónico ya está registrado." }, 400);
    }

    const newUser = await User.create({ name, email, password });
    return c.json({ message: "Profesional registrado con éxito", id: newUser._id }, 201);
  } catch (error: any) {
    return c.json({ error: "Error en el registro", details: error.message }, 500);
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Correo y contraseña son obligatorios." }, 400);
    }

    // Buscamos usuario incluyendo el campo password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    // Generar Token JWT (Válido por 24h)
    const payload = {
      id: user._id,
      role: 'ADMIN', // Rol por defecto del profesional para mantener compatibilidad
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
    };

    const token = await sign(payload, process.env.JWT_SECRET!);
    return c.json({ token, role: 'ADMIN', name: user.name });
  } catch (error: any) {
    return c.json({ error: "Error en el inicio de sesión", details: error.message }, 500);
  }
};

export const getPsychologists = async (c: Context) => {
  try {
    const users = await User.find({}, 'name email');

    const list = await Promise.all(users.map(async (user) => {
      // ← ANTES: ~20 líneas de lógica de burnout aquí
      // ← AHORA: 1 sola línea. El controlador no sabe CÓMO se calcula.
      const burnoutLabel = await burnoutService.calculateBurnoutLabel(user._id);

      return {
        name: user.name,
        email: user.email,
        burnoutState: burnoutLabel
      };
    }));

    return c.json(list);
  } catch (error: any) {
    return c.json({ error: "Error al obtener psicólogos", details: error.message }, 500);
  }
};
