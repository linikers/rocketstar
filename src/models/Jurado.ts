import mongoose, { Schema, Document } from 'mongoose';

export interface IJurado extends Document {
  name: string;
  // Adicione outros campos que desejar, como email, credenciais, etc.
}

const JuradoSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
});

const Jurado = mongoose.models.Jurado || mongoose.model<IJurado>('Jurado', JuradoSchema);

export default Jurado;

