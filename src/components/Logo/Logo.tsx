import { Box, Typography, keyframes } from "@mui/material";

const pulse = keyframes`
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 8px #00E5FF) drop-shadow(0 0 20px #7C4DFF) drop-shadow(0 0 40px #FF00AA);
  }
  50% {
    filter: brightness(1.3) drop-shadow(0 0 12px #00E5FF) drop-shadow(0 0 30px #7C4DFF) drop-shadow(0 0 60px #FF00AA);
  }
`;

const flicker = keyframes`
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
  }
  20%, 24%, 55% {
    opacity: 0.85;
  }
`;

interface LogoProps {
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizes = {
  sm: { title: "2rem", subtitle: "1.2rem", con: "1.4rem", padding: { x: 2, y: 0.8, innerX: 1.5, innerY: 0.5 }, radius: 12 },
  md: { title: "3.5rem", subtitle: "1.8rem", con: "2.2rem", padding: { x: 4, y: 1.5, innerX: 3, innerY: 1 }, radius: 16 },
  lg: { title: "5rem", subtitle: "2.5rem", con: "3rem", padding: { x: 5, y: 2, innerX: 4, innerY: 1.5 }, radius: 18 },
};

export default function Logo({ size = "md", onClick }: LogoProps) {
  const s = sizes[size];

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "flex-end",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        animation: `${flicker} 4s ease-in-out infinite`,
      }}
    >
      {/* Borda neon com gradiente */}
      <Box
        sx={{
          position: "relative",
          px: s.padding.x,
          py: s.padding.y,
          borderRadius: `${s.radius}px`,
          background: "linear-gradient(135deg, #00E5FF 0%, #7C4DFF 50%, #FF00AA 100%)",
          animation: `${pulse} 3s ease-in-out infinite`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: -2,
            borderRadius: `${s.radius + 2}px`,
            background: "linear-gradient(135deg, #00E5FF 0%, #7C4DFF 50%, #FF00AA 100%)",
            filter: "blur(15px)",
            opacity: 0.6,
            zIndex: -1,
          },
        }}
      >
        {/* Fundo interno escuro */}
        <Box
          sx={{
            bgcolor: "#080808",
            borderRadius: `${s.radius - 4}px`,
            px: s.padding.innerX,
            py: s.padding.innerY,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: s.title,
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "6px",
              textShadow: `
                0 0 7px #fff,
                0 0 10px #fff,
                0 0 21px #fff,
                0 0 42px #00E5FF,
                0 0 82px #7C4DFF,
                0 0 92px #FF00AA
              `,
            }}
          >
            OTTAKU
          </Typography>
        </Box>
      </Box>

      {/* Badge CON */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: -12, md: size === "lg" ? -20 : -15 },
          bottom: { xs: -8, md: size === "lg" ? -12 : -10 },
          bgcolor: "#0a0a0a",
          px: s.con === "3rem" ? 1.5 : 1,
          py: 0.3,
          borderRadius: 1.5,
          border: "2px solid",
          borderImage: "linear-gradient(135deg, #FF00AA, #7C4DFF) 1",
          boxShadow: "0 0 15px rgba(124,77,255,0.4), 0 0 30px rgba(255,0,170,0.2)",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: s.con,
            lineHeight: 1,
            color: "#fff",
            textShadow: "0 0 7px #FF00AA, 0 0 15px #7C4DFF",
            letterSpacing: "2px",
          }}
        >
          CON
        </Typography>
      </Box>
    </Box>
  );
}
