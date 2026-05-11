import { Schema, model } from 'mongoose';

const AppointmentSchema = new Schema({
  psychologistId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  priority: { type: Number, enum: [1, 2, 3], required: true }, // 1:Baja, 2:Media, 3:Alta
  expectedIntensity: { type: Number, required: true },
  realIntensity: { type: Number },
  performanceScore: { type: Number, default: 0 }
}, { timestamps: true });

export const Appointment = model('Appointment', AppointmentSchema);