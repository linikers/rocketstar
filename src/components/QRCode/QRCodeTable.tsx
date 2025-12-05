import React, { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Box,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import StatusBadge from "./StatusBadge";
import QRCodeDisplay, { QRCodeDisplayRef } from "./QRcodeDisplay";
import { IQRCodeAuth } from "@/models/QRCodeAuth";

interface QRCodeTableProps {
  qrCodes: Array<IQRCodeAuth & { status: "valido" | "expirado" | "usado" }>;
}

export default function QRCodeTable({ qrCodes }: QRCodeTableProps) {
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const qrDisplayRef = useRef<QRCodeDisplayRef>(null);

  const handleOpenDialog = (code: string) => {
    setSelectedQR(code);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedQR(null);
  };

  const getAuthUrl = (code: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/auth/qrcode?code=${code}`;
    }
    return "";
  };

  const handleCopyUrl = (code: string) => {
    const url = getAuthUrl(code);
    navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência!");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Código copiado!");
  };

  const handleShare = async (code: string) => {
    const url = getAuthUrl(code);

    // Tenta usar Web Share API (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QR Code de Autenticação",
          text: "Use este link para autenticação:",
          url: url,
        });
      } catch (error) {
        // Usuário cancelou ou erro
        console.log("Compartilhamento cancelado");
      }
    } else {
      // Fallback: copia o link
      handleCopyUrl(code);
    }
  };

  const handleDownload = () => {
    if (qrDisplayRef.current) {
      qrDisplayRef.current.downloadQRCode();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  const truncateCode = (code: string) => {
    return `${code.substring(0, 8)}...`;
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell>Expira em</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Usado em</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {qrCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum QR Code gerado ainda
                </TableCell>
              </TableRow>
            ) : (
              qrCodes.map((qr) => (
                <TableRow key={qr._id}>
                  <TableCell>
                    <Tooltip title={qr.code}>
                      <span>{truncateCode(qr.code)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{formatDate(qr.createdAt)}</TableCell>
                  <TableCell>{formatDate(qr.expiresAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={qr.status} />
                  </TableCell>
                  <TableCell>
                    {qr.usedAt ? formatDate(qr.usedAt) : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="Visualizar QR Code">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(qr.code)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Compartilhar link">
                        <IconButton
                          size="small"
                          onClick={() => handleShare(qr.code)}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copiar link">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyUrl(qr.code)}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de visualização do QR Code */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>QR Code de Autenticação</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" py={2}>
            {selectedQR && (
              <QRCodeDisplay ref={qrDisplayRef} code={selectedQR} size={300} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<DownloadIcon />} onClick={handleDownload}>
            Baixar QR
          </Button>
          <Button
            startIcon={<ShareIcon />}
            onClick={() => selectedQR && handleShare(selectedQR)}
          >
            Compartilhar
          </Button>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={() => selectedQR && handleCopyUrl(selectedQR)}
          >
            Copiar Link
          </Button>
          <Button onClick={handleCloseDialog} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
