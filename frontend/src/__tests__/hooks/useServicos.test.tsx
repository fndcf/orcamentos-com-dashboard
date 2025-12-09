import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useServicos,
  useServicosAtivos,
  useCriarServico,
  useAtualizarServico,
  useToggleServico,
  useExcluirServico,
} from '../../hooks/useServicos';
import { servicoService } from '../../services/servicoService';
import { Servico } from '../../types';

// Mock do service
vi.mock('../../services/servicoService', () => ({
  servicoService: {
    listar: vi.fn(),
    listarAtivos: vi.fn(),
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

const mockServicos: Servico[] = [
  {
    id: '1',
    descricao: 'Instalação de extintores',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
  {
    id: '2',
    descricao: 'Manutenção de hidrantes',
    ativo: true,
    ordem: 2,
    createdAt: new Date(),
  },
  {
    id: '3',
    descricao: 'Serviço inativo para teste',
    ativo: false,
    ordem: 3,
    createdAt: new Date(),
  },
];

describe('useServicos hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useServicos', () => {
    it('deve retornar lista de serviços', async () => {
      vi.mocked(servicoService.listar).mockResolvedValue(mockServicos);

      const { result } = renderHook(() => useServicos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockServicos);
      expect(servicoService.listar).toHaveBeenCalled();
    });

    it('deve retornar isLoading enquanto carrega', () => {
      vi.mocked(servicoService.listar).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useServicos(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar erro quando falhar', async () => {
      const error = new Error('Erro ao listar');
      vi.mocked(servicoService.listar).mockRejectedValue(error);

      const { result } = renderHook(() => useServicos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useServicosAtivos', () => {
    it('deve retornar lista de serviços ativos', async () => {
      const ativos = mockServicos.filter((s) => s.ativo);
      vi.mocked(servicoService.listarAtivos).mockResolvedValue(ativos);

      const { result } = renderHook(() => useServicosAtivos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(ativos);
      expect(servicoService.listarAtivos).toHaveBeenCalled();
    });
  });

  describe('useCriarServico', () => {
    it('deve criar novo serviço', async () => {
      const novoServico = { id: '4', descricao: 'Novo serviço de teste', ativo: true, ordem: 4, createdAt: new Date() };
      vi.mocked(servicoService.criar).mockResolvedValue(novoServico);

      const { result } = renderHook(() => useCriarServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ descricao: 'Novo serviço de teste', ativo: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(servicoService.criar).toHaveBeenCalledWith({ descricao: 'Novo serviço de teste', ativo: true });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao criar');
      vi.mocked(servicoService.criar).mockRejectedValue(error);

      const { result } = renderHook(() => useCriarServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ descricao: 'Novo serviço' })).rejects.toThrow('Erro ao criar');
    });
  });

  describe('useAtualizarServico', () => {
    it('deve atualizar serviço existente', async () => {
      const servicoAtualizado = { ...mockServicos[0], descricao: 'Serviço atualizado' };
      vi.mocked(servicoService.atualizar).mockResolvedValue(servicoAtualizado);

      const { result } = renderHook(() => useAtualizarServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ id: '1', data: { descricao: 'Serviço atualizado' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(servicoService.atualizar).toHaveBeenCalledWith('1', { descricao: 'Serviço atualizado' });
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao atualizar');
      vi.mocked(servicoService.atualizar).mockRejectedValue(error);

      const { result } = renderHook(() => useAtualizarServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ id: '1', data: { descricao: 'Teste' } })).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('useToggleServico', () => {
    it('deve alternar status do serviço', async () => {
      const servicoAlternado = { ...mockServicos[0], ativo: false };
      vi.mocked(servicoService.toggleAtivo).mockResolvedValue(servicoAlternado);

      const { result } = renderHook(() => useToggleServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(servicoService.toggleAtivo).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao alternar');
      vi.mocked(servicoService.toggleAtivo).mockRejectedValue(error);

      const { result } = renderHook(() => useToggleServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao alternar');
    });
  });

  describe('useExcluirServico', () => {
    it('deve excluir serviço', async () => {
      vi.mocked(servicoService.excluir).mockResolvedValue(undefined);

      const { result } = renderHook(() => useExcluirServico(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(servicoService.excluir).toHaveBeenCalledWith('1');
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao excluir');
      vi.mocked(servicoService.excluir).mockRejectedValue(error);

      const { result } = renderHook(() => useExcluirServico(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync('1')).rejects.toThrow('Erro ao excluir');
    });
  });
});
