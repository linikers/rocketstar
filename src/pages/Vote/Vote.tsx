import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import {
  Button,
  Grid,
  LinearProgress,
  Typography,
  Box,
  Slider,
  Card,
  CardContent,
  Stack,
  Chip,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from "@mui/icons-material";

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

const criteriaConfig = [
  { name: "anatomy", label: "Anatomia", icon: "🎯" },
  { name: "creativity", label: "Criatividade", icon: "💡" },
  { name: "pigmentation", label: "Pigmentação", icon: "🎨" },
  { name: "traces", label: "Traços", icon: "✏️" },
  { name: "readability", label: "Legibilidade", icon: "👁️" },
  { name: "visualImpact", label: "Impacto Visual", icon: "⚡" },
];

export default function Vote({ onOpenSnackBar }: VoteProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <TrophyIcon sx={{ fontSize: 48, color: "#B8F3FF" }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "2rem", md: "3rem" },
              }}
            >
              Vote Agora
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "#8AC6D0", opacity: 0.9 }}>
            Avalie cada critério de 0 a 10 usando os controles deslizantes
          </Typography>
        </Box>

        {/* Cards de Votação */}
        <Grid container spacing={3}>
          {users.length > 0 ? (
            users.map((user: any) => (
              <Grid item xs={12} key={user._id}>
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    border: "1px solid rgba(184, 243, 255, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 32px rgba(184, 243, 255, 0.2)",
                      border: "1px solid rgba(184, 243, 255, 0.4)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    {/* Header do Card */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: 4,
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            color: "#B8F3FF",
                            fontWeight: 700,
                            mb: 0.5,
                          }}
                        >
                          {user.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#8AC6D0", opacity: 0.8 }}
                        >
                          {user.work}
                        </Typography>
                      </Box>
                      <Chip
                        label={user.category}
                        icon={<StarIcon />}
                        sx={{
                          background: "rgba(138, 198, 208, 0.2)",
                          color: "#8AC6D0",
                          border: "1px solid rgba(138, 198, 208, 0.3)",
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {/* Critérios de Votação */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      {criteriaConfig.map((criteria) => (
                        <Grid item xs={12} md={6} key={criteria.name}>
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid rgba(184, 243, 255, 0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#8AC6D0",
                                  fontWeight: 500,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <span style={{ fontSize: "1.2rem" }}>
                                  {criteria.icon}
                                </span>
                                {criteria.label}
                              </Typography>
                              <Chip
                                label={
                                  voteValues[
                                    criteria.name as keyof VoteValuesState
                                  ]
                                }
                                size="small"
                                sx={{
                                  background:
                                    "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
                                  color: "#36213E",
                                  fontWeight: 700,
                                  minWidth: 40,
                                }}
                              />
                            </Box>
                            <Slider
                              value={
                                voteValues[
                                  criteria.name as keyof VoteValuesState
                                ] as number
                              }
                              onChange={handleSliderChange(criteria.name)}
                              min={0}
                              max={10}
                              step={1}
                              marks={[
                                { value: 0, label: "0" },
                                { value: 5, label: "5" },
                                { value: 10, label: "10" },
                              ]}
                              sx={{
                                color: "#8AC6D0",
                                "& .MuiSlider-thumb": {
                                  background:
                                    "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
                                  boxShadow:
                                    "0 2px 8px rgba(184, 243, 255, 0.4)",
                                  "&:hover, &.Mui-focusVisible": {
                                    boxShadow:
                                      "0 0 0 8px rgba(184, 243, 255, 0.16)",
                                  },
                                },
                                "& .MuiSlider-track": {
                                  background:
                                    "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
                                  border: "none",
                                },
                                "& .MuiSlider-rail": {
                                  background: "rgba(184, 243, 255, 0.2)",
                                },
                                "& .MuiSlider-mark": {
                                  background: "rgba(184, 243, 255, 0.4)",
                                },
                                "& .MuiSlider-markLabel": {
                                  color: "#8AC6D0",
                                  fontSize: "0.75rem",
                                },
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    {/* Pontuação Atual */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: "rgba(184, 243, 255, 0.05)",
                        border: "1px solid rgba(184, 243, 255, 0.2)",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#8AC6D0", mb: 1, fontWeight: 500 }}
                      >
                        Pontuação Atual
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          totalScoreSum > 0
                            ? (user.totalScore / totalScoreSum) * 100
                            : 0
                        }
                        sx={{
                          height: 12,
                          borderRadius: 2,
                          backgroundColor: "rgba(184, 243, 255, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            background:
                              "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
                            borderRadius: 2,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#B8F3FF",
                          display: "block",
                          mt: 1,
                          fontWeight: 600,
                        }}
                      >
                        {user.totalScore} pontos (
                        {totalScoreSum > 0
                          ? ((user.totalScore / totalScoreSum) * 100).toFixed(2)
                          : 0}
                        %)
                      </Typography>
                    </Box>

                    {/* Botão de Votar */}
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => handleVote(user._id)}
                      disabled={votingUserId === user._id}
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                      }}
                    >
                      {votingUserId === user._id
                        ? "Enviando..."
                        : "Confirmar Voto"}
                    </Button>
                  </CardContent>
                </Card>
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
