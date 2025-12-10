import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useNotificacoes,
  useNotificacoesNaoLidas,
  useNotificacoesProximas,
  useNotificacoesVencidas,
  useNotificacoesAtivas,
  useNotificacaoResumo,
  useMarcarNotificacaoComoLida,
  useMarcarTodasNotificacoesComoLidas,
  useExcluirNotificacao,
  useGerarNotificacoesOrcamento,
  useProcessarTodasNotificacoes,
} from '../../hooks/useNotificacoes';
import { notificacaoService } from '../../services/notificacaoService';
import { Notificacao } from '../../types';

// Mock do service
vi.mock('../../services/notificacaoService', () => ({
  notificacaoService: {
    listar: vi.fn(),
    listarNaoLidas: vi.fn(),
    listarProximas: vi.fn(),
    listarVencidas: vi.fn(),
    listarAtivas: vi.fn(),
    obterResumo: vi.fn(),
    marcarComoLida: vi.fn(),
    marcarTodasComoLidas: vi.fn(),
    excluir: vi.fn(),
    gerarParaOrcamento: vi.fn(),
    processarTodos: vi.fn(),
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

  describe('useNotificacoes', () => {
    it('deve retornar lista de notificações', async () => {
      vi.mocked(notificacaoService.listar).mockResolvedValue(mockNotificacoes);

      const { result } = renderHook(() => useNotificacoes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNotificacoes);
      expect(notificacaoService.listar).toHaveBeenCalled();
    });

    it('deve retornar isLoading enquanto carrega', () => {
      vi.mocked(notificacaoService.listar).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useNotificacoes(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar erro quando falhar', async () => {
      const error = new Error('Erro ao listar');
      vi.mocked(notificacaoService.listar).mockRejectedValue(error);

      const { result } = renderHook(() => useNotificacoes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useNotificacoesNaoLidas', () => {
    it('deve retornar lista de notificações não lidas', async () => {
      const naoLidas = mockNotificacoes.filter((n) => !n.lida);
      vi.mocked(notificacaoService.listarNaoLidas).mockResolvedValue(naoLidas);

      const { result } = renderHook(() => useNotificacoesNaoLidas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(naoLidas);
      expect(notificacaoService.listarNaoLidas).toHaveBeenCalled();
    });
  });

  describe('useNotificacoesProximas', () => {
    it('deve retornar lista de notificações próximas com dias padrão', async () => {
      vi.mocked(notificacaoService.listarProximas).mockResolvedValue(mockNotificacoes);

      const { result } = renderHook(() => useNotificacoesProximas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNotificacoes);
      expect(notificacaoService.listarProximas).toHaveBeenCalledWith(30);
    });

    it('deve retornar lista de notificações próximas com dias customizado', async () => {
      vi.mocked(notificacaoService.listarProximas).mockResolvedValue(mockNotificacoes);

      const { result } = renderHook(() => useNotificacoesProximas(15), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificacaoService.listarProximas).toHaveBeenCalledWith(15);
    });
  });

  describe('useNotificacoesVencidas', () => {
    it('deve retornar lista de notificações vencidas', async () => {
      vi.mocked(notificacaoService.listarVencidas).mockResolvedValue(mockNotificacoes);

      const { result } = renderHook(() => useNotificacoesVencidas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNotificacoes);
      expect(notificacaoService.listarVencidas).toHaveBeenCalled();
    });
  });

  describe('useNotificacoesAtivas', () => {
    it('deve retornar lista de notificações ativas com dias padrão', async () => {
      vi.mocked(notificacaoService.listarAtivas).mockResolvedValue(mockNotificacoes);

      const { result } = renderHook(() => useNotificacoesAtivas(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockNotificacoes);
      expect(notificacaoService.listarAtivas).toHaveBeenCalledWith(60);
    });

    it('deve retornar lista de notificações ativas com dias customizado', async () => {
      vi.mocked(notificacaoService.listarAtivas).mockResolvedValue(mockNotificacoes);

      const { result } = renderHook(() => useNotificacoesAtivas(90), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificacaoService.listarAtivas).toHaveBeenCalledWith(90);
    });

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
});
