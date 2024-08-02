import { Grid, Typography, keyframes } from "@mui/material";
import { DesktopMac, RocketLaunch } from '@mui/icons-material';

const blinkAndChangeColor = keyframes`
  0% { opacity: 1; color: #ff00ff; }
  25% { opacity: 0.5; color: #ff00ff; }
  50% { opacity: 1; color: #ff00ff; }
  75% { opacity: 0.5; color: #ff00ff; } 
  100% { opacity: 1; color: #ff00ff; } 
  75% { opacity: 0.5; color: #ff00ff; }
  50% { opacity: 1; color: #ff00ff; }
  25% { opacity: 0.5; color: #ff00ff; }
  0% { opacity: 1; color: #ff00ff; }
`;

export const Header = () => {
  return (
    <Grid sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      perspective: "800px",
      flexDirection: { xs: "column", sm: "row" },
    }}>
      <Typography sx={{
        transform: "rotateY(20deg)",
        transition: "transform 0.5s",
        marginBottom: "3rem",
        display: "flex",
        alignItems: "center",
        animation: `${blinkAndChangeColor} 2s infinite`,
        flexDirection: { xs: "column", sm: "row" },
      }}>
        Rocket Tattoo 
        <RocketLaunch sx={{
          fontSize: "3rem",
          transform: "translateZ(40px) rotateZ(10deg)",
          margin: "0 1rem",
          transition: "transform 0.5s, color 0.5s",
          animation: `${blinkAndChangeColor} 2s infinite`,
          "&:hover": {
            transform: "translateZ(40px) rotateZ(10deg)",
          }
        }} 
        />
        feat. linikerS.Dev 
        <DesktopMac sx={{
          fontSize: "3rem",
          transform: "translateZ(40px) rotateZ(10deg)",
          margin: "0 1rem",
          transition: "transform 0.5s, color 0.5s",
          animation: `${blinkAndChangeColor} 2s infinite`,
          "&:hover": {
            transform: "translateZ(40px) rotateZ(10deg)",
          }
        }} 
        />
      </Typography>
    </Grid>
  )
}
