import { Hono } from 'hono';
import { Patient } from '../models/Patient';
import { verifyJWT, isAdmin } from '../middlewares/authMiddleware';

const patients = new Hono();

// Obtener lista de pacientes (Solo los que pertenecen al Psicólogo logueado)
patients.get('/', verifyJWT, isAdmin, async (c) => {
  try {
    const psychologist = c.get('jwtPayload') as { id: string };
    const list = await Patient.find({ psychologistId: psychologist.id }).select('name email');
    return c.json(list);
  } catch (error: any) {
    return c.json({ error: "Error al listar pacientes", details: error.message }, 500);
  }
});

// Registrar un nuevo paciente asociado al Psicólogo logueado
patients.post('/', verifyJWT, isAdmin, async (c) => {
  try {
    const { name, email, document } = await c.req.json();
    const psychologist = c.get('jwtPayload') as { id: string };

    if (!name || !email || !document) {
      return c.json({ error: "Todos los campos (nombre, correo, documento) son obligatorios." }, 400);
    }

    // Verificar si ya existe un paciente con el mismo documento o correo
    const existingPatient = await Patient.findOne({
      $or: [{ document }, { email }]
    });

    if (existingPatient) {
      if (existingPatient.document === document) {
        return c.json({ error: "Un paciente con esta cédula/DNI ya está registrado." }, 400);
      }
      return c.json({ error: "Un paciente con este correo electrónico ya está registrado." }, 400);
    }

    // Crear el nuevo paciente
    const newPatient = await Patient.create({
      name,
      email,
      document,
      psychologistId: psychologist.id
    });

    return c.json({ message: "Paciente creado", id: newPatient._id }, 201);
  } catch (error: any) {
    // Si la validación de Mongoose falla (ej. Regex del DNI), capturamos el mensaje detallado
    return c.json({ error: error.message || "Error al registrar el paciente" }, 400);
  }
});

export default patients;