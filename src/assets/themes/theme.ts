import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  // #9400F0 roxo
  // #FFCBDB rosa
  // #4169E1 azul royal
  // #B4D4EE azul columbia
 
  palette: {
    primary: {
      main: '#B8F3FF',
    },
    secondary: {
      main: '#8AC6D0',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#36213E',
    },
    text: {
      primary: '#B8F3FF',
      secondary: '#8AC6D0',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
    },
    h2: {
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          backgroundImage: 'linear-gradient(45deg, #B8F3FF 30%, #8AC6D0 90%)',
          color: '#36213E',
          '&:hover': {
            backgroundImage:'linear-gradient(45deg, #8AC6D0 30%, #B8F3FF 90%)',
          },
        },
        outlined: {
          borderColor: '#8AC6D0',
          color: '#8AC6D0',
          '&:hover': {
            borderColor: '#B8F3FF',
            color: '#B8F3FF',
          },
        },
        text: {
          color: '#8AC6D0',
          '&:hover': {
            color: '#B8F3FF',
          }
        }
      }
    }
  }
});

export { theme };