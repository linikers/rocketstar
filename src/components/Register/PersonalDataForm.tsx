import { Grid, TextField, Typography } from "@mui/material";
import { PersonAdd as PersonAddIcon } from "@mui/icons-material";

interface PersonalDataFormProps {
  name: string;
  work: string;
  onNameChange: (name: string) => void;
  onWorkChange: (work: string) => void;
}

export default function PersonalDataForm({
  name,
  work,
  onNameChange,
  onWorkChange,
}: PersonalDataFormProps) {
  return (
    <>
      <Grid item xs={12}>
        <Typography
          variant="h6"
          sx={{
            color: "#B8F3FF",
            fontWeight: 600,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PersonAddIcon />
          Dados Pessoais
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Nome do Competidor"
          name="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          fullWidth
          required
          placeholder="Digite seu nome completo"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#B8F3FF",
              "& fieldset": {
                borderColor: "rgba(184, 243, 255, 0.3)",
              },
              "&:hover fieldset": {
                borderColor: "#8AC6D0",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#B8F3FF",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#8AC6D0",
            },
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Estúdio / Trabalho"
          name="work"
          value={work}
          onChange={(e) => onWorkChange(e.target.value)}
          fullWidth
          placeholder="Nome do estúdio ou trabalho apresentado"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#B8F3FF",
              "& fieldset": {
                borderColor: "rgba(184, 243, 255, 0.3)",
              },
              "&:hover fieldset": {
                borderColor: "#8AC6D0",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#B8F3FF",
              },
            },
            "& .MuiInputLabel-root": {
              color: "#8AC6D0",
            },
          }}
        />
      </Grid>
    </>
  );
}
