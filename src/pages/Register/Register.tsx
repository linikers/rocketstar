import { categoryToDay } from "@/utils/categoryMap";
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import React, { FormEvent, useState } from "react";

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

const dias = ["Sexta", "Sábado", "Domingo"] as const;

export default function Register ({ onRegister }: IRegisterProps) {
  const [formData, setFormData] = useState<IUser>({
    id: "",
    name: "",
    work: "",
    votes: 0,
    percent: 0,
    anatomy: 0,
    creativity: 0,
    pigmentation: 0,
    traces: 0,
    readability: 0,
    visualimpact: 0,
    totalScore: 0,
    day: "Sexta",
    category: "",
  });
  const [, setSnackbarMessage] = useState("");
  const [, setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("success");
  const [, setSnackbarOpen] = useState(false);

  const [diaSelecionado, setDiaSelecionado] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === 'votes' || name === 'anatomy' || name === 'creativity' || 
              name === 'pigmentation' || name === 'traces' || name === 'readability' || 
              name === 'visualimpact' || name === 'totalScore' ? parseFloat(value) : value,
    }));
  };

  const handleCategoryChange = (categoria: string) => {
    setFormData((prevState) => ({
      ...prevState,
      category: categoria,
    }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    // DEBUG: Verificar se a categoria está sendo enviada
    console.log('FormData sendo enviado:', formData);
    console.log('Category:', formData.category);

    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        id: "",
        name: "",
        work: "",
        votes: 0,
        percent: 0,
        anatomy: 0,
        creativity: 0,
        pigmentation: 0,
        traces: 0,
        readability: 0,
        visualimpact: 0,
        totalScore: 0,
        day: "Sexta",
        category: "",
      });
      setDiaSelecionado("");
      
    } catch (error) {
      setSnackbarMessage("Erro ao salvar");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const categoriasFiltradas = Object.entries(categoryToDay)
    .filter(([_, dia]) => dia === diaSelecionado)
    .map(([categoria]) => categoria);

  return (
    <form onSubmit={handleRegister}>
      <Grid container spacing={2} sx={{ marginTop: '2rem'}}>
        <FormControl fullWidth>
          <Grid item xs={12} style={{ margin: "1rem" }}>
            <TextField 
              label="Nome" 
              name="name" 
              value={formData.name} 
              color="secondary" 
              onChange={handleInputChange} 
              fullWidth 
              required
            />
          </Grid>
          <Grid item xs={12} style={{ margin: "1rem" }}>
            <TextField 
              label="Estúdio" 
              name="work" 
              value={formData.work} 
              onChange={handleInputChange} 
              fullWidth 
            />
          </Grid>

          <Grid item xs={12} style={{ margin: "1rem" }}>
            <FormControl fullWidth>
              <InputLabel id="dia-label">Selecione o Dia</InputLabel>
              <Select
                labelId="dia-label"
                value={diaSelecionado}
                label="Selecione o Dia"
                onChange={(e) => {
                  setDiaSelecionado(e.target.value);
                  // Limpa a categoria quando muda o dia
                  setFormData(prev => ({ ...prev, category: "" }));
                }}
              >
                <MenuItem value="">
                  <em>-- escolha --</em>
                </MenuItem>
                {dias.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
       
          {diaSelecionado && (
            <Grid item xs={12} style={{ margin: "1rem" }}>
              <FormControl fullWidth>
                <InputLabel id="categoria-label">Selecione a Categoria</InputLabel>
                <Select
                  labelId="categoria-label"
                  value={formData.category}
                  label="Selecione a Categoria"
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <MenuItem value="">
                    <em>-- escolha --</em>
                  </MenuItem>
                  {categoriasFiltradas.map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {formData.category && (
            <Grid item xs={12} style={{ margin: "1rem" }}>
              <Typography variant="body1">
                Categoria selecionada: <b>{formData.category}</b> ({categoryToDay[formData.category]})
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} style={{ margin: "2rem" }}>
            <Button variant="contained" color="primary" type="submit">
              Salvar
            </Button>
          </Grid>
        </FormControl>
      </Grid>
    </form>
  );
}