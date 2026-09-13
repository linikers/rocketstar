// utils/categoryMap.ts
export const categoryToDay: Record<string, "Sexta" | "Sábado" | "Domingo"> = {
    // Sexta: sem categorias (o dia já foi encerrado)

    // Sábado
    "Fineline": "Sábado",
    "Minitattoo": "Sábado",
    "Old School": "Sábado",
    "Iniciante": "Sábado",
    "Aquarela": "Sábado",
    "Série de desenho": "Sábado",
    "Anime retrô": "Sábado",

    // Domingo
    "Toriyama": "Domingo",
    "Cicatrizado": "Domingo",
    "Whipshading": "Domingo",
    "Blackwork": "Domingo",
    "Colorido": "Domingo",
    "Realismo": "Domingo",
    "Livre/Fusion": "Domingo",
  };

// Dia de um competidor. Vem da categoria do competidor (a categoria é o dado
// que o cadastro guarda; o dia é derivado dela, não digitado). Categoria fora
// do mapa cai em "Outros" para o competidor NUNCA ficar invisível para o
// jurado — antes, uma categoria nova simplesmente não existiria em nenhum dia.
export const ORDEM_DIAS = ["Sexta", "Sábado", "Domingo", "Outros"] as const;
export const DIA_OUTROS = "Outros";
export type Dia = (typeof ORDEM_DIAS)[number];

export function diaDaCategoria(categoria?: string | null): Dia {
  if (categoria && categoryToDay[categoria]) {
    return categoryToDay[categoria];
  }
  return DIA_OUTROS;
}

// Mantém a ordem cronológica do evento (Sexta -> Sábado -> Domingo -> Outros)
// em vez da ordem alfabética.
export function ordenarDias(dias: string[]): string[] {
  return [...dias].sort((a, b) => {
    const ia = ORDEM_DIAS.indexOf(a as Dia);
    const ib = ORDEM_DIAS.indexOf(b as Dia);
    return (ia === -1 ? ORDEM_DIAS.length : ia) - (ib === -1 ? ORDEM_DIAS.length : ib);
  });
}
