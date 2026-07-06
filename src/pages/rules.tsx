import { Box, Container, Typography, Paper, Grid } from "@mui/material";

const criteria = [
  { name: "Anatomia", icon: "🎯", desc: "Adaptação do desenho ao corpo, proporção e posicionamento." },
  { name: "Criatividade", icon: "💡", desc: "Originalidade do desenho, conceito e inovação." },
  { name: "Pigmentação", icon: "🎨", desc: "Qualidade da cor, saturação e uniformidade." },
  { name: "Traços", icon: "✏️", desc: "Precisão do traço, espessura e definição." },
  { name: "Legibilidade", icon: "👁️", desc: "Clareza do desenho, facilidade de leitura à distância." },
  { name: "Impacto Visual", icon: "⚡", desc: "Impacto geral, presença e memorabilidade." },
];

const rules = [
  { step: "1", title: "Receba seu QR Code", desc: "O administrador entrega um QR Code único para cada jurado. Escaneie com seu celular." },
  { step: "2", title: "Valide seu acesso", desc: "Ao escanear, o QR é validado e consumido (uso único). Você será redirecionado para a página de votação. O QR é válido até o último dia do evento." },
  { step: "3", title: "Avalie cada competidor", desc: "Para cada competidor, dê notas de 0 a 10 em 6 critérios: Anatomia, Criatividade, Pigmentação, Traços, Legibilidade e Impacto Visual." },
  { step: "4", title: "Confirme o voto", desc: "Clique em 'Confirmar Voto' para registrar. Após confirmado, não é possível alterar o voto naquele competidor." },
  { step: "5", title: "Finalize sua avaliação", desc: "Após votar em todos os competidores, clique em 'Finalizar Avaliação'. Sua votação será encerrada e você será redirecionado para o ranking." },
];

export default function VotingRulesPage() {
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #36213E 0%, #554971 100%)", py: 6 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(10px)", border: "1px solid rgba(184, 243, 255, 0.1)", mb: 4 }}>
          <Typography variant="h4" sx={{ color: "#B8F3FF", fontWeight: 700, textAlign: "center", mb: 1 }}>
            🏆 Regras de Votação
          </Typography>
          <Typography sx={{ color: "#8AC6D0", textAlign: "center", mb: 4 }}>
            Sistema Rocketstar — Competição de Tatuagem
          </Typography>

          {/* Etapas */}
          <Typography variant="h5" sx={{ color: "#B8F3FF", fontWeight: 600, mb: 3 }}>
            Etapas
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 5 }}>
            {rules.map((r) => (
              <Box key={r.step} sx={{ display: "flex", gap: 2, p: 2, borderRadius: 2, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(184, 243, 255, 0.08)" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(184, 243, 255, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Typography sx={{ color: "#B8F3FF", fontWeight: 700 }}>{r.step}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#B8F3FF", fontWeight: 600, mb: 0.5 }}>{r.title}</Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.9rem" }}>{r.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Critérios */}
          <Typography variant="h5" sx={{ color: "#B8F3FF", fontWeight: 600, mb: 3 }}>
            Critérios de Avaliação
          </Typography>
          <Grid container spacing={2} sx={{ mb: 5 }}>
            {criteria.map((c) => (
              <Grid item xs={12} sm={6} key={c.name}>
                <Box sx={{ p: 2, borderRadius: 2, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(184, 243, 255, 0.08)", height: "100%" }}>
                  <Typography sx={{ color: "#B8F3FF", fontWeight: 600, mb: 0.5 }}>
                    {c.icon} {c.name}
                  </Typography>
                  <Typography sx={{ color: "#8AC6D0", fontSize: "0.85rem" }}>{c.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Regras importantes */}
          <Typography variant="h5" sx={{ color: "#FFD700", fontWeight: 600, mb: 2 }}>
            ⚠️ Regras Importantes
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[
              "Cada jurado pode votar APENAS UMA VEZ por competidor.",
              "As notas devem ser de 0 a 10 — não são permitidas notas fora dessa faixa.",
              "Após confirmar o voto em um competidor, não é possível alterar.",
              "Após finalizar a avaliação, não é possível votar novamente.",
              "O QR Code é de uso único — não compartilhe com outras pessoas.",
              "Em caso de problemas, procure o administrador do evento.",
            ].map((rule, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <Typography sx={{ color: "#FFD700", fontSize: "1.1rem" }}>•</Typography>
                <Typography sx={{ color: "#8AC6D0", fontSize: "0.9rem" }}>{rule}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
