import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import { Box, Grid, Typography, Container } from "@mui/material";
import PageHeader from "@/components/Vote/PageHeader";
import CompetitorCard from "@/components/Vote/CompetitorCard";

interface VoteValuesState {
  anatomy: number;
  creativity: number;
  pigmentation: number;
  traces: number;
  readability: number;
  visualImpact: number;
  category: string;
}

interface VoteProps {
  onOpenSnackBar: (message: string) => void;
  users?: IUser[] | [];
  setUsers?: (users: IUser[]) => void;
}

export default function Vote({ onOpenSnackBar }: VoteProps) {
  const [totalScoreSum, setTotalScoreSum] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [voteValues, setVoteValues] = useState<VoteValuesState>({
    anatomy: 5,
    creativity: 5,
    pigmentation: 5,
    traces: 5,
    readability: 5,
    visualImpact: 5,
    category: "",
  });
  const [votingUserId, setVotingUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/list");
        if (!response.ok) {
          throw new Error("Erro ao listar competidores");
        }
        const data = await response.json();
        setUsers(data);
        const total = data.reduce(
          (acc: number, user: { totalScore: number }) => acc + user.totalScore,
          0
        );
        setTotalScoreSum(total);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        onOpenSnackBar("Erro ao listar competidores");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [onOpenSnackBar]);

  const handleSliderChange =
    (name: string) => (event: Event, value: number | number[]) => {
      setVoteValues((prevValues) => ({
        ...prevValues,
        [name]: value as number,
      }));
    };

  const handleVote = async (userId: string) => {
    setVotingUserId(userId);

    try {
      setLoading(true);
      const payload = {
        anatomy: voteValues.anatomy,
        creativity: voteValues.creativity,
        pigmentation: voteValues.pigmentation,
        traces: voteValues.traces,
        readability: voteValues.readability,
        visualImpact: voteValues.visualImpact,
      };

      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, competidorId: userId }),
      });
      if (!response.ok) {
        throw new Error("Erro ao registrar voto");
      }
      const updatedUser = await response.json();
      const updatedUsers = users.map((user: any) =>
        user._id === updatedUser._id ? { ...user, ...updatedUser } : user
      );

      setUsers(updatedUsers);
      const newTotalScore = updatedUsers.reduce(
        (acc, user) => acc + user.totalScore,
        0
      );
      setTotalScoreSum(newTotalScore);

      // Reset para valores médios
      setVoteValues({
        anatomy: 5,
        creativity: 5,
        pigmentation: 5,
        traces: 5,
        readability: 5,
        visualImpact: 5,
        category: "",
      });
      onOpenSnackBar("Voto registrado com sucesso! 🎉");
    } catch (error) {
      console.error("Erro ao votar:", error);
      onOpenSnackBar("Erro ao registrar voto");
    } finally {
      setLoading(false);
      setVotingUserId(null);
    }
  };

  if (loading && users.length === 0)
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
        <Typography sx={{ color: "#B8F3FF", fontSize: "1.5rem" }}>
          Carregando...
        </Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <PageHeader />

        <Grid container spacing={3}>
          {users.length > 0 ? (
            users.map((user: any) => (
              <Grid item xs={12} key={user._id}>
                <CompetitorCard
                  user={user}
                  voteValues={voteValues}
                  totalScoreSum={totalScoreSum}
                  votingUserId={votingUserId}
                  onSliderChange={handleSliderChange}
                  onVote={handleVote}
                />
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
                  Nenhum participante cadastrado
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
