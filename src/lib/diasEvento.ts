import Competidor from "@/models/Competidor";
import Votacao from "@/models/Votacao";
import { diaDaCategoria, ordenarDias } from "@/utils/categoryMap";

// Dias que o EVENTO declara (vêm das categorias da votação, que o admin já usa
// para organizar o cadastro). É a fonte da verdade para saber se o jurado ainda
// tem o que julgar. Importante: NÃO usamos os competidores cadastrados para
// isso — no sábado o domingo ainda não tem competidor cadastrado, e se a
// decisão dependesse disso o QR do jurado queimaria no sábado, impedindo-o de
// voltar no domingo.
export async function diasDoEvento(
  votacaoId?: string | null
): Promise<string[]> {
  if (!votacaoId) return [];

  const votacao = await Votacao.findById(votacaoId)
    .select("categorias")
    .lean();

  const categorias = (votacao as { categorias?: string[] } | null)?.categorias;
  const dias = new Set<string>(
    (categorias || []).map((categoria) => diaDaCategoria(categoria))
  );

  // Evento sem categorias declaradas: cai para os dias que já têm competidor
  // (senão não haveria como saber que o jurado ainda tem algo a julgar).
  if (dias.size === 0) {
    const competidores = await Competidor.find({ votacaoId })
      .select("category")
      .lean();
    for (const competidor of competidores) {
      dias.add(diaDaCategoria((competidor as { category?: string }).category));
    }
  }

  return ordenarDias(Array.from(dias));
}

type CompetidorLean = {
  name?: string;
  category?: string;
  votos?: { code?: string }[];
};

// Nomes dos competidores DAQUELE dia que este jurado ainda não votou. Usado para
// travar a finalização no servidor (a tela já escondia o botão, mas a API
// aceitava finalizar com pendência e queimava o QR Code).
export async function competidoresSemVotoNaDia(
  votacaoId: string | null | undefined,
  dia: string,
  code: string
): Promise<string[]> {
  if (!votacaoId) return [];

  const competidores = (await Competidor.find({ votacaoId })
    .select("name category votos")
    .lean()) as unknown as CompetidorLean[];

  return competidores
    .filter((competidor) => diaDaCategoria(competidor.category) === dia)
    .filter(
      (competidor) =>
        !(competidor.votos || []).some((voto) => voto.code === code)
    )
    .map((competidor) => competidor.name || "(sem nome)");
}
