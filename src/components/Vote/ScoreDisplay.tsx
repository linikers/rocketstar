import { Box, LinearProgress, Typography } from "@mui/material";

interface ScoreDisplayProps {
  totalScore: number;
}

const MAX_POSSIBLE_SCORE = 10 * 6; // 6 criterios, max 10 cada

export default function ScoreDisplay({ totalScore }: ScoreDisplayProps) {
  const percentage = (totalScore / MAX_POSSIBLE_SCORE) * 100;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: "rgba(184, 243, 255, 0.05)",
        border: "1px solid rgba(184, 243, 255, 0.2)",
        mb: 3,
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "#8AC6D0", mb: 1, fontWeight: 500 }}
      >
        Pontuação Atual
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 12,
          borderRadius: 2,
          backgroundColor: "rgba(184, 243, 255, 0.1)",
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
            borderRadius: 2,
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: "#B8F3FF",
          display: "block",
          mt: 1,
          fontWeight: 600,
        }}
      >
        {totalScore} / {MAX_POSSIBLE_SCORE} pontos
      </Typography>
    </Box>
  );
}
