import { isValidObjectId } from 'mongoose';
import { Appointment } from '../models/Appointment';
import {
  IAppointmentRepository,
  AppointmentData
} from './IAppointmentRepository';

export class MongoAppointmentRepository implements IAppointmentRepository {

  async findById(id: string): Promise<AppointmentData | null> {
    if (!isValidObjectId(id)) return null;
    // Mongoose devuelve un documento que tiene .save(), compatible con AppointmentData
    return Appointment.findById(id) as any;
  }

  async save(appointment: AppointmentData): Promise<void> {
    await appointment.save();
  }

  async findResolvedByPatient(
    patientId: string,
    limit: number,
    excludeId?: string
  ): Promise<Array<{ realIntensity?: number | null; date: Date }>> {
    const query: any = {
      patientId,
      status: 'resolved'
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    return Appointment.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .select('realIntensity date')
      .lean() as any;
  }

  async findResolvedByPsychologist(
    psychologistId: string,
    limit: number,
    fromDate?: Date
  ): Promise<Array<{ realIntensity?: number | null; date: Date }>> {
    const query: any = {
      psychologistId,
      status: 'resolved'
    };
    if (fromDate) {
      query.date = { $gte: fromDate };
    }

    return Appointment.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .select('realIntensity date')
      .lean() as any;
  }
}
