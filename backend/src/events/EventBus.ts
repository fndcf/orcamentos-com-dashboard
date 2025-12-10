/**
 * EventBus - Sistema de eventos para comunicação desacoplada entre serviços
 *
 * Este padrão resolve a dependência circular entre orcamentoService e notificacaoService:
 * - orcamentoService emite eventos quando o status muda
 * - notificacaoService escuta esses eventos e reage
 */

import { logger } from '../utils/logger';

type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

interface EventMap {
  "orcamento:status:changed": OrcamentoStatusChangedEvent;
  "orcamento:created": OrcamentoCreatedEvent;
  "orcamento:deleted": OrcamentoDeletedEvent;
}

export interface OrcamentoStatusChangedEvent {
  orcamentoId: string;
  statusAnterior: string;
  statusNovo: string;
}

export interface OrcamentoCreatedEvent {
  orcamentoId: string;
  clienteId: string;
  tipo: string;
}

export interface OrcamentoDeletedEvent {
  orcamentoId: string;
}

class EventBusImpl {
  private handlers: Map<string, Set<EventHandler<unknown>>> = new Map();

  /**
   * Registra um handler para um evento específico
   */
  on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);

    // Retorna função para remover o handler (útil para cleanup)
    return () => {
      this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
    };
  }

  /**
   * Emite um evento para todos os handlers registrados
   * Não bloqueia se um handler falhar
   */
  async emit<K extends keyof EventMap>(
    event: K,
    payload: EventMap[K]
  ): Promise<void> {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers || eventHandlers.size === 0) {
      return;
    }

    const promises = Array.from(eventHandlers).map(async (handler) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`[EventBus] Error in handler for event "${event}"`, { error });
        // Não propaga o erro - outros handlers devem continuar executando
      }
    });

    await Promise.all(promises);
  }

  /**
   * Remove todos os handlers de um evento específico
   */
  off<K extends keyof EventMap>(event: K): void {
    this.handlers.delete(event);
  }

  /**
   * Remove todos os handlers de todos os eventos
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const eventBus = new EventBusImpl();

// Eventos disponíveis para fácil referência
export const OrcamentoEvents = {
  STATUS_CHANGED: "orcamento:status:changed" as const,
  CREATED: "orcamento:created" as const,
  DELETED: "orcamento:deleted" as const,
};
