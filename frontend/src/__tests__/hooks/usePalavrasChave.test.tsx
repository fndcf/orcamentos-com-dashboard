import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  usePalavrasChave,
  usePalavrasChaveAtivas,
  useCriarPalavraChave,
  useAtualizarPalavraChave,
  useTogglePalavraChave,
  useExcluirPalavraChave,
} from '../../hooks/usePalavrasChave';
import { palavraChaveService } from '../../services/palavraChaveService';
import { PalavraChave } from '../../types';

// Mock do service
vi.mock('../../services/palavraChaveService', () => ({
  palavraChaveService: {
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

const mockPalavrasChave: PalavraChave[] = [
  {
    id: '1',
    palavra: 'extintor',
    prazoDias: 345,
    ativo: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    palavra: 'mangueira',
    prazoDias: 180,
    ativo: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    palavra: 'alarme',
    prazoDias: 365,
    ativo: false,
    createdAt: new Date(),
  },
];

describe('usePalavrasChave hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePalavrasChave', () => {
    it('deve retornar lista de palavras-chave', async () => {
      vi.mocked(palavraChaveService.listar).mockResolvedValue(mockPalavrasChave);

      const { result } = renderHook(() => usePalavrasChave(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPalavrasChave);
      expect(palavraChaveService.listar).toHaveBeenCalled();
    });

    it('deve retornar isLoading enquanto carrega', () => {
      vi.mocked(palavraChaveService.listar).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => usePalavrasChave(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar erro quando falhar', async () => {
      const error = new Error('Erro ao listar');
      vi.mocked(palavraChaveService.listar).mockRejectedValue(error);

      const { result } = renderHook(() => usePalavrasChave(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });
  });

  describe('usePalavrasChaveAtivas', () => {
    it('deve retornar apenas palavras-chave ativas', async () => {
      const ativas = mockPalavrasChave.filter((p) => p.ativo);
      vi.mocked(palavraChaveService.listarAtivas).mockResolvedValue(ativas);

      const { result } = renderHook(() => usePalavrasChaveAtivas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(ativas);
      expect(palavraChaveService.listarAtivas).toHaveBeenCalled();
    });
  });

  describe('useCriarPalavraChave', () => {
    it('deve criar nova palavra-chave', async () => {
      const novaPalavra: PalavraChave = {
        id: '4',
        palavra: 'sprinkler',
        prazoDias: 400,
        ativo: true,
        createdAt: new Date(),
      };

      vi.mocked(palavraChaveService.criar).mockResolvedValue(novaPalavra);

      const { result } = renderHook(() => useCriarPalavraChave(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        palavra: 'sprinkler',
        prazoDias: 400,
      });

      expect(palavraChaveService.criar).toHaveBeenCalledWith({
        palavra: 'sprinkler',
        prazoDias: 400,
      });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao criar');
      vi.mocked(palavraChaveService.criar).mockRejectedValue(error);

      const { result } = renderHook(() => useCriarPalavraChave(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ palavra: 'teste', prazoDias: 100 })
      ).rejects.toThrow('Erro ao criar');
    });
  });

  describe('useAtualizarPalavraChave', () => {
    it('deve atualizar palavra-chave existente', async () => {
      const atualizada: PalavraChave = {
        ...mockPalavrasChave[0],
        palavra: 'extintor atualizado',
        prazoDias: 400,
      };

      vi.mocked(palavraChaveService.atualizar).mockResolvedValue(atualizada);

      const { result } = renderHook(() => useAtualizarPalavraChave(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        id: '1',
        data: { palavra: 'extintor atualizado', prazoDias: 400 },
      });

      expect(palavraChaveService.atualizar).toHaveBeenCalledWith('1', {
        palavra: 'extintor atualizado',
        prazoDias: 400,
      });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao atualizar');
      vi.mocked(palavraChaveService.atualizar).mockRejectedValue(error);

      const { result } = renderHook(() => useAtualizarPalavraChave(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ id: '1', data: { palavra: 'teste' } })
      ).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('useTogglePalavraChave', () => {
    it('deve alternar status da palavra-chave', async () => {
      const toggled: PalavraChave = {
        ...mockPalavrasChave[0],
        ativo: false,
      };

      vi.mocked(palavraChaveService.toggleAtivo).mockResolvedValue(toggled);

      const { result } = renderHook(() => useTogglePalavraChave(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      expect(palavraChaveService.toggleAtivo).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao alternar');
      vi.mocked(palavraChaveService.toggleAtivo).mockRejectedValue(error);

      const { result } = renderHook(() => useTogglePalavraChave(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao alternar');
    });
  });

  describe('useExcluirPalavraChave', () => {
    it('deve excluir palavra-chave', async () => {
      vi.mocked(palavraChaveService.excluir).mockResolvedValue(undefined);

      const { result } = renderHook(() => useExcluirPalavraChave(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      expect(palavraChaveService.excluir).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao excluir');
      vi.mocked(palavraChaveService.excluir).mockRejectedValue(error);

      const { result } = renderHook(() => useExcluirPalavraChave(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao excluir');
    });
  });
});
