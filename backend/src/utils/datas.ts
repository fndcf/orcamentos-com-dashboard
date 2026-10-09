/**
 * Datas no fuso da empresa (Brasília, UTC-3; sem horário de verão desde 2019).
 *
 * O servidor roda em UTC: sem isso, "2026-10-01" vira 30/09 às 21h no Brasil e o período
 * dos relatórios/painel fica deslocado 3 horas.
 */
const OFFSET = '-03:00';
const OFFSET_MS = 3 * 60 * 60 * 1000;
const SO_DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Início do dia (00:00 em Brasília) para "YYYY-MM-DD"; outros formatos são lidos como estão */
export function inicioDoDia(data: string): Date {
  return new Date(SO_DATA.test(data) ? `${data}T00:00:00.000${OFFSET}` : data);
}

/** Fim do dia (23:59:59.999 em Brasília) para "YYYY-MM-DD"; outros formatos são lidos como estão */
export function fimDoDia(data: string): Date {
  return new Date(SO_DATA.test(data) ? `${data}T23:59:59.999${OFFSET}` : data);
}

/** Mês (0-11) e ano de uma data no horário de Brasília */
export function mesAnoBrasilia(data: Date): { mes: number; ano: number } {
  const local = new Date(data.getTime() - OFFSET_MS);
  return { mes: local.getUTCMonth(), ano: local.getUTCFullYear() };
}
