import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Filter as FilterIcon } from "@mui/icons-material";

interface CategoryFilterProps {
  categorias: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  categorias,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (categorias.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <FormControl
        fullWidth={isMobile}
        sx={{
          minWidth: isMobile ? "100%" : 250,
        }}
      >
        <InputLabel
          sx={{
            color: "#8AC6D0",
            "&.Mui-focused": {
              color: "#B8F3FF",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon fontSize="small" />
            Filtrar por categoria
          </Box>
        </InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          label="Filtrar por categoria"
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
          <MenuItem value="">-- Todas --</MenuItem>
          {categorias.map((categoria) => (
            <MenuItem key={categoria} value={categoria}>
              {categoria}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
