import { Box, Tabs, Tab, useTheme, useMediaQuery } from "@mui/material";
import { IVotacao } from "@/models/Votacao";

interface VotingTabsProps {
  votacoes: IVotacao[];
  selectedVotacaoId: string;
  onVotacaoChange: (votacaoId: string) => void;
}

export default function VotingTabs({
  votacoes,
  selectedVotacaoId,
  onVotacaoChange,
}: VotingTabsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (votacoes.length === 0) return null;

  return (
    <Box
      sx={{
        mb: 4,
        borderRadius: 2,
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(184, 243, 255, 0.1)",
        p: 2,
      }}
    >
      <Tabs
        value={selectedVotacaoId}
        onChange={(_, newValue) => onVotacaoChange(newValue)}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons={isMobile ? "auto" : false}
        sx={{
          "& .MuiTab-root": {
            color: "#8AC6D0",
            fontWeight: 500,
            "&.Mui-selected": {
              color: "#B8F3FF",
            },
          },
          "& .MuiTabs-indicator": {
            background: "linear-gradient(90deg, #B8F3FF 0%, #8AC6D0 100%)",
            height: 3,
          },
        }}
      >
        {votacoes.map((votacao) => (
          <Tab key={votacao._id} value={votacao._id} label={votacao.nome} />
        ))}
      </Tabs>
    </Box>
  );
}
