import { useEffect, useState } from "react";
import { IUser } from "../Register/Register";
import { Button, Grid, LinearProgress, TextField, Typography } from "@mui/material";

interface VoteValuesState {
    anatomy: number | null;
    creativity: number | null;
    pigmentation: number | null;
    traces: number | null;
    readability: number | null;
    visualImpact: number | null;
    category: string;
}
interface VoteProps {
    onOpenSnackBar: (message: string) => void;
    users?: IUser[] | []; 
    setUsers?: (users: IUser[]) => void;
}

export default function Vote ({ onOpenSnackBar }: VoteProps) {
    // const [totalVotes, setTotalVotes] = useState(0);
    const [totalScoreSum, setTotalScoreSum] = useState(0);
    // const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [users, setUsers] = useState<IUser[]>([]);
    const [voteValues, setVoteValues] = useState<VoteValuesState>({
        anatomy: null,
        creativity: null,
        pigmentation: null,
        traces: null,
        readability: null,
        visualImpact: null,
        category: "",
        // competidorId: "",
        // juradoId: "",
    });
    const [votingUserId, setVotingUserId] = useState<string | null>(null);
    const [juradoId, setJuradoId] = useState<string>(""); // Estado para o ID do jurado
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
                const total = data.reduce((acc: number, user: { totalScore: number }) => acc + user.totalScore, 0);
                setTotalScoreSum(total);
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
        // setVoteValues({ ...voteValues, [e.target.name]: parseInt(e.target.value, 10) });
        const { name, value } = e.target;
        if (value === '') {
            setVoteValues(prevValues => ({ ...prevValues, [name]: 0 }));
            return;
        }

        // Converte o valor para número. Se o campo estiver vazio ou inválido, considera 0.
        let numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
            // numValue = 0;
            return;
        }

        // Limita o valor entre 0 e 10.
        if (numValue > 10) {
            numValue = 10;
        } else if (numValue < 0) {
            numValue = 0;
        }

        setVoteValues(prevValues => ({
            ...prevValues,
            [name]: numValue,
        }));

    };
 
    const handleVote = async (userId: string) => {
        setVotingUserId(userId);

        // if (!juradoId) {
        //     onOpenSnackBar("Por favor, insira o ID do Jurado antes de votar.");
        //     return;
        // }
        try {
            setLoading(true);
            const payload = {
                anatomy: voteValues.anatomy ?? 0,
                creativity: voteValues.creativity ?? 0,
                pigmentation: voteValues.pigmentation ?? 0,
                traces: voteValues.traces ?? 0,
                readability: voteValues.readability ?? 0,
                visualImpact: voteValues.visualImpact ?? 0,
            };

            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({ 
                //     ...voteValues, 
                //     competidorId: userId, // ID do competidor que está recebendo o voto
                //     juradoId: juradoId, // ID do jurado que está votando
                // })
                body: JSON.stringify({ ...payload, competidorId: userId })
            });
            if (!response.ok) {
                throw new Error('Erro ao registrar voto');
            }
            const updatedUser = await response.json();
            const updatedUsers = users.map(
                (user: any) => user._id === updatedUser._id ? { ...user, ...updatedUser } : user
            );

            setUsers(updatedUsers);
            const newTotalScore = updatedUsers.reduce((acc, user) => acc + user.totalScore, 0);
            setTotalScoreSum(newTotalScore);
            setVoteValues({
                anatomy: 0,
                creativity: 0,
                pigmentation: 0,
                traces: 0,
                readability: 0,
                visualImpact: 0,
                category: '',
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

                        {/* Campo para inserir o ID do Jurado */}
                        <TextField
                label="ID do Jurado"
                value={juradoId}
                onChange={(e) => setJuradoId(e.target.value)}
                variant="outlined"
                fullWidth
                required
                sx={{ marginBottom: '2rem', maxWidth: '500px' }}
            />

            <form style={{ width: "100%" }} onSubmit={(e) => { e.preventDefault(); }}>
                <Grid container spacing={3} sx={{ width: "100%" }}>
                    {users.length > 0 ? (
                        users.map((user: any) => (
                            <Grid
                                key={(user as any)._id}
                                xs={12} item
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    backgroundColor: "#FB607F",
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
                                    style={{ fontWeight: "bold", color: "#FFC0CB" }}
                                >
                                    {user.name}
                                </Typography>
                                <Typography
                                    style={{ color: "#FB607F" }}
                                >
                                    {user.work}
                                </Typography>

                                <TextField
                                    label="Anatomia"
                                    type="number"
                                    inputProps={{ min: 1, max: 10 }}
                                    // value={voteValues.anatomy ? Number(voteValues.anatomy) : 0}
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
                                    // value={voteValues.creativity ? Number(voteValues.creativity) : 0}
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
                                    // value={voteValues.pigmentation ? Number(voteValues.pigmentation) : 0}
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
                                    // value={voteValues.traces ? Number(voteValues.traces) : 0}
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
                                    // value={voteValues.readability ? Number(voteValues.readability) : 0}
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
                                    // value={voteValues.visualImpact ? Number(voteValues.visualImpact) : 0}
                                    value={voteValues.visualImpact}
                                    onChange={handleVoteChange}
                                    name="visualImpact"
                                    style={{ marginBottom: "0.5rem" }}
                                    fullWidth
                                />

                                  <Typography
                                    variant="caption" sx={{ margin: 2}} fontSize="12" color="#f0f0f0">
                                    {user.category}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={totalScoreSum > 0
                                        ? (user.totalScore / totalScoreSum) * 100
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
                                    Pontuação: 
                                        {user.totalScore} 
                                        ({totalScoreSum > 0 ? 
                                            ((user.totalScore / totalScoreSum) * 100).toFixed(2)
                                            : 0
                                        } %)
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleVote((user as any)._id)}
                                    style={{ marginTop: "1rem" }}
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
