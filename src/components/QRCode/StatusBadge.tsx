import React from "react";
import { Chip } from "@mui/material";

interface StatusBadgeProps {
  status: "valido" | "expirado" | "usado";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "valido":
        return { label: "Válido", color: "success" as const };
      case "expirado":
        return { label: "Expirado", color: "warning" as const };
      case "usado":
        return { label: "Usado", color: "error" as const };
      default:
        return { label: "Desconhecido", color: "default" as const };
    }
  };

  const config = getStatusConfig();

  return <Chip label={config.label} color={config.color} size="small" />;
}
