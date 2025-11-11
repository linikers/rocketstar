import mongoose, { Schema, Document } from 'mongoose';
import './Jurado';

// Define the interface for a single vote subdocument
export interface IVoto {
  juradoId: mongoose.Types.ObjectId;
  anatomy: number;
  creativity: number;
  pigmentation: number;
  traces: number;
  readability: number;
  visualImpact: number;
}

// Define the interface for the main Competidor document
export interface ICompetidor extends Document {
  name: string;
  work: string;
  // category?: string;
  votos: IVoto[]; // Array of subdocuments
  eventoId: mongoose.Types.ObjectId;
  category: string;
  anatomy: number;
  creativity: number;
  pigmentation: number;
  traces: number;
  readability: number;
  visualImpact: number;
  totalScore: number;
}

const VotoSchema: Schema = new Schema({
  juradoId: { type: Schema.Types.ObjectId, ref: 'Jurado', required: true },
  anatomy: { type: Number, default: 0 },
  creativity: { type: Number, default: 0 },
  pigmentation: { type: Number, default: 0 },
  traces: { type: Number, default: 0 },
  readability: { type: Number, default: 0 },
  visualImpact: { type: Number, default: 0 },
}, { _id: false }); // _id: false para subdocumentos, eles não precisam de um _id próprio

const CompetidorSchema: Schema = new Schema({
  name: { type: String, required: true },
  work: { type: String, required: true },
  // category: { type: String, default: null },
  votos: [VotoSchema], // Array de subdocumentos de votos
  enventoId: { type: Schema.Types.ObjectId, ref: 'Votacao', required: true },
  category: { type: String, required: true },
  anatomy: { type: Number, default: 0 },
  creativity: { type: Number, default: 0 },
  pigmentation: { type: Number, default: 0 },
  traces: { type: Number, default: 0 },
  readability: { type: Number, default: 0 },
  visualImpact: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
});

// Exporta o modelo. Se ele já existe, usa-o; caso contrário, cria-o.
const Competidor = mongoose.models.Competidor || mongoose.model<ICompetidor>('Competidor', CompetidorSchema);

export default Competidor;
