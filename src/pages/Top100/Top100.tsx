import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import { Box, Grid, Paper, Typography, Tabs, Tab } from "@mui/material";
import { categoryToDay } from "@/utils/categoryMap";

const dias = ["Sexta", "Sábado", "Domingo"] as const;

export default function Top100() {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/list');
        if (!response.ok) {
          throw new Error('Erro ao listar competidores');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <Typography>Carregando...</Typography>;

  const diaAtual = dias[tabIndex];

  // Calcula totalScore e filtra por dia e categoria
  const sortedUsers = [...users]
    .map(user => ({
      ...user,
      totalScore:
        (user.anatomy || 0) +
        (user.creativity || 0) +
        (user.pigmentation || 0) +
        (user.traces || 0) +
        (user.readability || 0) +
        (user.visualImpact || 0)
    }))
    .filter(user => {
      // Se o usuário não tem categoria, não mostra (categoria é obrigatória agora)
      if (!user.category) return false;
      
      // Verifica se a categoria do usuário pertence ao dia atual
      const userDay = categoryToDay[user.category];
      if (!userDay || userDay !== diaAtual) return false;
      
      // Filtra por categoria se selecionada
      if (categoriaSelecionada && user.category !== categoriaSelecionada) return false;
      
      return true;
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 100);

  // Categorias disponíveis para o dia atual (baseado no mapeamento + usuários do banco)
  const categoriasDoDia = Object.keys(categoryToDay).filter(categoria => 
    categoryToDay[categoria] === diaAtual
  );

  return (
    <Box sx={{ margin: "3rem", marginTop: "6rem" }}>
      <Typography gutterBottom variant="h4">Top 100</Typography>

      {/* Abas dos dias */}
      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => {
          setTabIndex(newValue);
          setCategoriaSelecionada(""); // reset categoria ao mudar de aba
        }}
        sx={{ marginBottom: 2 }}
      >
        {dias.map((dia, index) => (
          <Tab key={dia} label={dia} />
        ))}
      </Tabs>

      {/* Seleção de categoria */}
      <Box sx={{ marginBottom: 2 }}>
        <Typography>Filtrar por categoria:</Typography>
        <select
          value={categoriaSelecionada}
          onChange={(e) => setCategoriaSelecionada(e.target.value)}
          style={{ 
            padding: "8px", 
            borderRadius: "4px", 
            border: "1px solid #ccc",
            marginTop: "8px"
          }}
        >
          <option value="">-- Todas --</option>
          {categoriasDoDia.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </Box>

      <Grid container spacing={2}>
        {sortedUsers.map((user, index) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
            <Paper sx={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#e3d5ca",
              borderRadius: "8px",
              padding: "1rem"
            }}>
              <Box sx={{ textAlign: "center", marginBottom: "1rem"}}>
                <Typography variant="h6" sx={{ fontWeight: "bold"}}>
                  {index + 1}. {user.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">Anatomia: {user.anatomy}</Typography>
                <Typography variant="body1">Criatividade: {user.creativity}</Typography>
                <Typography variant="body1">Pigmentação: {user.pigmentation}</Typography>
                <Typography variant="body1">Traços: {user.traces}</Typography>
                <Typography variant="body1">Legibilidade: {user.readability}</Typography>
                <Typography variant="body1">Impacto Visual: {user.visualImpact}</Typography>
                <Typography variant="body2">Nota Geral: {user.totalScore}</Typography>
                {user.category && (
                  <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                    Categoria: {user.category}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}