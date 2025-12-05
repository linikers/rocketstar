import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Event as EventIcon } from "@mui/icons-material";
import { IVotacao } from "@/models/Votacao";

interface VotingSelectorProps {
  votacoes: IVotacao[];
  selectedVotacaoId: string;
  onVotacaoChange: (votacaoId: string) => void;
}

export default function VotingSelector({
  votacoes,
  selectedVotacaoId,
  onVotacaoChange,
}: VotingSelectorProps) {
  return (
    <>
      <Grid item xs={12} sx={{ mt: 2 }}>
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
          <EventIcon />
          Votação
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel
            sx={{
              color: "#8AC6D0",
              "&.Mui-focused": {
                color: "#B8F3FF",
              },
            }}
          >
            Selecione a votação
          </InputLabel>
          <Select
            value={selectedVotacaoId}
            label="Selecione a Votação"
            onChange={(e) => onVotacaoChange(e.target.value as string)}
            sx={{
              color: "#B8F3FF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(184, 243, 255, 0.3)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#8AC6D0",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#B8F3FF",
              },
              "& .MuiSvgIcon-root": {
                color: "#8AC6D0",
              },
            }}
          >
            <MenuItem value="">
              <em>-- Escolha uma votação --</em>
            </MenuItem>
            {votacoes.map((v) => (
              <MenuItem key={v._id} value={v._id}>
                {v.nome} ({new Date(v.data).toLocaleDateString("pt-BR")})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
}
