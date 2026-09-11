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
} from '@mui/material';

interface IUser {
  _id: string;
  name: string;
  work: string;
  category: string;
  votacaoId: string;
  // Vindo do /api/list: já votou neste competidor com o code atual?
  jaVotou?: boolean;
}

interface CompetitorCardProps {
  user: IUser;
  code: string;
  jurorToken?: string | null;
  onVoteComplete: (userId: string) => void;
  onError?: (mensagem: string) => void;
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

export default function CompetitorCard({
  user,
  code,
  jurorToken,
  onVoteComplete,
  onError,
}: CompetitorCardProps) {
  const [votos, setVotos] = useState<Record<NotaKey, number>>({
    anatomy: 0,
    creativity: 0,
    pigmentation: 0,
    traces: 0,
    readability: 0,
    visualImpact: 0,
  });
  // Inicializa com o que o servidor informa: se este jurado já votou neste
  // competidor, o card abre em "Voto Registrado" em vez de pedir voto de novo.
  const [voted, setVoted] = useState(Boolean(user.jaVotou));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset dos sliders ao trocar de competidor. O Vote.tsx também passa
  // key={user._id}, que remonta o componente; este efeito cobre o caso de o
  // componente ser reaproveitado pelo React (era a causa do bug: o estado
  // 'voted' ficava true para TODOS os competidores seguintes).
  useEffect(() => {
    setVotos({
      anatomy: 0,
      creativity: 0,
      pigmentation: 0,
      traces: 0,
      readability: 0,
      visualImpact: 0,
    });
    setVoted(Boolean(user.jaVotou));
    setError(null);
  }, [user._id, user.jaVotou]);

  const handleVotoChange = (key: NotaKey, value: number | number[]) => {
    setVotos((prev) => ({ ...prev, [key]: value as number }));
  };

  const handleSubmit = async () => {
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
        onVoteComplete(user._id);
        return;
      }

      // 409 = este jurado já votou neste competidor: mantém o card consistente
      // (não deixa o botão piscando como se o voto tivesse falhado).
      if (response.status === 409) {
        setVoted(true);
        onVoteComplete(user._id);
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

  const media = (
    Object.values(votos).reduce((acc, nota) => acc + nota, 0) / CRITERIOS.length
  ).toFixed(1);

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Typography variant="h5" component="h2" gutterBottom>
            {user.name}
          </Typography>
          {voted && (
            <Typography
              variant="body2"
              color="success.main"
              sx={{ fontWeight: 600 }}
            >
              VOTO REGISTRADO
            </Typography>
          )}
        </Box>

        <Typography color="text.secondary" gutterBottom>
          Obra: {user.work}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Categoria: {user.category}
        </Typography>

        <Alert severity="info" sx={{ my: 2 }}>
          Avalie de 0 a 10 em cada critério. Após confirmado, o voto não pode ser
          alterado.
        </Alert>

        {CRITERIOS.map((criterio) => (
          <Box key={criterio.key} mb={2}>
            <Typography gutterBottom>
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
              disabled={voted || loading}
            />
          </Box>
        ))}

        <Typography variant="h6" sx={{ mb: 2 }}>
          Média: {media}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {voted ? (
          <Alert severity="success">
            Você já votou neste competidor. Use &quot;Próximo&quot; para seguir.
          </Alert>
        ) : (
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
