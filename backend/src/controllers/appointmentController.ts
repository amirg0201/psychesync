import { Context } from 'hono';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { isValidObjectId } from 'mongoose';

export const appointmentController = {

  // 1. CREAR CITA (La validación de cédula ahora vive en el Registro de Paciente)
  create: async (c: Context) => {
    try {
      const body = await c.req.json();
      // Ya no recibimos 'patientDocument' aquí
      const { patientId, date, priority, expectedIntensity } = body;
      const psychologist = c.get('jwtPayload') as { id: string };

      // Validar que el paciente existe y pertenece al Psicólogo logueado
      const patient = await Patient.findOne({ _id: patientId, psychologistId: psychologist.id });

      if (!patient) {
        return c.json({ error: "El paciente seleccionado no existe o no pertenece a su perfil profesional." }, 404);
      }

      const newAppointment = await Appointment.create({
        psychologistId: psychologist.id,
        patientId,
        date: new Date(date),
        priority: Number(priority),
        expectedIntensity: Number(expectedIntensity),
        status: 'open'
      });

      return c.json(newAppointment, 201);
    } catch (error: any) {
      return c.json({ error: "Error al crear la cita", details: error.message }, 500);
    }
  },

  // 2. LISTAR CITAS (Dashboard)
  getAppointments: async (c: Context) => {
    try {
      const psychologist = c.get('jwtPayload') as { id: string };

      // Traemos las citas y hacemos "populate" para ver el nombre y el documento del paciente
      const appointments = await Appointment.find({ psychologistId: psychologist.id })
        .populate('patientId', 'name email document')
        .sort({ date: 1 });

      return c.json(appointments);
    } catch (error: any) {
      return c.json({ error: "Error al obtener citas" }, 500);
    }
  },

  // 3. MOTOR DE PRODUCTIVIDAD (Resolver Cita)
  resolve: async (c: Context) => {
    try {
      const id = c.req.param('id');
      const { realIntensity } = await c.req.json();

      if (!isValidObjectId(id)) return c.json({ error: "ID de cita inválido" }, 400);

      const appointment = await Appointment.findById(id);
      if (!appointment) return c.json({ error: "Cita no encontrada" }, 404);

      // Algoritmo de Productividad
      const baseScore = appointment.priority;
      const intensityDelta = realIntensity - appointment.expectedIntensity;
      const finalScore = baseScore - intensityDelta;

      appointment.realIntensity = realIntensity;
      appointment.performanceScore = finalScore;
      appointment.status = 'resolved';

      const needsBuffer = realIntensity >= 8;
      await appointment.save();

      // Actualizar acumuladores del psicólogo en la base de datos
      await User.findByIdAndUpdate(appointment.psychologistId, {
        $inc: {
          'stats.totalPoints': finalScore,
          'stats.sessionsCompleted': 1
        }
      });

      return c.json({
        message: "Cita finalizada",
        scoreObtained: finalScore,
        smartBufferActive: needsBuffer,
        alert: needsBuffer ? "⚠️ Sesión intensa detectada." : "Ok"
      });
    } catch (error: any) {
      return c.json({ error: "Error al resolver la cita" }, 500);
    }
  }
};