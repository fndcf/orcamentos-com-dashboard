import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificacaoService } from '../../services/notificacaoService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockNotificacao = {
  id: '1',
  orcamentoId: 'orc-1',
  orcamentoNumero: 1001,
  clienteId: 'cli-1',
  clienteNome: 'Cliente Teste',
  itemDescricao: 'Extintor ABC 6kg',
  palavraChave: 'VALIDADE',
  dataVencimento: new Date(),
  lida: false,
  createdAt: new Date(),
};

const mockResumo = {
  total: 10,
  naoLidas: 5,
  vencidas: 2,
  proximasVencer: 3,
};

describe('notificacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obterResumo', () => {
    it('deve obter resumo de notificações', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockResumo });

      const result = await notificacaoService.obterResumo();

      expect(api.get).toHaveBeenCalledWith('/notificacoes/resumo');
      expect(result).toEqual(mockResumo);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar notificação por id', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockNotificacao });

      const result = await notificacaoService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/notificacoes/1');
      expect(result).toEqual(mockNotificacao);
    });
  });

  describe('marcarComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      const notificacaoLida = { ...mockNotificacao, lida: true };
      vi.mocked(api.patch).mockResolvedValue({ data: notificacaoLida });

      const result = await notificacaoService.marcarComoLida('1');

      expect(api.patch).toHaveBeenCalledWith('/notificacoes/1/lida');
      expect(result).toEqual(notificacaoLida);
    });
  });

  describe('marcarTodasComoLidas', () => {
    it('deve marcar todas notificações como lidas', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: { atualizadas: 5 } });

      const result = await notificacaoService.marcarTodasComoLidas();

      expect(api.patch).toHaveBeenCalledWith('/notificacoes/marcar-todas-lidas');
      expect(result).toEqual({ atualizadas: 5 });
    });
  });

  describe('excluir', () => {
    it('deve excluir notificação', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await notificacaoService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/notificacoes/1');
    });
  });

  describe('gerarParaOrcamento', () => {
    it('deve gerar notificações para orçamento', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: [mockNotificacao] });

      const result = await notificacaoService.gerarParaOrcamento('orc-1');

      expect(api.post).toHaveBeenCalledWith('/notificacoes/gerar/orc-1');
      expect(result).toEqual([mockNotificacao]);
    });
  });

  describe('processarTodos', () => {
    it('deve processar todas as notificações', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { processados: 10, notificacoesCriadas: 3 } });

      const result = await notificacaoService.processarTodos();

      expect(api.post).toHaveBeenCalledWith('/notificacoes/processar-todos');
      expect(result).toEqual({ processados: 10, notificacoesCriadas: 3 });
    });
  });

  // ========== TESTES PARA MÉTODOS PAGINADOS ==========

  describe('listarPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 10,
      hasMore: true,
      cursor: 'next-cursor',
    };

    it('deve listar notificações paginadas com valores padrão', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarPaginado();

      expect(api.get).toHaveBeenCalledWith('/notificacoes/paginado?pageSize=10');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações paginadas com pageSize customizado', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarPaginado(20);

      expect(api.get).toHaveBeenCalledWith('/notificacoes/paginado?pageSize=20');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações paginadas com cursor', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarPaginado(10, 'cursor-abc');

      expect(api.get).toHaveBeenCalledWith('/notificacoes/paginado?pageSize=10&cursor=cursor-abc');
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarNaoLidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 5,
      hasMore: false,
      cursor: undefined,
    };

    it('deve listar notificações não lidas paginadas com valores padrão', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarNaoLidasPaginado();

      expect(api.get).toHaveBeenCalledWith('/notificacoes/nao-lidas/paginado?pageSize=10');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações não lidas paginadas com cursor', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarNaoLidasPaginado(15, 'cursor-xyz');

      expect(api.get).toHaveBeenCalledWith('/notificacoes/nao-lidas/paginado?pageSize=15&cursor=cursor-xyz');
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarVencidasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 8,
      hasMore: true,
      cursor: 'vencidas-cursor',
    };

    it('deve listar notificações vencidas paginadas com valores padrão', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarVencidasPaginado();

      expect(api.get).toHaveBeenCalledWith('/notificacoes/vencidas/paginado?pageSize=10');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações vencidas paginadas com cursor', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarVencidasPaginado(25, 'vencidas-cursor');

      expect(api.get).toHaveBeenCalledWith('/notificacoes/vencidas/paginado?pageSize=25&cursor=vencidas-cursor');
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarAtivasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 15,
      hasMore: true,
      cursor: 'ativas-cursor',
    };

    it('deve listar notificações ativas paginadas com valores padrão', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarAtivasPaginado();

      expect(api.get).toHaveBeenCalledWith('/notificacoes/ativas/paginado?dias=60&pageSize=10');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações ativas paginadas com dias e pageSize customizados', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarAtivasPaginado(30, 20);

      expect(api.get).toHaveBeenCalledWith('/notificacoes/ativas/paginado?dias=30&pageSize=20');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações ativas paginadas com cursor', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarAtivasPaginado(60, 10, 'ativas-cursor');

      expect(api.get).toHaveBeenCalledWith('/notificacoes/ativas/paginado?dias=60&pageSize=10&cursor=ativas-cursor');
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('listarProximasPaginado', () => {
    const mockPaginatedResponse = {
      items: [mockNotificacao],
      total: 22,
      hasMore: true,
      cursor: 'proximas-cursor',
    };

    it('deve listar notificações próximas paginadas com valores padrão', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarProximasPaginado();

      expect(api.get).toHaveBeenCalledWith('/notificacoes/proximas/paginado?dias=30&pageSize=10');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações próximas paginadas com dias e pageSize customizados', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarProximasPaginado(15, 20);

      expect(api.get).toHaveBeenCalledWith('/notificacoes/proximas/paginado?dias=15&pageSize=20');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('deve listar notificações próximas paginadas com cursor', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPaginatedResponse });

      const result = await notificacaoService.listarProximasPaginado(30, 10, 'proximas-cursor');

      expect(api.get).toHaveBeenCalledWith('/notificacoes/proximas/paginado?dias=30&pageSize=10&cursor=proximas-cursor');
      expect(result).toEqual(mockPaginatedResponse);
    });
  });
});
