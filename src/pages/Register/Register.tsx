import { IVotacao } from "@/models/Votacao";
import { Button, Grid, Box, Container, Card, CardContent } from "@mui/material";
import React, { FormEvent, useEffect, useState } from "react";
import PageHeader from "@/components/Register/PageHeader";
import ProgressStepper from "@/components/Register/ProgressStepper";
import PersonalDataForm from "@/components/Register/PersonalDataForm";
import VotingSelector from "@/components/Register/VotingSelector";
import CategorySelector from "@/components/Register/CategorySelector";
import RegistrationSummary from "@/components/Register/RegistrationSummary";

export interface IUser {
  id: string;
  name: string;
  work: string;
  votes: number;
  percent?: number;
  anatomy: number;
  creativity: number;
  pigmentation: number;
  traces: number;
  readability: number;
  visualimpact: number;
  totalScore: number;
  day: "Sexta" | "Sábado" | "Domingo";
  category: string;
  competidorId?: string;
  jurorId?: string;
}

interface IRegisterProps {
  onRegister: () => void;
}

export default function Register({ onRegister }: IRegisterProps) {
  const [formData, setFormData] = useState({
    name: "",
    work: "",
    category: "",
  });
  const [, setSnackbarMessage] = useState("");
  const [, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [, setSnackbarOpen] = useState(false);
  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [votacaoSelecionadaId, setVotacaoSelecionadaId] = useState<string>("");
  const [categoriasDaVotacao, setCategoriasDaVotacao] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    "Dados Pessoais",
    "Selecionar Votação",
    "Selecionar Categoria",
  ];

  useEffect(() => {
    const fetchVotacoes = async () => {
      try {
        const response = await fetch("/api/votacoes");
        if (!response.ok) {
          throw new Error("Erro ao carregar votações");
        }
        const data: IVotacao[] = await response.json();
        setVotacoes(data);
      } catch (error) {
        console.error("Falha ao buscar votações:", error);
        setSnackbarMessage("Erro ao carregar votações.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    fetchVotacoes();
  }, []);

  const handleVotacaoChange = (votacaoId: string) => {
    setVotacaoSelecionadaId(votacaoId);
    const votacao = votacoes.find((v) => v._id === votacaoId);
    if (votacao) {
      setCategoriasDaVotacao(votacao.categorias);
      setFormData((prev) => ({ ...prev, category: "" }));
      setActiveStep(1);
    } else {
      setCategoriasDaVotacao([]);
    }
  };

  const handleCategoryChange = (categoria: string) => {
    setFormData((prevState) => ({
      ...prevState,
      category: categoria,
    }));
    setActiveStep(2);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!votacaoSelecionadaId || !formData.category) {
      setSnackbarMessage("Por favor, selecione uma votação e uma categoria.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          work: formData.work,
          votacaoId: votacaoSelecionadaId,
          category: formData.category,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setSnackbarMessage(`Erro ao salvar: ${error.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const savedUser = await response.json();
      setSnackbarMessage("Registrado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      onRegister();

      // Reset do formulário
      setFormData({
        name: "",
        work: "",
        category: "",
      });
      setVotacaoSelecionadaId("");
      setCategoriasDaVotacao([]);
      setActiveStep(0);
    } catch (error) {
      setSnackbarMessage("Erro ao salvar");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const votacaoNome =
    votacoes.find((v) => v._id === votacaoSelecionadaId)?.nome || "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <PageHeader />

        <ProgressStepper activeStep={activeStep} steps={steps} />

        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            border: "1px solid rgba(184, 243, 255, 0.2)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <form onSubmit={handleRegister}>
              <Grid container spacing={3}>
                <PersonalDataForm
                  name={formData.name}
                  work={formData.work}
                  onNameChange={(name) =>
                    setFormData((prev) => ({ ...prev, name }))
                  }
                  onWorkChange={(work) =>
                    setFormData((prev) => ({ ...prev, work }))
                  }
                />

                <VotingSelector
                  votacoes={votacoes}
                  selectedVotacaoId={votacaoSelecionadaId}
                  onVotacaoChange={handleVotacaoChange}
                />

                <CategorySelector
                  categorias={categoriasDaVotacao}
                  selectedCategory={formData.category}
                  onCategoryChange={handleCategoryChange}
                />

                <RegistrationSummary
                  name={formData.name}
                  work={formData.work}
                  votacaoNome={votacaoNome}
                  category={formData.category}
                />

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={
                      !formData.name ||
                      !votacaoSelecionadaId ||
                      !formData.category
                    }
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    Confirmar Registro
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
