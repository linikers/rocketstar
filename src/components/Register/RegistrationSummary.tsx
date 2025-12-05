import { Grid, Box, Typography, Chip } from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { IVotacao } from "@/models/Votacao";

interface RegistrationSummaryProps {
  name: string;
  work: string;
  votacaoNome: string;
  category: string;
}

export default function RegistrationSummary({
  name,
  work,
  votacaoNome,
  category,
}: RegistrationSummaryProps) {
  if (!category) return null;

  return (
    <Grid item xs={12}>
      <Box
        sx={{
          p: 3,
          borderRadius: 2,
          background: "rgba(184, 243, 255, 0.05)",
          border: "1px solid rgba(184, 243, 255, 0.2)",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: "#8AC6D0",
            mb: 2,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <CheckCircleIcon fontSize="small" />
          Resumo do Registro
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
              Nome:
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#B8F3FF", fontWeight: 600 }}
            >
              {name || "-"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
              Estúdio:
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#B8F3FF", fontWeight: 600 }}
            >
              {work || "-"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
              Votação:
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#B8F3FF", fontWeight: 600 }}
            >
              {votacaoNome}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ color: "#8AC6D0" }}>
              Categoria:
            </Typography>
            <Chip
              label={category}
              size="small"
              sx={{
                background: "rgba(138, 198, 208, 0.2)",
                color: "#8AC6D0",
                border: "1px solid rgba(138, 198, 208, 0.3)",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}
