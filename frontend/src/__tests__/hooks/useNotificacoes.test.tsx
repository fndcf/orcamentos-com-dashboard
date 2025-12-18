import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useNotificacaoResumo,
  useMarcarNotificacaoComoLida,
  useMarcarTodasNotificacoesComoLidas,
  useExcluirNotificacao,
  useGerarNotificacoesOrcamento,
  useProcessarTodasNotificacoes,
  useNotificacoesPaginadas,
  useNotificacoesNaoLidasPaginadas,
  useNotificacoesVencidasPaginadas,
  useNotificacoesAtivasPaginadas,
  useNotificacoesProximasPaginadas,
} from '../../hooks/useNotificacoes';
import { notificacaoService } from '../../services/notificacaoService';
import { Notificacao, PaginatedResponse } from '../../types';

// Mock do service
vi.mock('../../services/notificacaoService', () => ({
  notificacaoService: {
    obterResumo: vi.fn(),
    marcarComoLida: vi.fn(),
    marcarTodasComoLidas: vi.fn(),
    excluir: vi.fn(),
    gerarParaOrcamento: vi.fn(),
    processarTodos: vi.fn(),
    listarPaginado: vi.fn(),
    listarNaoLidasPaginado: vi.fn(),
    listarVencidasPaginado: vi.fn(),
    listarAtivasPaginado: vi.fn(),
    listarProximasPaginado: vi.fn(),
  },
}));


const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    orcamentoId: 'orc-1',
    orcamentoNumero: 1001,
    clienteId: 'cli-1',
    clienteNome: 'Cliente Teste',
    itemDescricao: 'Extintor ABC',
    palavraChave: 'VALIDADE',
    dataVencimento: new Date('2025-01-15'),
    lida: false,
    createdAt: new Date(),
  },
  {
    id: '2',
    orcamentoId: 'orc-2',
    orcamentoNumero: 1002,
    clienteId: 'cli-2',
    clienteNome: 'Outro Cliente',
    itemDescricao: 'Hidrante',
    palavraChave: 'MANUTENCAO',
    dataVencimento: new Date('2025-02-20'),
    lida: true,
    createdAt: new Date(),
  },
];

const mockResumo = {
  total: 10,
  naoLidas: 5,
  vencidas: 2,
  proximasVencer: 3,
  ativas: 4,
};

