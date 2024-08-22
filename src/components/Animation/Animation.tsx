import { Grid } from "@mui/material";
import rocket from "../../../public/foguete.png";
import Image from "next/image";

export default function Animation() {
    return (
        <Grid 
            container 
            justifyContent="center" 
            alignItems="center" 
            sx={{
                height: {xs: '100vh', sm: '100vh'},
                overflow: 'hidden',
                '& img': {
                    width: {xs: '64vw', sm: '64vw'},
                    transform: 'rotate(-45deg)',
                    animation: 'fly 4s ease-in-out infinite',
                    objectFit: 'contain',
                },
                '@keyframes fly': {
                    '0%': {
                        transform: 'translateY(0) rotate(-45deg)',
                    },
                    '50%': {
                        transform: 'translateY(-20px) rotate(-45deg)',
                    },
                    '100%': {
                        transform: 'translateY(0) rotate(-45deg)',
                    },
                },
            }}
        >
            <Image 
                src={rocket}
                alt="rocket"
                width={996}
                height={695}
                quality={100}
            />
       </Grid> 
    );
}
