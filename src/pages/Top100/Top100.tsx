import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import { Box, Grid, Typography, Container, Skeleton } from "@mui/material";
import { IVotacao } from "@/models/Votacao";
import VotingTabs from "@/components/Top100/components/VotingTabs";
import CategoryFilter from "@/components/Top100/components/CategoryFilter";
import RankingCard from "@/components/Top100/components/RankingCard";
import PageHeader from "@/components/Top100/components/PageHeader";

export default function Top100() {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [selectedVotacaoId, setSelectedVotacaoId] = useState<string>("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");

  useEffect(() => {
    const fetchVotacoes = async () => {
      try {
        const response = await fetch("/api/votacoes");
        if (!response.ok) {
          throw new Error("Erro ao carregar votações");
        }
        const data: IVotacao[] = await response.json();
        setVotacoes(data);
        if (data.length > 0) {
          setSelectedVotacaoId(data[0]._id);
        }
      } catch (error) {
        console.error("Erro ao buscar votações:", error);
      }
    };

    fetchVotacoes();
  }, []);

  useEffect(() => {
    if (!selectedVotacaoId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/list?votacaoId=${selectedVotacaoId}`
        );
        if (!response.ok) {
          throw new Error("Erro ao listar competidores");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar competidores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedVotacaoId]);

  const handleVotacaoChange = (votacaoId: string) => {
    setSelectedVotacaoId(votacaoId);
    setCategoriaSelecionada("");
  };

  // Filtra por categoria (quando selecionada) e ordena por totalScore.
// No ranking GERAL (sem categoria), deduplica por NOME mantendo a melhor nota,
// já que um competidor tem um documento por categoria (senão apareceria repetido).
let rankingSource = [...users];
if (categoriaSelecionada) {
  rankingSource = rankingSource.filter(
    (user) => user.category === categoriaSelecionada
  );
} else {
  const melhorPorNome = new Map<string, (typeof users)[number]>();
  for (const u of rankingSource) {
    const atual = melhorPorNome.get(u.name);
    if (!atual || u.totalScore > atual.totalScore) melhorPorNome.set(u.name, u);
  }
  rankingSource = Array.from(melhorPorNome.values());
}

const sortedUsers = rankingSource
  .sort((a, b) => b.totalScore - a.totalScore)
  .slice(0, 100);

  const categoriasDaVotacao =
    votacoes.find((v) => v._id === selectedVotacaoId)?.categorias || [];

  if (loading && users.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        }}
      >
        <Box sx={{ width: "80%", maxWidth: 600 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 3 }} />
          <Skeleton variant="rounded" height={100} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 2 }} />
          <Skeleton variant="rounded" height={100} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 2 }} />
          <Skeleton variant="rounded" height={100} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 2 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        <PageHeader />

        <VotingTabs
          votacoes={votacoes}
          selectedVotacaoId={selectedVotacaoId}
          onVotacaoChange={handleVotacaoChange}
        />

        <CategoryFilter
          categorias={categoriasDaVotacao}
          selectedCategory={categoriaSelecionada}
          onCategoryChange={setCategoriaSelecionada}
        />

        <Grid container spacing={4}>
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user, index) => (
              <Grid item xs={12} sm={6} md={6} lg={6} xl={4} key={user.id}>
                <RankingCard user={user} index={index} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "#8AC6D0",
                }}
              >
                <Typography variant="h6">
                  Nenhum competidor encontrado para esta votação.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
