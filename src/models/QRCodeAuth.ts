import mongoose, { Schema, Document } from "mongoose";

// Interface para o documento QRCodeAuth
export interface IQRCodeAuth extends Document {
  _id: string;
  code: string; // Código único do QR
  jurorName: string; // Nome do jurado
  votacaoId?: mongoose.Types.ObjectId | null; // Evento vinculado (opcional)
  expiresAt: Date; // Data de expiração
  createdAt: Date; // Data de criação
  usedAt?: Date | null; // Data de finalização (se finalizou)
  firstUsedAt?: Date | null; // Primeiro acesso ao link (não queima o QR)
  isUsed: boolean; // Se já foi utilizado (setado ao finalizar)
  isFinished: boolean; // Se a votação foi finalizada
  diasFinalizados: string[]; // Dias já finalizados pelo jurado (ex.: ["Sábado"])
  validityHours: number; // Horas de validade (configurável)
  status: "valido" | "expirado" | "usado"; // Status calculado (virtual)
}

// Schema do Mongoose
const QRCodeAuthSchema: Schema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  jurorName: {
    type: String,
    required: true,
  },
  // Evento ao qual o jurado pertence. Opcional para não invalidar os QR Codes
  // já emitidos: quando vazio, o vínculo é gravado no primeiro voto (ver
  // src/pages/api/vote.ts). Sem esse vínculo, um jurado recebia competidores de
  // TODOS os eventos e podia votar em outra votação.
  votacaoId: {
    type: Schema.Types.ObjectId,
    ref: "Votacao",
    default: null,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  firstUsedAt: {
    type: Date,
    default: null,
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true,
  },
  isFinished: {
    type: Boolean,
    default: false,
  },
  // Finalização é POR DIA: o jurado pode julgar sábado e voltar domingo com o
  // mesmo link. isUsed/isFinished só viram true quando não sobra dia pendente.
  diasFinalizados: {
    type: [String],
    default: [],
  },
  validityHours: {
    type: Number,
    required: true,
    default: 72,
  },
});

// Virtual para calcular o status dinamicamente
QRCodeAuthSchema.virtual("status").get(function (this: IQRCodeAuth) {
  if (this.isFinished || this.isUsed) {
    return "usado";
  }
  if (new Date() > this.expiresAt) {
    return "expirado";
  }
  return "valido";
});

// Garante que virtuals sejam incluídos no JSON
QRCodeAuthSchema.set("toJSON", { virtuals: true });
QRCodeAuthSchema.set("toObject", { virtuals: true });

// Exporta o modelo
const QRCodeAuth =
  mongoose.models.QRCodeAuth ||
  mongoose.model<IQRCodeAuth>("QRCodeAuth", QRCodeAuthSchema);

export default QRCodeAuth;
