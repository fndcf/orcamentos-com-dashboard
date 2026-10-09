/**
 * Data "YYYY-MM-DD" no horário local (do navegador). Diferente de toISOString(), que usa UTC
 * e, no Brasil, já vira o dia seguinte a partir das 21h.
 */
export function dataLocalISO(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

/** "YYYY-MM-DD" → "DD/MM", sem passar por Date (que leria a data como UTC) */
export function diaMes(dataISO: string): string {
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
}
