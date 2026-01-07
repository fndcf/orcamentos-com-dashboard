import { notificacaoRepository } from "../repositories/notificacaoRepository";
import { orcamentoRepository } from "../repositories/orcamentoRepository";
import { palavraChaveRepository } from "../repositories/palavraChaveRepository";
import { Notificacao, Orcamento, PaginatedResponse } from "../models";
import { NotFoundError } from "../utils/errors";
import {
  eventBus,
  OrcamentoEvents,
  OrcamentoStatusChangedEvent,
} from "../events";
import { logger } from "../utils/logger";

export const notificacaoService = {
  // ========== MÉTODOS PAGINADOS ==========

  async listarTodasPaginado(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    return notificacaoRepository.findAllPaginated(pageSize, cursor);
  },

  async listarNaoLidasPaginado(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    return notificacaoRepository.findNaoLidasPaginated(pageSize, cursor);
  },

  async listarVencidasPaginado(pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    return notificacaoRepository.findVencidasPaginated(pageSize, cursor);
  },

  async listarAtivasPaginado(diasAntecedencia: number = 60, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    return notificacaoRepository.findAtivasPaginated(diasAntecedencia, pageSize, cursor);
  },

  async listarProximasPaginado(dias: number = 30, pageSize: number = 10, cursor?: string): Promise<PaginatedResponse<Notificacao>> {
    return notificacaoRepository.findProximasPaginated(dias, pageSize, cursor);
  },

  async buscarPorId(id: string): Promise<Notificacao> {
    const notificacao = await notificacaoRepository.findById(id);
    if (!notificacao) {
      throw new NotFoundError("Notificação não encontrada");
    }
    return notificacao;
  },

  async marcarComoLida(id: string): Promise<Notificacao> {
    const notificacao = await notificacaoRepository.marcarComoLida(id);
    if (!notificacao) {
      throw new NotFoundError("Notificação não encontrada");
    }
    return notificacao;
  },

  async marcarTodasComoLidas(): Promise<number> {
    return notificacaoRepository.marcarTodasComoLidas();
  },

  async excluir(id: string): Promise<void> {
    const deleted = await notificacaoRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Notificação não encontrada");
    }
  },

  /**
   * Gera notificações para um orçamento específico baseado nas palavras-chave
   * Só processa orçamentos com status "aceito"
   */
  async gerarNotificacoesParaOrcamento(
    orcamentoId: string
  ): Promise<Notificacao[]> {
    const orcamento = await orcamentoRepository.findById(orcamentoId);

    // Só gera notificações para orçamentos aceitos
    if (orcamento.status !== "aceito") {
      return [];
    }

    return this.processarOrcamento(orcamento);
  },

  /**
   * Processa um orçamento e cria notificações baseadas nas palavras-chave encontradas
   */
  async processarOrcamento(orcamento: Orcamento): Promise<Notificacao[]> {
    const palavrasChaveAtivas = await palavraChaveRepository.findAtivas();

    if (palavrasChaveAtivas.length === 0) {
      return [];
    }

    const notificacoesParaCriar: Omit<Notificacao, "id" | "createdAt">[] = [];
    const dataBase =
      orcamento.dataAceite || orcamento.dataEmissao || new Date();

    // Buscar itens do orçamento completo
    const itensDescricoes: string[] = [];

    if (orcamento.itensCompleto && orcamento.itensCompleto.length > 0) {
      orcamento.itensCompleto.forEach((item) => {
        if (item.descricao) {
          itensDescricoes.push(item.descricao);
        }
      });
    }

    // Para cada item, verificar se contém alguma palavra-chave
    for (const descricao of itensDescricoes) {
      const descricaoLower = descricao.toLowerCase();

      for (const palavraChave of palavrasChaveAtivas) {
        // Verifica se a descrição contém a palavra-chave
        if (descricaoLower.includes(palavraChave.palavra.toLowerCase())) {
          // Verifica se já existe notificação para este orçamento/item/palavra
          const existe = await notificacaoRepository.exists(
            orcamento.id!,
            descricao,
            palavraChave.palavra
          );

          if (!existe) {
            // Calcular data de vencimento baseado no prazo da palavra-chave
            const dataVencimento = new Date(dataBase);
            dataVencimento.setDate(
              dataVencimento.getDate() + palavraChave.prazoDias
            );

            notificacoesParaCriar.push({
              orcamentoId: orcamento.id!,
              orcamentoNumero: orcamento.numero,
              orcamentoDataEmissao: orcamento.dataEmissao,
              clienteId: orcamento.clienteId,
              clienteNome: orcamento.clienteNome,
              itemDescricao: descricao,
              palavraChave: palavraChave.palavra,
              dataVencimento,
              lida: false,
            });
          }
        }
      }
    }

    if (notificacoesParaCriar.length === 0) {
      return [];
    }

    // Criar todas as notificações em batch
    return notificacaoRepository.createMany(notificacoesParaCriar);
  },

  /**
   * Processa todos os orçamentos aceitos e gera notificações
   * Útil para rodar em batch ou na inicialização
   */
  async processarTodosOrcamentosAceitos(): Promise<{
    processados: number;
    notificacoesCriadas: number;
  }> {
    const orcamentosAceitos = await orcamentoRepository.findByStatus("aceito");

    let notificacoesCriadas = 0;

    for (const orcamento of orcamentosAceitos) {
      const notificacoes = await this.processarOrcamento(orcamento);
      notificacoesCriadas += notificacoes.length;
    }

    return {
      processados: orcamentosAceitos.length,
      notificacoesCriadas,
    };
  },

  /**
   * Remove todas as notificações de um orçamento específico
   * Útil quando um orçamento deixa de ser "aceito"
   */
  async removerNotificacoesDoOrcamento(orcamentoId: string): Promise<number> {
    return notificacaoRepository.deleteByOrcamentoId(orcamentoId);
  },

  /**
   * Conta notificações não lidas
   */
  async contarNaoLidas(): Promise<number> {
    const naoLidas = await notificacaoRepository.findNaoLidas();
    return naoLidas.length;
  },

  /**
   * Retorna resumo das notificações (para dashboard/header)
   */
  async obterResumo(): Promise<{
    total: number;
    naoLidas: number;
    vencidas: number;
    proximasVencer: number;
    ativas: number;
  }> {
    const [todas, naoLidas, vencidas, proximas, ativas] = await Promise.all([
      notificacaoRepository.findAll(),
      notificacaoRepository.findNaoLidas(),
      notificacaoRepository.findVencidas(),
      notificacaoRepository.findProximas(30),
      notificacaoRepository.findAtivas(10),
    ]);

    return {
      total: todas.length,
      naoLidas: naoLidas.length,
      vencidas: vencidas.length,
      proximasVencer: proximas.length,
      ativas: ativas.length,
    };
  },

};

/**
 * Registra handlers de eventos para o notificacaoService
 * Isso permite que o serviço reaja a eventos do orcamentoService
 * sem criar dependência circular
 */
export function inicializarEventHandlers(): void {
  eventBus.on(
    OrcamentoEvents.STATUS_CHANGED,
    async (event: OrcamentoStatusChangedEvent) => {
      try {
        const { orcamentoId, statusAnterior, statusNovo } = event;

        if (statusNovo === "aceito" && statusAnterior !== "aceito") {
          // Gerar notificações quando orçamento é aceito
          await notificacaoService.gerarNotificacoesParaOrcamento(orcamentoId);
        } else if (statusAnterior === "aceito" && statusNovo !== "aceito") {
          // Remover notificações quando orçamento deixa de ser aceito
          await notificacaoService.removerNotificacoesDoOrcamento(orcamentoId);
        }
      } catch (error) {
        logger.error(
          "[NotificacaoService] Erro ao processar evento de mudança de status:",
          { error }
        );
        // Não propaga o erro - EventBus já trata isso
      }
    }
  );
}
