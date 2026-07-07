export interface AppointmentData {
  _id: any;
  psychologistId: any;
  patientId: any;
  priority: number;
  expectedIntensity: number;
  realIntensity?: number;
  performanceScore?: number;
  status: 'open' | 'resolved';
  save(): Promise<void>;
}

export interface IAppointmentRepository {
  /**
   * Busca una cita por su ID.
   */
  findById(id: string): Promise<AppointmentData | null>;

  /**
   * Persiste los cambios de una cita.
   */
  save(appointment: AppointmentData): Promise<void>;

  /**
   * Obtiene las últimas N sesiones resueltas de un paciente,
   * excluyendo opcionalmente una cita específica.
   */
  findResolvedByPatient(
    patientId: string,
    limit: number,
    excludeId?: string
  ): Promise<Array<{ realIntensity?: number | null; date: Date }>>;

  /**
   * Obtiene las últimas N sesiones resueltas de un psicólogo
   * a partir de una fecha.
   */
  findResolvedByPsychologist(
    psychologistId: string,
    limit: number,
    fromDate?: Date
  ): Promise<Array<{ realIntensity?: number | null; date: Date }>>;
}
