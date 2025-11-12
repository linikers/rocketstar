import { useEffect, useState } from 'react';
import { IUser } from '../Register/Register';
import { Box, Grid, Paper, Typography, Tabs, Tab } from '@mui/material';
import { IVotacao } from '@/models/Votacao';

export default function Top100() {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<IUser[]>([]);
  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [selectedVotacaoId, setSelectedVotacaoId] = useState<string>('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');

  useEffect(() => {
    // 1. Busca todas as votações disponíveis para criar as abas
    const fetchVotacoes = async () => {
      try {
        const response = await fetch('/api/votacoes');
        if (!response.ok) {
          throw new Error('Erro ao carregar votações');
        }
        const data: IVotacao[] = await response.json();
        setVotacoes(data);
        // Seleciona a primeira votação da lista por padrão
        if (data.length > 0) {
          setSelectedVotacaoId(data[0]._id);
        }
      } catch (error) {
        console.error('Erro ao buscar votações:', error);
      }
    };

    fetchVotacoes();
  }, []);

  useEffect(() => {
    // 2. Busca os competidores apenas para a votação selecionada
    if (!selectedVotacaoId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/list?votacaoId=${selectedVotacaoId}`);
        if (!response.ok) {
          throw new Error('Erro ao listar competidores');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erro ao buscar competidores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedVotacaoId]);

  if (loading) return <Typography>Carregando...</Typography>;

  // Filtra e ordena os competidores no lado do cliente
  const sortedUsers = [...users]
    .filter((user) => {
      if (categoriaSelecionada && user.category !== categoriaSelecionada) return false;
      return true;
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 100);

  // Pega as categorias da votação atualmente selecionada
  const categoriasDaVotacao = votacoes.find(v => v._id === selectedVotacaoId)?.categorias || [];

  return (
    <Box sx={{ margin: "3rem", marginTop: "6rem" }}>
      <Typography gutterBottom variant="h4">Top 100</Typography>

      {/* Abas para cada Votação */}
      <Tabs
        value={selectedVotacaoId}
        onChange={(_, newValue) => {
          setSelectedVotacaoId(newValue);
          setCategoriaSelecionada(''); // Reseta o filtro de categoria ao mudar de aba
        }}
        sx={{ marginBottom: 2 }}
      >
        {votacoes.map((votacao) => (
          <Tab key={votacao._id} value={votacao._id} label={votacao.nome} />
        ))}
      </Tabs>

      {/* Dropdown para filtrar por categoria */}
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
          {categoriasDaVotacao.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </Box>

      <Grid container spacing={2}>
        {sortedUsers.length > 0 ? sortedUsers.map((user, index) => (
          <Grid key={user.id} item>
            <Paper sx={{
          flex: 1, 
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#e3d5ca",
          borderRadius: "8px",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "270px",

            }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ textAlign: "center", marginBottom: "1rem", flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: "bold", 
                    color: "#2c3e50",
                    fontSize: "1.1rem"
                  }}>
                    {index + 1}. {user.name}
                  </Typography>
                  {user.work && (
                    <Typography variant="body2" sx={{ 
                      color: "#7f8c8d", 
                      fontStyle: "italic",
                      marginTop: "0.2rem"
                    }}>
                      {user.work}
                    </Typography>
                  )}
                </Box>
                
                <Box sx={{ marginBottom: "1rem" }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: "bold", 
                    marginBottom: "0.5rem", 
                    color: "#2c3e50" 
                  }}>
                    Pontuações:
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Typography variant="body2">Anatomia: {user.anatomy || 0}</Typography>
                    <Typography variant="body2">Criatividade: {user.creativity || 0}</Typography>
                    <Typography variant="body2">Pigmentação: {user.pigmentation || 0}</Typography>
                    <Typography variant="body2">Traços: {user.traces || 0}</Typography>
                    <Typography variant="body2">Legibilidade: {user.readability || 0}</Typography>
                    <Typography variant="body2">Imp. Visual: {user.visualimpact || 0}</Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  borderTop: "1px solid #bdc3c7", 
                  paddingTop: "0.8rem",
                  marginTop: "auto"
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: "bold", 
                    textAlign: "center",
                    color: "#e74c3c",
                    marginBottom: "0.5rem"
                  }}>
                    Total: {user.totalScore}
                  </Typography>
                  {user.category && (
                    <Typography variant="caption" sx={{ 
                      display: "block", 
                      textAlign: "center",
                      backgroundColor: "#34495e",
                      color: "white",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "12px",
                      fontSize: "0.7rem"
                    }}>
                      {user.category}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        )) : (
          <Typography sx={{ mt: 4, ml: 2 }}>Nenhum competidor encontrado para esta votação.</Typography>
        )}
      </Grid>
    </Box>
  );
}