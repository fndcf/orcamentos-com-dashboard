import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useCategoriasItem,
  useCategoriasItemAtivas,
  useCriarCategoriaItem,
  useAtualizarCategoriaItem,
  useToggleCategoriaItem,
  useExcluirCategoriaItem,
} from '../../hooks/useCategoriasItem';
import { categoriaItemService } from '../../services/categoriaItemService';
import { CategoriaItem } from '../../types';

// Mock do service
vi.mock('../../services/categoriaItemService', () => ({
  categoriaItemService: {
    listar: vi.fn(),
    listarAtivas: vi.fn(),
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

const mockCategorias: CategoriaItem[] = [
  {
    id: '1',
    nome: 'Extintores',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    nome: 'Mangueiras',
    ativo: true,
    ordem: 2,
    createdAt: new Date(),
  },
  {
    id: '3',
    nome: 'Alarmes',
    ativo: false,
    ordem: 3,
    createdAt: new Date(),
  },
];

describe('useCategoriasItem hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCategoriasItem', () => {
    it('deve retornar lista de categorias', async () => {
      vi.mocked(categoriaItemService.listar).mockResolvedValue(mockCategorias);

      const { result } = renderHook(() => useCategoriasItem(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCategorias);
      expect(categoriaItemService.listar).toHaveBeenCalled();
    });

    it('deve retornar isLoading enquanto carrega', () => {
      vi.mocked(categoriaItemService.listar).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useCategoriasItem(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar erro quando falhar', async () => {
      const error = new Error('Erro ao listar');
      vi.mocked(categoriaItemService.listar).mockRejectedValue(error);

      const { result } = renderHook(() => useCategoriasItem(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCategoriasItemAtivas', () => {
    it('deve retornar lista de categorias ativas', async () => {
      const ativas = mockCategorias.filter((c) => c.ativo);
      vi.mocked(categoriaItemService.listarAtivas).mockResolvedValue(ativas);

      const { result } = renderHook(() => useCategoriasItemAtivas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(ativas);
      expect(categoriaItemService.listarAtivas).toHaveBeenCalled();
    });
  });

  describe('useCriarCategoriaItem', () => {
    it('deve criar nova categoria', async () => {
      const novaCategoria = { id: '4', nome: 'Nova Categoria', ativo: true, ordem: 4, createdAt: new Date() };
      vi.mocked(categoriaItemService.criar).mockResolvedValue(novaCategoria);

      const { result } = renderHook(() => useCriarCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ nome: 'Nova Categoria', ativo: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoriaItemService.criar).toHaveBeenCalledWith({ nome: 'Nova Categoria', ativo: true });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao criar');
      vi.mocked(categoriaItemService.criar).mockRejectedValue(error);

      const { result } = renderHook(() => useCriarCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ nome: 'Nova Categoria' })).rejects.toThrow('Erro ao criar');
    });
  });

  describe('useAtualizarCategoriaItem', () => {
    it('deve atualizar categoria existente', async () => {
      const categoriaAtualizada = { ...mockCategorias[0], nome: 'Extintor Atualizado' };
      vi.mocked(categoriaItemService.atualizar).mockResolvedValue(categoriaAtualizada);

      const { result } = renderHook(() => useAtualizarCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: '1', data: { nome: 'Extintor Atualizado' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoriaItemService.atualizar).toHaveBeenCalledWith('1', { nome: 'Extintor Atualizado' });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao atualizar');
      vi.mocked(categoriaItemService.atualizar).mockRejectedValue(error);

      const { result } = renderHook(() => useAtualizarCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ id: '1', data: { nome: 'Teste' } })).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('useToggleCategoriaItem', () => {
    it('deve alternar status da categoria', async () => {
      const categoriaAlternada = { ...mockCategorias[0], ativo: false };
      vi.mocked(categoriaItemService.toggleAtivo).mockResolvedValue(categoriaAlternada);

      const { result } = renderHook(() => useToggleCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoriaItemService.toggleAtivo).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao alternar');
      vi.mocked(categoriaItemService.toggleAtivo).mockRejectedValue(error);

      const { result } = renderHook(() => useToggleCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao alternar');
    });
  });

  describe('useExcluirCategoriaItem', () => {
    it('deve excluir categoria', async () => {
      vi.mocked(categoriaItemService.excluir).mockResolvedValue(undefined);

      const { result } = renderHook(() => useExcluirCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(categoriaItemService.excluir).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao excluir');
      vi.mocked(categoriaItemService.excluir).mockRejectedValue(error);

      const { result } = renderHook(() => useExcluirCategoriaItem(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao excluir');
    });
  });
});
