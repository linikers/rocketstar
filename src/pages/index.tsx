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
  HowToVote as VoteIcon,
  PersonAdd as RegisterIcon,
  EmojiEvents as TrophyIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import Register, { IUser } from "./Register/Register";
import { Header } from "@/components/Header/Header";
import Vote from "./Vote/Vote";
import Top100 from "./Top100/Top100";
import { SnackBarCustom } from "@/components/Snackbar/SnackBar";
import Animation from "@/components/Animation/Animation";

function App() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState("animation");
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [, setSnackBarOpen] = useState(false);

  const handleNavigateAnimation = () => {
    setCurrentPage("animation");
  };
  const handleNavigateVote = () => {
    setCurrentPage("vote");
  };
  const handleNavigateRegister = () => {
    setCurrentPage("register");
  };
  const handleNavigateTop10 = () => {
    setCurrentPage("top10");
  };

  const handleOpenSnackBar = (message: string) => {
    setSnackBarMessage(message);
    setSnackBarOpen(true);
  };

  const navigationCards = [
    {
      title: "Vote Agora",
      description: "Avalie os competidores",
      icon: <VoteIcon sx={{ fontSize: 48 }} />,
      onClick: handleNavigateVote,
      gradient: "linear-gradient(135deg, #B8F3FF 0%, #8AC6D0 100%)",
    },
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
            {/* Header */}
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
                <HomeIcon sx={{ fontSize: 48, color: "#B8F3FF" }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "2rem", md: "3rem" },
                  }}
                >
                  RocketStar
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ color: "#8AC6D0", opacity: 0.9 }}
              >
                RocketStar - Votação e Ranking de Competidores
              </Typography>
            </Box>

            {/* Animation */}
            <Box
              sx={{
                mb: 6,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Animation />
            </Box>

            {/* Navigation Cards */}
            <Grid container spacing={3}>
              {navigationCards.map((card, index) => (
                <Grid item xs={12} md={4} key={index}>
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
        <Grid
          container
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "1rem",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Grid item style={{ width: "100%", maxWidth: "1200px" }}>
            <Header onClick={handleNavigateAnimation} />
          </Grid>
          <Grid
            item
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              color="secondary"
              onClick={handleNavigateVote}
              sx={{ margin: "4px" }}
            >
              Vote Agora
            </Button>
            <Button
              color="secondary"
              onClick={handleNavigateRegister}
              sx={{ margin: "4px" }}
            >
              Registre o participante
            </Button>
            <Button
              color="secondary"
              onClick={handleNavigateTop10}
              sx={{ margin: "4px" }}
            >
              Classificação Geral
            </Button>
          </Grid>
          <Grid
            item
            xs={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            {currentPage === "vote" && (
              <Vote
                onOpenSnackBar={handleOpenSnackBar}
                users={users}
                setUsers={setUsers}
              />
            )}
            {currentPage === "register" && (
              <Register onRegister={handleNavigateVote} />
            )}
            {currentPage === "top10" && <Top100 />}
          </Grid>
        </Grid>
      )}
      <SnackBarCustom message={snackBarMessage} severity="success" />
    </>
  );
}

export default App;
