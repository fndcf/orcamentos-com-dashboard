import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  useConfiguracoesGerais,
  useAtualizarConfiguracoesGerais,
} from '../../hooks/useConfiguracoesGerais';
import { configuracoesGeraisService } from '../../services/configuracoesGeraisService';
import { ConfiguracoesGerais } from '../../types';

// Mock do service
vi.mock('../../services/configuracoesGeraisService', () => ({
  configuracoesGeraisService: {
    buscar: vi.fn(),
    atualizar: vi.fn(),
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

const mockConfiguracoesGerais: ConfiguracoesGerais = {
  diasValidadeOrcamento: 30,
  nomeEmpresa: 'FLAMA Proteção Contra Incêndio',
  cnpjEmpresa: '12.345.678/0001-90',
  enderecoEmpresa: 'Rua das Flores, 123 - Centro',
  telefoneEmpresa: '(11) 99999-9999',
  emailEmpresa: 'contato@flama.com.br',
  logoUrl: 'https://exemplo.com/logo.png',
};

describe('useConfiguracoesGerais hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useConfiguracoesGerais', () => {
    it('deve retornar configurações gerais', async () => {
      vi.mocked(configuracoesGeraisService.buscar).mockResolvedValue(mockConfiguracoesGerais);

      const { result } = renderHook(() => useConfiguracoesGerais(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockConfiguracoesGerais);
      expect(configuracoesGeraisService.buscar).toHaveBeenCalled();
    });

    it('deve retornar isLoading enquanto carrega', () => {
      vi.mocked(configuracoesGeraisService.buscar).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useConfiguracoesGerais(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('deve retornar erro quando falhar', async () => {
      const error = new Error('Erro ao buscar configurações');
      vi.mocked(configuracoesGeraisService.buscar).mockRejectedValue(error);

      const { result } = renderHook(() => useConfiguracoesGerais(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useAtualizarConfiguracoesGerais', () => {
    it('deve atualizar configurações gerais', async () => {
      const configuracoesAtualizadas = { ...mockConfiguracoesGerais, diasValidadeOrcamento: 45 };
      vi.mocked(configuracoesGeraisService.atualizar).mockResolvedValue(configuracoesAtualizadas);

      const { result } = renderHook(() => useAtualizarConfiguracoesGerais(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ diasValidadeOrcamento: 45 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(configuracoesGeraisService.atualizar).toHaveBeenCalledWith({ diasValidadeOrcamento: 45 });
    });

    it('deve atualizar nome da empresa', async () => {
      const configuracoesAtualizadas = { ...mockConfiguracoesGerais, nomeEmpresa: 'Nova Empresa' };
      vi.mocked(configuracoesGeraisService.atualizar).mockResolvedValue(configuracoesAtualizadas);

      const { result } = renderHook(() => useAtualizarConfiguracoesGerais(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ nomeEmpresa: 'Nova Empresa' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(configuracoesGeraisService.atualizar).toHaveBeenCalledWith({ nomeEmpresa: 'Nova Empresa' });
    });

    it('deve atualizar múltiplos campos', async () => {
      const atualizacao = {
        nomeEmpresa: 'Nova Empresa',
        telefoneEmpresa: '(21) 88888-8888',
        emailEmpresa: 'novo@email.com',
      };
      const configuracoesAtualizadas = { ...mockConfiguracoesGerais, ...atualizacao };
      vi.mocked(configuracoesGeraisService.atualizar).mockResolvedValue(configuracoesAtualizadas);

      const { result } = renderHook(() => useAtualizarConfiguracoesGerais(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(atualizacao);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(configuracoesGeraisService.atualizar).toHaveBeenCalledWith(atualizacao);
    });

    it('deve lançar erro quando falhar', async () => {
      const error = new Error('Erro ao atualizar configurações');
      vi.mocked(configuracoesGeraisService.atualizar).mockRejectedValue(error);

      const { result } = renderHook(() => useAtualizarConfiguracoesGerais(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync({ diasValidadeOrcamento: 60 })).rejects.toThrow('Erro ao atualizar configurações');
    });
  });
});
