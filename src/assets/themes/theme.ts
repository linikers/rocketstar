import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
      primary: '#63768D',
      secondary: '#554971',
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
          transition: '0px 3px 6px rgba(0, 0, 0, 0.1)',
          boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.2)',
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
          color: '63768D',
          '&:hover': {
            color: '#55971',
          }
        }
      }
    }
  }
});

export { theme };