import { eventBus, OrcamentoEvents, OrcamentoStatusChangedEvent, OrcamentoCreatedEvent, OrcamentoDeletedEvent } from '../../events';

describe('EventBus', () => {
  beforeEach(() => {
    // Limpa todos os handlers antes de cada teste
    eventBus.clear();
  });

  describe('on', () => {
    it('deve registrar um handler para um evento', async () => {
      const handler = jest.fn();
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler);

      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event);

      expect(handler).toHaveBeenCalledWith(event);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('deve registrar múltiplos handlers para o mesmo evento', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler1);
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler2);

      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event);

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it('deve retornar função para remover o handler', async () => {
      const handler = jest.fn();
      const unsubscribe = eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler);

      // Remove o handler
      unsubscribe();

      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('deve emitir evento para todos os handlers registrados', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler1);
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler2);
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler3);

      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
      expect(handler3).toHaveBeenCalledTimes(1);
    });

    it('deve não falhar quando não há handlers registrados', async () => {
      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await expect(eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event)).resolves.not.toThrow();
    });

    it('deve continuar executando outros handlers mesmo se um falhar', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn().mockRejectedValue(new Error('Handler error'));
      const handler3 = jest.fn();

      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler1);
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler2);
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler3);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event);

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
      // O logger formata a mensagem com timestamp e nível
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[EventBus] Error in handler for event')
      );

      consoleErrorSpy.mockRestore();
    });

    it('deve suportar handlers assíncronos', async () => {
      const results: number[] = [];

      const handler1 = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        results.push(1);
      });

      const handler2 = jest.fn(async () => {
        results.push(2);
      });

      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler1);
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler2);

      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event);

      expect(results).toContain(1);
      expect(results).toContain(2);
    });
  });

  describe('off', () => {
    it('deve remover todos os handlers de um evento específico', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler1);
      eventBus.on(OrcamentoEvents.STATUS_CHANGED, handler2);

      eventBus.off(OrcamentoEvents.STATUS_CHANGED);

      const event: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, event);

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('deve não afetar handlers de outros eventos', async () => {
      const statusHandler = jest.fn();
      const createdHandler = jest.fn();

      eventBus.on(OrcamentoEvents.STATUS_CHANGED, statusHandler);
      eventBus.on(OrcamentoEvents.CREATED, createdHandler);

      eventBus.off(OrcamentoEvents.STATUS_CHANGED);

      const createdEvent: OrcamentoCreatedEvent = {
        orcamentoId: '123',
        clienteId: 'cli1',
        tipo: 'simples',
      };

      await eventBus.emit(OrcamentoEvents.CREATED, createdEvent);

      expect(createdHandler).toHaveBeenCalledWith(createdEvent);
    });
  });

  describe('clear', () => {
    it('deve remover todos os handlers de todos os eventos', async () => {
      const statusHandler = jest.fn();
      const createdHandler = jest.fn();
      const deletedHandler = jest.fn();

      eventBus.on(OrcamentoEvents.STATUS_CHANGED, statusHandler);
      eventBus.on(OrcamentoEvents.CREATED, createdHandler);
      eventBus.on(OrcamentoEvents.DELETED, deletedHandler);

      eventBus.clear();

      const statusEvent: OrcamentoStatusChangedEvent = {
        orcamentoId: '123',
        statusAnterior: 'pendente',
        statusNovo: 'aceito',
      };

      const createdEvent: OrcamentoCreatedEvent = {
        orcamentoId: '123',
        clienteId: 'cli1',
        tipo: 'simples',
      };

      const deletedEvent: OrcamentoDeletedEvent = {
        orcamentoId: '123',
      };

      await eventBus.emit(OrcamentoEvents.STATUS_CHANGED, statusEvent);
      await eventBus.emit(OrcamentoEvents.CREATED, createdEvent);
      await eventBus.emit(OrcamentoEvents.DELETED, deletedEvent);

      expect(statusHandler).not.toHaveBeenCalled();
      expect(createdHandler).not.toHaveBeenCalled();
      expect(deletedHandler).not.toHaveBeenCalled();
    });
  });

  describe('OrcamentoEvents', () => {
    it('deve ter os eventos corretos definidos', () => {
      expect(OrcamentoEvents.STATUS_CHANGED).toBe('orcamento:status:changed');
      expect(OrcamentoEvents.CREATED).toBe('orcamento:created');
      expect(OrcamentoEvents.DELETED).toBe('orcamento:deleted');
    });
  });

  describe('diferentes tipos de eventos', () => {
    it('deve emitir evento CREATED corretamente', async () => {
      const handler = jest.fn();
      eventBus.on(OrcamentoEvents.CREATED, handler);

      const event: OrcamentoCreatedEvent = {
        orcamentoId: '123',
        clienteId: 'cli1',
        tipo: 'completo',
      };

      await eventBus.emit(OrcamentoEvents.CREATED, event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it('deve emitir evento DELETED corretamente', async () => {
      const handler = jest.fn();
      eventBus.on(OrcamentoEvents.DELETED, handler);

      const event: OrcamentoDeletedEvent = {
        orcamentoId: '456',
      };

      await eventBus.emit(OrcamentoEvents.DELETED, event);

      expect(handler).toHaveBeenCalledWith(event);
    });
  });
});
