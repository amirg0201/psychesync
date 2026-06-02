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

      // ── Algoritmo de Productividad ──────────────────────────────────────────
      const baseScore      = appointment.priority;
      const intensityDelta = realIntensity - appointment.expectedIntensity;
      const finalScore     = baseScore - intensityDelta;

      appointment.realIntensity    = realIntensity;
      appointment.performanceScore = finalScore;
      appointment.status           = 'resolved';

      const needsBuffer = realIntensity >= 8;
      await appointment.save();

      // ── Actualizar acumuladores del psicólogo ───────────────────────────────
      await User.findByIdAndUpdate(appointment.psychologistId, {
        $inc: {
          'stats.totalPoints': finalScore,
          'stats.sessionsCompleted': 1
        }
      });

      // ── Análisis de Tendencia del Paciente (cross-query Appointment) ────────
      // Trae las últimas 5 sesiones RESUELTAS del mismo paciente (excluye la actual)
      const lastSessions = await Appointment.find({
        patientId: appointment.patientId,
        status: 'resolved',
        _id: { $ne: appointment._id }
      })
        .sort({ date: -1 })
        .limit(5)
        .select('realIntensity date');

      type TrendDirection = 'improving' | 'worsening' | 'stable' | 'insufficient_data';

      interface PatientTrend {
        direction: TrendDirection;
        delta: number | null;
        sessionsAnalyzed: number;
        clinicalAlert: string | null;
      }

      let patientTrend: PatientTrend = {
        direction: 'insufficient_data',
        delta: null,
        sessionsAnalyzed: lastSessions.length,
        clinicalAlert: null
      };

      if (lastSessions.length >= 2) {
        // Más reciente → índice 0, más antigua → último índice
        const mostRecent = lastSessions[0].realIntensity as number;
        const oldest     = lastSessions[lastSessions.length - 1].realIntensity as number;
        const delta      = mostRecent - oldest; // positivo = empeora, negativo = mejora

        let direction: TrendDirection;
        if      (delta <= -2) direction = 'improving';
        else if (delta >= 2)  direction = 'worsening';
        else                  direction = 'stable';

        // Alerta clínica si hay deterioro significativo (delta ≥ 3 puntos)
        const clinicalAlert = delta >= 3
          ? `⚠️ El paciente muestra deterioro significativo: intensidad subió ${delta} puntos en las últimas ${lastSessions.length} sesiones.`
          : null;

        patientTrend = {
          direction,
          delta,
          sessionsAnalyzed: lastSessions.length,
          clinicalAlert
        };
      }
      // ────────────────────────────────────────────────────────────────────────

      return c.json({
        message: "Cita finalizada",
        scoreObtained: finalScore,
        smartBufferActive: needsBuffer,
        alert: needsBuffer ? "⚠️ Sesión intensa detectada." : "Ok",
        patientTrend
      });
    } catch (error: any) {
      return c.json({ error: "Error al resolver la cita" }, 500);
    }
  }
};