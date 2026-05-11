import { Hono } from 'hono';
import { User } from '../models/User';
import { verifyJWT, isAdmin } from '../middlewares/authMiddleware';

const patients = new Hono();

// Obtener lista de pacientes (Solo para el Admin/Psicólogo)
patients.get('/', verifyJWT, isAdmin, async (c) => {
  const list = await User.find({ role: 'PATIENT' }).select('name email');
  return c.json(list);
});

export default patients;