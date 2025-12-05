import { IVotacao } from "@/models/Votacao";
import { IQRCodeAuth } from "@/models/QRCodeAuth";
import {
  Button,
  Container,
  Grid,
  IconButton,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  QrCode2 as QrCodeIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import React, { FormEvent, useEffect, useState } from "react";
import QRCodeTable from "@/components/QRCode/QRCodeTable";

export default function AdminVotacaoPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [formState, setFormState] = useState({
    nome: "",
    data: new Date().toISOString().split("T")[0],
    categorias: "",
  });

  // Estados para QR Codes
  const [qrCodes, setQrCodes] = useState<
    Array<IQRCodeAuth & { status: "valido" | "expirado" | "usado" }>
  >([]);
  const [validityHours, setValidityHours] = useState<number>(72);
  const [loadingQR, setLoadingQR] = useState(false);

  const fetchVotacoes = async () => {
    try {
      const response = await fetch("/api/votacoes");
      const data: IVotacao[] = await response.json();
      setVotacoes(data);
    } catch (error) {
      console.error("Erro ao buscar votações:", error);
    }
  };

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qrcodes/list");
      const result = await response.json();
      if (result.success) {
        setQrCodes(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar QR Codes:", error);
    }
  };

  useEffect(() => {
    fetchVotacoes();
    fetchQRCodes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const categoriasArray = formState.categorias
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat);

    if (!formState.nome || categoriasArray.length === 0) {
      alert("Nome e pelo menos uma categoria são obrigatórios.");
      return;
    }

    try {
      const response = await fetch("/api/votacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formState.nome,
          data: new Date(formState.data),
          categorias: categoriasArray,
          ativo: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar votação");
      }

      setFormState({
        nome: "",
        data: new Date().toISOString().split("T")[0],
        categorias: "",
      });
      fetchVotacoes();
      alert("Votação criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar votação:", error);
      alert("Erro ao criar votação.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja deletar esta votação?")) {
      return;
    }
    try {
      const response = await fetch(`/api/votacoes?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao deletar");
      fetchVotacoes();
      alert("Votação deletada com sucesso.");
    } catch (error) {
      alert("Erro ao deletar votação.");
    }
  };

  const handleGenerateQRCode = async () => {
    if (validityHours <= 0) {
      alert("A validade deve ser maior que 0 horas.");
      return;
    }

    setLoadingQR(true);
    try {
      const response = await fetch("/api/qrcodes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validityHours }),
      });

      const result = await response.json();

      if (result.success) {
        alert("QR Code gerado com sucesso!");
        fetchQRCodes();
      } else {
        alert("Erro ao gerar QR Code.");
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      alert("Erro ao gerar QR Code.");
    } finally {
      setLoadingQR(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Painel Administrativo
          </Typography>
          <Typography variant="body1" sx={{ color: "#B8F3FF", opacity: 0.8 }}>
            Gerencie votações e QR codes de autenticação
          </Typography>
        </Box>

        {/* Seção de Votações */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(184, 243, 255, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <EventIcon sx={{ color: "#B8F3FF", mr: 1, fontSize: 32 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#B8F3FF",
              }}
            >
              Gerenciar Votações
            </Typography>
          </Box>

          {/* Formulário de Criação */}
          <Card
            sx={{
              mb: 4,
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: 2,
              border: "1px solid rgba(184, 243, 255, 0.1)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "#8AC6D0", fontWeight: 500 }}
              >
                Criar Nova Votação
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="nome"
                      label="Nome da Votação"
                      placeholder="Ex: Votação de Sexta"
                      value={formState.nome}
                      onChange={handleInputChange}
                      fullWidth
                      required
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="data"
                      label="Data"
                      type="date"
                      value={formState.data}
                      onChange={handleInputChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
                      name="categorias"
                      label="Categorias (separadas por vírgula)"
                      placeholder="Ex: Realismo, Old School, Aquarela"
                      value={formState.categorias}
                      onChange={handleInputChange}
                      fullWidth
                      required
                      multiline
                      rows={2}
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
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth={isMobile}
                      sx={{
                        minWidth: isMobile ? "100%" : 200,
                      }}
                    >
                      Criar Votação
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Votações */}
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#8AC6D0", fontWeight: 500 }}
          >
            Votações Existentes
          </Typography>
          <Grid container spacing={2}>
            {votacoes.length === 0 ? (
              <Grid item xs={12}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "#8AC6D0",
                    opacity: 0.6,
                  }}
                >
                  Nenhuma votação criada ainda
                </Box>
              </Grid>
            ) : (
              votacoes.map((votacao) => (
                <Grid item xs={12} md={6} key={votacao._id}>
                  <Card
                    sx={{
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 2,
                      border: "1px solid rgba(184, 243, 255, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(184, 243, 255, 0.15)",
                        border: "1px solid rgba(184, 243, 255, 0.3)",
                      },
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#B8F3FF",
                          fontWeight: 600,
                          mb: 1,
                        }}
                      >
                        {votacao.nome}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        gap={1}
                      >
                        {votacao.categorias.map((cat, idx) => (
                          <Chip
                            key={idx}
                            label={cat}
                            size="small"
                            sx={{
                              background: "rgba(138, 198, 208, 0.2)",
                              color: "#8AC6D0",
                              border: "1px solid rgba(138, 198, 208, 0.3)",
                            }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                    <CardActions
                      sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}
                    >
                      <IconButton
                        onClick={() => handleDelete(votacao._id)}
                        sx={{
                          color: "#f44336",
                          "&:hover": {
                            background: "rgba(244, 67, 54, 0.1)",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Paper>

        {/* Seção de QR Codes */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(184, 243, 255, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <QrCodeIcon sx={{ color: "#B8F3FF", mr: 1, fontSize: 32 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#B8F3FF",
              }}
            >
              QR Codes de Autenticação
            </Typography>
          </Box>

          {/* Formulário de Geração de QR */}
          <Card
            sx={{
              mb: 4,
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: 2,
              border: "1px solid rgba(184, 243, 255, 0.1)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 3, color: "#8AC6D0", fontWeight: 500 }}
              >
                Gerar Novo QR Code
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Validade (horas)"
                    type="number"
                    value={validityHours}
                    onChange={(e) => setValidityHours(Number(e.target.value))}
                    fullWidth
                    inputProps={{ min: 1 }}
                    helperText="Padrão: 72 horas (3 dias)"
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
                      "& .MuiFormHelperText-root": {
                        color: "#8AC6D0",
                        opacity: 0.7,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    onClick={handleGenerateQRCode}
                    disabled={loadingQR}
                    fullWidth
                    size="large"
                    startIcon={<QrCodeIcon />}
                  >
                    {loadingQR ? "Gerando..." : "Gerar QR Code"}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabela de QR Codes */}
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#8AC6D0", fontWeight: 500 }}
          >
            QR Codes Gerados
          </Typography>
          <QRCodeTable qrCodes={qrCodes} />
        </Paper>
      </Container>
    </Box>
  );
}
