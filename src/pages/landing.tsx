import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  QrCode2 as QrIcon,
  HowToVote as VoteIcon,
  EmojiEvents as TrophyIcon,
  RocketLaunch,
} from "@mui/icons-material";
import { useState } from "react";

const steps = [
  {
    icon: <QrIcon sx={{ fontSize: 40 }} />,
    title: "1. Jurado recebe um QR Code",
    desc: "O organizador gera um QR Code único para cada jurado com validade de 24h. Escaneie para acessar a votação.",
  },
  {
    icon: <VoteIcon sx={{ fontSize: 40 }} />,
    title: "2. Avalia os participantes",
    desc: "Cada trabalho é avaliado em 6 critérios: Anatomia, Criatividade, Pigmentação, Traços, Legibilidade e Impacto Visual. Notas de 0 a 10.",
  },
  {
    icon: <TrophyIcon sx={{ fontSize: 40 }} />,
    title: "3. Confere a classificação",
    desc: "Após votar em todos, o jurado é redirecionado para o ranking. A classificação é calculada pela soma total dos critérios.",
  },
];

export default function Landing() {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState("animation");
  
  const handleNavigateAnimation = () => {
    setCurrentPage("animation");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
      }}
    >
      {/* Hero */}
      <Box
        sx={{
          textAlign: "center",
          pt: { xs: 6, md: 10 },
          pb: { xs: 4, md: 6 },
          px: 2,
        }}
      >
        <RocketLaunch
          sx={{
            fontSize: 64,
            color: "#B8F3FF",
            mb: 2,
          }}
        />
                  <Box sx={{ mb: 6, textAlign: "center" }}>
            <Box
              onClick={handleNavigateAnimation}
              sx={{
                display: "inline-flex",
                alignItems: "flex-end",
                position: "relative",
                cursor: "pointer",
              }}
            >
              {/* Borda neon */}
              <Box
                sx={{
                  position: "relative",
                  px: { xs: 3, md: 5 },
                  py: { xs: 1.5, md: 2 },
                  borderRadius: "18px",
                  background:
                    "linear-gradient(90deg, #00E5FF 0%, #7C4DFF 50%, #FF00AA 100%)",
                  boxShadow: `
                    0 0 10px #00E5FF,
                    0 0 20px #7C4DFF,
                    0 0 30px #FF00AA
                  `,
                }}
              >
                {/* Fundo interno */}
                <Box
                  sx={{
                    bgcolor: "#050505",
                    borderRadius: "14px",
                    px: { xs: 2, md: 4 },
                    py: { xs: 1, md: 1.5 },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: { xs: "3rem", md: "5rem" },
                      lineHeight: 1,
                      color: "#fff",
                      letterSpacing: "4px",
                      textShadow: `
                        0 0 10px rgba(255,255,255,0.4),
                        0 0 20px rgba(255,255,255,0.2)
                      `,
                    }}
                  >
                    OTTAKU
                  </Typography>
                </Box>
              </Box>

              {/* CON */}
              <Typography
                sx={{
                  position: "absolute",
                  right: { xs: -15, md: -25 },
                  bottom: { xs: -10, md: -15 },
                  bgcolor: "#000",
                  px: 1,
                  borderRadius: 1,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: { xs: "2rem", md: "3rem" },
                  color: "#fff",
                  lineHeight: 1,
                  textShadow: "0 0 10px rgba(255,255,255,0.4)",
                  boxShadow: "0 0 15px rgba(0,0,0,0.8)",
                }}
              >
                CON
              </Typography>
            </Box>
        <Typography
          variant="h5"
          sx={{
            color: "#8AC6D0",
            fontWeight: 400,
            maxWidth: 600,
            mx: "auto",
            mb: 4,
            fontSize: { xs: "1rem", md: "1.3rem" },
          }}
        >
          Sistema de votação para competições de tatuagem — rocketStar
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push("/")}
          sx={{
            py: 1.5,
            px: 6,
            fontSize: "1.1rem",
            fontWeight: 700,
          }}
        >
          Acessar o Evento
        </Button>
      </Box>

      {/* Como funciona */}
      <Container maxWidth="md" sx={{ pb: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "#B8F3FF",
            fontWeight: 700,
            mb: 4,
          }}
        >
          Como funciona
        </Typography>

        <Grid container spacing={3}>
          {steps.map((step, i) => (
            <Grid item xs={12} key={i}>
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.04)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  border: "1px solid rgba(184, 243, 255, 0.1)",
                  transition: "transform 0.2s ease-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    border: "1px solid rgba(184, 243, 255, 0.3)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    p: { xs: 2, md: 4 },
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      minWidth: 70,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #B8F3FF 0%, #8AC6D0 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#36213E",
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: "#B8F3FF", fontWeight: 700, mb: 0.5 }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#8AC6D0", opacity: 0.9 }}
                    >
                      {step.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Critérios */}
        <Box
          sx={{
            mt: 4,
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(184, 243, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#B8F3FF", fontWeight: 700, mb: 2 }}
          >
            Critérios de avaliação
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              { label: "Anatomia", icon: "🎯" },
              { label: "Criatividade", icon: "💡" },
              { label: "Pigmentação", icon: "🎨" },
              { label: "Traços", icon: "✏️" },
              { label: "Legibilidade", icon: "👁️" },
              { label: "Impacto Visual", icon: "⚡" },
            ].map((c) => (
              <Grid item key={c.label}>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    background: "rgba(138, 198, 208, 0.1)",
                    border: "1px solid rgba(138, 198, 208, 0.2)",
                  }}
                >
                  <Typography sx={{ color: "#8AC6D0", fontWeight: 600 }}>
                    {c.icon} {c.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
