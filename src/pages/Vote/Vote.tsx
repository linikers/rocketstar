import { useEffect, useState } from "react";
import { Box, Grid, Typography, Container, Skeleton } from "@mui/material";
import PageHeader from "@/components/Vote/PageHeader";
import CompetitorCard from "@/components/Vote/CompetitorCard";
import { useSnackbar } from "@/contexts/SnackbarContext";

interface VoteProps {
  users?: any[];
  setUsers?: (users: any[]) => void;
}

export default function Vote({ users: initialUsers, setUsers: setParentUsers }: VoteProps) {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/list");
        if (!response.ok) {
          throw new Error("Erro ao listar competidores");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        showSnackbar("Erro ao listar competidores");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [showSnackbar]);

  if (loading && users.length === 0)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        }}
      >
        <Box sx={{ width: "80%", maxWidth: 600 }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 2 }} />
          <Skeleton variant="rounded" height={120} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 1 }} />
          <Skeleton variant="rounded" height={120} sx={{ bgcolor: "rgba(184,243,255,0.1)", mb: 1 }} />
          <Skeleton variant="rounded" height={120} sx={{ bgcolor: "rgba(184,243,255,0.1)" }} />
        </Box>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <PageHeader />

        <Grid container spacing={3}>
          {users.length > 0 ? (
            users.map((user: any) => (
              <Grid item xs={12} key={user._id}>
                <CompetitorCard user={user} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "#8AC6D0",
                }}
              >
                <Typography variant="h6">
                  Nenhum participante cadastrado
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
}
