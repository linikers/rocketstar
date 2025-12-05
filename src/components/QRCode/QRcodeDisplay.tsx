import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Box, Typography } from "@mui/material";

interface QRCodeDisplayProps {
  code: string;
  size?: number;
}

export default function QRCodeDisplay({
  code,
  size = 200,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && code) {
      // Gera o QR code no canvas
      QRCode.toCanvas(
        canvasRef.current,
        code,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("Erro ao gerar QR Code:", error);
          }
        }
      );
    }
  }, [code, size]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
      <canvas ref={canvasRef} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ wordBreak: "break-all", maxWidth: size }}
      >
        {code}
      </Typography>
    </Box>
  );
}
