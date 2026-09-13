import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Slider,
  Button,
  Box,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';

interface IUser {
  _id: string;
  name: string;
  work: string;
  category: string;
  votacaoId: string;
  // Vindo do /api/list: já votou neste competidor com o code atual?
  jaVotou?: boolean;
  // Notas que ESTE jurado já deu (o /api/list só devolve o voto do próprio code).
  meuVoto?: Record<string, number> | null;
}

interface CompetitorCardProps {
  user: IUser;
  code: string;
  jurorToken?: string | null;
  onVoteComplete: (userId: string) => void;
  onError?: (mensagem: string) => void;
  onSaved?: (mensagem: string) => void;
  // O jurado pode corrigir o próprio voto? (dia ainda não finalizado)
  podeAlterar?: boolean;
}

const CRITERIOS = [
  { key: 'anatomy', label: 'Anatomia' },
  { key: 'creativity', label: 'Criatividade' },
  { key: 'pigmentation', label: 'Pigmentação' },
  { key: 'traces', label: 'Traços' },
  { key: 'readability', label: 'Legibilidade' },
  { key: 'visualImpact', label: 'Impacto Visual' },
] as const;

type NotaKey = (typeof CRITERIOS)[number]['key'];

const NOTAS_ZERO: Record<NotaKey, number> = {
  anatomy: 0,
  creativity: 0,
  pigmentation: 0,
  traces: 0,
  readability: 0,
  visualImpact: 0,
};

// Notas salvas do próprio jurado -> estado dos sliders (default 0).
function notasDoUsuario(meuVoto?: Record<string, number> | null): Record<NotaKey, number> {
  const base = { ...NOTAS_ZERO };
  if (!meuVoto) return base;
  for (const criterio of CRITERIOS) {
    const valor = meuVoto[criterio.key];
    if (typeof valor === 'number') base[criterio.key] = valor;
  }
  return base;
}

// O tema do app é pensado para fundo escuro (text.primary = ciano claro
// #B8F3FF). Como o card do competidor é branco, os textos e os sliders
// precisam de cores escuras próprias — senão ficam ilegíveis (contraste
// ~1.2:1). Valores medidos contra #fff:
//   TEXTO_PRINCIPAL     14.5:1
//   TEXTO_SECUNDARIO     7.8:1
//   ACENTO (slider)      4.8:1
const TEXTO_PRINCIPAL = '#36213E';
const TEXTO_SECUNDARIO = '#5A4E63';
const ACENTO = '#2F7A8A';

