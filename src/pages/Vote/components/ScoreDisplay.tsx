import { Box, LinearProgress, Typography } from "@mui/material";

interface ScoreDisplayProps {
  totalScore: number;
  totalScoreSum: number;
}

export default function ScoreDisplay({
  totalScore,
  totalScoreSum,
}: ScoreDisplayProps) {
  const percentage = totalScoreSum > 0 ? (totalScore / totalScoreSum) * 100 : 0;

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
        {totalScore} pontos ({percentage.toFixed(2)}%)
      </Typography>
    </Box>
  );
}
