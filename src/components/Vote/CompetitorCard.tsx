import { Card, CardContent, Typography, Box, Grid, Button } from "@mui/material";
import { useState } from "react";
import VotingCriteria from "./VotingCriteria";
import { useSnackbar } from "@/contexts/SnackbarContext";

interface CompetitorCardProps {
  user: any;
  onVoteComplete?: (id: string) => void;
}

const criteriaConfig = [
  { name: "anatomy", label: "Anatomia", icon: "🎯" },
  { name: "creativity", label: "Criatividade", icon: "💡" },
  { name: "pigmentation", label: "Pigmentação", icon: "🎨" },
  { name: "traces", label: "Traços", icon: "✏️" },
  { name: "readability", label: "Legibilidade", icon: "👁️" },
  { name: "visualImpact", label: "Impacto Visual", icon: "⚡" },
];

const DEFAULT_SLIDER = 5;

export default function CompetitorCard({ user, onVoteComplete }: CompetitorCardProps) {
  const { showSnackbar } = useSnackbar();
  const [voteValues, setVoteValues] = useState<Record<string, number>>({
    anatomy: DEFAULT_SLIDER,
    creativity: DEFAULT_SLIDER,
    pigmentation: DEFAULT_SLIDER,
    traces: DEFAULT_SLIDER,
    readability: DEFAULT_SLIDER,
    visualImpact: DEFAULT_SLIDER,
  });
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);

  const handleSliderChange =
    (name: string) => (event: Event, value: number | number[]) => {
      setVoteValues((prev) => ({ ...prev, [name]: value as number }));
    };

  const handleVote = async () => {
    setVoting(true);
    try {
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
        body: JSON.stringify({ ...payload, competidorId: user._id }),
      });

      if (!response.ok) {
        throw new Error("Erro ao registrar voto");
      }

      setVoted(true);
      onVoteComplete?.(user._id);
      showSnackbar("Voto registrado com sucesso! 🎉");
    } catch (error) {
      console.error("Erro ao votar:", error);
      showSnackbar("Erro ao registrar voto");
    } finally {
      setVoting(false);
    }
  };

  return (
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
            <Typography variant="body2" sx={{ color: "#8AC6D0", opacity: 0.8 }}>
              {user.work}
            </Typography>
          </Box>
          <Typography
            sx={{
              color: "#8AC6D0",
              fontWeight: 700,
              fontSize: "1.2rem",
              textAlign: { xs: "left", sm: "right" },
              py: 0.5,
              px: 1.5,
              borderRadius: 1,
              border: "1px solid rgba(138, 198, 208, 0.3)",
              background: "rgba(138, 198, 208, 0.1)",
            }}
          >
            {user.category}
          </Typography>
        </Box>

        {/* Critérios de Votação */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {criteriaConfig.map((criteria) => (
            <Grid item xs={12} md={6} key={criteria.name}>
              <VotingCriteria
                criteria={criteria}
                value={voteValues[criteria.name] as number}
                onChange={handleSliderChange(criteria.name)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Botão de Votar */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleVote}
          disabled={voting || voted}
          sx={{
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          {voting ? "Enviando..." : voted ? "Voto Registrado ✅" : "Confirmar Voto"}
        </Button>
      </CardContent>
    </Card>
  );
}
