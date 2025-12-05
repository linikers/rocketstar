import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import QRCode from "qrcode";
import { Box, Typography, Link } from "@mui/material";

interface QRCodeDisplayProps {
  code: string;
  size?: number;
  showUrl?: boolean;
}

export interface QRCodeDisplayRef {
  downloadQRCode: () => void;
}

const QRCodeDisplay = forwardRef<QRCodeDisplayRef, QRCodeDisplayProps>(
  ({ code, size = 200, showUrl = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Gera a URL completa para autenticação
    const authUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/qrcode?code=${code}`
        : "";

    useEffect(() => {
      if (canvasRef.current && code) {
        // Gera o QR code no canvas com a URL completa
        QRCode.toCanvas(
          canvasRef.current,
          authUrl || code,
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
    }, [code, authUrl, size]);

    // Expõe função para download
    useImperativeHandle(ref, () => ({
      downloadQRCode: () => {
        if (canvasRef.current) {
          const url = canvasRef.current.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `qrcode-${code.substring(0, 8)}.png`;
          link.href = url;
          link.click();
        }
      },
    }));

    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <canvas ref={canvasRef} />
        {showUrl && authUrl && (
          <Link
            href={authUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            sx={{
              wordBreak: "break-all",
              maxWidth: size,
              textAlign: "center",
            }}
          >
            {authUrl}
          </Link>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ wordBreak: "break-all", maxWidth: size, textAlign: "center" }}
        >
          Código: {code.substring(0, 16)}...
        </Typography>
      </Box>
    );
  }
);

QRCodeDisplay.displayName = "QRCodeDisplay";

export default QRCodeDisplay;
