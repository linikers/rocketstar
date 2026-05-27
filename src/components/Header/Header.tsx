import { Grid, Typography, keyframes } from "@mui/material";
import { RocketLaunch } from '@mui/icons-material';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
`;

export const Header = ({ onClick }: any) => {
  return (
    <Grid sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      perspective: "800px",
      flexDirection: { xs: "column", sm: "row" },
    }}
      onClick={onClick}
    >
      <Typography sx={{
        transform: { xs: "none", sm: "rotateY(20deg)" },
        transition: "transform 0.5s",
        marginBottom: "3rem",
        display: "flex",
        alignItems: "center",
        flexDirection: { xs: "column", sm: "row" },
        textAlign: "center",
      }}>
        Rocket Tattoo
        <RocketLaunch sx={{
          fontSize: "3rem",
          transform: "translateZ(40px) rotateZ(10deg)",
          margin: "0 1rem",
          transition: "transform 0.3s ease-out, color 0.3s ease-out",
          color: "#B8F3FF",
          animation: `${float} 3s ease-in-out infinite`,
          "&:hover": {
            transform: "translateZ(40px) rotateZ(10deg) scale(1.1)",
            color: "#8AC6D0",
          }
        }}
        />
      </Typography>
    </Grid>
  )
}
