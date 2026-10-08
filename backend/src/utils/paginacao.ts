// Teto de itens por página: evita que um único pedido leia a coleção inteira do Firestore
export const MAX_ITENS_POR_PAGINA = 100;

/**
 * Converte o parâmetro de query em tamanho de página entre 1 e MAX_ITENS_POR_PAGINA.
 * Valores ausentes, inválidos ou menores que 1 usam o padrão.
 */
export function tamanhoPagina(valor: unknown, padrao: number): number {
  const n = parseInt(String(valor), 10);
  if (!Number.isFinite(n) || n < 1) {
    return padrao;
  }
  return Math.min(n, MAX_ITENS_POR_PAGINA);
}

/** Converte o parâmetro de query em número de página (mínimo 1). */
export function numeroPagina(valor: unknown): number {
  const n = parseInt(String(valor), 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
