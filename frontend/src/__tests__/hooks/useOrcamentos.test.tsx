import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode } from 'react';
import {
  useOrcamentos,
  useOrcamento,
  useOrcamentosPorCliente,
  useOrcamentosPorStatus,
  useEstatisticasOrcamentos,
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
    buscarPorId: vi.fn(),
    buscarPorCliente: vi.fn(),
    buscarPorStatus: vi.fn(),
    getEstatisticas: vi.fn(),
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
