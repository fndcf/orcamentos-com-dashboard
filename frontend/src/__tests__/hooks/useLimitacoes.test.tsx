import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useLimitacoes,
  useLimitacoesAtivas,
  useCriarLimitacao,
  useAtualizarLimitacao,
  useToggleLimitacao,
  useExcluirLimitacao,
} from '../../hooks/useLimitacoes';
import { limitacaoService } from '../../services/limitacaoService';
import { Limitacao } from '../../types';

// Mock do service
vi.mock('../../services/limitacaoService', () => ({
  limitacaoService: {
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

const mockLimitacoes: Limitacao[] = [
  {
    id: '1',
    texto: 'Esta proposta é válida por 30 dias.',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    texto: 'Não inclui materiais de construção civil.',
    ativo: true,
    ordem: 2,
    createdAt: new Date(),
  },
  {
    id: '3',
    texto: 'Limitação inativa para teste.',
    ativo: false,
    ordem: 3,
    createdAt: new Date(),
  },
];

describe('useLimitacoes hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLimitacoes', () => {
    it('deve retornar lista de limitações', async () => {
      vi.mocked(limitacaoService.listar).mockResolvedValue(mockLimitacoes);

      const { result } = renderHook(() => useLimitacoes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLimitacoes);
      expect(limitacaoService.listar).toHaveBeenCalled();
    });

    it('deve retornar isLoading enquanto carrega', () => {
      vi.mocked(limitacaoService.listar).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useLimitacoes(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar erro quando falhar', async () => {
      const error = new Error('Erro ao listar');
      vi.mocked(limitacaoService.listar).mockRejectedValue(error);

      const { result } = renderHook(() => useLimitacoes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useLimitacoesAtivas', () => {
    it('deve retornar lista de limitações ativas', async () => {
      const ativas = mockLimitacoes.filter((l) => l.ativo);
      vi.mocked(limitacaoService.listarAtivas).mockResolvedValue(ativas);

      const { result } = renderHook(() => useLimitacoesAtivas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(ativas);
      expect(limitacaoService.listarAtivas).toHaveBeenCalled();
    });
  });

  describe('useCriarLimitacao', () => {
    it('deve criar nova limitação', async () => {
      const novaLimitacao = { id: '4', texto: 'Nova limitação de teste', ativo: true, ordem: 4, createdAt: new Date() };
      vi.mocked(limitacaoService.criar).mockResolvedValue(novaLimitacao);

      const { result } = renderHook(() => useCriarLimitacao(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ texto: 'Nova limitação de teste', ativo: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(limitacaoService.criar).toHaveBeenCalledWith({ texto: 'Nova limitação de teste', ativo: true });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao criar');
      vi.mocked(limitacaoService.criar).mockRejectedValue(error);

      const { result } = renderHook(() => useCriarLimitacao(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ texto: 'Nova limitação' })).rejects.toThrow('Erro ao criar');
    });
  });

  describe('useAtualizarLimitacao', () => {
    it('deve atualizar limitação existente', async () => {
      const limitacaoAtualizada = { ...mockLimitacoes[0], texto: 'Limitação atualizada' };
      vi.mocked(limitacaoService.atualizar).mockResolvedValue(limitacaoAtualizada);

      const { result } = renderHook(() => useAtualizarLimitacao(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: '1', data: { texto: 'Limitação atualizada' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(limitacaoService.atualizar).toHaveBeenCalledWith('1', { texto: 'Limitação atualizada' });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao atualizar');
      vi.mocked(limitacaoService.atualizar).mockRejectedValue(error);

      const { result } = renderHook(() => useAtualizarLimitacao(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ id: '1', data: { texto: 'Teste' } })).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('useToggleLimitacao', () => {
    it('deve alternar status da limitação', async () => {
      const limitacaoAlternada = { ...mockLimitacoes[0], ativo: false };
      vi.mocked(limitacaoService.toggleAtivo).mockResolvedValue(limitacaoAlternada);

      const { result } = renderHook(() => useToggleLimitacao(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(limitacaoService.toggleAtivo).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao alternar');
      vi.mocked(limitacaoService.toggleAtivo).mockRejectedValue(error);

      const { result } = renderHook(() => useToggleLimitacao(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao alternar');
    });
  });

  describe('useExcluirLimitacao', () => {
    it('deve excluir limitação', async () => {
      vi.mocked(limitacaoService.excluir).mockResolvedValue(undefined);

      const { result } = renderHook(() => useExcluirLimitacao(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(limitacaoService.excluir).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao excluir');
      vi.mocked(limitacaoService.excluir).mockRejectedValue(error);

      const { result } = renderHook(() => useExcluirLimitacao(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao excluir');
    });
  });
});
