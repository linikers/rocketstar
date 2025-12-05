import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import {
  Box,
  Grid,
  Typography,
  Tabs,
  Tab,
  Container,
  Card,
  CardContent,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Filter as FilterIcon,
} from "@mui/icons-material";
import { IVotacao } from "@/models/Votacao";

export default function Top100() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

  const sortedUsers = [...users]
    .filter((user) => {
      if (categoriaSelecionada && user.category !== categoriaSelecionada)
        return false;
      return true;
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 100);

  const categoriasDaVotacao =
    votacoes.find((v) => v._id === selectedVotacaoId)?.categorias || [];

  const getPodiumColor = (index: number) => {
    if (index === 0) return "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"; // Ouro
    if (index === 1) return "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)"; // Prata
    if (index === 2) return "linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)"; // Bronze
    return "rgba(255, 255, 255, 0.05)";
  };

  const getPodiumIcon = (index: number) => {
    if (index < 3) return <TrophyIcon sx={{ fontSize: 32 }} />;
    return <StarIcon sx={{ fontSize: 24 }} />;
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
            <TrophyIcon sx={{ fontSize: 48, color: "#FFD700" }} />
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
              Top 100
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "#8AC6D0", opacity: 0.9 }}>
            Ranking dos melhores competidores
          </Typography>
        </Box>

        {/* Tabs de Votações */}
        {votacoes.length > 0 && (
          <Box
            sx={{
              mb: 4,
              borderRadius: 2,
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(184, 243, 255, 0.1)",
              p: 2,
            }}
          >
            <Tabs
              value={selectedVotacaoId}
              onChange={(_, newValue) => {
                setSelectedVotacaoId(newValue);
                setCategoriaSelecionada("");
              }}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{
                "& .MuiTab-root": {
                  color: "#8AC6D0",
                  fontWeight: 500,
                  "&.Mui-selected": {
                    color: "#B8F3FF",
                  },
                },
                "& .MuiTabs-indicator": {
                  background:
                    "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
                  height: 3,
                },
              }}
            >
              {votacoes.map((votacao) => (
                <Tab
                  key={votacao._id}
                  value={votacao._id}
                  label={votacao.nome}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Filtro de Categoria */}
        {categoriasDaVotacao.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <FormControl
              fullWidth={isMobile}
              sx={{
                minWidth: isMobile ? "100%" : 250,
              }}
            >
              <InputLabel
                sx={{
                  color: "#8AC6D0",
                  "&.Mui-focused": {
                    color: "#B8F3FF",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterIcon fontSize="small" />
                  Filtrar por categoria
                </Box>
              </InputLabel>
              <Select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                label="Filtrar por categoria"
                sx={{
                  color: "#B8F3FF",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(184, 243, 255, 0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8AC6D0",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#B8F3FF",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#8AC6D0",
                  },
                }}
              >
                <MenuItem value="">-- Todas --</MenuItem>
                {categoriasDaVotacao.map((categoria) => (
                  <MenuItem key={categoria} value={categoria}>
                    {categoria}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Grid de Competidores */}
        <Grid container spacing={3}>
          {sortedUsers.length > 0 ? (
            sortedUsers.map((user, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                <Card
                  sx={{
                    height: "100%",
                    background:
                      index < 3
                        ? getPodiumColor(index)
                        : "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    border:
                      index < 3
                        ? "2px solid rgba(255, 215, 0, 0.5)"
                        : "1px solid rgba(184, 243, 255, 0.2)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "visible",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow:
                        index < 3
                          ? "0 16px 40px rgba(255, 215, 0, 0.3)"
                          : "0 12px 32px rgba(184, 243, 255, 0.2)",
                    },
                  }}
                >
                  {/* Posição Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background:
                        index < 3
                          ? getPodiumColor(index)
                          : "linear-gradient(135deg, #B8F3FF 0%, #8AC6D0 100%)",
                      borderRadius: "50%",
                      width: 50,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "3px solid #36213E",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "1.2rem",
                        color: index < 3 ? "#36213E" : "#36213E",
                      }}
                    >
                      {index + 1}
                    </Typography>
                  </Box>

                  <CardContent sx={{ pt: 5, pb: 2 }}>
                    {/* Nome e Trabalho */}
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 1,
                          color: index < 3 ? "#36213E" : "#B8F3FF",
                        }}
                      >
                        {getPodiumIcon(index)}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: index < 3 ? "#36213E" : "#B8F3FF",
                          mb: 0.5,
                        }}
                      >
                        {user.name}
                      </Typography>
                      {user.work && (
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              index < 3 ? "rgba(54, 33, 62, 0.7)" : "#8AC6D0",
                            fontStyle: "italic",
                          }}
                        >
                          {user.work}
                        </Typography>
                      )}
                    </Box>

                    {/* Categoria */}
                    {user.category && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={user.category}
                          size="small"
                          sx={{
                            background:
                              index < 3
                                ? "rgba(54, 33, 62, 0.2)"
                                : "rgba(138, 198, 208, 0.2)",
                            color: index < 3 ? "#36213E" : "#8AC6D0",
                            border:
                              index < 3
                                ? "1px solid rgba(54, 33, 62, 0.3)"
                                : "1px solid rgba(138, 198, 208, 0.3)",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    )}

                    {/* Pontuações */}
                    <Stack spacing={0.5} sx={{ mb: 2 }}>
                      {[
                        { label: "Anatomia", value: user.anatomy },
                        { label: "Criatividade", value: user.creativity },
                        { label: "Pigmentação", value: user.pigmentation },
                        { label: "Traços", value: user.traces },
                        { label: "Legibilidade", value: user.readability },
                        { label: "Imp. Visual", value: user.visualimpact },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                index < 3 ? "rgba(54, 33, 62, 0.8)" : "#8AC6D0",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Chip
                            label={item.value || 0}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              background:
                                index < 3
                                  ? "rgba(54, 33, 62, 0.15)"
                                  : "rgba(184, 243, 255, 0.1)",
                              color: index < 3 ? "#36213E" : "#B8F3FF",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>

                    {/* Total Score */}
                    <Box
                      sx={{
                        borderTop:
                          index < 3
                            ? "2px solid rgba(54, 33, 62, 0.3)"
                            : "2px solid rgba(184, 243, 255, 0.2)",
                        pt: 2,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: index < 3 ? "#36213E" : "#B8F3FF",
                        }}
                      >
                        {user.totalScore}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            index < 3 ? "rgba(54, 33, 62, 0.7)" : "#8AC6D0",
                          fontWeight: 500,
                        }}
                      >
                        pontos totais
                      </Typography>
                    </Box>
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
