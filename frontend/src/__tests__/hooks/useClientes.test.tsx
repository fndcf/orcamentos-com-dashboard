import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactNode } from 'react';
import {
  useClientes,
  useCliente,
  useClientesPaginados,
  useClientesInfiniteScroll,
  usePesquisarClientes,
  useCriarCliente,
  useAtualizarCliente,
  useExcluirCliente,
  useBuscarCnpjBrasilAPI,
} from '../../hooks/useClientes';
import { clienteService } from '../../services/clienteService';

// Mock do clienteService
vi.mock('../../services/clienteService', () => ({
  clienteService: {
    listar: vi.fn(),
    listarPaginado: vi.fn(),
    buscarPorId: vi.fn(),
    pesquisar: vi.fn(),
    criar: vi.fn(),
    atualizar: vi.fn(),
    excluir: vi.fn(),
    buscarCnpjBrasilAPI: vi.fn(),
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

describe('useClientes hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useClientes', () => {
    it('deve retornar lista de clientes', async () => {
      const mockClientes = [
        { id: '1', nome: 'Cliente 1' },
        { id: '2', nome: 'Cliente 2' },
      ];
      vi.mocked(clienteService.listar).mockResolvedValue(mockClientes as any);

      const { result } = renderHook(() => useClientes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockClientes);
      expect(clienteService.listar).toHaveBeenCalled();
    });
  });

  describe('useClientesPaginados', () => {
    it('deve retornar lista paginada de clientes', async () => {
      const mockResponse = {
        items: [{ id: '1', nome: 'Cliente 1' }],
        total: 50,
        page: 1,
        totalPages: 5,
        hasMore: true,
      };
      vi.mocked(clienteService.listarPaginado).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useClientesPaginados(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(clienteService.listarPaginado).toHaveBeenCalledWith(1, 10, undefined);
    });

    it('deve retornar lista paginada com filtros', async () => {
      const mockResponse = {
        items: [{ id: '1', nome: 'Cliente Teste' }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasMore: false,
      };
      vi.mocked(clienteService.listarPaginado).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useClientesPaginados(1, 10, { busca: 'Teste' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(clienteService.listarPaginado).toHaveBeenCalledWith(1, 10, { busca: 'Teste' });
    });
  });

  describe('useClientesInfiniteScroll', () => {
    it('deve retornar clientes com infinite scroll', async () => {
      const mockResponse = {
        items: [{ id: '1', nome: 'Cliente 1' }],
        total: 50,
        page: 1,
        totalPages: 5,
        hasMore: true,
      };
      vi.mocked(clienteService.listarPaginado).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useClientesInfiniteScroll(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(clienteService.listarPaginado).toHaveBeenCalledWith(1, 20, { busca: undefined });
    });

    it('deve retornar clientes com busca e limit customizado', async () => {
      const mockResponse = {
        items: [{ id: '1', nome: 'Cliente Teste' }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasMore: false,
      };
      vi.mocked(clienteService.listarPaginado).mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() => useClientesInfiniteScroll('Teste', 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pages[0]).toEqual(mockResponse);
      expect(clienteService.listarPaginado).toHaveBeenCalledWith(1, 10, { busca: 'Teste' });
    });
  });

  describe('useCliente', () => {
    it('deve retornar cliente por ID', async () => {
      const mockCliente = { id: '1', nome: 'Cliente 1' };
      vi.mocked(clienteService.buscarPorId).mockResolvedValue(mockCliente as any);

      const { result } = renderHook(() => useCliente('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCliente);
      expect(clienteService.buscarPorId).toHaveBeenCalledWith('1');
    });

    it('não deve buscar quando ID está vazio', () => {
      const { result } = renderHook(() => useCliente(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(clienteService.buscarPorId).not.toHaveBeenCalled();
    });
  });

  describe('usePesquisarClientes', () => {
    it('deve pesquisar clientes quando termo tem 2+ caracteres', async () => {
      const mockClientes = [{ id: '1', nome: 'João' }];
      vi.mocked(clienteService.pesquisar).mockResolvedValue(mockClientes as any);

      const { result } = renderHook(() => usePesquisarClientes('Jo'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockClientes);
      expect(clienteService.pesquisar).toHaveBeenCalledWith('Jo');
    });

    it('não deve pesquisar quando termo tem menos de 2 caracteres', () => {
      const { result } = renderHook(() => usePesquisarClientes('J'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(clienteService.pesquisar).not.toHaveBeenCalled();
    });
  });

  describe('useCriarCliente', () => {
    it('deve criar cliente e invalidar queries', async () => {
      const novoCliente = { nome: 'Novo Cliente', documento: '12345678901' };
      const clienteCriado = { id: '1', ...novoCliente };
      vi.mocked(clienteService.criar).mockResolvedValue(clienteCriado as any);

      const { result } = renderHook(() => useCriarCliente(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(novoCliente as any);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(clienteService.criar).toHaveBeenCalledWith(novoCliente);
    });
  });

  describe('useAtualizarCliente', () => {
    it('deve atualizar cliente e invalidar queries', async () => {
      const dadosAtualizados = { razaoSocial: 'Nome Atualizado' };
      vi.mocked(clienteService.atualizar).mockResolvedValue({ id: '1', ...dadosAtualizados } as any);

      const { result } = renderHook(() => useAtualizarCliente(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: '1', data: dadosAtualizados });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(clienteService.atualizar).toHaveBeenCalledWith('1', dadosAtualizados);
    });
  });

  describe('useExcluirCliente', () => {
    it('deve excluir cliente e invalidar queries', async () => {
      vi.mocked(clienteService.excluir).mockResolvedValue();

      const { result } = renderHook(() => useExcluirCliente(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(clienteService.excluir).toHaveBeenCalledWith('1');
    });
  });

  describe('useBuscarCnpjBrasilAPI', () => {
    it('deve buscar dados do CNPJ', async () => {
      const mockDados = { cnpj: '54513212000100', razao_social: 'FLAMA LTDA' };
      vi.mocked(clienteService.buscarCnpjBrasilAPI).mockResolvedValue(mockDados as any);

      const { result } = renderHook(() => useBuscarCnpjBrasilAPI(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('54.513.212/0001-00');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(clienteService.buscarCnpjBrasilAPI).toHaveBeenCalledWith('54.513.212/0001-00');
    });
  });
});
