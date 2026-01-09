import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode } from 'react';
import {
  useOrcamentos,
  useOrcamento,
  useOrcamentosPorCliente,
  useOrcamentosPorStatus,
  useOrcamentosPorPeriodo,
  useOrcamentosPaginados,
  useHistoricoCliente,
  useEstatisticasOrcamentos,
  useDashboardStats,
  useCriarOrcamento,
  useAtualizarOrcamento,
  useAtualizarStatusOrcamento,
  useExcluirOrcamento,
  useDuplicarOrcamento,
  useVerificarExpirados,
} from '../../hooks/useOrcamentos';
import { orcamentoService } from '../../services/orcamentoService';

// Mock do orcamentoService
vi.mock('../../services/orcamentoService', () => ({
  orcamentoService: {
    listar: vi.fn(),
    listarPaginado: vi.fn(),
    buscarPorId: vi.fn(),
    buscarPorCliente: vi.fn(),
    buscarPorStatus: vi.fn(),
    buscarPorPeriodo: vi.fn(),
    getHistoricoCliente: vi.fn(),
    getEstatisticas: vi.fn(),
    getDashboardStats: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    atualizarStatus: vi.fn(),
    excluir: vi.fn(),
    duplicar: vi.fn(),
    verificarExpirados: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOrcamentos hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useOrcamentos', () => {
    it('deve retornar lista de orçamentos', async () => {
      const mockOrcamentos = [
        { id: '1', numero: 1 },
        { id: '2', numero: 2 },
      ];
      vi.mocked(orcamentoService.listar).mockResolvedValue(mockOrcamentos as any);

      const { result } = renderHook(() => useOrcamentos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOrcamentos);
      expect(orcamentoService.listar).toHaveBeenCalled();
    });
  });

  describe('useOrcamento', () => {
    it('deve retornar orçamento por ID', async () => {
      const mockOrcamento = { id: '1', numero: 1 };
      vi.mocked(orcamentoService.buscarPorId).mockResolvedValue(mockOrcamento as any);

      const { result } = renderHook(() => useOrcamento('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOrcamento);
      expect(orcamentoService.buscarPorId).toHaveBeenCalledWith('1');
    });

    it('não deve buscar quando ID está vazio', () => {
      const { result } = renderHook(() => useOrcamento(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(orcamentoService.buscarPorId).not.toHaveBeenCalled();
    });
  });

  describe('useOrcamentosPorCliente', () => {
    it('deve retornar orçamentos por cliente', async () => {
      const mockOrcamentos = [{ id: '1', clienteId: 'c1' }];
      vi.mocked(orcamentoService.buscarPorCliente).mockResolvedValue(mockOrcamentos as any);

      const { result } = renderHook(() => useOrcamentosPorCliente('c1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOrcamentos);
      expect(orcamentoService.buscarPorCliente).toHaveBeenCalledWith('c1');
    });

    it('não deve buscar quando clienteId está vazio', () => {
      const { result } = renderHook(() => useOrcamentosPorCliente(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(orcamentoService.buscarPorCliente).not.toHaveBeenCalled();
    });
  });

  describe('useHistoricoCliente', () => {
    it('deve retornar histórico do cliente com resumo agregado', async () => {
      const mockHistorico = {
        orcamentos: [
          { id: '1', numero: 5, clienteId: 'c1', status: 'aceito', valorTotal: 1000 },
          { id: '2', numero: 4, clienteId: 'c1', status: 'aberto', valorTotal: 500 },
        ],
        resumo: {
          total: 10,
          aceitos: 5,
          valorTotalAceitos: 15000,
        },
      };
      vi.mocked(orcamentoService.getHistoricoCliente).mockResolvedValue(mockHistorico as any);

      const { result } = renderHook(() => useHistoricoCliente('c1', 5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHistorico);
      expect(orcamentoService.getHistoricoCliente).toHaveBeenCalledWith('c1', 5);
    });

    it('deve usar limite padrão de 5 quando não especificado', async () => {
      const mockHistorico = {
        orcamentos: [],
        resumo: { total: 0, aceitos: 0, valorTotalAceitos: 0 },
      };
      vi.mocked(orcamentoService.getHistoricoCliente).mockResolvedValue(mockHistorico as any);

      const { result } = renderHook(() => useHistoricoCliente('c1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orcamentoService.getHistoricoCliente).toHaveBeenCalledWith('c1', 5);
    });

    it('não deve buscar quando clienteId está vazio', () => {
      const { result } = renderHook(() => useHistoricoCliente(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(orcamentoService.getHistoricoCliente).not.toHaveBeenCalled();
    });

    it('deve retornar resumo correto mesmo com poucos orçamentos retornados', async () => {
      const mockHistorico = {
        orcamentos: [
          { id: '1', numero: 100, clienteId: 'c1', status: 'aceito', valorTotal: 5000 },
        ],
        resumo: {
          total: 200,
          aceitos: 150,
          valorTotalAceitos: 500000,
        },
      };
      vi.mocked(orcamentoService.getHistoricoCliente).mockResolvedValue(mockHistorico as any);

      const { result } = renderHook(() => useHistoricoCliente('c1', 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.orcamentos).toHaveLength(1);
      expect(result.current.data?.resumo.total).toBe(200);
      expect(result.current.data?.resumo.aceitos).toBe(150);
    });
  });

  describe('useOrcamentosPorStatus', () => {
    it('deve retornar orçamentos por status', async () => {
      const mockOrcamentos = [{ id: '1', status: 'aberto' }];
      vi.mocked(orcamentoService.buscarPorStatus).mockResolvedValue(mockOrcamentos as any);

      const { result } = renderHook(() => useOrcamentosPorStatus('aberto'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOrcamentos);
      expect(orcamentoService.buscarPorStatus).toHaveBeenCalledWith('aberto');
    });
  });

  describe('useOrcamentosPorPeriodo', () => {
    it('deve retornar orçamentos por período', async () => {
      const mockOrcamentos = [
        { id: '1', numero: 1, dataEmissao: '2024-01-15' },
        { id: '2', numero: 2, dataEmissao: '2024-01-20' },
      ];
      vi.mocked(orcamentoService.buscarPorPeriodo).mockResolvedValue(mockOrcamentos as any);

      const { result } = renderHook(() => useOrcamentosPorPeriodo('2024-01-01', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockOrcamentos);
      expect(orcamentoService.buscarPorPeriodo).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });

    it('não deve buscar quando dataInicio está vazia', () => {
      const { result } = renderHook(() => useOrcamentosPorPeriodo('', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(orcamentoService.buscarPorPeriodo).not.toHaveBeenCalled();
    });

    it('não deve buscar quando dataFim está vazia', () => {
      const { result } = renderHook(() => useOrcamentosPorPeriodo('2024-01-01', ''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(orcamentoService.buscarPorPeriodo).not.toHaveBeenCalled();
    });
  });

  describe('useOrcamentosPaginados', () => {
    it('deve retornar orçamentos paginados', async () => {
      const mockResponse = {
        items: [{ id: '1', numero: 1 }],
        total: 50,
        page: 1,
        totalPages: 5,
        hasMore: true,
      };
      vi.mocked(orcamentoService.listarPaginado).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useOrcamentosPaginados(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(orcamentoService.listarPaginado).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('deve retornar orçamentos paginados com filtros', async () => {
      const mockResponse = {
        items: [{ id: '1', numero: 1, status: 'aceito' }],
        total: 10,
        page: 2,
        totalPages: 2,
        hasMore: false,
      };
      vi.mocked(orcamentoService.listarPaginado).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useOrcamentosPaginados(2, 20, { status: 'aceito', busca: 'teste' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(orcamentoService.listarPaginado).toHaveBeenCalledWith(2, 20, { status: 'aceito', busca: 'teste' });
    });
  });

  describe('useDashboardStats', () => {
    it('deve retornar estatísticas do dashboard', async () => {
      const mockStats = {
        totalOrcamentos: 150,
        orcamentosAbertos: 30,
        orcamentosAceitos: 80,
        orcamentosRecusados: 25,
        orcamentosExpirados: 15,
        valorTotalAceitos: 500000,
        ticketMedio: 6250,
        taxaConversao: 53.33,
      };
      vi.mocked(orcamentoService.getDashboardStats).mockResolvedValue(mockStats as any);

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockStats);
      expect(orcamentoService.getDashboardStats).toHaveBeenCalled();
    });
  });

  describe('useEstatisticasOrcamentos', () => {
    it('deve retornar estatísticas dos orçamentos', async () => {
      const mockEstatisticas = {
        total: 100,
        abertos: 30,
        aceitos: 50,
        recusados: 15,
        expirados: 5,
        valorTotalAceitos: 150000,
      };
      vi.mocked(orcamentoService.getEstatisticas).mockResolvedValue(mockEstatisticas);

      const { result } = renderHook(() => useEstatisticasOrcamentos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockEstatisticas);
      expect(orcamentoService.getEstatisticas).toHaveBeenCalled();
    });
  });

  describe('useCriarOrcamento', () => {
    it('deve criar orçamento e invalidar queries', async () => {
      const novoOrcamento = { clienteId: 'c1', itens: [] };
      const orcamentoCriado = { id: '1', numero: 1, ...novoOrcamento };
      vi.mocked(orcamentoService.criar).mockResolvedValue(orcamentoCriado as any);

      const { result } = renderHook(() => useCriarOrcamento(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(novoOrcamento as any);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orcamentoService.criar).toHaveBeenCalledWith(novoOrcamento);
    });
  });

  describe('useAtualizarOrcamento', () => {
    it('deve atualizar orçamento e invalidar queries', async () => {
      const dadosAtualizados = { observacoes: 'Nova obs' };
      vi.mocked(orcamentoService.atualizar).mockResolvedValue({ id: '1', ...dadosAtualizados } as any);

      const { result } = renderHook(() => useAtualizarOrcamento(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', data: dadosAtualizados });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orcamentoService.atualizar).toHaveBeenCalledWith('1', dadosAtualizados);
    });
  });

  describe('useAtualizarStatusOrcamento', () => {
    it('deve atualizar status e invalidar queries', async () => {
      vi.mocked(orcamentoService.atualizarStatus).mockResolvedValue({ id: '1', status: 'aceito' } as any);

      const { result } = renderHook(() => useAtualizarStatusOrcamento(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', status: 'aceito' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orcamentoService.atualizarStatus).toHaveBeenCalledWith('1', 'aceito');
    });
  });

  describe('useExcluirOrcamento', () => {
    it('deve excluir orçamento e invalidar queries', async () => {
      vi.mocked(orcamentoService.excluir).mockResolvedValue();

      const { result } = renderHook(() => useExcluirOrcamento(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orcamentoService.excluir).toHaveBeenCalledWith('1');
    });
  });

  describe('useDuplicarOrcamento', () => {
    it('deve duplicar orçamento e invalidar queries', async () => {
      const orcamentoDuplicado = { id: '2', numero: 2 };
      vi.mocked(orcamentoService.duplicar).mockResolvedValue(orcamentoDuplicado as any);

      const { result } = renderHook(() => useDuplicarOrcamento(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orcamentoService.duplicar).toHaveBeenCalledWith('1');
    });
  });

  describe('useVerificarExpirados', () => {
    it('deve verificar expirados e invalidar queries', async () => {
      vi.mocked(orcamentoService.verificarExpirados).mockResolvedValue(5);

      const { result } = renderHook(() => useVerificarExpirados(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(orcamentoService.verificarExpirados).toHaveBeenCalled();
    });
  });
});
