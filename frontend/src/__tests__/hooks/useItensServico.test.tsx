import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useItensServico,
  useItensServicoPorCategoria,
  useItensServicoAtivosPorCategoria,
  useInfiniteItensServicoAtivos,
  useInfiniteItensServicoPorCategoria,
  useCriarItemServico,
  useAtualizarItemServico,
  useToggleItemServico,
  useExcluirItemServico,
} from '../../hooks/useItensServico';
import { itemServicoService } from '../../services/itemServicoService';
import { ItemServico } from '../../types';

// Mock do service
vi.mock('../../services/itemServicoService', () => ({
  itemServicoService: {
    listar: vi.fn(),
    listarPorCategoria: vi.fn(),
    listarAtivosPorCategoria: vi.fn(),
    listarAtivosPorCategoriaPaginado: vi.fn(),
    listarPorCategoriaPaginado: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    toggleAtivo: vi.fn(),
    excluir: vi.fn(),
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

const mockItensServico: ItemServico[] = [
  {
    id: '1',
    categoriaId: 'cat-1',
    descricao: 'Extintor ABC 6kg',
    unidade: 'UN',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    categoriaId: 'cat-1',
    descricao: 'Hidrante de Parede',
    unidade: 'UN',
    ativo: true,
    ordem: 2,
    createdAt: new Date(),
  },
  {
    id: '3',
    categoriaId: 'cat-2',
    descricao: 'Item inativo para teste',
    unidade: 'M²',
    ativo: false,
    ordem: 3,
    createdAt: new Date(),
  },
];

describe('useItensServico hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useItensServico', () => {
    it('deve retornar lista de itens de serviço', async () => {
      vi.mocked(itemServicoService.listar).mockResolvedValue(mockItensServico);

      const { result } = renderHook(() => useItensServico(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockItensServico);
      expect(itemServicoService.listar).toHaveBeenCalled();
    });

    it('deve retornar isLoading enquanto carrega', () => {
      vi.mocked(itemServicoService.listar).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useItensServico(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar erro quando falhar', async () => {
      const error = new Error('Erro ao listar');
      vi.mocked(itemServicoService.listar).mockRejectedValue(error);

      const { result } = renderHook(() => useItensServico(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useItensServicoPorCategoria', () => {
    it('deve retornar lista de itens por categoria', async () => {
      const itensCat1 = mockItensServico.filter((i) => i.categoriaId === 'cat-1');
      vi.mocked(itemServicoService.listarPorCategoria).mockResolvedValue(itensCat1);

      const { result } = renderHook(() => useItensServicoPorCategoria('cat-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(itensCat1);
      expect(itemServicoService.listarPorCategoria).toHaveBeenCalledWith('cat-1');
    });

    it('não deve fazer query quando categoriaId é undefined', () => {
      const { result } = renderHook(() => useItensServicoPorCategoria(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(itemServicoService.listarPorCategoria).not.toHaveBeenCalled();
    });
  });

  describe('useItensServicoAtivosPorCategoria', () => {
    it('deve retornar lista de itens ativos por categoria', async () => {
      const itensAtivos = mockItensServico.filter((i) => i.categoriaId === 'cat-1' && i.ativo);
      vi.mocked(itemServicoService.listarAtivosPorCategoria).mockResolvedValue(itensAtivos);

      const { result } = renderHook(() => useItensServicoAtivosPorCategoria('cat-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(itensAtivos);
      expect(itemServicoService.listarAtivosPorCategoria).toHaveBeenCalledWith('cat-1');
    });

    it('não deve fazer query quando categoriaId é undefined', () => {
      const { result } = renderHook(() => useItensServicoAtivosPorCategoria(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(itemServicoService.listarAtivosPorCategoria).not.toHaveBeenCalled();
    });

    it('deve usar cache por 5 minutos (staleTime)', async () => {
      const itensAtivos = mockItensServico.filter((i) => i.categoriaId === 'cat-1' && i.ativo);
      vi.mocked(itemServicoService.listarAtivosPorCategoria).mockResolvedValue(itensAtivos);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result, rerender } = renderHook(() => useItensServicoAtivosPorCategoria('cat-1'), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(itemServicoService.listarAtivosPorCategoria).toHaveBeenCalledTimes(1);

      // Re-render o hook - não deve fazer nova chamada devido ao staleTime
      rerender();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // Ainda deve ter sido chamado apenas 1 vez
      expect(itemServicoService.listarAtivosPorCategoria).toHaveBeenCalledTimes(1);
    });
  });

  describe('useInfiniteItensServicoAtivos', () => {
    it('deve retornar itens ativos com infinite scroll', async () => {
      const mockResponse = {
        itens: mockItensServico.filter((i) => i.categoriaId === 'cat-1' && i.ativo),
        nextCursor: 'cursor-123',
        hasMore: true,
        total: 50,
      };
      vi.mocked(itemServicoService.listarAtivosPorCategoriaPaginado).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useInfiniteItensServicoAtivos('cat-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(itemServicoService.listarAtivosPorCategoriaPaginado).toHaveBeenCalledWith('cat-1', 10, undefined, undefined);
    });

    it('deve retornar itens ativos com search', async () => {
      const mockResponse = {
        itens: [mockItensServico[0]],
        nextCursor: undefined,
        hasMore: false,
        total: 1,
      };
      vi.mocked(itemServicoService.listarAtivosPorCategoriaPaginado).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useInfiniteItensServicoAtivos('cat-1', 'extintor', 20), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(itemServicoService.listarAtivosPorCategoriaPaginado).toHaveBeenCalledWith('cat-1', 20, undefined, 'extintor');
    });

    it('não deve buscar quando categoriaId é undefined', () => {
      const { result } = renderHook(() => useInfiniteItensServicoAtivos(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(itemServicoService.listarAtivosPorCategoriaPaginado).not.toHaveBeenCalled();
    });
  });

  describe('useInfiniteItensServicoPorCategoria', () => {
    it('deve retornar itens por categoria com infinite scroll', async () => {
      const mockResponse = {
        itens: mockItensServico.filter((i) => i.categoriaId === 'cat-1'),
        nextCursor: 'cursor-456',
        hasMore: true,
        total: 100,
      };
      vi.mocked(itemServicoService.listarPorCategoriaPaginado).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useInfiniteItensServicoPorCategoria('cat-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(itemServicoService.listarPorCategoriaPaginado).toHaveBeenCalledWith('cat-1', 10, undefined, undefined);
    });

    it('deve retornar itens com search e limit customizado', async () => {
      const mockResponse = {
        itens: [mockItensServico[1]],
        nextCursor: undefined,
        hasMore: false,
        total: 1,
      };
      vi.mocked(itemServicoService.listarPorCategoriaPaginado).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useInfiniteItensServicoPorCategoria('cat-1', 'hidrante', 15), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(itemServicoService.listarPorCategoriaPaginado).toHaveBeenCalledWith('cat-1', 15, undefined, 'hidrante');
    });

    it('não deve buscar quando categoriaId é undefined', () => {
      const { result } = renderHook(() => useInfiniteItensServicoPorCategoria(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(itemServicoService.listarPorCategoriaPaginado).not.toHaveBeenCalled();
    });
  });

  describe('useCriarItemServico', () => {
    it('deve criar novo item de serviço', async () => {
      const novoItem = { id: '4', categoriaId: 'cat-1', descricao: 'Novo item', unidade: 'UN', ativo: true, ordem: 4, createdAt: new Date() };
      vi.mocked(itemServicoService.criar).mockResolvedValue(novoItem);

      const { result } = renderHook(() => useCriarItemServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ categoriaId: 'cat-1', descricao: 'Novo item', unidade: 'UN', ativo: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(itemServicoService.criar).toHaveBeenCalledWith({ categoriaId: 'cat-1', descricao: 'Novo item', unidade: 'UN', ativo: true });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao criar');
      vi.mocked(itemServicoService.criar).mockRejectedValue(error);

      const { result } = renderHook(() => useCriarItemServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ categoriaId: 'cat-1', descricao: 'Novo item', unidade: 'UN' })).rejects.toThrow('Erro ao criar');
    });
  });

  describe('useAtualizarItemServico', () => {
    it('deve atualizar item de serviço existente', async () => {
      const itemAtualizado = { ...mockItensServico[0], descricao: 'Item atualizado' };
      vi.mocked(itemServicoService.atualizar).mockResolvedValue(itemAtualizado);

      const { result } = renderHook(() => useAtualizarItemServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: '1', data: { descricao: 'Item atualizado' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(itemServicoService.atualizar).toHaveBeenCalledWith('1', { descricao: 'Item atualizado' });
    });

    it('deve atualizar unidade do item', async () => {
      const itemAtualizado = { ...mockItensServico[0], unidade: 'M²' };
      vi.mocked(itemServicoService.atualizar).mockResolvedValue(itemAtualizado);

      const { result } = renderHook(() => useAtualizarItemServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: '1', data: { unidade: 'M²' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(itemServicoService.atualizar).toHaveBeenCalledWith('1', { unidade: 'M²' });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao atualizar');
      vi.mocked(itemServicoService.atualizar).mockRejectedValue(error);

      const { result } = renderHook(() => useAtualizarItemServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ id: '1', data: { descricao: 'Teste' } })).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('useToggleItemServico', () => {
    it('deve alternar status do item de serviço', async () => {
      const itemAlternado = { ...mockItensServico[0], ativo: false };
      vi.mocked(itemServicoService.toggleAtivo).mockResolvedValue(itemAlternado);

      const { result } = renderHook(() => useToggleItemServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(itemServicoService.toggleAtivo).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao alternar');
      vi.mocked(itemServicoService.toggleAtivo).mockRejectedValue(error);

      const { result } = renderHook(() => useToggleItemServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao alternar');
    });
  });

  describe('useExcluirItemServico', () => {
    it('deve excluir item de serviço', async () => {
      vi.mocked(itemServicoService.excluir).mockResolvedValue(undefined);

      const { result } = renderHook(() => useExcluirItemServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(itemServicoService.excluir).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao excluir');
      vi.mocked(itemServicoService.excluir).mockRejectedValue(error);

      const { result } = renderHook(() => useExcluirItemServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao excluir');
    });
  });
});
