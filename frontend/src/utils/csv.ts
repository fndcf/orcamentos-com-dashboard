/**
 * Utilitários para geração de CSV seguro para Excel/LibreOffice
 */

// Valores iniciados por estes caracteres são interpretados como fórmula pelas planilhas
const INICIO_DE_FORMULA = /^[=+\-@\t\r]/;

// Números simples (inclusive negativos, com vírgula ou ponto decimal) continuam numéricos
const NUMERO = /^-?\d+([.,]\d+)?$/;

/**
 * Formata um valor como célula de CSV: sempre entre aspas, com aspas internas duplicadas
 * e prefixo ' em textos que seriam interpretados como fórmula (CSV injection).
 */
export function csvCell(valor: unknown): string {
  let texto = String(valor ?? "");

  if (INICIO_DE_FORMULA.test(texto) && !NUMERO.test(texto)) {
    texto = "'" + texto;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

/**
 * Monta o conteúdo CSV a partir de linhas (a primeira normalmente é o cabeçalho)
 */
export function gerarCSV(linhas: unknown[][], separador = ";"): string {
  return linhas.map((linha) => linha.map(csvCell).join(separador)).join("\n");
}
