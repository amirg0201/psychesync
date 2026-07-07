import { User } from '../models/User';
import { IProductivityStrategy } from '../strategies/IProductivityStrategy';
import { DefaultProductivityStrategy } from '../strategies/DefaultProductivityStrategy';
import {
  IAppointmentRepository,
  AppointmentData
} from '../repositories/IAppointmentRepository';
import { MongoAppointmentRepository } from '../repositories/MongoAppointmentRepository';

// — Tipos de resultado —
export type TrendDirection = 'improving' | 'worsening' | 'stable' | 'insufficient_data';

export interface PatientTrend {
  direction: TrendDirection;
  delta: number | null;
  sessionsAnalyzed: number;
  clinicalAlert: string | null;
}

export interface ResolveResult {
  appointment: AppointmentData;
  finalScore: number;
  needsBuffer: boolean;
  patientTrend: PatientTrend;
}

export class AppointmentService {
  private repository: IAppointmentRepository;
  private strategy: IProductivityStrategy;

  constructor(
    repository: IAppointmentRepository = new MongoAppointmentRepository(),
    strategy: IProductivityStrategy = new DefaultProductivityStrategy()
  ) {
    this.repository = repository;
    this.strategy = strategy;
  }

  /**
   * Resuelve una cita: calcula el score (via Strategy), actualiza el estado,
   * incrementa stats del psicólogo, y analiza la tendencia del paciente.
   */
  async resolveAppointment(
    appointmentId: string | undefined,
    realIntensity: number
  ): Promise<ResolveResult> {

    if (!appointmentId) {
      throw new Error('APPOINTMENT_NOT_FOUND');
    }

    // — Paso 1: Obtener la cita (via Repository, no Mongoose directo) —
    const appointment = await this.repository.findById(appointmentId);
    if (!appointment) {
      throw new Error('APPOINTMENT_NOT_FOUND');
    }

    // — Paso 2: Calcular score (via Strategy — OCP) —
    // El servicio NO conoce la fórmula. Delega al objeto "strategy".
    const finalScore = this.strategy.calculate(
      appointment.priority,
      realIntensity,
      appointment.expectedIntensity
    );

    // — Paso 3: Actualizar la cita —
    appointment.realIntensity = realIntensity;
    appointment.performanceScore = finalScore;
    appointment.status = 'resolved';

    const needsBuffer = realIntensity >= 8;
    await this.repository.save(appointment);

    // — Paso 4: Actualizar acumuladores del psicólogo —
    await User.findByIdAndUpdate(appointment.psychologistId, {
      $inc: {
        'stats.totalPoints': finalScore,
        'stats.sessionsCompleted': 1
      }
    });

    // — Paso 5: Analizar tendencia del paciente —
    const patientTrend = await this.analyzePatientTrend(
      String(appointment.patientId),
      String(appointment._id)
    );

    return { appointment, finalScore, needsBuffer, patientTrend };
  }

  // ─── Método privado: análisis de tendencia ───────────────────
  // SRP: este análisis está separado y podría moverse a un
  // TrendAnalysisService si crece más en el futuro.
  private async analyzePatientTrend(
    patientId: string,
    excludeAppointmentId: string
  ): Promise<PatientTrend> {

    const lastSessions = await this.repository.findResolvedByPatient(
      patientId,
      5,
      excludeAppointmentId
    );

    if (lastSessions.length < 2) {
      return {
        direction: 'insufficient_data',
        delta: null,
        sessionsAnalyzed: lastSessions.length,
        clinicalAlert: null
      };
    }

    const mostRecent = (lastSessions[0].realIntensity ?? 0) as number;
    const oldest = (lastSessions[lastSessions.length - 1].realIntensity ?? 0) as number;
    const delta = mostRecent - oldest; // positivo = empeora, negativo = mejora

    let direction: TrendDirection;
    if (delta <= -2) direction = 'improving';
    else if (delta >= 2) direction = 'worsening';
    else direction = 'stable';

    const clinicalAlert =
      delta >= 3
        ? `⚠️ El paciente muestra deterioro significativo: intensidad subió ${delta} puntos en las últimas ${lastSessions.length} sesiones.`
        : null;

    return { direction, delta, sessionsAnalyzed: lastSessions.length, clinicalAlert };
  }
}
