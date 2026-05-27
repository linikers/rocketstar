import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Paper,
  Alert,
} from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";
import { useRouter } from "next/router";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "Erro ao fazer login");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            border: "1px solid rgba(184, 243, 255, 0.2)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <RocketLaunch
                sx={{ fontSize: 48, color: "#B8F3FF", mb: 2 }}
              />
              <Typography
                variant="h4"
                sx={{ color: "#B8F3FF", fontWeight: 700 }}
              >
                Rocket Tattoo
              </Typography>
              <Typography sx={{ color: "#8AC6D0", mt: 1 }}>
                Entre com sua conta
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    color: "#B8F3FF",
                    "& fieldset": { borderColor: "rgba(184, 243, 255, 0.3)" },
                    "&:hover fieldset": { borderColor: "#8AC6D0" },
                    "&.Mui-focused fieldset": { borderColor: "#B8F3FF" },
                  },
                }}
                InputLabelProps={{ sx: { color: "#8AC6D0" } }}
              />
              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                fullWidth
                required
                sx={{ mb: 3 }}
                InputProps={{
                  sx: {
                    color: "#B8F3FF",
                    "& fieldset": { borderColor: "rgba(184, 243, 255, 0.3)" },
                    "&:hover fieldset": { borderColor: "#8AC6D0" },
                    "&.Mui-focused fieldset": { borderColor: "#B8F3FF" },
                  },
                }}
                InputLabelProps={{ sx: { color: "#8AC6D0" } }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
