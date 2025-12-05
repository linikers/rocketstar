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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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

    if (navigator.share) {
      try {
        await navigator.share({
          title: "QR Code de Autenticação",
          text: "Use este link para autenticação:",
          url: url,
        });
      } catch (error) {
        console.log("Compartilhamento cancelado");
      }
    } else {
      handleCopyUrl(code);
    }
  };

  const handleDownload = () => {
    if (qrDisplayRef.current) {
      qrDisplayRef.current.downloadQRCode();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateCode = (code: string) => {
    return isMobile
      ? `${code.substring(0, 6)}...`
      : `${code.substring(0, 12)}...`;
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: 2,
          border: "1px solid rgba(184, 243, 255, 0.1)",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                background: "rgba(184, 243, 255, 0.05)",
              }}
            >
              <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                Código
              </TableCell>
              {!isMobile && (
                <>
                  <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                    Criado em
                  </TableCell>
                  <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                    Expira em
                  </TableCell>
                </>
              )}
              <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                Status
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ color: "#B8F3FF", fontWeight: 600 }}>
                  Usado em
                </TableCell>
              )}
              <TableCell
                align="center"
                sx={{ color: "#B8F3FF", fontWeight: 600 }}
              >
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {qrCodes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isMobile ? 3 : 6}
                  align="center"
                  sx={{
                    color: "#8AC6D0",
                    py: 4,
                    opacity: 0.6,
                  }}
                >
                  Nenhum QR Code gerado ainda
                </TableCell>
              </TableRow>
            ) : (
              qrCodes.map((qr) => (
                <TableRow
                  key={qr._id}
                  sx={{
                    "&:hover": {
                      background: "rgba(184, 243, 255, 0.05)",
                    },
                    borderBottom: "1px solid rgba(184, 243, 255, 0.1)",
                  }}
                >
                  <TableCell sx={{ color: "#8AC6D0" }}>
                    <Tooltip title={qr.code}>
                      <span>{truncateCode(qr.code)}</span>
                    </Tooltip>
                  </TableCell>
                  {!isMobile && (
                    <>
                      <TableCell
                        sx={{ color: "#8AC6D0", fontSize: "0.875rem" }}
                      >
                        {formatDate(qr.createdAt)}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#8AC6D0", fontSize: "0.875rem" }}
                      >
                        {formatDate(qr.expiresAt)}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <StatusBadge status={qr.status} />
                  </TableCell>
                  {!isMobile && (
                    <TableCell sx={{ color: "#8AC6D0", fontSize: "0.875rem" }}>
                      {qr.usedAt ? formatDate(qr.usedAt) : "-"}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <Box display="flex" gap={0.5} justifyContent="center">
                      <Tooltip title="Visualizar QR Code">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(qr.code)}
                          sx={{
                            color: "#B8F3FF",
                            "&:hover": {
                              background: "rgba(184, 243, 255, 0.1)",
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Compartilhar link">
                        <IconButton
                          size="small"
                          onClick={() => handleShare(qr.code)}
                          sx={{
                            color: "#8AC6D0",
                            "&:hover": {
                              background: "rgba(138, 198, 208, 0.1)",
                            },
                          }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!isMobile && (
                        <Tooltip title="Copiar link">
                          <IconButton
                            size="small"
                            onClick={() => handleCopyUrl(qr.code)}
                            sx={{
                              color: "#8AC6D0",
                              "&:hover": {
                                background: "rgba(138, 198, 208, 0.1)",
                              },
                            }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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
        PaperProps={{
          sx: {
            background: "linear-gradient(135deg, #36213E 0%, #554971 100%)",
            border: "1px solid rgba(184, 243, 255, 0.2)",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#B8F3FF",
            fontWeight: 600,
            borderBottom: "1px solid rgba(184, 243, 255, 0.1)",
          }}
        >
          QR Code de Autenticação
        </DialogTitle>
        <DialogContent sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center">
            {selectedQR && (
              <QRCodeDisplay ref={qrDisplayRef} code={selectedQR} size={300} />
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: "1px solid rgba(184, 243, 255, 0.1)",
            p: 2,
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              color: "#8AC6D0",
              "&:hover": {
                background: "rgba(138, 198, 208, 0.1)",
              },
            }}
          >
            Baixar QR
          </Button>
          <Button
            startIcon={<ShareIcon />}
            onClick={() => selectedQR && handleShare(selectedQR)}
            sx={{
              color: "#8AC6D0",
              "&:hover": {
                background: "rgba(138, 198, 208, 0.1)",
              },
            }}
          >
            Compartilhar
          </Button>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={() => selectedQR && handleCopyUrl(selectedQR)}
            sx={{
              color: "#8AC6D0",
              "&:hover": {
                background: "rgba(138, 198, 208, 0.1)",
              },
            }}
          >
            Copiar Link
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleCloseDialog} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
