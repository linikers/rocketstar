
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import useGlobalStyles from "@/assets/themes/globalStyles";
import { theme } from "@/assets/themes/theme";


function MyApp({ Component, pageProps }: AppProps) {
    useGlobalStyles(); 
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}

export default MyApp;
