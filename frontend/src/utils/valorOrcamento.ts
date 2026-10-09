import { Orcamento } from "../types";

type DadosValor = Pick<Orcamento, "valorTotal" | "condicaoPagamento" | "descontoAVista">;

/**
 * Desconto em R$ do orçamento. Só vale para à vista e parcelado (no parcelado, o desconto
 * se aplica a todo o parcelamento). Juros de parcelas não entram.
 * Mesma regra de backend/src/utils/valorOrcamento.ts.
 */
export function descontoOrcamento(orcamento: DadosValor): number {
  const { condicaoPagamento, descontoAVista } = orcamento;
  if (condicaoPagamento !== "a_vista" && condicaoPagamento !== "parcelado") return 0;
  const desconto = descontoAVista?.valorDesconto ?? 0;
  return Math.min(Math.max(desconto, 0), orcamento.valorTotal || 0);
}

/** Valor que o cliente paga: total menos o desconto (é o valor exibido em listas e relatórios) */
export function valorFinalOrcamento(orcamento: DadosValor): number {
  return (orcamento.valorTotal || 0) - descontoOrcamento(orcamento);
}
