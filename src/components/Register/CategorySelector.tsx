import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";

interface CategorySelectorProps {
  categorias: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategorySelector({
  categorias,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  if (categorias.length === 0) return null;

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
          <CategoryIcon />
          Categoria
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
            Selecione a Categoria
          </InputLabel>
          <Select
            value={selectedCategory}
            label="Selecione a Categoria"
            onChange={(e) => onCategoryChange(e.target.value)}
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
              <em>-- Escolha uma categoria --</em>
            </MenuItem>
            {categorias.map((categoria) => (
              <MenuItem key={categoria} value={categoria}>
                {categoria}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </>
  );
}
