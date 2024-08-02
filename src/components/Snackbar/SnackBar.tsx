import { Alert, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";

interface ISnack {
    message?: string;
    severity: "success" | "error" | "warning" | "info";
}

export const SnackBarCustom: React.FC<ISnack> = ({ message, severity }) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (message) {
            setOpen(true);
        }
    }, [message]);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
                {message}
            </Alert>
        </Snackbar>
    );
};
