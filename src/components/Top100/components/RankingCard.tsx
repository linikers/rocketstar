import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { IUser } from "@/pages/Register/Register";

interface RankingCardProps {
  user: IUser;
  index: number;
}

const getPodiumColor = (index: number) => {
  if (index === 0) return "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)";
  if (index === 1) return "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)";
  if (index === 2) return "linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)";
  return "rgba(255, 255, 255, 0.05)";
};

const getPodiumIcon = (index: number) => {
  if (index < 3) return <TrophyIcon sx={{ fontSize: 28 }} />;
  return <StarIcon sx={{ fontSize: 20 }} />;
};

export default function RankingCard({ user, index }: RankingCardProps) {
  const isPodium = index < 3;

  return (
    <Card
      sx={{
        mt: 5,
        width: "100%",
        minHeight: 420,
        maxHeight: 480,
        display: "flex",
        flexDirection: "column",
        background: isPodium
          ? getPodiumColor(index)
          : "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: 3,
        border: isPodium
          ? "2px solid rgba(255, 215, 0, 0.5)"
          : "1px solid rgba(184, 243, 255, 0.2)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: isPodium
            ? "0 16px 40px rgba(255, 215, 0, 0.3)"
            : "0 12px 32px rgba(184, 243, 255, 0.2)",
        },
      }}
    >
      {/* Posição Badge */}
      <Box
        sx={{
          position: "absolute",
          top: -15,
          left: "50%",
          transform: "translateX(-50%)",
          background: isPodium
            ? getPodiumColor(index)
            : "linear-gradient(135deg, #B8F3FF 0%, #8AC6D0 100%)",
          borderRadius: "50%",
          width: 45,
          height: 45,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid #36213E",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "#36213E",
          }}
        >
          {index + 1}
        </Typography>
      </Box>

      <CardContent
        sx={{
          pt: 4.5,
          pb: 2,
          px: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Nome e Trabalho */}
        <Box sx={{ textAlign: "center", mb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 0.5,
              color: isPodium ? "#36213E" : "#B8F3FF",
            }}
          >
            {getPodiumIcon(index)}
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "0.95rem",
              color: isPodium ? "#36213E" : "#B8F3FF",
              mb: 0.5,
              lineHeight: 1.2,
            }}
          >
            {user.name}
          </Typography>
          {user.work && (
            <Typography
              variant="body2"
              sx={{
                color: isPodium ? "rgba(54, 33, 62, 0.7)" : "#8AC6D0",
                fontStyle: "italic",
                fontSize: "0.75rem",
              }}
            >
              {user.work}
            </Typography>
          )}
        </Box>

        {/* Categoria */}
        {user.category && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 1.5,
            }}
          >
            <Chip
              label={user.category}
              size="small"
              sx={{
                background: isPodium
                  ? "rgba(54, 33, 62, 0.2)"
                  : "rgba(138, 198, 208, 0.2)",
                color: isPodium ? "#36213E" : "#8AC6D0",
                border: isPodium
                  ? "1px solid rgba(54, 33, 62, 0.3)"
                  : "1px solid rgba(138, 198, 208, 0.3)",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          </Box>
        )}

        {/* Pontuações */}
        <Stack spacing={0.4} sx={{ mb: 1.5, flex: 1 }}>
          {[
            { label: "Anatomia", value: user.anatomy },
            { label: "Criatividade", value: user.creativity },
            { label: "Pigmentação", value: user.pigmentation },
            { label: "Traços", value: user.traces },
            { label: "Legibilidade", value: user.readability },
            { label: "Imp. Visual", value: user.visualimpact },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: isPodium ? "rgba(54, 33, 62, 0.8)" : "#8AC6D0",
                  fontSize: "0.7rem",
                }}
              >
                {item.label}
              </Typography>
              <Chip
                label={item.value || 0}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  background: isPodium
                    ? "rgba(54, 33, 62, 0.15)"
                    : "rgba(184, 243, 255, 0.1)",
                  color: isPodium ? "#36213E" : "#B8F3FF",
                  fontWeight: 600,
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>

        {/* Total Score */}
        <Box
          sx={{
            borderTop: isPodium
              ? "2px solid rgba(54, 33, 62, 0.3)"
              : "2px solid rgba(184, 243, 255, 0.2)",
            pt: 1.5,
            textAlign: "center",
            mt: "auto",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: "1.5rem",
              color: isPodium ? "#36213E" : "#B8F3FF",
            }}
          >
            {user.totalScore}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isPodium ? "rgba(54, 33, 62, 0.7)" : "#8AC6D0",
              fontWeight: 500,
              fontSize: "0.7rem",
            }}
          >
            pontos totais
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
