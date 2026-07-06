import { Box, Typography, Link } from "@mui/material";
import { EmojiEvents as TrophyIcon, InfoOutlined } from "@mui/icons-material";

export default function PageHeader() {
  return (
    <Box sx={{ mb: 6, textAlign: "center" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <TrophyIcon sx={{ fontSize: 48, color: "#B8F3FF" }} />
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "2rem", md: "3rem" },
          }}
        >
          Vote Agora
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ color: "#8AC6D0", opacity: 0.9, mb: 1 }}>
        Avalie cada critério de 0 a 10 usando os controles deslizantes
      </Typography>
      <Link
        href="/voting-rules"
        target="_blank"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          color: "#8AC6D0",
          fontSize: "0.85rem",
          cursor: "pointer",
          "&:hover": { color: "#B8F3FF" },
        }}
      >
        <InfoOutlined sx={{ fontSize: 16 }} />
        Ver regras da votação
      </Link>
    </Box>
  );
}
