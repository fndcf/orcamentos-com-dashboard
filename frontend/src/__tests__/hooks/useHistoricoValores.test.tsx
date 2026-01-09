import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode } from 'react';
import { useHistoricoItens, useHistoricoConfiguracoes } from '../../hooks/useHistoricoValores';
import { historicoValoresService } from '../../services/historicoValoresService';

// Mock do historicoValoresService
vi.mock('../../services/historicoValoresService', () => ({
  historicoValoresService: {
    buscarHistoricoItens: vi.fn(),
    buscarHistoricoConfiguracoes: vi.fn(),
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

describe('useHistoricoValores hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useHistoricoItens', () => {
    it('deve retornar histórico de itens por período', async () => {
      const mockHistorico = [
        {
          id: '1',
          itemId: 'item-1',
          itemDescricao: 'Extintor ABC 6kg',
          valorAnterior: 100,
          valorNovo: 120,
          dataAlteracao: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          itemId: 'item-2',
          itemDescricao: 'Mangueira 15m',
          valorAnterior: 200,
          valorNovo: 250,
          dataAlteracao: '2024-01-16T14:30:00Z',
        },
      ];
      vi.mocked(historicoValoresService.buscarHistoricoItens).mockResolvedValue(mockHistorico as any);

      const { result } = renderHook(() => useHistoricoItens('2024-01-01', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHistorico);
      expect(historicoValoresService.buscarHistoricoItens).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });

    it('não deve buscar quando dataInicio está vazia', () => {
      const { result } = renderHook(() => useHistoricoItens('', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(historicoValoresService.buscarHistoricoItens).not.toHaveBeenCalled();
    });

    it('não deve buscar quando dataFim está vazia', () => {
      const { result } = renderHook(() => useHistoricoItens('2024-01-01', ''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(historicoValoresService.buscarHistoricoItens).not.toHaveBeenCalled();
    });

    it('não deve buscar quando enabled é false', () => {
      const { result } = renderHook(() => useHistoricoItens('2024-01-01', '2024-01-31', false), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(historicoValoresService.buscarHistoricoItens).not.toHaveBeenCalled();
    });

    it('deve retornar array vazio quando não há histórico', async () => {
      vi.mocked(historicoValoresService.buscarHistoricoItens).mockResolvedValue([]);

      const { result } = renderHook(() => useHistoricoItens('2024-01-01', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useHistoricoConfiguracoes', () => {
    it('deve retornar histórico de configurações por período', async () => {
      const mockHistorico = [
        {
          id: '1',
          campo: 'impostoMaterial',
          valorAnterior: '10',
          valorNovo: '12',
          dataAlteracao: '2024-01-10T08:00:00Z',
        },
        {
          id: '2',
          campo: 'impostoServico',
          valorAnterior: '15',
          valorNovo: '18',
          dataAlteracao: '2024-01-12T09:00:00Z',
        },
      ];
      vi.mocked(historicoValoresService.buscarHistoricoConfiguracoes).mockResolvedValue(mockHistorico as any);

      const { result } = renderHook(() => useHistoricoConfiguracoes('2024-01-01', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHistorico);
      expect(historicoValoresService.buscarHistoricoConfiguracoes).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });

    it('não deve buscar quando dataInicio está vazia', () => {
      const { result } = renderHook(() => useHistoricoConfiguracoes('', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(historicoValoresService.buscarHistoricoConfiguracoes).not.toHaveBeenCalled();
    });

    it('não deve buscar quando dataFim está vazia', () => {
      const { result } = renderHook(() => useHistoricoConfiguracoes('2024-01-01', ''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(historicoValoresService.buscarHistoricoConfiguracoes).not.toHaveBeenCalled();
    });

    it('não deve buscar quando enabled é false', () => {
      const { result } = renderHook(() => useHistoricoConfiguracoes('2024-01-01', '2024-01-31', false), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(historicoValoresService.buscarHistoricoConfiguracoes).not.toHaveBeenCalled();
    });

    it('deve retornar array vazio quando não há histórico', async () => {
      vi.mocked(historicoValoresService.buscarHistoricoConfiguracoes).mockResolvedValue([]);

      const { result } = renderHook(() => useHistoricoConfiguracoes('2024-01-01', '2024-01-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });
});
