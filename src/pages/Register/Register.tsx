import { Button, FormControl, Grid, TextField } from "@mui/material";
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
  visualImpact: number;
  totalScore: number;
}

interface IRegisterProps {
  onRegister: () => void;
}

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
    visualImpact: 0,
    totalScore: 0,
  });
  const [ , setSnackbarMessage] = useState("");
  const [ , setSnackbarSeverity] = useState<"success" | "error" | "warning" | "info">("success");
  const [ , setSnackbarOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === 'votes' || name === 'anatomy' || name === 'creativity' || 
              name === 'pigmentation' || name === 'traces' || name === 'readability' || 
              name === 'visualImpact' || name === 'totalScore' ? parseFloat(value) : value,
    }));
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

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
        visualImpact: 0,
        totalScore: 0,
      });
      savedUser();
    } catch (error) {
      setSnackbarMessage("Erro ao salvar");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <Grid container spacing={2}>
        <FormControl fullWidth>
          <Grid item xs={12} style={{ margin: "1rem" }}>
            <TextField label="Nome" name="name" value={formData.name} color="secondary" onChange={handleInputChange} fullWidth />
          </Grid>
          <Grid item xs={12} style={{ margin: "1rem" }}>
            <TextField label="Estúdio" name="work" value={formData.work} onChange={handleInputChange} fullWidth />
          </Grid>
          <Grid item style={{ margin: "2rem" }}>
            <Button variant="contained" color="primary" type="submit">
              Salvar
            </Button>
          </Grid>
        </FormControl>
      </Grid>
      {/* Snackbar */}
    </form>
  );
}