describe('useNotificacoes hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useNotificacaoResumo', () => {
    it('deve retornar resumo de notificações', async () => {
      vi.mocked(notificacaoService.obterResumo).mockResolvedValue(mockResumo);

      const { result } = renderHook(() => useNotificacaoResumo(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResumo);
      expect(notificacaoService.obterResumo).toHaveBeenCalled();
    });
  });

  describe('useMarcarNotificacaoComoLida', () => {
    it('deve marcar notificação como lida', async () => {
      const notificacaoLida = { ...mockNotificacoes[0], lida: true };
      vi.mocked(notificacaoService.marcarComoLida).mockResolvedValue(notificacaoLida);

      const { result } = renderHook(() => useMarcarNotificacaoComoLida(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificacaoService.marcarComoLida).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao marcar como lida');
      vi.mocked(notificacaoService.marcarComoLida).mockRejectedValue(error);

      const { result } = renderHook(() => useMarcarNotificacaoComoLida(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao marcar como lida');
    });
  });

  describe('useMarcarTodasNotificacoesComoLidas', () => {
    it('deve marcar todas notificações como lidas', async () => {
      vi.mocked(notificacaoService.marcarTodasComoLidas).mockResolvedValue({ atualizadas: 5 });

      const { result } = renderHook(() => useMarcarTodasNotificacoesComoLidas(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificacaoService.marcarTodasComoLidas).toHaveBeenCalled();
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao marcar todas como lidas');
      vi.mocked(notificacaoService.marcarTodasComoLidas).mockRejectedValue(error);

      const { result } = renderHook(() => useMarcarTodasNotificacoesComoLidas(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync()).rejects.toThrow('Erro ao marcar todas como lidas');
    });
  });

  describe('useExcluirNotificacao', () => {
    it('deve excluir notificação', async () => {
      vi.mocked(notificacaoService.excluir).mockResolvedValue(undefined);

      const { result } = renderHook(() => useExcluirNotificacao(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificacaoService.excluir).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao excluir');
      vi.mocked(notificacaoService.excluir).mockRejectedValue(error);

      const { result } = renderHook(() => useExcluirNotificacao(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao excluir');
    });
  });

  describe('useGerarNotificacoesOrcamento', () => {
    it('deve gerar notificações para orçamento', async () => {
      vi.mocked(notificacaoService.gerarParaOrcamento).mockResolvedValue(mockNotificacoes);

      const { result } = renderHook(() => useGerarNotificacoesOrcamento(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('orc-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificacaoService.gerarParaOrcamento).toHaveBeenCalledWith('orc-1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao gerar notificações');
      vi.mocked(notificacaoService.gerarParaOrcamento).mockRejectedValue(error);

      const { result } = renderHook(() => useGerarNotificacoesOrcamento(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('orc-1')).rejects.toThrow('Erro ao gerar notificações');
    });
  });

  describe('useProcessarTodasNotificacoes', () => {
    it('deve processar todas notificações', async () => {
      vi.mocked(notificacaoService.processarTodos).mockResolvedValue({
        processados: 10,
        notificacoesCriadas: 3,
      });

      const { result } = renderHook(() => useProcessarTodasNotificacoes(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificacaoService.processarTodos).toHaveBeenCalled();
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao processar notificações');
      vi.mocked(notificacaoService.processarTodos).mockRejectedValue(error);

      const { result } = renderHook(() => useProcessarTodasNotificacoes(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync()).rejects.toThrow('Erro ao processar notificações');
    });
  });

  // ========== TESTES PARA HOOKS PAGINADOS ==========

  describe('useNotificacoesPaginadas', () => {
    const mockPaginatedResponse: PaginatedResponse<Notificacao> = {
      items: mockNotificacoes,
      total: 10,
      hasMore: true,
      cursor: 'next-cursor',
    };

    it('deve retornar primeira página de notificações', async () => {
      vi.mocked(notificacaoService.listarPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockPaginatedResponse);
      expect(notificacaoService.listarPaginado).toHaveBeenCalledWith(10, undefined);
    });

    it('deve usar pageSize customizado', async () => {
      vi.mocked(notificacaoService.listarPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesPaginadas(20), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificacaoService.listarPaginado).toHaveBeenCalledWith(20, undefined);
    });

    it('deve indicar que há mais páginas', async () => {
      vi.mocked(notificacaoService.listarPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasNextPage).toBe(true);
    });

    it('deve indicar quando não há mais páginas', async () => {
      const lastPageResponse: PaginatedResponse<Notificacao> = {
        items: mockNotificacoes,
        total: 2,
        hasMore: false,
        cursor: undefined,
      };
      vi.mocked(notificacaoService.listarPaginado).mockResolvedValue(lastPageResponse);

      const { result } = renderHook(() => useNotificacoesPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasNextPage).toBe(false);
    });
  });

  describe('useNotificacoesNaoLidasPaginadas', () => {
    const mockPaginatedResponse: PaginatedResponse<Notificacao> = {
      items: mockNotificacoes.filter(n => !n.lida),
      total: 5,
      hasMore: false,
      cursor: undefined,
    };

    it('deve retornar notificações não lidas paginadas', async () => {
      vi.mocked(notificacaoService.listarNaoLidasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesNaoLidasPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockPaginatedResponse);
      expect(notificacaoService.listarNaoLidasPaginado).toHaveBeenCalledWith(10, undefined);
    });

    it('deve usar pageSize customizado', async () => {
      vi.mocked(notificacaoService.listarNaoLidasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesNaoLidasPaginadas(15), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificacaoService.listarNaoLidasPaginado).toHaveBeenCalledWith(15, undefined);
    });
  });

  describe('useNotificacoesVencidasPaginadas', () => {
    const mockPaginatedResponse: PaginatedResponse<Notificacao> = {
      items: mockNotificacoes,
      total: 8,
      hasMore: true,
      cursor: 'vencidas-cursor',
    };

    it('deve retornar notificações vencidas paginadas', async () => {
      vi.mocked(notificacaoService.listarVencidasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesVencidasPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockPaginatedResponse);
      expect(notificacaoService.listarVencidasPaginado).toHaveBeenCalledWith(10, undefined);
    });

    it('deve usar pageSize customizado', async () => {
      vi.mocked(notificacaoService.listarVencidasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesVencidasPaginadas(25), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificacaoService.listarVencidasPaginado).toHaveBeenCalledWith(25, undefined);
    });
  });

  describe('useNotificacoesAtivasPaginadas', () => {
    const mockPaginatedResponse: PaginatedResponse<Notificacao> = {
      items: mockNotificacoes,
      total: 15,
      hasMore: true,
      cursor: 'ativas-cursor',
    };

    it('deve retornar notificações ativas paginadas com valores padrão', async () => {
      vi.mocked(notificacaoService.listarAtivasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesAtivasPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockPaginatedResponse);
      expect(notificacaoService.listarAtivasPaginado).toHaveBeenCalledWith(60, 10, undefined);
    });

    it('deve usar dias e pageSize customizados', async () => {
      vi.mocked(notificacaoService.listarAtivasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesAtivasPaginadas(30, 20), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificacaoService.listarAtivasPaginado).toHaveBeenCalledWith(30, 20, undefined);
    });

    it('deve indicar que há mais páginas', async () => {
      vi.mocked(notificacaoService.listarAtivasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesAtivasPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasNextPage).toBe(true);
    });
  });

  describe('useNotificacoesProximasPaginadas', () => {
    const mockPaginatedResponse: PaginatedResponse<Notificacao> = {
      items: mockNotificacoes,
      total: 22,
      hasMore: true,
      cursor: 'proximas-cursor',
    };

    it('deve retornar notificações próximas paginadas com valores padrão', async () => {
      vi.mocked(notificacaoService.listarProximasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesProximasPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockPaginatedResponse);
      expect(notificacaoService.listarProximasPaginado).toHaveBeenCalledWith(30, 10, undefined);
    });

    it('deve usar dias e pageSize customizados', async () => {
      vi.mocked(notificacaoService.listarProximasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesProximasPaginadas(15, 20), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificacaoService.listarProximasPaginado).toHaveBeenCalledWith(15, 20, undefined);
    });

    it('deve indicar que há mais páginas', async () => {
      vi.mocked(notificacaoService.listarProximasPaginado).mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useNotificacoesProximasPaginadas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.hasNextPage).toBe(true);
    });
  });
});
