import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Button,
} from "@mui/material";
import { Star as StarIcon } from "@mui/icons-material";
import VotingCriteria from "./VotingCriteria";
import ScoreDisplay from "./ScoreDisplay";

interface VoteValuesState {
  anatomy: number;
  creativity: number;
  pigmentation: number;
  traces: number;
  readability: number;
  visualImpact: number;
  category: string;
}

interface CompetitorCardProps {
  user: any;
  voteValues: VoteValuesState;
  totalScoreSum: number;
  votingUserId: string | null;
  onSliderChange: (
    name: string
  ) => (event: Event, value: number | number[]) => void;
  onVote: (userId: string) => void;
}

const criteriaConfig = [
  { name: "anatomy", label: "Anatomia", icon: "🎯" },
  { name: "creativity", label: "Criatividade", icon: "💡" },
  { name: "pigmentation", label: "Pigmentação", icon: "🎨" },
  { name: "traces", label: "Traços", icon: "✏️" },
  { name: "readability", label: "Legibilidade", icon: "👁️" },
  { name: "visualImpact", label: "Impacto Visual", icon: "⚡" },
];

export default function CompetitorCard({
  user,
  voteValues,
  totalScoreSum,
  votingUserId,
  onSliderChange,
  onVote,
}: CompetitorCardProps) {
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
          <Chip
            label={user.category}
            icon={<StarIcon />}
            sx={{
              background: "rgba(138, 198, 208, 0.2)",
              color: "#8AC6D0",
              border: "1px solid rgba(138, 198, 208, 0.3)",
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Critérios de Votação */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {criteriaConfig.map((criteria) => (
            <Grid item xs={12} md={6} key={criteria.name}>
              <VotingCriteria
                criteria={criteria}
                value={
                  voteValues[criteria.name as keyof VoteValuesState] as number
                }
                onChange={onSliderChange(criteria.name)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Pontuação Atual */}
        <ScoreDisplay
          totalScore={user.totalScore}
          totalScoreSum={totalScoreSum}
        />

        {/* Botão de Votar */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => onVote(user._id)}
          disabled={votingUserId === user._id}
          sx={{
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          {votingUserId === user._id ? "Enviando..." : "Confirmar Voto"}
        </Button>
      </CardContent>
    </Card>
  );
}
