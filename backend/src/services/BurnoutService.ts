import { Appointment } from '../models/Appointment';

export type BurnoutLabel =
  | 'Sin Datos ⚪'
  | 'Nivel Óptimo 🟢'
  | 'Carga Elevada 🟡'
  | 'Riesgo Crítico 🔴';

export class BurnoutService {
  async calculateBurnoutLabel(psychologistId: any): Promise<BurnoutLabel> {
    // — Paso 1: Contar citas resueltas HOY —
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayStr);

    const resolvedTodayCount = await Appointment.countDocuments({
      psychologistId,
      status: 'resolved',
      date: { $gte: todayStart }
    });

    // — Paso 2: Analizar las últimas 5 sesiones —
    const lastSessions = await Appointment.find({
      psychologistId,
      status: 'resolved'
    })
      .sort({ date: -1 })
      .limit(5)
      .select('realIntensity');

    // Sin datos suficientes, no podemos calcular
    if (lastSessions.length === 0) {
      return 'Sin Datos ⚪';
    }

    // — Paso 3: Calcular métricas —
    const criticalCount = lastSessions.filter(
      (app) => (app.realIntensity ?? 0) >= 8
    ).length;

    const totalIntensity = lastSessions.reduce(
      (sum, app) => sum + (app.realIntensity ?? 0),
      0
    );
    const avgIntensity = totalIntensity / lastSessions.length;

    // — Paso 4: Aplicar reglas de clasificación —
    if (resolvedTodayCount >= 8 || criticalCount >= 2) {
      return 'Riesgo Crítico 🔴';
    }
    if (resolvedTodayCount >= 6 || criticalCount === 1 || avgIntensity >= 5.5) {
      return 'Carga Elevada 🟡';
    }
    return 'Nivel Óptimo 🟢';
  }
}
