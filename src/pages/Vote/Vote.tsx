import { useCallback, useEffect, useRef, useState } from "react";
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
  keyframes,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import PageHeader from "@/components/Vote/PageHeader";
import CompetitorCard from "@/components/Vote/CompetitorCard";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useRouter } from "next/router";

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(5deg); }
  50% { transform: translateY(-10px) rotate(-5deg); }
  75% { transform: translateY(-30px) rotate(3deg); }
`;

const confettiChars = ["🎉", "🎊", "✨", "⭐", "🏆", "🎈", "🌟", "💫"];

interface VotacaoResumo {
  _id: string;
  nome: string;
}

const JUROR_TOKEN_KEY = "jurorToken";
const JUROR_VOTACAO_KEY = "jurorVotacaoId";

export default function Vote() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const { code } = router.query;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [votados, setVotados] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Sessão do jurado (emitida pelo /api/qrcodes/validate) e evento do QR.
  const [jurorToken, setJurorToken] = useState<string | null>(null);
  const [votacaoId, setVotacaoId] = useState<string>("");
  const [votacoesDisponiveis, setVotacoesDisponiveis] = useState<VotacaoResumo[]>([]);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  // 1) Valida o QR Code: obtém a sessão do jurado e o evento vinculado.
  useEffect(() => {
    if (!code || typeof code !== "string") return;

    let cancelado = false;

    const validarCode = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/qrcodes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const payload = await response.json().catch(() => ({}));

        if (cancelado) return;

        if (!response.ok || !payload?.success) {
          const mensagem = payload?.error || "QR Code inválido.";
          // QR já finalizado: mostra a tela de conclusão em vez de erro seco.
          if (/finalizad|utilizad/i.test(mensagem)) {
            setFinalizado(true);
            return;
          }
          setErroValidacao(mensagem);
          showSnackbar(mensagem);
          return;
        }

        const { jurorToken: token, votacao, votacoesAtivas } = payload.data;

        if (token) sessionStorage.setItem(JUROR_TOKEN_KEY, token);
        setJurorToken(token ?? null);

        if (votacao?._id) {
          sessionStorage.setItem(JUROR_VOTACAO_KEY, votacao._id);
          setVotacaoId(votacao._id);
          return;
        }

        // QR Code emitido antes do vínculo com evento (ou sem evento definido):
        // usa o evento mais recente se só existir um, senão pede para escolher.
        const ativas: VotacaoResumo[] = votacoesAtivas || [];
        if (ativas.length === 1) {
          sessionStorage.setItem(JUROR_VOTACAO_KEY, ativas[0]._id);
          setVotacaoId(ativas[0]._id);
        } else if (ativas.length > 1) {
          setVotacoesDisponiveis(ativas);
        } else {
          setErroValidacao(
            "Nenhum evento ativo no momento. Avise o organizador."
          );
        }
      } catch (error) {
        console.error("Erro ao validar QR Code:", error);
        if (!cancelado) {
          setErroValidacao("Não foi possível validar o QR Code. Tente novamente.");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    validarCode();

    return () => {
      cancelado = true;
    };
  }, [code, showSnackbar]);

  // 2) Busca APENAS os competidores do evento do QR Code, e já marca os que
  // este jurado votou (antes vinha a base inteira, de todos os eventos).
  useEffect(() => {
    if (!votacaoId || !code || typeof code !== "string") return;

    let cancelado = false;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/list?votacaoId=${encodeURIComponent(votacaoId)}&code=${encodeURIComponent(code)}`
        );
        if (!response.ok) {
          throw new Error("Erro ao listar competidores");
        }
        const data = await response.json();
        if (cancelado) return;

        const lista = Array.isArray(data) ? data : [];
        setUsers(lista);
        setCurrentIndex(0);
        setVotados(
          new Set(lista.filter((u: any) => u.jaVotou).map((u: any) => u._id))
        );
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        if (!cancelado) showSnackbar("Erro ao listar competidores");
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      cancelado = true;
    };
  }, [votacaoId, code, showSnackbar]);

  const handleVoteComplete = useCallback((id: string) => {
    setVotados((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const allVoted = users.length > 0 && votados.size === users.length;
  const votedCount = votados.size;
  const totalCount = users.length;
  const currentUser = users[currentIndex];
  const isCurrentVoted = currentUser ? votados.has(currentUser._id) : false;

  const goToNext = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex((i) => i + 1);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFinalizar = () => {
    setConfirmOpen(true);
  };

  const confirmarFinalizar = async () => {
    setConfirmOpen(false);

    if (code && typeof code === "string") {
      try {
        const response = await fetch("/api/qrcodes/finalizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, jurorToken }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          showSnackbar(
            payload?.error || "Não foi possível finalizar a votação."
          );
          return;
        }
      } catch (e) {
        console.error("Erro ao finalizar:", e);
        showSnackbar("Falha de conexão ao finalizar. Tente novamente.");
        return;
      }
    }

    setFinalizado(true);

    setTimeout(() => {
      router.push("/Top100/Top100");
    }, 3500);
  };

  if (erroValidacao)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Alert severity="error">{erroValidacao}</Alert>
        </Container>
      </Box>
    );

  if (!finalizado && votacoesDisponiveis.length > 1 && !votacaoId)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="h5"
            sx={{ color: "#B8F3FF", fontWeight: 700, mb: 2 }}
          >
            Selecione o evento que você vai avaliar
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="evento-label" sx={{ color: "#8AC6D0" }}>
              Evento
            </InputLabel>
            <Select
              labelId="evento-label"
              label="Evento"
              value=""
              onChange={(e) => {
                const id = e.target.value;
                sessionStorage.setItem(JUROR_VOTACAO_KEY, id);
                setVotacaoId(id);
              }}
              sx={{ background: "rgba(255,255,255,0.05)", color: "#fff" }}
            >
              {votacoesDisponiveis.map((v) => (
                <MenuItem key={v._id} value={v._id}>
                  {v.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Container>
      </Box>
    );

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
        py: { xs: 3, md: 6 },
        position: "relative",
        overflow: "hidden",
      }}
      ref={topRef}
    >
      {finalizado &&
        confettiChars.map((char, i) => (
          <Box
            key={i}
            sx={{
              position: "fixed",
              top: -50,
              left: `${10 + (i * 90) / confettiChars.length}%`,
              fontSize: "2.5rem",
              animation: `${float} ${2 + Math.random() * 2}s ease-in-out ${i * 0.15}s infinite`,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            {char}
          </Box>
        ))}

      <Container maxWidth="lg">
        <PageHeader />

        {finalizado ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#FFD700",
                mb: 2,
              }}
            >
              Votação Finalizada!
            </Typography>
            <Typography variant="h6" sx={{ color: "#8AC6D0", fontWeight: 400 }}>
              Redirecionando para a classificação...
            </Typography>
          </Box>
        ) : users.length === 0 ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            Nenhum competidor cadastrado neste evento ainda. Assim que os
            competidores forem cadastrados, eles aparecem aqui.
          </Alert>
        ) : (
          <>
            {/* Progress bar */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(184, 243, 255, 0.1)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ color: "#8AC6D0", fontWeight: 500, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                  {votedCount === 0
                    ? `${totalCount} competidor(es) para avaliar`
                    : `${votedCount} de ${totalCount} avaliado(s)`}
                </Typography>
                <Typography sx={{ color: "#B8F3FF", fontWeight: 600, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
                  {currentIndex + 1} / {totalCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(votedCount / Math.max(totalCount, 1)) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(184, 243, 255, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {/* Current competitor */}
            {currentUser && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  {/* key: sem ela o React reaproveitava o card anterior e o
                      estado "já votou" vazava para o próximo competidor. */}
                  <CompetitorCard
                    key={currentUser._id}
                    user={currentUser}
                    code={code as string}
                    jurorToken={jurorToken}
                    onVoteComplete={handleVoteComplete}
                    onError={showSnackbar}
                  />
                </Grid>
              </Grid>
            )}

            {/* Mobile-style navigation */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                startIcon={<KeyboardArrowLeft />}
                size="small"
                sx={{ minWidth: { xs: 100, sm: 130 } }}
              >
                Anterior
              </Button>

              {votados.size >= 1 && (
                <Button
                  variant="text"
                  onClick={() => {
                    const pendente = users.findIndex((u) => !votados.has(u._id));
                    if (pendente >= 0) {
                      setCurrentIndex(pendente);
                      topRef.current?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  size="small"
                  sx={{ color: "#8AC6D0", fontSize: "0.8rem" }}
                >
                  {totalCount - votedCount > 0
                    ? `Pular p/ pendente (${totalCount - votedCount})`
                    : "Todos votados"}
                </Button>
              )}

              {/* Finalizar tem precedência: antes o jurado precisava navegar até o
                  último competidor para o botão aparecer. */}
              {allVoted ? (
                <Button
                  variant="contained"
                  onClick={handleFinalizar}
                  size="small"
                  sx={{ minWidth: { xs: 100, sm: 130 } }}
                >
                  Finalizar
                </Button>
              ) : currentIndex < users.length - 1 ? (
                <Button
                  variant="outlined"
                  onClick={goToNext}
                  disabled={currentIndex === users.length - 1}
                  endIcon={<KeyboardArrowRight />}
                  size="small"
                  sx={{ minWidth: { xs: 100, sm: 130 } }}
                >
                  Próximo
                </Button>
              ) : allVoted ? (
                <Button
                  variant="contained"
                  onClick={handleFinalizar}
                  size="small"
                  sx={{ minWidth: { xs: 100, sm: 130 } }}
                >
                  Finalizar
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={goToNext}
                  disabled
                  endIcon={<KeyboardArrowRight />}
                  size="small"
                  sx={{ minWidth: { xs: 100, sm: 130 } }}
                >
                  Próximo
                </Button>
              )}
            </Box>

            {/* Current competitor status chip */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography
                sx={{
                  // Verde mais claro: #4caf50 sobre o roxo do fundo dava 3.9:1
                  color: isCurrentVoted ? "#81C784" : "#FFD700",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                {isCurrentVoted ? "Voto registrado" : "Aguardando voto"}
              </Typography>
            </Box>
          </>
        )}

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
            <Button variant="contained" onClick={confirmarFinalizar}>
              Sim, Finalizar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
