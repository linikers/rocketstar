import { IVotacao } from "@/models/Votacao";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Event as EventIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import React, { FormEvent, useEffect, useState } from "react";

export interface IUser {
  id: string;
  name: string;
  work: string;
  votes: number;
  percent?: number;
  anatomy: number;
  creativity: number;
  pigmentation: number;
  traces: number;
  readability: number;
  visualimpact: number;
  totalScore: number;
  day: "Sexta" | "Sábado" | "Domingo";
  category: string;
  competidorId?: string;
  jurorId?: string;
}

interface IRegisterProps {
  onRegister: () => void;
}

export default function Register({ onRegister }: IRegisterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState<IUser>({
    id: "",
    name: "",
    work: "",
    votes: 0,
    percent: 0,
    anatomy: 0,
    creativity: 0,
    pigmentation: 0,
    traces: 0,
    readability: 0,
    visualimpact: 0,
    totalScore: 0,
    day: "Sexta",
    category: "",
  });
  const [, setSnackbarMessage] = useState("");
  const [, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [, setSnackbarOpen] = useState(false);
  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [votacaoSelecionadaId, setVotacaoSelecionadaId] = useState<string>("");
  const [categoriasDaVotacao, setCategoriasDaVotacao] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const fetchVotacoes = async () => {
      try {
        const response = await fetch("/api/votacoes");
        if (!response.ok) {
          throw new Error("Erro ao carregar votações");
        }
        const data: IVotacao[] = await response.json();
        setVotacoes(data);
      } catch (error) {
        console.error("Falha ao buscar votações:", error);
        setSnackbarMessage("Erro ao carregar votações.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchVotacoes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]:
        name === "votes" ||
        name === "anatomy" ||
        name === "creativity" ||
        name === "pigmentation" ||
        name === "traces" ||
        name === "readability" ||
        name === "visualimpact" ||
        name === "totalScore"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleVotacaoChange = (votacaoId: string) => {
    setVotacaoSelecionadaId(votacaoId);
    const votacao = votacoes.find((v) => v._id === votacaoId);
    if (votacao) {
      setCategoriasDaVotacao(votacao.categorias);
      setFormData((prev) => ({ ...prev, category: "" }));
      setActiveStep(1);
    } else {
      setCategoriasDaVotacao([]);
    }
  };

  const handleCategoryChange = (categoria: string) => {
    setFormData((prevState) => ({
      ...prevState,
      category: categoria,
    }));
    setActiveStep(2);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!votacaoSelecionadaId || !formData.category) {
      setSnackbarMessage("Por favor, selecione uma votação e uma categoria.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          work: formData.work,
          votacaoId: votacaoSelecionadaId,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setSnackbarMessage(`Erro ao salvar: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const savedUser = await response.json();
      setSnackbarMessage("Registrado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onRegister();

      // Reset do formulário
      setFormData({
        id: "",
        name: "",
        work: "",
        votes: 0,
        percent: 0,
        anatomy: 0,
        creativity: 0,
        pigmentation: 0,
        traces: 0,
        readability: 0,
        visualimpact: 0,
        totalScore: 0,
        day: "Sexta",
        category: "",
      });
      setVotacaoSelecionadaId("");
      setCategoriasDaVotacao([]);
      setActiveStep(0);
    } catch (error) {
      setSnackbarMessage("Erro ao salvar");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const steps = [
    "Dados Pessoais",
    "Selecionar Votação",
    "Selecionar Categoria",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
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
            <PersonAddIcon sx={{ fontSize: 48, color: "#B8F3FF" }} />
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
              Registro de Competidor
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: "#8AC6D0", opacity: 0.9 }}>
            Preencha os dados para participar da competição
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel={!isMobile}
            orientation={isMobile ? "vertical" : "horizontal"}
            sx={{
              "& .MuiStepLabel-label": {
                color: "#8AC6D0",
                "&.Mui-active": {
                  color: "#B8F3FF",
                  fontWeight: 600,
                },
                "&.Mui-completed": {
                  color: "#8AC6D0",
                },
              },
              "& .MuiStepIcon-root": {
                color: "rgba(138, 198, 208, 0.3)",
                "&.Mui-active": {
                  color: "#B8F3FF",
                },
                "&.Mui-completed": {
                  color: "#8AC6D0",
                },
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Formulário */}
        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            border: "1px solid rgba(184, 243, 255, 0.2)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <form onSubmit={handleRegister}>
              <Grid container spacing={3}>
                {/* Dados Pessoais */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#B8F3FF",
                      fontWeight: 600,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <PersonAddIcon />
                    Dados Pessoais
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nome do Competidor"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="Digite seu nome completo"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#B8F3FF",
                        "& fieldset": {
                          borderColor: "rgba(184, 243, 255, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#8AC6D0",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#B8F3FF",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#8AC6D0",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Estúdio / Trabalho"
                    name="work"
                    value={formData.work}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Nome do estúdio ou trabalho apresentado"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#B8F3FF",
                        "& fieldset": {
                          borderColor: "rgba(184, 243, 255, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "#8AC6D0",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#B8F3FF",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#8AC6D0",
                      },
                    }}
                  />
                </Grid>

                {/* Seleção de Votação */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#B8F3FF",
                      fontWeight: 600,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <EventIcon />
                    Votação
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel
                      sx={{
                        color: "#8AC6D0",
                        "&.Mui-focused": {
                          color: "#B8F3FF",
                        },
                      }}
                    >
                      Selecione a votação
                    </InputLabel>
                    <Select
                      value={votacaoSelecionadaId}
                      label="Selecione a Votação"
                      onChange={(e) =>
                        handleVotacaoChange(e.target.value as string)
                      }
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
                      <MenuItem value="">
                        <em>-- Escolha uma votação --</em>
                      </MenuItem>
                      {votacoes.map((v) => (
                        <MenuItem key={v._id} value={v._id}>
                          {v.nome} (
                          {new Date(v.data).toLocaleDateString("pt-BR")})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Seleção de Categoria */}
                {votacaoSelecionadaId && (
                  <>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#B8F3FF",
                          fontWeight: 600,
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CategoryIcon />
                        Categoria
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel
                          sx={{
                            color: "#8AC6D0",
                            "&.Mui-focused": {
                              color: "#B8F3FF",
                            },
                          }}
                        >
                          Selecione a Categoria
                        </InputLabel>
                        <Select
                          value={formData.category}
                          label="Selecione a Categoria"
                          onChange={(e) => handleCategoryChange(e.target.value)}
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
                          <MenuItem value="">
                            <em>-- Escolha uma categoria --</em>
                          </MenuItem>
                          {categoriasDaVotacao.map((categoria) => (
                            <MenuItem key={categoria} value={categoria}>
                              {categoria}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}

                {/* Resumo */}
                {formData.category && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: "rgba(184, 243, 255, 0.05)",
                        border: "1px solid rgba(184, 243, 255, 0.2)",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#8AC6D0",
                          mb: 2,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CheckCircleIcon fontSize="small" />
                        Resumo do Registro
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
                            Nome:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#B8F3FF", fontWeight: 600 }}
                          >
                            {formData.name || "-"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
                            Estúdio:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#B8F3FF", fontWeight: 600 }}
                          >
                            {formData.work || "-"}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
                            Votação:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#B8F3FF", fontWeight: 600 }}
                          >
                            {
                              votacoes.find(
                                (v) => v._id === votacaoSelecionadaId
                              )?.nome
                            }
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
                            Categoria:
                          </Typography>
                          <Chip
                            label={formData.category}
                            size="small"
                            sx={{
                              background: "rgba(138, 198, 208, 0.2)",
                              color: "#8AC6D0",
                              border: "1px solid rgba(138, 198, 208, 0.3)",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Botão de Enviar */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={
                      !formData.name ||
                      !votacaoSelecionadaId ||
                      !formData.category
                    }
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    Confirmar Registro
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
