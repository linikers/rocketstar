import mongoose, { Schema, Document } from 'mongoose';

export interface IVotacao extends Document {
    _id: string;
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

const Votacao = mongoose.models.Evento || mongoose.model<IVotacao>('Evento', VotacaoSchema);

export default Votacao;

