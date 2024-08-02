import { createStyles, makeStyles } from "@mui/styles";

const useGlobalStyles = makeStyles(() =>
  createStyles({
    '@global': {
      '*': {
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      },
      body: {
        margin: 0,
        padding: 0,
        maxHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
      },
      html: {
        margin: 0,
        padding: 0,
        width: '100%',
        overflowX: 'hidden',
      },
      '#root': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      },
    },
  })
);

export default useGlobalStyles;
