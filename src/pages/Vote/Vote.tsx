import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Container,
  Skeleton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PageHeader from "@/components/Vote/PageHeader";
import CompetitorCard from "@/components/Vote/CompetitorCard";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useRouter } from "next/router";

export default function Vote() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [votados, setVotados] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        showSnackbar("Erro ao listar competidores");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showSnackbar]);

  const handleVoteComplete = useCallback((id: string) => {
    setVotados((prev) => new Set(prev).add(id));
  }, []);

  const todosVotados = users.length > 0 && votados.size === users.length;
  const pendentes = users.length - votados.size;

  const handleFinalizar = () => {
    setConfirmOpen(true);
  };

  const confirmarFinalizar = () => {
    setConfirmOpen(false);
    router.push("/Top100/Top100");
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
        <Box sx={{ width: "80%", maxWidth: 600 }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 2 }} />
          <Skeleton variant="rounded" height={120} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 1 }} />
          <Skeleton variant="rounded" height={120} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 1 }} />
          <Skeleton variant="rounded" height={120} sx={{ bgcolor: "rgba(184,243,255,0.1)" }} />
        </Box>
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

        {/* Progresso */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(184, 243, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#8AC6D0", fontWeight: 500 }}>
            {votados.size === 0
              ? `${users.length} competidor(es) para avaliar`
              : `${votados.size} de ${users.length} avaliado(s) — ${pendentes} pendente(s)`}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {users.length > 0 ? (
            users.map((user: any) => (
              <Grid item xs={12} key={user._id}>
                <CompetitorCard
                  user={user}
                  onVoteComplete={handleVoteComplete}
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

        {/* Botao Finalizar */}
        {todosVotados && (
          <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleFinalizar}
              sx={{
                py: 1.5,
                px: 6,
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              Finalizar Avaliação
            </Button>
          </Box>
        )}
      </Container>

      {/* Dialog de confirmacao */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            background: "#2D1B36",
            border: "1px solid rgba(184, 243, 255, 0.2)",
            borderRadius: 3,
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ color: "#B8F3FF", fontWeight: 600 }}>
          Finalizar Avaliação?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#8AC6D0" }}>
            Você já votou em todos os competidores. Após finalizar, não será
            possível voltar para alterar os votos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ color: "#8AC6D0" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmarFinalizar}
          >
            Sim, Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
