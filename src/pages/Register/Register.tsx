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
  visualImpact: number;
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
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [, setSnackbarMessage] = useState("");
  const [, setSnackbarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [, setSnackbarOpen] = useState(false);
  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [votacaoSelecionadaId, setVotacaoSelecionadaId] = useState<string>("");
  const [categoriasDaVotacao, setCategoriasDaVotacao] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const steps = [
    "Dados Pessoais",
    "Selecionar Votação",
    "Selecionar Categorias",
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
      setCategories([]);
      setActiveStep(1);
    } else {
      setCategoriasDaVotacao([]);
    }
  };

  const handleCategoriesChange = (cats: string[]) => {
    setCategories(cats);
    if (cats.length > 0) setActiveStep(2);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!votacaoSelecionadaId || categories.length === 0) {
      setSnackbarMessage("Por favor, selecione uma votação e pelo menos uma categoria.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const category of categories) {
      try {
        const response = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            work: formData.work,
            votacaoId: votacaoSelecionadaId,
            category,
          }),
        });

        if (!response.ok) {
          errorCount++;
        } else {
          successCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setSaving(false);

    if (successCount > 0) {
      setSnackbarMessage(
        `Registrado em ${successCount} categoria(s)${errorCount > 0 ? ` (${errorCount} falha(s))` : ""}!`
      );
      setSnackbarSeverity(errorCount > 0 ? "warning" : "success");
      setSnackbarOpen(true);
      onRegister();

      setFormData({ name: "", work: "" });
      setCategories([]);
      setVotacaoSelecionadaId("");
      setCategoriasDaVotacao([]);
      setActiveStep(0);
    } else {
      setSnackbarMessage("Erro ao registrar. Tente novamente.");
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
                  selectedCategories={categories}
                  onCategoriesChange={handleCategoriesChange}
                />

                <RegistrationSummary
                  name={formData.name}
                  work={formData.work}
                  votacaoNome={votacaoNome}
                  categories={categories}
                />

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    size="large"
                    disabled={
                      saving ||
                      !formData.name ||
                      !votacaoSelecionadaId ||
                      categories.length === 0
                    }
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    {saving
                      ? `Registrando em ${categories.length} categoria(s)...`
                      : `Confirmar Registro (${categories.length} categoria${categories.length > 1 ? "s" : ""})`}
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
