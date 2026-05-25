import { Schema, model } from 'mongoose';

const PatientSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'El correo electrónico es obligatorio'], 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  document: { 
    type: String, 
    required: [true, 'El documento/cédula es obligatorio'], 
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[0-9]{10}$/.test(v);
      },
      message: (props: any) => `${props.value} no es un formato válido de identificación oficial (deben ser 10 dígitos numéricos).`
    }
  },
  psychologistId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'El ID del psicólogo responsable es obligatorio'] 
  }
}, { timestamps: true });

export const Patient = model('Patient', PatientSchema);
