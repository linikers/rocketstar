import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import QRCodeAuth from "@/models/QRCodeAuth";
import { isCodeFormatValido, verificarTokenJurado } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { competidoresSemVotoNaDia, diasDoEvento } from "@/lib/diasEvento";
import { ordenarDias } from "@/utils/categoryMap";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    if (
      !rateLimit(req, res, {
        key: "qrcodes-finalizar",
        limit: 20,
        windowMs: 60 * 1000,
      })
    ) {
      return;
    }

    await dbConnect();

    const { code, jurorToken, dia } = req.body || {};

    if (!code) {
      return res.status(400).json({ error: "Código é obrigatório" });
    }

    if (!isCodeFormatValido(code)) {
      return res.status(400).json({ error: "QR Code inválido" });
    }

    // Finalizar é irreversível e queima o QR Code: exige a sessão de jurado
    // emitida ao abrir o link. Antes, qualquer POST com um code conhecido
    // finalizava a votação de outra pessoa.
    const juror = jurorToken ? verificarTokenJurado(jurorToken) : null;
    if (!juror || juror.code !== code) {
      return res.status(401).json({
        error:
          "Sessão de jurado inválida ou expirada. Abra novamente o link do QR Code.",
      });
    }

    // Dia sendo finalizado. O jurado julga um dia por vez (Sábado/Domingo) e
    // volta para o outro depois com o mesmo link; sem `dia` (QR antigo, chamada
    // legada) a finalização encerra tudo, como antes.
    if (dia !== undefined && dia !== null && typeof dia !== "string") {
      return res.status(400).json({ error: "Dia inválido" });
    }
    const diaInformado = typeof dia === "string" && dia.trim() ? dia.trim() : null;
    const qrCode = await QRCodeAuth.findOne({ code });

    if (!qrCode) {
      return res.status(404).json({ error: "QR Code não encontrado" });
    }

    if (new Date() > qrCode.expiresAt) {
      return res.status(400).json({ error: "QR Code expirado" });
    }

    if (qrCode.isFinished || qrCode.isUsed) {
      // Idempotente: já finalizado, devolve sucesso sem regravar a data.
      return res.status(200).json({
        success: true,
        message: "Votação já estava finalizada",
        data: {
          jurorName: qrCode.jurorName,
          diasFinalizados: qrCode.diasFinalizados || [],
          diasPendentes: [],
          encerrado: true,
        },
      });
    }

    // Dias que o evento declara (categorias da votação). Enquanto sobrar dia que
    // o jurado não finalizou, o link continua valendo — é assim que ele julga o
    // sábado hoje e volta no domingo com o mesmo QR.
    const diasDeclarados = await diasDoEvento(qrCode.votacaoId);

    // O dia tem que pertencer ao evento (a lista de categorias é a fonte da
    // verdade). Votação antiga, sem categorias declaradas, não é bloqueada.
    if (
      diaInformado &&
      diasDeclarados.length > 0 &&
      !diasDeclarados.includes(diaInformado)
    ) {
      return res.status(400).json({
        error: `Dia inválido para este evento. Dias disponíveis: ${diasDeclarados.join(
          ", "
        )}.`,
      });
    }

    // Trava de servidor: antes o "votou todo mundo" existia só na tela, então um
    // POST direto finalizava com pendência e queimava o QR (o jurado perdia o
    // outro dia). Aqui o dia só fecha se todos os competidores dele têm voto.
    if (diaInformado) {
      const semVoto = await competidoresSemVotoNaDia(
        qrCode.votacaoId,
        diaInformado,
        qrCode.code
      );
      if (semVoto.length > 0) {
        const amostra = semVoto.slice(0, 3).join(", ");
        return res.status(400).json({
          error: `Ainda falta avaliar ${semVoto.length} competidor(es) de ${diaInformado}: ${amostra}${
            semVoto.length > 3 ? "..." : ""
          }`,
        });
      }
    }

    const diasFinalizados = Array.from(
      new Set([...(qrCode.diasFinalizados || [])])
    );
    if (diaInformado && !diasFinalizados.includes(diaInformado)) {
      diasFinalizados.push(diaInformado);
    }

    const diasPendentes = diasDeclarados.filter(
      (d) => !diasFinalizados.includes(d)
    );
    // Sem `dia` = finalização legada/geral -> encerra o QR na hora.
    const encerrado = !diaInformado || diasPendentes.length === 0;

    qrCode.diasFinalizados = ordenarDias(diasFinalizados);

    if (encerrado) {
      qrCode.isFinished = true;
      qrCode.isUsed = true;
      qrCode.usedAt = new Date();
    }

    await qrCode.save();

    return res.status(200).json({
      success: true,
      message: encerrado
        ? "Votação finalizada com sucesso"
        : `Avaliação de ${diaInformado} finalizada com sucesso`,
      data: {
        jurorName: qrCode.jurorName,
        diasFinalizados: qrCode.diasFinalizados,
        diasPendentes,
        encerrado,
      },
    });
  } catch (error) {
    console.error("Erro ao finalizar votação:", error);
    return res.status(500).json({ error: "Erro ao finalizar votação" });
  }
}
