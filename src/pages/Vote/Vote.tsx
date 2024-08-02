import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import { Button, Grid, LinearProgress, TextField, Typography } from "@mui/material";

interface VoteProps {
    onOpenSnackBar: (message: string) => void;
    users?: IUser[] | []; 
    setUsers?: (users: IUser[]) => void;
}

export default function Vote ({ onOpenSnackBar }: VoteProps) {
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [users, setUsers] = useState<IUser[]>([]);
    const [voteValues, setVoteValues] = useState({
        anatomy: 0,
        creativity: 0,
        pigmentation: 0,
        traces: 0,
        readability: 0,
        visualImpact: 0,
    });
    const [votingUserId, setVotingUserId] = useState<string | null>(null);

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
                const total = data.reduce((acc: number, user: { votes: number }) => acc + user.votes, 0);
                setTotalVotes(total);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                onOpenSnackBar("Erro ao listar competidores");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [onOpenSnackBar]);

    const handleVoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVoteValues({ ...voteValues, [e.target.name]: parseInt(e.target.value, 10) });
    };

    const handleVote = async (userId: string) => {
        setVotingUserId(userId);

        try {
            setLoading(true);
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...voteValues, userId })
            });
            if (!response.ok) {
                throw new Error('Erro ao registrar voto');
            }
            const updatedUser = await response.json();
            const updatedUsers = users.map(
                (user) => user.id === updatedUser.id ? updatedUser : user
            );
            setUsers(updatedUsers);
            const newTotalVotes = updatedUsers.reduce((acc, user) => acc + user.votes, 0);
            setTotalVotes(newTotalVotes);
            setVoteValues({
                anatomy: 0,
                creativity: 0,
                pigmentation: 0,
                traces: 0,
                readability: 0,
                visualImpact: 0,
            });
            onOpenSnackBar("Voto registrado com sucesso");
        } catch (error) {
            console.error('Erro ao votar:', error);
            onOpenSnackBar("Erro ao registrar voto");
        } finally {
            setLoading(false);
            setVotingUserId(null);
        }
    };
    if(loading) return <Typography>Carregando...</Typography>
    return (
        <Grid container
            sx={{
                margin: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "320px",
            }}
        >
            <Grid item>
                <Typography variant="h4" gutterBottom style={{ marginBottom: "6rem" }}>Vote Agora</Typography>
            </Grid>

            <form style={{ width: "100%" }} onSubmit={(e) => { e.preventDefault(); }}>
                <Grid container spacing={3} sx={{ width: "100%" }}>
                    {users.length > 0 ? (
                        users.map((user) => (
                            <Grid
                                key={user.id}
                                xs={12} item
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    backgroundColor: "#6c757d",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    marginBottom: "1rem",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                    minWidth: "320px",
                                    "&:hover": {
                                        transform: "scale(1.02)",
                                        boxShadow: "0 16px rgba(0,0,0, 0.2)",
                                    }
                                }}
                            >
                                <Typography
                                    style={{ fontWeight: "bold" }}
                                >
                                    {user.name}
                                </Typography>
                                <Typography
                                    style={{ color: "#757575" }}
                                >
                                    {user.work}
                                </Typography>

                                <TextField
                                    label="Anatomia"
                                    type="number"
                                    inputProps={{ min: 1, max: 10 }}
                                    value={voteValues.anatomy}
                                    onChange={handleVoteChange}
                                    name="anatomy"
                                    style={{ marginBottom: "0.5rem" }}
                                    fullWidth
                                />
                                <TextField
                                    label="Criatividade"
                                    type="number"
                                    inputProps={{ min: 1, max: 10 }}
                                    value={voteValues.creativity}
                                    onChange={handleVoteChange}
                                    name="creativity"
                                    style={{ marginBottom: "0.5rem" }}
                                    fullWidth
                                />
                                <TextField
                                    label="Pigmentação"
                                    type="number"
                                    inputProps={{ min: 1, max: 10 }}
                                    value={voteValues.pigmentation}
                                    onChange={handleVoteChange}
                                    name="pigmentation"
                                    style={{ marginBottom: "0.5rem" }}
                                    fullWidth
                                />
                                <TextField
                                    label="Traços"
                                    type="number"
                                    inputProps={{ min: 1, max: 10 }}
                                    value={voteValues.traces}
                                    onChange={handleVoteChange}
                                    name="traces"
                                    style={{ marginBottom: "0.5rem" }}
                                    fullWidth
                                />
                                <TextField
                                    label="Legibilidade"
                                    type="number"
                                    inputProps={{ min: 1, max: 10 }}
                                    value={voteValues.readability}
                                    onChange={handleVoteChange}
                                    name="readability"
                                    style={{ marginBottom: "0.5rem" }}
                                    fullWidth
                                />
                                <TextField
                                    label="Impacto Visual"
                                    type="number"
                                    inputProps={{ min: 1, max: 10 }}
                                    value={voteValues.visualImpact}
                                    onChange={handleVoteChange}
                                    name="visualImpact"
                                    style={{ marginBottom: "0.5rem" }}
                                    fullWidth
                                />
                                <LinearProgress
                                    variant="determinate"
                                    value={totalVotes > 0
                                        ? (user.votes / totalVotes) * 100
                                        : 0
                                    }
                                    sx={{
                                        backgroundColor: "#414141",
                                        marginTop: "0.5rem",
                                        height: "10px",
                                        borderRadius: "8px",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor: "#3f51b5",
                                        },
                                    }}
                                />
                                <Typography variant="caption" style={{ display: "block", marginTop: "0.5rem" }}>
                                    {user.votes} votos ({totalVotes > 0 ? ((user.votes / totalVotes) * 100).toFixed(2) : 0} %)
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleVote(user.id)}
                                    style={{ marginTop: "1rem" }}
                                    disabled={votingUserId === user.id}
                                >
                                    Votar
                                </Button>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body1">Nenhum participante cadastrado</Typography>
                    )}
                </Grid>
            </form>
        </Grid>
    );
}
