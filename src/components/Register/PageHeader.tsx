import { Box, Typography } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";

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
        <PersonAddIcon sx={{ fontSize: 48, color: "#B8F3FF" }} />
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
          Registro de Competidor
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ color: "#8AC6D0", opacity: 0.9 }}>
        Preencha os dados para participar da competição
      </Typography>
    </Box>
  );
}
