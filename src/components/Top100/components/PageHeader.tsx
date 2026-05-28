import { Box, Typography } from "@mui/material";
import Logo from "@/components/Logo/Logo";
import { useRouter } from "next/router";

export default function PageHeader() {
  const router = useRouter();

  return (
    <Box sx={{ mb: 6, textAlign: "center" }}>
      <Logo
        size="md"
        onClick={() => router.push("/")}
      />
      <Typography variant="body1" sx={{ color: "#8AC6D0", opacity: 0.9, mt: 2 }}>
        Ranking dos melhores competidores
      </Typography>
    </Box>
  );
}
