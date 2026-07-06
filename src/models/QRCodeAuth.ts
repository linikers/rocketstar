import mongoose, { Schema, Document } from "mongoose";

// Interface para o documento QRCodeAuth
export interface IQRCodeAuth extends Document {
  _id: string;
  code: string; // Código único do QR
  jurorName: string; // Nome do jurado
  expiresAt: Date; // Data de expiração
  createdAt: Date; // Data de criação
  usedAt?: Date; // Data de uso (se foi usado)
  isUsed: boolean; // Se já foi utilizado
  isFinished: boolean; // Se a votação foi finalizada
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
  isUsed: {
    type: Boolean,
    default: false,
    index: true,
  },
  isFinished: {
    type: Boolean,
    default: false,
  },
  validityHours: {
    type: Number,
    required: true,
    default: 72,
  },
});

// Virtual para calcular o status dinamicamente
QRCodeAuthSchema.virtual("status").get(function (this: IQRCodeAuth) {
  if (this.isUsed) {
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
