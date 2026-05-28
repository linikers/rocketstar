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
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  QrCode2 as QrCodeIcon,
  Event as EventIcon,
  Logout as LogoutIcon,
  RocketLaunch,
} from "@mui/icons-material";
import React, { FormEvent, useEffect, useState } from "react";
import QRCodeTable from "@/components/QRCode/QRCodeTable";
import { categoryToDay } from "@/utils/categoryMap";
import PersonalDataForm from "@/components/Register/PersonalDataForm";
import VotingSelector from "@/components/Register/VotingSelector";
import CategorySelector from "@/components/Register/CategorySelector";
import RegistrationSummary from "@/components/Register/RegistrationSummary";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useRouter } from "next/router";

interface UserData {
  _id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  criadoEm: string;
}

export default function AdminVotacaoPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [user, setUser] = useState<{ nome: string; email: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(userData);
      setUser(parsed);
    } catch {
      router.push("/login");
      return;
    }

    setAuthChecked(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [formState, setFormState] = useState({
    nome: "",
    data: new Date().toISOString().split("T")[0],
  });
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);

  // Agrupa categorias por dia
  const categoriasPorDia: Record<string, string[]> = {};
  Object.entries(categoryToDay).forEach(([cat, dia]) => {
    if (!categoriasPorDia[dia]) categoriasPorDia[dia] = [];
    categoriasPorDia[dia].push(cat);
  });
  const dias = Object.keys(categoriasPorDia);

  const toggleCategoria = (cat: string) => {
    setSelectedCategorias((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Estados para QR Codes
  const [qrCodes, setQrCodes] = useState<
    Array<IQRCodeAuth & { status: "valido" | "expirado" | "usado" }>
  >([]);
  const [validityHours, setValidityHours] = useState<number>(72);
  const [jurorName, setJurorName] = useState("");

  // Estados para Usuarios
  const [users, setUsers] = useState<UserData[]>([]);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [userForm, setUserForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "jurado",
  });

  // Estados para Competidores
  const [competidores, setCompetidores] = useState<any[]>([]);
  const [competidorDialogOpen, setCompetidorDialogOpen] = useState(false);
  const [categoriasDaVotacao, setCategoriasDaVotacao] = useState<string[]>([]);
  const [competidorForm, setCompetidorForm] = useState({
    name: "",
    work: "",
    category: "",
    votacaoId: "",
  });
  const [loadingCompetidor, setLoadingCompetidor] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const result = await response.json();
      if (result.success) setUsers(result.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const [loadingQR, setLoadingQR] = useState(false);

  // Dashboard
  const [dashboard, setDashboard] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      const r = await fetch("/api/dashboard");
      const d = await r.json();
      if (d.success) setDashboard(d.data);
    } catch (_) {}
  };

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

  const fetchCompetidores = async () => {
    try {
      const response = await fetch("/api/list");
      const data = await response.json();
      if (Array.isArray(data)) setCompetidores(data);
    } catch (error) {
      console.error("Erro ao buscar competidores:", error);
    }
  };

  const handleDeleteCompetidor = async (id: string, name: string) => {
    if (!window.confirm(`Deletar competidor "${name}"?`)) return;
    try {
      const res = await fetch(`/api/save?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchCompetidores();
        showSnackbar("Competidor removido", "success");
      } else {
        showSnackbar(data.error || "Erro ao deletar", "error");
      }
    } catch (error) {
      console.error("Erro ao deletar competidor:", error);
      showSnackbar("Erro ao deletar competidor", "error");
    }
  };

  const handleSaveCompetidor = async (e: FormEvent) => {
    e.preventDefault();
    const { name, work, category, votacaoId } = competidorForm;
    if (!name || !work || !category || !votacaoId) {
      showSnackbar("Preencha todos os campos", "warning");
      return;
    }
    setLoadingCompetidor(true);
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, work, category, votacaoId }),
      });
      if (res.ok) {
        // Multi-submissao: mantem o nome, reseta trabalho + categoria + votacao
        setCompetidorForm((p) => ({ ...p, work: "", category: "", votacaoId: "" }));
        setCategoriasDaVotacao([]);
        fetchCompetidores();
        showSnackbar("Competidor cadastrado! 👍", "success");
      } else {
        const err = await res.json();
        showSnackbar(err.error || "Erro ao cadastrar", "error");
      }
    } catch (error) {
      console.error("Erro ao cadastrar competidor:", error);
      showSnackbar("Erro ao cadastrar competidor", "error");
    } finally {
      setLoadingCompetidor(false);
    }
  };

  useEffect(() => {
    fetchVotacoes();
    fetchQRCodes();
    fetchUsers();
    fetchDashboard();
    fetchCompetidores();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const categoriasArray = selectedCategorias;

    if (!formState.nome || categoriasArray.length === 0) {
      showSnackbar("Nome e pelo menos uma categoria são obrigatórios.", "warning");
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
      });
      setSelectedCategorias([]);
      fetchVotacoes();
      showSnackbar("Votação criada com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao criar votação:", error);
      showSnackbar("Erro ao criar votação.", "error");
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
      showSnackbar("Votação deletada com sucesso.", "success");
    } catch (error) {
      showSnackbar("Erro ao deletar votação.", "error");
    }
  };

  const handleGenerateQRCode = async () => {
    if (validityHours <= 0) {
      showSnackbar("Validade deve ser maior que 0 horas.", "warning");
      return;
    }
    if (!jurorName.trim()) {
      showSnackbar("Informe o nome do jurado.", "warning");
      return;
    }

    setLoadingQR(true);
    try {
      const response = await fetch("/api/qrcodes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validityHours, jurorName: jurorName.trim() }),
      });

      const result = await response.json();

      if (result.success) {
        showSnackbar(`QR Code gerado para ${jurorName.trim()}!`, "success");
        setJurorName("");
        fetchQRCodes();
      } else {
        showSnackbar(result.error || "Erro ao gerar QR Code.", "error");
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      showSnackbar("Erro ao gerar QR Code.", "error");
    } finally {
      setLoadingQR(false);
    }
  };

  // Handlers de Usuarios
  const handleSaveUser = async () => {
    if (!userForm.nome || !userForm.email) {
      showSnackbar("Nome e email são obrigatórios.", "warning");
      return;
    }
    if (!editingUser && !userForm.senha) {
      showSnackbar("Senha é obrigatória para novos usuários.", "warning");
      return;
    }
    try {
      if (editingUser) {
        const body = { _id: editingUser._id, nome: userForm.nome, email: userForm.email, role: userForm.role };
        if (userForm.senha) Object.assign(body, { senha: userForm.senha });
        await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userForm) });
      }
      setUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({ nome: "", email: "", senha: "", role: "jurado" });
      fetchUsers();
      showSnackbar("Usuário salvo com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao salvar usuario:", error);
      showSnackbar("Erro ao salvar usuário.", "error");
    }
  };

  const handleToggleUser = async (user: UserData) => {
    await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ _id: user._id, ativo: !user.ativo }) });
    fetchUsers();
  };

  if (!authChecked) {
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
        <Typography sx={{ color: "#B8F3FF" }}>Verificando acesso...</Typography>
      </Box>
    );
  }

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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                icon={<RocketLaunch />}
                label={user?.nome || "Admin"}
                sx={{
                  background: "rgba(184, 243, 255, 0.1)",
                  color: "#B8F3FF",
                  fontWeight: 600,
                  border: "1px solid rgba(184, 243, 255, 0.2)",
                  "& .MuiChip-icon": { color: "#B8F3FF" },
                }}
              />
              <Chip
                label={user?.role === "admin" ? "Administrador" : "Jurado"}
                size="small"
                sx={{
                  background:
                    user?.role === "admin"
                      ? "rgba(184, 243, 255, 0.2)"
                      : "rgba(138, 198, 208, 0.2)",
                  color: "#8AC6D0",
                  fontWeight: 500,
                }}
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: "#8AC6D0",
                borderColor: "rgba(184, 243, 255, 0.3)",
                "&:hover": {
                  borderColor: "#f44336",
                  color: "#f44336",
                  background: "rgba(244, 67, 54, 0.1)",
                },
              }}
            >
              Sair
            </Button>
          </Box>
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

        {/* Dashboard */}
        {dashboard && (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ background: "rgba(184, 243, 255, 0.08)", borderRadius: 2, border: "1px solid rgba(184, 243, 255, 0.2)" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: "#B8F3FF", fontSize: "1.8rem", fontWeight: 700 }}>{dashboard.totalVotacoes}</Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.75rem" }}>Votações</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ background: "rgba(138, 198, 208, 0.08)", borderRadius: 2, border: "1px solid rgba(138, 198, 208, 0.2)" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: "#B8F3FF", fontSize: "1.8rem", fontWeight: 700 }}>{dashboard.totalCompetidores}</Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.75rem" }}>Competidores</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ background: "rgba(255, 215, 0, 0.08)", borderRadius: 2, border: "1px solid rgba(255, 215, 0, 0.2)" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: "#B8F3FF", fontSize: "1.8rem", fontWeight: 700 }}>{dashboard.totalVotos}</Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.75rem" }}>Votos</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ background: "rgba(76, 175, 80, 0.08)", borderRadius: 2, border: "1px solid rgba(76, 175, 80, 0.2)" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: "#B8F3FF", fontSize: "1.8rem", fontWeight: 700 }}>{dashboard.qrCodes.validos}</Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.75rem" }}>QR Válidos</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ background: "rgba(244, 67, 54, 0.08)", borderRadius: 2, border: "1px solid rgba(244, 67, 54, 0.2)" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: "#B8F3FF", fontSize: "1.8rem", fontWeight: 700 }}>{dashboard.qrCodes.usados}</Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.75rem" }}>QR Usados</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ background: "rgba(255, 152, 0, 0.08)", borderRadius: 2, border: "1px solid rgba(255, 152, 0, 0.2)" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography sx={{ color: "#B8F3FF", fontSize: "1.8rem", fontWeight: 700 }}>{dashboard.totalUsers}</Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.75rem" }}>Usuários</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

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
                    <FormLabel sx={{ color: "#8AC6D0", mb: 1, display: "block" }}>
                      Categorias
                    </FormLabel>
                    {dias.map((dia) => (
                      <Box key={dia} sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#B8F3FF", mb: 1, fontWeight: 600 }}
                        >
                          {dia}
                        </Typography>
                        <FormGroup row>
                          {categoriasPorDia[dia].map((cat) => (
                            <FormControlLabel
                              key={cat}
                              control={
                                <Checkbox
                                  checked={selectedCategorias.includes(cat)}
                                  onChange={() => toggleCategoria(cat)}
                                  size="small"
                                  sx={{
                                    color: "rgba(184, 243, 255, 0.5)",
                                    "&.Mui-checked": {
                                      color: "#B8F3FF",
                                    },
                                  }}
                                />
                              }
                              label={cat}
                              sx={{
                                "& .MuiTypography-root": {
                                  color: "#8AC6D0",
                                  fontSize: "0.875rem",
                                },
                              }}
                            />
                          ))}
                        </FormGroup>
                      </Box>
                    ))}
                    {selectedCategorias.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                        {selectedCategorias.map((cat) => (
                          <Chip
                            key={cat}
                            label={cat}
                            size="small"
                            onDelete={() => toggleCategoria(cat)}
                            sx={{
                              background: "rgba(184, 243, 255, 0.15)",
                              color: "#B8F3FF",
                              border: "1px solid rgba(184, 243, 255, 0.3)",
                            }}
                          />
                        ))}
                      </Stack>
                    )}
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

        {/* Seção de Competidores */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            mt: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(184, 243, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#B8F3FF" }}>
              Competidores
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => {
                setCompetidorForm({ name: "", work: "", category: "", votacaoId: "" });
                setCategoriasDaVotacao([]);
                setCompetidorDialogOpen(true);
              }}
            >
              Novo Competidor
            </Button>
          </Box>

          {/* Lista de Competidores */}
          {competidores.length === 0 ? (
            <Typography
              sx={{
                color: "#8AC6D0",
                opacity: 0.6,
                textAlign: "center",
                py: 4,
              }}
            >
              Nenhum competidor cadastrado ainda
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {competidores.map((c: any) => (
                <Card
                  key={c._id}
                  sx={{
                    background: "rgba(255, 255, 255, 0.03)",
                    borderRadius: 2,
                    border: "1px solid rgba(184, 243, 255, 0.1)",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 1,
                      py: 1.5,
                      "&:last-child": { pb: 1.5 },
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color: "#B8F3FF",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {c.name}
                      </Typography>
                      <Typography sx={{ color: "#8AC6D0", fontSize: "0.8rem" }}>
                        {c.work} — {c.category}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#8AC6D0",
                          fontSize: "0.75rem",
                          opacity: 0.7,
                        }}
                      >
                        {c.votacaoId?.nome || "Votação removida"}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCompetidor(c._id, c.name)}
                      sx={{ color: "#f44336" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* Dialog de Cadastro de Competidor */}
        <Dialog
          open={competidorDialogOpen}
          onClose={() => setCompetidorDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: "#2D1B36",
              border: "1px solid rgba(184, 243, 255, 0.2)",
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle
            sx={{
              color: "#B8F3FF",
              fontWeight: 600,
              borderBottom: "1px solid rgba(184, 243, 255, 0.1)",
            }}
          >
            Novo Competidor
          </DialogTitle>
          <form onSubmit={handleSaveCompetidor}>
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={3}>
                <PersonalDataForm
                  name={competidorForm.name}
                  work={competidorForm.work}
                  onNameChange={(name) =>
                    setCompetidorForm((p) => ({ ...p, name }))
                  }
                  onWorkChange={(work) =>
                    setCompetidorForm((p) => ({ ...p, work }))
                  }
                />

                <VotingSelector
                  votacoes={votacoes}
                  selectedVotacaoId={competidorForm.votacaoId}
                  onVotacaoChange={(votacaoId) => {
                    setCompetidorForm((p) => ({ ...p, votacaoId, category: "" }));
                    const votacao = votacoes.find((v) => v._id === votacaoId);
                    setCategoriasDaVotacao(votacao?.categorias || []);
                  }}
                />

                <CategorySelector
                  categorias={categoriasDaVotacao}
                  selectedCategory={competidorForm.category}
                  onCategoryChange={(category) =>
                    setCompetidorForm((p) => ({ ...p, category }))
                  }
                />

                <RegistrationSummary
                  name={competidorForm.name}
                  work={competidorForm.work}
                  votacaoNome={
                    votacoes.find(
                      (v) => v._id === competidorForm.votacaoId
                    )?.nome || ""
                  }
                  category={competidorForm.category}
                />
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                p: 2,
                borderTop: "1px solid rgba(184, 243, 255, 0.1)",
              }}
            >
              <Button
                onClick={() => setCompetidorDialogOpen(false)}
                sx={{ color: "#8AC6D0" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={
                  !competidorForm.name ||
                  !competidorForm.votacaoId ||
                  !competidorForm.category
                }
              >
                {loadingCompetidor ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

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
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Nome do Jurado"
                    value={jurorName}
                    onChange={(e) => setJurorName(e.target.value)}
                    fullWidth
                    required
                    placeholder="Ex: João Silva"
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
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
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

        {/* Secao de Usuarios */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            mt: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(184, 243, 255, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#B8F3FF" }}>
              Usuários
            </Typography>
            <Button variant="contained" size="small" onClick={() => { setEditingUser(null); setUserForm({ nome: "", email: "", senha: "", role: "jurado" }); setUserDialogOpen(true); }}>
              Novo Usuário
            </Button>
          </Box>

          {users.length === 0 ? (
            <Typography sx={{ color: "#8AC6D0", opacity: 0.6, textAlign: "center", py: 4 }}>
              Nenhum usuário cadastrado
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {users.map((u) => (
                <Card key={u._id} sx={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: 2, border: "1px solid rgba(184, 243, 255, 0.1)" }}>
                  <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, py: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box>
                      <Typography sx={{ color: "#B8F3FF", fontWeight: 600, fontSize: "0.95rem" }}>
                        {u.nome}
                      </Typography>
                      <Typography sx={{ color: "#8AC6D0", fontSize: "0.8rem" }}>
                        {u.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip label={u.role === "admin" ? "Admin" : "Jurado"} size="small" sx={{ background: u.role === "admin" ? "rgba(184, 243, 255, 0.2)" : "rgba(138, 198, 208, 0.2)", color: "#8AC6D0" }} />
                      <Chip label={u.ativo ? "Ativo" : "Inativo"} size="small" color={u.ativo ? "success" : "default"} variant="outlined" />
                      <IconButton size="small" onClick={() => { setEditingUser(u); setUserForm({ nome: u.nome, email: u.email, senha: "", role: u.role }); setUserDialogOpen(true); }} sx={{ color: "#B8F3FF" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </IconButton>
                      {u.role !== "admin" && (
                        <IconButton size="small" onClick={() => handleToggleUser(u)} sx={{ color: u.ativo ? "#f44336" : "#4caf50" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        {/* Dialog de Criar/Editar Usuario */}
        <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { background: "linear-gradient(135deg, #36213E 0%, #554971 100%)", border: "1px solid rgba(184, 243, 255, 0.2)", borderRadius: 3 } }}
        >
          <DialogTitle sx={{ color: "#B8F3FF", fontWeight: 600, borderBottom: "1px solid rgba(184, 243, 255, 0.1)" }}>
            {editingUser ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nome" value={userForm.nome} onChange={(e) => setUserForm((p) => ({ ...p, nome: e.target.value }))} fullWidth required
                InputProps={{ sx: { color: "#B8F3FF", "& fieldset": { borderColor: "rgba(184, 243, 255, 0.3)" }, "&:hover fieldset": { borderColor: "#8AC6D0" }, "&.Mui-focused fieldset": { borderColor: "#B8F3FF" } } }}
                InputLabelProps={{ sx: { color: "#8AC6D0" } }}
              />
              <TextField label="Email" type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} fullWidth required
                InputProps={{ sx: { color: "#B8F3FF", "& fieldset": { borderColor: "rgba(184, 243, 255, 0.3)" }, "&:hover fieldset": { borderColor: "#8AC6D0" }, "&.Mui-focused fieldset": { borderColor: "#B8F3FF" } } }}
                InputLabelProps={{ sx: { color: "#8AC6D0" } }}
              />
              <TextField label={editingUser ? "Nova Senha (deixar vazio para manter)" : "Senha"} type="password" value={userForm.senha} onChange={(e) => setUserForm((p) => ({ ...p, senha: e.target.value }))} fullWidth required={!editingUser}
                InputProps={{ sx: { color: "#B8F3FF", "& fieldset": { borderColor: "rgba(184, 243, 255, 0.3)" }, "&:hover fieldset": { borderColor: "#8AC6D0" }, "&.Mui-focused fieldset": { borderColor: "#B8F3FF" } } }}
                InputLabelProps={{ sx: { color: "#8AC6D0" } }}
              />
              <TextField label="Tipo" select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))} fullWidth
                SelectProps={{ native: true }}
                InputProps={{ sx: { color: "#B8F3FF", "& fieldset": { borderColor: "rgba(184, 243, 255, 0.3)" } } }}
                InputLabelProps={{ sx: { color: "#8AC6D0" } }}
              >
                <option value="jurado">Jurado</option>
                <option value="admin">Administrador</option>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: "1px solid rgba(184, 243, 255, 0.1)" }}>
            <Button onClick={() => setUserDialogOpen(false)} sx={{ color: "#8AC6D0" }}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveUser}>
              {editingUser ? "Salvar" : "Criar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
