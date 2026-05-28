import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import useGlobalStyles from "@/assets/themes/globalStyles";
import { theme } from "@/assets/themes/theme";
import { SnackbarProvider } from "@/contexts/SnackbarContext";

function MyApp({ Component, pageProps }: AppProps) {
    useGlobalStyles();
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider>
                <Component {...pageProps} />
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default MyApp;
