import { IVotacao } from '@/models/Votacao';
import { Button, Container, Grid, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import React, { FormEvent, useEffect, useState } from 'react';

export default function AdminVotacaoPage() {
  const [votacoes, setVotacoes] = useState<IVotacao[]>([]);
  const [formState, setFormState] = useState({
    nome: '',
    data: new Date().toISOString().split('T')[0], // Padrão para hoje
    categorias: '', // Usaremos uma string separada por vírgulas
  });

  const fetchVotacoes = async () => {
    try {
      const response = await fetch('/api/votacoes');
      const data: IVotacao[] = await response.json();
      setVotacoes(data);
    } catch (error) {
      console.error('Erro ao buscar votações:', error);
    }
  };

  useEffect(() => {
    fetchVotacoes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Converte a string de categorias em um array, removendo espaços em branco
    const categoriasArray = formState.categorias.split(',').map(cat => cat.trim()).filter(cat => cat);

    if (!formState.nome || categoriasArray.length === 0) {
      alert('Nome e pelo menos uma categoria são obrigatórios.');
      return;
    }

    try {
      const response = await fetch('/api/votacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formState.nome,
          data: new Date(formState.data),
          categorias: categoriasArray,
          ativo: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar votação');
      }

      // Limpa o formulário e atualiza a lista
      setFormState({ nome: '', data: new Date().toISOString().split('T')[0], categorias: '' });
      fetchVotacoes();
      alert('Votação criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar votação:', error);
      alert('Erro ao criar votação.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta votação?')) {
      return;
    }
    try {
      const response = await fetch(`/api/votacoes?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao deletar');
      fetchVotacoes(); // Atualiza a lista
      alert('Votação deletada com sucesso.');
    } catch (error) {
      alert('Erro ao deletar votação.');
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

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Votações Existentes</Typography>
      <List>
        {votacoes.map(votacao => (
        //   <ListItem key={votacao._id} divider>
        <ListItem
        key={votacao._id}
        divider
        secondaryAction={
          <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(votacao._id)}>
            <Typography color="error">X</Typography>
          </IconButton>
        }
      >
            <ListItemText primary={votacao.nome} secondary={`Categorias: ${votacao.categorias.join(', ')}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
