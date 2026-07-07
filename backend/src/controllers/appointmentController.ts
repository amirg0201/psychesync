import { Context } from 'hono';
import { Appointment } from '../models/Appointment';
import { Patient } from '../models/Patient';
import { AppointmentService } from '../services/AppointmentService'; // ← NEW

// Instancia del servicio con las dependencias por defecto
// (MongoRepository + DefaultProductivityStrategy)
const appointmentService = new AppointmentService();

export const appointmentController = {

  // 1. CREAR CITA (sin cambios — lógica simple de validación)
  create: async (c: Context) => {
    try {
      const body = await c.req.json();
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

  // 2. LISTAR CITAS (sin cambios)
  getAppointments: async (c: Context) => {
    try {
      const psychologist = c.get('jwtPayload') as { id: string };

      const appointments = await Appointment.find({ psychologistId: psychologist.id })
        .populate('patientId', 'name email document')
        .sort({ date: 1 });

      return c.json(appointments);
    } catch (error: any) {
      return c.json({ error: "Error al obtener citas" }, 500);
    }
  },

  // 3. MOTOR DE PRODUCTIVIDAD — Resolver Cita (REFACTORIZADO)
  resolve: async (c: Context) => {
    try {
      const id = c.req.param('id');
      const { realIntensity } = await c.req.json();

      // ─────────────────────────────────────────────────────────
      // SRP + STRATEGY + REPOSITORY EN ACCIÓN:
      // El controlador solo llama al servicio. No sabe:
      //   ❌ Qué fórmula se usó para calcular el score
      //   ❌ Cómo se accede a la base de datos
      //   ❌ Cómo se analiza la tendencia del paciente
      // ─────────────────────────────────────────────────────────
      const result = await appointmentService.resolveAppointment(id, realIntensity);

      return c.json({
        message: "Cita finalizada",
        scoreObtained: result.finalScore,
        smartBufferActive: result.needsBuffer,
        alert: result.needsBuffer ? "⚠️ Sesión intensa detectada." : "Ok",
        patientTrend: result.patientTrend
      });

    } catch (error: any) {
      if (error.message === 'APPOINTMENT_NOT_FOUND') {
        return c.json({ error: "Cita no encontrada" }, 404);
      }
      return c.json({ error: "Error al resolver la cita" }, 500);
    }
  }
};