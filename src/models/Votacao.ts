import mongoose, { Schema, Document } from 'mongoose';

export interface IVotacao extends Document {
  nome: string;
  data: Date;
  categorias: string[];
  ativo: boolean;
}

const VotacaoSchema: Schema = new Schema({
  nome: { type: String, required: true },
  data: { type: Date, required: true, default: Date.now },
  // Lista de categorias que fazem parte deste evento, ex: ["Realismo", "Old School"]
  categorias: [{ type: String }],
  ativo: { type: Boolean, default: true }, // Para controlar se a votação está aberta
});

const Votacao = mongoose.models.Votacao || mongoose.model<IVotacao>('Votacao', VotacaoSchema);

export default Votacao;