export default function CompetitorCard({
  user,
  code,
  jurorToken,
  onVoteComplete,
  onError,
  onSaved,
  podeAlterar = false,
}: CompetitorCardProps) {
  const [votos, setVotos] = useState<Record<NotaKey, number>>(() =>
    notasDoUsuario(user.meuVoto)
  );
  // Inicializa com o que o servidor informa: se este jurado já votou neste
  // competidor, o card abre em "Voto Registrado" em vez de pedir voto de novo.
  const [voted, setVoted] = useState(Boolean(user.jaVotou));
  // Correção do próprio voto: destrava os sliders com as notas já salvas.
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Nota toda em zero é aceita pelo servidor (0 é nota válida, de 0 a 10). Como
  // o slider começa em 0, um toque apressado registrava 0 em tudo sem aviso:
  // aqui pede uma confirmação extra.
  const [confirmandoZero, setConfirmandoZero] = useState(false);

  // Reset dos sliders ao trocar de competidor. O Vote.tsx também passa
  // key={user._id}, que remonta o componente; este efeito cobre o caso de o
  // componente ser reaproveitado pelo React (era a causa do bug: o estado
  // 'voted' ficava true para TODOS os competidores seguintes).
  useEffect(() => {
    setVotos(notasDoUsuario(user.meuVoto));
    setVoted(Boolean(user.jaVotou));
    setEditando(false);
    setConfirmandoZero(false);
    setError(null);
  }, [user._id, user.jaVotou, user.meuVoto]);

  const handleVotoChange = (key: NotaKey, value: number | number[]) => {
    setVotos((prev) => ({ ...prev, [key]: value as number }));
  };

  const todasZero = CRITERIOS.every((c) => votos[c.key] === 0);

  const enviarVoto = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competidorId: user._id,
          code,
          jurorToken,
          ...votos,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        setVoted(true);
        setEditando(false);
        setConfirmandoZero(false);
        onVoteComplete(user._id);
        if (payload?.atualizado && onSaved) {
          onSaved('Voto atualizado com sucesso.');
        }
        return;
      }

      const mensagem =
        payload?.error ||
        (response.status === 401
          ? 'Sessão de jurado expirada. Abra novamente o link do QR Code.'
          : `Erro ao registrar voto (${response.status}).`);

      setError(mensagem);
      if (onError) onError(mensagem);
    } catch (err) {
      const mensagem = 'Falha de conexão ao registrar o voto. Tente novamente.';
      setError(mensagem);
      if (onError) onError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    // Primeiro clique com tudo zerado: pede confirmação em vez de gravar 0.
    if (!voted && todasZero && !confirmandoZero) {
      setConfirmandoZero(true);
      return;
    }
    enviarVoto();
  };

  const cancelarEdicao = () => {
    setVotos(notasDoUsuario(user.meuVoto));
    setEditando(false);
    setConfirmandoZero(false);
    setError(null);
  };

  const media = (
    Object.values(votos).reduce((acc, nota) => acc + nota, 0) / CRITERIOS.length
  ).toFixed(1);

  const slidersTravados = loading || (voted && !editando);

  return (
    <Card elevation={3} sx={{ mb: 3, bgcolor: '#fff' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ color: TEXTO_PRINCIPAL, fontWeight: 700 }}>
            {user.name}
          </Typography>
          {voted && (
            <Typography
              variant="body2"
              color="success.main"
              sx={{ fontWeight: 600 }}
            >
              {editando ? 'CORRIGINDO VOTO' : 'VOTO REGISTRADO'}
            </Typography>
          )}
        </Box>

        <Typography gutterBottom sx={{ color: TEXTO_SECUNDARIO }}>
          Obra: {user.work}
        </Typography>
        <Typography gutterBottom sx={{ color: TEXTO_SECUNDARIO }}>
          Categoria: {user.category}
        </Typography>

        <Alert severity="info" sx={{ my: 2 }}>
          {voted
            ? podeAlterar
              ? 'Seu voto está salvo. Você pode corrigir as notas até finalizar o dia.'
              : 'Seu voto está salvo. As notas deste dia já foram finalizadas — só o organizador pode liberar uma correção.'
            : 'Avalie de 0 a 10 em cada critério. Você pode corrigir suas notas até finalizar o dia.'}
        </Alert>

        {CRITERIOS.map((criterio) => (
          <Box key={criterio.key} mb={2}>
            <Typography gutterBottom sx={{ color: TEXTO_PRINCIPAL, fontWeight: 600 }}>
              {criterio.label}: {votos[criterio.key]}
            </Typography>
            <Slider
              value={votos[criterio.key]}
              onChange={(_, value) => handleVotoChange(criterio.key, value)}
              min={0}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              disabled={slidersTravados}
              sx={{
                color: ACENTO,
                '& .MuiSlider-mark': { backgroundColor: TEXTO_SECUNDARIO },
                '& .MuiSlider-markLabel': { color: TEXTO_SECUNDARIO, fontSize: '0.7rem' },
                '& .MuiSlider-valueLabel': { backgroundColor: TEXTO_PRINCIPAL },
              }}
            />
          </Box>
        ))}

        <Typography variant="h6" sx={{ mb: 2, color: TEXTO_PRINCIPAL }}>
          Média: {media}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {confirmandoZero && !voted && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Todas as notas estão em <strong>0</strong>. Registrar um voto zerado
            assim mesmo?
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
              <Button size="small" variant="contained" color="warning" onClick={enviarVoto} disabled={loading}>
                Sim, registrar 0
              </Button>
              <Button size="small" onClick={() => setConfirmandoZero(false)} disabled={loading}>
                Revisar notas
              </Button>
            </Stack>
          </Alert>
        )}

        {voted ? (
          editando ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Salvando...' : 'SALVAR ALTERAÇÃO'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={cancelarEdicao}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Stack>
          ) : podeAlterar ? (
            <Stack spacing={1}>
              <Alert severity="success">
                Seu voto neste competidor está registrado. Quer mudar alguma nota?
              </Alert>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                size="large"
                onClick={() => setEditando(true)}
              >
                ALTERAR VOTO
              </Button>
              <Typography sx={{ color: TEXTO_SECUNDARIO, fontSize: '0.85rem' }}>
                Ou use &quot;Próximo&quot; para seguir para o próximo competidor.
              </Typography>
            </Stack>
          ) : (
            <Alert severity="success">
              Você já votou neste competidor. Use &quot;Próximo&quot; para seguir.
            </Alert>
          )
        ) : confirmandoZero ? null : (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Registrando...' : 'CONFIRMAR VOTO'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
