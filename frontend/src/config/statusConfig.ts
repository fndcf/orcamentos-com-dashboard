import { OrcamentoStatus } from "../types";

/**
 * Configuração de tema visual para cada status de orçamento.
 */
export interface StatusTheme {
  background: string;
  color: string;
  label: string;
}

/**
 * Mapeamento de status para seus respectivos temas visuais.
 */
export const STATUS_THEMES: Record<OrcamentoStatus, StatusTheme> = {
  aberto: {
    background: "rgba(33, 150, 243, 0.1)",
    color: "#1976d2",
    label: "Aberto",
  },
  aceito: {
    background: "rgba(76, 175, 80, 0.1)",
    color: "#388e3c",
    label: "Aceito",
  },
  recusado: {
    background: "rgba(244, 67, 54, 0.1)",
    color: "#d32f2f",
    label: "Recusado",
  },
  expirado: {
    background: "rgba(158, 158, 158, 0.1)",
    color: "#616161",
    label: "Expirado",
  },
};

/**
 * Transições de status permitidas.
 * Define quais status podem ser alcançados a partir de cada status atual.
 */
export const STATUS_TRANSITIONS: Record<OrcamentoStatus, OrcamentoStatus[]> = {
  aberto: ["aceito", "recusado"],
  aceito: ["aberto"],
  recusado: ["aberto"],
  expirado: ["aberto"],
};

/**
 * Cores para cards de estatísticas por status.
 */
export const STATUS_CARD_COLORS: Record<OrcamentoStatus | "total", string> = {
  aberto: "#2196f3",
  aceito: "#4caf50",
  recusado: "#f44336",
  expirado: "#9e9e9e",
  total: "#cc0000",
};

/**
 * Funções helper para obter informações de status
 */
export const getStatusTheme = (status: OrcamentoStatus): StatusTheme => {
  return STATUS_THEMES[status];
};

export const getStatusLabel = (status: OrcamentoStatus): string => {
  return STATUS_THEMES[status].label;
};

export const getStatusBackground = (status: OrcamentoStatus): string => {
  return STATUS_THEMES[status].background;
};

export const getStatusColor = (status: OrcamentoStatus): string => {
  return STATUS_THEMES[status].color;
};

export const getAvailableTransitions = (
  currentStatus: OrcamentoStatus
): OrcamentoStatus[] => {
  return STATUS_TRANSITIONS[currentStatus];
};

export const canTransitionTo = (
  currentStatus: OrcamentoStatus,
  targetStatus: OrcamentoStatus
): boolean => {
  return STATUS_TRANSITIONS[currentStatus].includes(targetStatus);
};

/**
 * Gera CSS para styled-components baseado no status.
 */
export const getStatusStyles = (status: OrcamentoStatus): string => {
  const theme = STATUS_THEMES[status];
  return `
    background: ${theme.background};
    color: ${theme.color};
  `;
};
