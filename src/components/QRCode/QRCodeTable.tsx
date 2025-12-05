import React, { useState } from "react";
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
} from "@mui/icons-material";
import StatusBadge from "./StatusBadge";
import QRCodeDisplay from "./QRcodeDisplay";
import { IQRCodeAuth } from "@/models/QRCodeAuth";

interface QRCodeTableProps {
  qrCodes: Array<IQRCodeAuth & { status: "valido" | "expirado" | "usado" }>;
}

export default function QRCodeTable({ qrCodes }: QRCodeTableProps) {
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = (code: string) => {
    setSelectedQR(code);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedQR(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Código copiado!");
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
                    <Box display="flex" gap={1} justifyContent="center">
                      <Tooltip title="Visualizar QR Code">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(qr.code)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copiar código">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyCode(qr.code)}
                        >
                          <ContentCopyIcon />
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
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" py={2}>
            {selectedQR && <QRCodeDisplay code={selectedQR} size={300} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => selectedQR && handleCopyCode(selectedQR)}>
            Copiar Código
          </Button>
          <Button onClick={handleCloseDialog} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
