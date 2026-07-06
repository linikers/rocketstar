import {
  Grid,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Category as CategoryIcon } from "@mui/icons-material";

interface CategorySelectorProps {
  categorias: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export default function CategorySelector({
  categorias,
  selectedCategories,
  onCategoriesChange,
}: CategorySelectorProps) {
  if (categorias.length === 0) return null;

  const handleToggle = (categoria: string) => {
    const next = selectedCategories.includes(categoria)
      ? selectedCategories.filter((c) => c !== categoria)
      : [...selectedCategories, categoria];
    onCategoriesChange(next);
  };

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
          Categorias
        </Typography>
        <Typography sx={{ color: "#8AC6D0", fontSize: "0.85rem", mb: 2 }}>
          Marque todas as categorias em que o competidor participará.
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormGroup>
          {categorias.map((categoria) => (
            <FormControlLabel
              key={categoria}
              control={
                <Checkbox
                  checked={selectedCategories.includes(categoria)}
                  onChange={() => handleToggle(categoria)}
                  sx={{
                    color: "#8AC6D0",
                    "&.Mui-checked": {
                      color: "#B8F3FF",
                    },
                  }}
                />
              }
              label={categoria}
              sx={{
                color: selectedCategories.includes(categoria) ? "#B8F3FF" : "#8AC6D0",
                mb: 0.5,
                "& .MuiFormControlLabel-label": {
                  fontWeight: selectedCategories.includes(categoria) ? 600 : 400,
                },
              }}
            />
          ))}
        </FormGroup>
      </Grid>

      {selectedCategories.length > 0 && (
        <Grid item xs={12}>
          <Typography
            sx={{
              color: "#4caf50",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            ✅ {selectedCategories.length} categoria(s) selecionada(s)
          </Typography>
        </Grid>
      )}
    </>
  );
}
