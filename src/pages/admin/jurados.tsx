import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  RocketLaunch,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useSnackbar } from "@/contexts/SnackbarContext";

interface QRCodeData {
  _id: string;
  code: string;
  jurorName: string;
  isUsed: boolean;
  usedAt?: string;
  expiresAt: string;
  createdAt: string;
  status?: "valido" | "expirado" | "usado";
}

export default function AdminJurados() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetDialog, setResetDialog] = useState<{
    open: boolean;
    code?: string;
    name?: string;
  }>({ open: false });

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/qrcodes/list");
      const data = await res.json();
      if (data.success) {
        const withStatus = data.data.map((qr: QRCodeData) => {
          let status: "valido" | "expirado" | "usado";
          if (qr.isUsed) status = "usado";
          else if (new Date() > new Date(qr.expiresAt)) status = "expirado";
          else status = "valido";
          return { ...qr, status };
        });
        setQrCodes(withStatus);
      }
    } catch (error) {
      console.error("Erro ao buscar QR Codes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const handleResetVotos = async () => {
    if (!resetDialog.code) return;
    try {
      // Busca todos os competidores e zera votos
      const res = await fetch("/api/list");
      const competidores = await res.json();
      if (Array.isArray(competidores) && competidores.length > 0) {
        await Promise.all(
          competidores.map((c: any) =>
            fetch(`/api/save?id=${c._id}`, { method: "PUT" })
          )
        );
      }
      showSnackbar(`Votos zerados para testes do jurado "${resetDialog.name}"`, "success");
      setResetDialog({ open: false });
    } catch (error) {
      showSnackbar("Erro ao zerar votos", "error");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const finalizados = qrCodes.filter((q) => q.isUsed);
  const pendentes = qrCodes.filter(
    (q) => !q.isUsed && new Date() <= new Date(q.expiresAt)
  );

  const authChecked = true; // Simplified since we handle auth elsewhere

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
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <IconButton
              onClick={() => router.push("/admin")}
              sx={{ color: "#8AC6D0" }}
            >
              <BackIcon />
            </IconButton>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background:
                  "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Jurados
            </Typography>
          </Box>
        </Box>

        {/* Cards de resumo */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexWrap: "wrap",
          }}
        >
          <Paper
            sx={{
              p: 3,
              flex: 1,
              minWidth: 200,
              textAlign: "center",
              background: "rgba(76, 175, 80, 0.1)",
              border: "1px solid rgba(76, 175, 80, 0.3)",
              borderRadius: 2,
            }}
          >
            <Typography sx={{ color: "#4caf50", fontSize: "2rem", fontWeight: 700 }}>
              {finalizados.length}
            </Typography>
            <Typography sx={{ color: "#8AC6D0", fontSize: "0.85rem" }}>
              Finalizaram
            </Typography>
          </Paper>
          <Paper
            sx={{
              p: 3,
              flex: 1,
              minWidth: 200,
              textAlign: "center",
              background: "rgba(255, 152, 0, 0.1)",
              border: "1px solid rgba(255, 152, 0, 0.3)",
              borderRadius: 2,
            }}
          >
            <Typography sx={{ color: "#ff9800", fontSize: "2rem", fontWeight: 700 }}>
              {pendentes.length}
            </Typography>
            <Typography sx={{ color: "#8AC6D0", fontSize: "0.85rem" }}>
              Pendentes
            </Typography>
          </Paper>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#B8F3FF" }} />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: 2,
              border: "1px solid rgba(184, 243, 255, 0.1)",
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{ background: "rgba(184, 243, 255, 0.05)" }}
                >
                  <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                    Jurado
                  </TableCell>
                  <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                    Criado em
                  </TableCell>
                  <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                    Expira em
                  </TableCell>
                  <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qrCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", color: "#8AC6D0", py: 4 }}>
                      Nenhum QR Code gerado ainda
                    </TableCell>
                  </TableRow>
                ) : (
                  qrCodes.map((qr) => (
                    <TableRow
                      key={qr._id}
                      sx={{
                        "&:hover": {
                          background: "rgba(184, 243, 255, 0.05)",
                        },
                        borderBottom: "1px solid rgba(184, 243, 255, 0.1)",
                      }}
                    >
                      <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                        {qr.jurorName}
                      </TableCell>
                      <TableCell sx={{ color: "#8AC6D0", fontSize: "0.85rem" }}>
                        {formatDate(qr.createdAt)}
                      </TableCell>
                      <TableCell sx={{ color: "#8AC6D0", fontSize: "0.85rem" }}>
                        {formatDate(qr.expiresAt)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            qr.status === "usado"
                              ? "Finalizou"
                              : qr.status === "expirado"
                              ? "Expirado"
                              : "Pendente"
                          }
                          size="small"
                          icon={
                            qr.status === "usado" ? (
                              <CheckIcon />
                            ) : (
                              <CancelIcon />
                            )
                          }
                          sx={{
                            background:
                              qr.status === "usado"
                                ? "rgba(76, 175, 80, 0.2)"
                                : qr.status === "expirado"
                                ? "rgba(244, 67, 54, 0.2)"
                                : "rgba(255, 152, 0, 0.2)",
                            color:
                              qr.status === "usado"
                                ? "#4caf50"
                                : qr.status === "expirado"
                                ? "#f44336"
                                : "#ff9800",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {qr.status === "valido" && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<DeleteIcon />}
                            onClick={() =>
                              setResetDialog({
                                open: true,
                                code: qr.code,
                                name: qr.jurorName,
                              })
                            }
                            sx={{
                              borderColor: "rgba(255, 152, 0, 0.4)",
                              color: "#ff9800",
                              fontSize: "0.75rem",
                              "&:hover": {
                                borderColor: "#ff9800",
                                background: "rgba(255, 152, 0, 0.1)",
                              },
                            }}
                          >
                            Resetar votos
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Dialog de confirmacao reset */}
        <Dialog
          open={resetDialog.open}
          onClose={() => setResetDialog({ open: false })}
          PaperProps={{
            sx: {
              background: "#2D1B36",
              border: "1px solid rgba(184, 243, 255, 0.2)",
              borderRadius: 3,
              maxWidth: 450,
            },
          }}
        >
          <DialogTitle sx={{ color: "#B8F3FF", fontWeight: 600 }}>
            Resetar votos?
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#8AC6D0", mb: 1 }}>
              O jurado <strong>{resetDialog.name}</strong> não finalizou a
              votação. Deseja zerar todos os votos para permitir um novo teste?
            </Typography>
            <Typography sx={{ color: "#f44336", fontSize: "0.85rem" }}>
              Isso irá resetar TODOS os competidores (votos e notas).
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setResetDialog({ open: false })}
              sx={{ color: "#8AC6D0" }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleResetVotos}
            >
              Sim, resetar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
