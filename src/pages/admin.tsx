import { IVotacao } from "@/models/Votacao";
import { IQRCodeAuth } from "@/models/QRCodeAuth";
import {
  Button,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import React, { FormEvent, useEffect, useState } from "react";
import QRCodeTable from "@/components/QRCode/QRCodeTable";

export default function AdminVotacaoPage() {
  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [formState, setFormState] = useState({
    nome: "",
    data: new Date().toISOString().split("T")[0], // Padrão para hoje
    categorias: "", // Usaremos uma string separada por vírgulas
  });

  // Estados para QR Codes
  const [qrCodes, setQrCodes] = useState<
    Array<IQRCodeAuth & { status: "valido" | "expirado" | "usado" }>
  >([]);
  const [validityHours, setValidityHours] = useState<number>(72);
  const [loadingQR, setLoadingQR] = useState(false);

  const fetchVotacoes = async () => {
    try {
      const response = await fetch("/api/votacoes");
      const data: IVotacao[] = await response.json();
      setVotacoes(data);
    } catch (error) {
      console.error("Erro ao buscar votações:", error);
    }
  };

  const fetchQRCodes = async () => {
    try {
      const response = await fetch("/api/qrcodes/list");
      const result = await response.json();
      if (result.success) {
        setQrCodes(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar QR Codes:", error);
    }
  };

  useEffect(() => {
    fetchVotacoes();
    fetchQRCodes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Converte a string de categorias em um array, removendo espaços em branco
    const categoriasArray = formState.categorias
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat);

    if (!formState.nome || categoriasArray.length === 0) {
      alert("Nome e pelo menos uma categoria são obrigatórios.");
      return;
    }

    try {
      const response = await fetch("/api/votacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formState.nome,
          data: new Date(formState.data),
          categorias: categoriasArray,
          ativo: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar votação");
      }

      // Limpa o formulário e atualiza a lista
      setFormState({
        nome: "",
        data: new Date().toISOString().split("T")[0],
        categorias: "",
      });
      fetchVotacoes();
      alert("Votação criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar votação:", error);
      alert("Erro ao criar votação.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja deletar esta votação?")) {
      return;
    }
    try {
      const response = await fetch(`/api/votacoes?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao deletar");
      fetchVotacoes(); // Atualiza a lista
      alert("Votação deletada com sucesso.");
    } catch (error) {
      alert("Erro ao deletar votação.");
    }
  };

  const handleGenerateQRCode = async () => {
    if (validityHours <= 0) {
      alert("A validade deve ser maior que 0 horas.");
      return;
    }

    setLoadingQR(true);
    try {
      const response = await fetch("/api/qrcodes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validityHours }),
      });

      const result = await response.json();

      if (result.success) {
        alert("QR Code gerado com sucesso!");
        fetchQRCodes(); // Atualiza a lista
      } else {
        alert("Erro ao gerar QR Code.");
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      alert("Erro ao gerar QR Code.");
    } finally {
      setLoadingQR(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Gerenciar Votações
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">Criar Nova Votação</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="nome"
              label="Nome da Votação (ex: Votação de Sexta)"
              value={formState.nome}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="data"
              label="Data"
              type="date"
              value={formState.data}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="categorias"
              label="Categorias (separadas por vírgula)"
              placeholder="Ex: Realismo, Old School, Aquarela"
              value={formState.categorias}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Criar Votação
            </Button>
          </Grid>
        </Grid>
      </form>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Votações Existentes
      </Typography>
      <List>
        {votacoes.map((votacao) => (
          <ListItem
            key={votacao._id}
            divider
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(votacao._id)}
              >
                <Typography color="error">X</Typography>
              </IconButton>
            }
          >
            <ListItemText
              primary={votacao.nome}
              secondary={`Categorias: ${votacao.categorias.join(", ")}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Seção de QR Codes */}
      <Divider sx={{ my: 6 }} />

      <Typography variant="h4" gutterBottom>
        Gerenciar QR Codes de Autenticação
      </Typography>

      <Box sx={{ mt: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Gerar Novo QR Code
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Validade (horas)"
              type="number"
              value={validityHours}
              onChange={(e) => setValidityHours(Number(e.target.value))}
              fullWidth
              inputProps={{ min: 1 }}
              helperText="Padrão: 72 horas (3 dias)"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateQRCode}
              disabled={loadingQR}
              fullWidth
            >
              {loadingQR ? "Gerando..." : "Gerar QR Code"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom>
        QR Codes Gerados
      </Typography>
      <QRCodeTable qrCodes={qrCodes} />
    </Container>
  );
}
