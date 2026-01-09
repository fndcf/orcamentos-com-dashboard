import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clienteService } from '../../services/clienteService';
import api from '../../services/api';

// Mock do api
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock do fetch para buscarCnpjBrasilAPI
global.fetch = vi.fn();

describe('clienteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todos os clientes', async () => {
      const mockClientes = [
        { id: '1', nome: 'Cliente 1' },
        { id: '2', nome: 'Cliente 2' },
      ];
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockClientes },
      });

      const result = await clienteService.listar();

      expect(api.get).toHaveBeenCalledWith('/clientes');
      expect(result).toEqual(mockClientes);
    });
  });

  describe('listarPaginado', () => {
    it('deve listar clientes com paginação e parâmetros padrão', async () => {
      const mockResponse = {
        items: [{ id: '1', nome: 'Cliente 1' }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasMore: false,
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockResponse },
      });

      const result = await clienteService.listarPaginado();

      expect(api.get).toHaveBeenCalledWith('/clientes/paginated', {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve listar clientes com paginação e parâmetros customizados', async () => {
      const mockResponse = {
        items: [{ id: '1', nome: 'Cliente 1' }],
        total: 50,
        page: 2,
        totalPages: 5,
        hasMore: true,
      };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockResponse },
      });

      const result = await clienteService.listarPaginado(2, 20, { busca: 'teste' });

      expect(api.get).toHaveBeenCalledWith('/clientes/paginated', {
        params: { page: 2, limit: 20, busca: 'teste' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar cliente por ID', async () => {
      const mockCliente = { id: '1', nome: 'Cliente 1' };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockCliente },
      });

      const result = await clienteService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/clientes/1');
      expect(result).toEqual(mockCliente);
    });
  });

  describe('buscarPorDocumento', () => {
    it('deve buscar cliente por documento', async () => {
      const mockCliente = { id: '1', documento: '12345678901' };
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockCliente },
      });

      const result = await clienteService.buscarPorDocumento('12345678901');

      expect(api.get).toHaveBeenCalledWith('/clientes/documento/12345678901');
      expect(result).toEqual(mockCliente);
    });

    it('deve retornar null quando cliente não encontrado', async () => {
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: null },
      });

      const result = await clienteService.buscarPorDocumento('00000000000');

      expect(result).toBeNull();
    });
  });

  describe('pesquisar', () => {
    it('deve pesquisar clientes por termo', async () => {
      const mockClientes = [{ id: '1', nome: 'João Silva' }];
      vi.mocked(api.get).mockResolvedValue({
        data: { success: true, data: mockClientes },
      });

      const result = await clienteService.pesquisar('João');

      expect(api.get).toHaveBeenCalledWith('/clientes/pesquisar', {
        params: { termo: 'João' },
      });
      expect(result).toEqual(mockClientes);
    });
  });

  describe('criar', () => {
    it('deve criar um novo cliente', async () => {
      const novoCliente = { nome: 'Novo Cliente', documento: '12345678901' };
      const clienteCriado = { id: '1', ...novoCliente };
      vi.mocked(api.post).mockResolvedValue({
        data: { success: true, data: clienteCriado },
      });

      const result = await clienteService.criar(novoCliente as any);

      expect(api.post).toHaveBeenCalledWith('/clientes', novoCliente);
      expect(result).toEqual(clienteCriado);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar um cliente existente', async () => {
      const dadosAtualizados = { razaoSocial: 'Nome Atualizado' };
      const clienteAtualizado = { id: '1', ...dadosAtualizados };
      vi.mocked(api.put).mockResolvedValue({
        data: { success: true, data: clienteAtualizado },
      });

      const result = await clienteService.atualizar('1', dadosAtualizados);

      expect(api.put).toHaveBeenCalledWith('/clientes/1', dadosAtualizados);
      expect(result).toEqual(clienteAtualizado);
    });
  });

  describe('excluir', () => {
    it('deve excluir um cliente', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await clienteService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/clientes/1');
    });
  });

  describe('buscarCnpjBrasilAPI', () => {
    it('deve buscar dados do CNPJ na BrasilAPI', async () => {
      const mockDados = {
        cnpj: '54513212000100',
        razao_social: 'FLAMA LTDA',
      };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDados),
      } as Response);

      const result = await clienteService.buscarCnpjBrasilAPI('54.513.212/0001-00');

      expect(fetch).toHaveBeenCalledWith(
        'https://brasilapi.com.br/api/cnpj/v1/54513212000100'
      );
      expect(result).toEqual(mockDados);
    });

    it('deve retornar null quando CNPJ não encontrado', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const result = await clienteService.buscarCnpjBrasilAPI('00000000000000');

      expect(result).toBeNull();
    });

    it('deve retornar null quando ocorrer erro na requisição', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await clienteService.buscarCnpjBrasilAPI('54513212000100');

      expect(result).toBeNull();
    });
  });
});
