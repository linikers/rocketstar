import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import { Box, Grid, Paper, Typography } from "@mui/material";


export default function Top100 () {
    const [loading, setLoading] = useState<boolean>(false);
    const [users, setUsers]= useState<IUser[]>([]);
    
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
                // const total = data.reduce((acc: number, user: { votes: number }) => acc + user.votes, 0);
                // setTotalVotes(total);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                // onOpenSnackBar("Erro ao listar competidores");
            } finally {
                setLoading(false);
            }
        };
    
        fetchUsers();
    }, []);
    if(loading) return <Typography>Carregando...</Typography>

    // const sortedUsers = [...users].sort((a,b) => b.totalScore - a.totalScore).slice(0, 100)
    //add id
    const sortedUsers = [...users].map(user => ({
        ...user, 
        totalScore: 
            (user.anatomy || 0) + 
            (user.creativity || 0) +
            (user.pigmentation || 0) +
            (user.traces || 0) +
            (user.readability || 0) +
            (user.visualImpact || 0)
    })).sort((a, b) => b.totalScore - a.totalScore).slice(0, 100);

    return (
        <Grid container spacing={2} sx={{ margin: "3rem", marginTop: "6rem" }}>
            <Grid xs={12}>
            <Typography gutterBottom variant="h4">Top 100</Typography>
            </Grid>
            {sortedUsers.map((user, index) => (
                <Grid key={index} item xs={12} sm={6} md={4} lg={3}>
                    <Paper sx={{ 
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
                        backgroundColor: "#e3d5ca", 
                        borderRadius: "8px", 
                        padding: "1rem"
                        }}
                    >
                        <Box sx={{ textAlign: "center", marginBottom: "1rem"}}>
                            <Typography variant="h6" sx={{ fontWeight: "bold"}}>{index + 1}. {user.name}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body1">Anatomia: {user.anatomy}</Typography>
                            <Typography variant="body1">Criatividade: {user.creativity}</Typography>
                            <Typography variant="body1">Pigmentação: {user.pigmentation}</Typography>
                            <Typography variant="body1">Traços: {user.traces}</Typography>
                            <Typography variant="body1">Legibilidade: {user.readability}</Typography>
                            <Typography variant="body1">Impacto Visual: {user.visualImpact}</Typography>
                            <Typography variant="body2">Nota Geral: {Number(user.totalScore)}</Typography>
                        </Box>
                    </Paper>
                 

            </Grid>
            ))}
        </Grid>
    )
}