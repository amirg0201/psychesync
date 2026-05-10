import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, // 'select: false' por seguridad
  role: {
    type: String,
    enum: ['ADMIN', 'PATIENT'],
    default: 'PATIENT'
  },
  // Para el psicólogo: acumuladores de rendimiento
  stats: {
    totalPoints: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Middleware de Mongoose: Encriptar contraseña antes de guardar
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const User = model('User', UserSchema);