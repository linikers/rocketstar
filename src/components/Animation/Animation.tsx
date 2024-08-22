import { Grid } from "@mui/material";
import rocket from "../../../public/foguete.png";
import Image from "next/image";

export  default function Animation () {

    return (
        <Grid container sx={{ marginTop: '4rem' }}>
            <Image 
                src={rocket}
                alt="rocket"
                width={400}
                height={600}
            />
       </Grid> 
    )
}
