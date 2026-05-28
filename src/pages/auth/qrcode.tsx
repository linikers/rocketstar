import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

type Status = "validando" | "valido" | "usado" | "expirado" | "invalido" | "erro";

interface ValidateResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    jurorName: string;
  };
}

export default function AuthQRCodePage() {
  const router = useRouter();
  const { code } = router.query;

  const [status, setStatus] = useState<Status>("validando");
  const [message, setMessage] = useState("");
  const [jurorName, setJurorName] = useState("");

  useEffect(() => {
    if (!code || typeof code !== "string") return;

    let cancelled = false;

    async function validate() {
      try {
        const res = await fetch("/api/qrcodes/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data: ValidateResponse = await res.json();

        if (cancelled) return;

        if (data.success) {
          setStatus("valido");
          setJurorName(data.data?.jurorName || "");
          setMessage(data.message || "QR Code validado com sucesso!");

          setTimeout(() => {
            router.push("/Vote/Vote?code=" + code);
          }, 3000);
        } else if (data.error?.includes("expirado")) {
          setStatus("expirado");
          setMessage("Este QR Code expirou.");
        } else if (data.error?.includes("não encontrado")) {
          setStatus("invalido");
          setMessage("QR Code não encontrado.");
        } else {
          setStatus("erro");
          setMessage(data.error || "Erro ao validar QR Code.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("erro");
          setMessage("Erro de conexão ao validar QR Code.");
        }
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, [code, router]);

  if (!code) {
    return (
      <StatusLayout
        icon={<HourglassEmptyIcon sx={{ fontSize: 80, color: "#8AC6D0" }} />}
        title="Aguardando código..."
        description="Nenhum código de autenticação fornecido."
      />
    );
  }

  return (
    <StatusLayout
      icon={<StatusIcon status={status} />}
      title={<StatusTitle status={status} jurorName={jurorName} />}
      description={message}
      action={<StatusAction status={status} onRetry={() => router.reload()} />}
    />
  );
}

function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case "validando":
      return <CircularProgress size={80} sx={{ color: "#B8F3FF" }} />;
    case "valido":
      return <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#4caf50" }} />;
    case "usado":
      return <ErrorOutlineIcon sx={{ fontSize: 80, color: "#ff9800" }} />;
    case "expirado":
      return <ErrorOutlineIcon sx={{ fontSize: 80, color: "#f44336" }} />;
    case "invalido":
      return <ErrorOutlineIcon sx={{ fontSize: 80, color: "#f44336" }} />;
    case "erro":
      return <ErrorOutlineIcon sx={{ fontSize: 80, color: "#f44336" }} />;
  }
}

function StatusTitle({ status, jurorName }: { status: Status; jurorName: string }) {
  switch (status) {
    case "validando":
      return "Validando QR Code...";
    case "valido":
      return `Bem-vindo, ${jurorName || "Jurado"}!`;
    case "usado":
      return "QR Code já utilizado";
    case "expirado":
      return "QR Code expirado";
    case "invalido":
      return "QR Code inválido";
    case "erro":
      return "Erro na validação";
  }
}

function StatusAction({
  status,
  onRetry,
}: {
  status: Status;
  onRetry: () => void;
}) {
  if (status === "valido") {
    return (
      <Typography variant="body2" sx={{ color: "#8AC6D0", mt: 1 }}>
        Redirecionando para página de votação...
      </Typography>
    );
  }

  if (status === "erro") {
    return (
      <Button variant="outlined" onClick={onRetry} sx={{ mt: 2 }}>
        Tentar novamente
      </Button>
    );
  }

  return null;
}

function StatusLayout({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(184, 243, 255, 0.1)",
            textAlign: "center",
          }}
        >
          <Box sx={{ mb: 3 }}>{icon}</Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#B8F3FF",
              mb: 1,
            }}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              variant="body1"
              sx={{ color: "#8AC6D0", mb: 2, opacity: 0.9 }}
            >
              {description}
            </Typography>
          )}

          {action}
        </Paper>
      </Container>
    </Box>
  );
}
