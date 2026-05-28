import { useState } from "react";
import {
  Button,
  Grid,
  Box,
  Container,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import {
  PersonAdd as RegisterIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import Register, { IUser } from "./Register/Register";
import { Header } from "@/components/Header/Header";
import Top100 from "./Top100/Top100";
import { SnackBarCustom } from "@/components/Snackbar/SnackBar";
import Animation from "@/components/Animation/Animation";

function App() {
  const [currentPage, setCurrentPage] = useState("animation");
  const [snackBarMessage, setSnackBarMessage] = useState("");

  const handleNavigateAnimation = () => {
    setCurrentPage("animation");
  };
  const handleNavigateRegister = () => {
    setCurrentPage("register");
  };
  const handleNavigateTop10 = () => {
    setCurrentPage("top10");
  };

  const handleOpenSnackBar = (message: string) => {
    setSnackBarMessage(message);
  };

  const navigationCards = [
    {
      title: "Registrar Participante",
      description: "Cadastre um novo competidor",
      icon: <RegisterIcon sx={{ fontSize: 48 }} />,
      onClick: handleNavigateRegister,
      gradient: "linear-gradient(135deg, #8AC6D0 0%, #6BA5B0 100%)",
    },
    {
      title: "Classificação Geral",
      description: "Veja o ranking Top 100",
      icon: <TrophyIcon sx={{ fontSize: 48 }} />,
      onClick: handleNavigateTop10,
      gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    },
  ];

  return (
    <>
      {currentPage === "animation" ? (
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ mb: 6, textAlign: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  mb: 2,
                  cursor: "pointer",
                }}
                onClick={handleNavigateAnimation}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "#B8F3FF",
                    fontSize: { xs: "2rem", md: "3rem" },
                    textShadow: "0 0 20px rgba(184, 243, 255, 0.3)",
                  }}
                >
                  Otttakucon
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ color: "#8AC6D0", opacity: 0.9 }}
              >
                RocketStars - Votação e Ranking de Competidores
              </Typography>
            </Box>

            <Box
              sx={{
                mb: 6,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Animation />
            </Box>

            <Grid container spacing={3} justifyContent="center">
              {navigationCards.map((card, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card
                    onClick={card.onClick}
                    sx={{
                      height: "100%",
                      background: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 3,
                      border: "1px solid rgba(184, 243, 255, 0.2)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 32px rgba(184, 243, 255, 0.3)",
                        border: "1px solid rgba(184, 243, 255, 0.4)",
                        background: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 4,
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: card.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#36213E",
                          mb: 1,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "#B8F3FF",
                          fontWeight: 700,
                          mb: 1,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#8AC6D0",
                          opacity: 0.9,
                        }}
                      >
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      ) : (
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
          }}
        >
          <Grid
            container
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Grid
              item
              style={{ width: "100%", maxWidth: "1200px", padding: "1rem" }}
            >
              <Header onClick={handleNavigateAnimation} />
            </Grid>

            <Grid
              item
              style={{ width: "100%", maxWidth: "1200px", padding: "0 1rem" }}
            >
              <Box
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(184, 243, 255, 0.1)",
                  p: 2,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  justifyContent: "center",
                }}
              >
                <Button
                  onClick={handleNavigateRegister}
                  variant={
                    currentPage === "register" ? "contained" : "outlined"
                  }
                  startIcon={<RegisterIcon />}
                  fullWidth={true}
                  sx={{
                    color: currentPage === "register" ? "#36213E" : "#8AC6D0",
                    borderColor: "rgba(184, 243, 255, 0.3)",
                    background:
                      currentPage === "register"
                        ? "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)"
                        : "transparent",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    "&:hover": {
                      borderColor: "#8AC6D0",
                      background:
                        currentPage === "register"
                          ? "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)"
                          : "rgba(138, 198, 208, 0.1)",
                    },
                  }}
                >
                  Registrar Participante
                </Button>
                <Button
                  onClick={handleNavigateTop10}
                  variant={currentPage === "top10" ? "contained" : "outlined"}
                  startIcon={<TrophyIcon />}
                  fullWidth={true}
                  sx={{
                    color: currentPage === "top10" ? "#36213E" : "#8AC6D0",
                    borderColor: "rgba(184, 243, 255, 0.3)",
                    background:
                      currentPage === "top10"
                        ? "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)"
                        : "transparent",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    "&:hover": {
                      borderColor: "#8AC6D0",
                      background:
                        currentPage === "top10"
                          ? "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)"
                          : "rgba(138, 198, 208, 0.1)",
                    },
                  }}
                >
                  Classificação Geral
                </Button>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              style={{ display: "flex", justifyContent: "center" }}
            >
              {currentPage === "register" && (
                <Register onRegister={() => setCurrentPage("animation")} />
              )}
              {currentPage === "top10" && <Top100 />}
            </Grid>
          </Grid>
        </Box>
      )}
      <SnackBarCustom message={snackBarMessage} severity="success" />
    </>
  );
}

export default App;
