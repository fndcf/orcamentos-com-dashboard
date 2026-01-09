import { describe, it, expect, vi, beforeEach } from 'vitest';
import { itemServicoService } from '../../services/itemServicoService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockItemServico = {
  id: '1',
  categoriaId: 'cat-1',
  descricao: 'Extintor ABC 6kg',
  unidade: 'UN',
  ativo: true,
  ordem: 1,
  createdAt: new Date(),
};

describe('itemServicoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todos os itens de serviço', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockItemServico] });

      const result = await itemServicoService.listar();

      expect(api.get).toHaveBeenCalledWith('/itens-servico');
      expect(result).toEqual([mockItemServico]);
    });
  });

  describe('listarPorCategoria', () => {
    it('deve listar itens por categoria', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockItemServico] });

      const result = await itemServicoService.listarPorCategoria('cat-1');

      expect(api.get).toHaveBeenCalledWith('/itens-servico/categoria/cat-1');
      expect(result).toEqual([mockItemServico]);
    });
  });

  describe('listarAtivosPorCategoria', () => {
    it('deve listar itens ativos por categoria', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockItemServico] });

      const result = await itemServicoService.listarAtivosPorCategoria('cat-1');

      expect(api.get).toHaveBeenCalledWith('/itens-servico/categoria/cat-1/ativos');
      expect(result).toEqual([mockItemServico]);
    });
  });

  describe('listarAtivosPorCategoriaPaginado', () => {
    it('deve listar itens ativos por categoria com paginação e parâmetros padrão', async () => {
      const mockResponse = {
        itens: [mockItemServico],
        nextCursor: 'cursor-123',
        hasMore: true,
        total: 50,
      };
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await itemServicoService.listarAtivosPorCategoriaPaginado('cat-1');

      expect(api.get).toHaveBeenCalledWith('/itens-servico/categoria/cat-1/ativos/paginado', {
        params: { limit: '10' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve listar itens ativos por categoria com cursor e search', async () => {
      const mockResponse = {
        itens: [mockItemServico],
        nextCursor: null,
        hasMore: false,
        total: 1,
      };
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await itemServicoService.listarAtivosPorCategoriaPaginado('cat-1', 20, 'cursor-abc', 'extintor');

      expect(api.get).toHaveBeenCalledWith('/itens-servico/categoria/cat-1/ativos/paginado', {
        params: { limit: '20', cursor: 'cursor-abc', search: 'extintor' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listarPorCategoriaPaginado', () => {
    it('deve listar itens por categoria com paginação e parâmetros padrão', async () => {
      const mockResponse = {
        itens: [mockItemServico],
        nextCursor: 'cursor-456',
        hasMore: true,
        total: 100,
      };
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await itemServicoService.listarPorCategoriaPaginado('cat-1');

      expect(api.get).toHaveBeenCalledWith('/itens-servico/categoria/cat-1/paginado', {
        params: { limit: '10' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve listar itens por categoria com cursor e search', async () => {
      const mockResponse = {
        itens: [mockItemServico],
        nextCursor: null,
        hasMore: false,
        total: 5,
      };
      vi.mocked(api.get).mockResolvedValue({ data: mockResponse });

      const result = await itemServicoService.listarPorCategoriaPaginado('cat-1', 15, 'cursor-xyz', 'mangueira');

      expect(api.get).toHaveBeenCalledWith('/itens-servico/categoria/cat-1/paginado', {
        params: { limit: '15', cursor: 'cursor-xyz', search: 'mangueira' },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar item por id', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockItemServico });

      const result = await itemServicoService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/itens-servico/1');
      expect(result).toEqual(mockItemServico);
    });
  });

  describe('criar', () => {
    it('deve criar novo item de serviço', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockItemServico });

      const result = await itemServicoService.criar({
        categoriaId: 'cat-1',
        descricao: 'Extintor ABC 6kg',
        unidade: 'UN',
        ativo: true
      });

      expect(api.post).toHaveBeenCalledWith('/itens-servico', {
        categoriaId: 'cat-1',
        descricao: 'Extintor ABC 6kg',
        unidade: 'UN',
        ativo: true
      });
      expect(result).toEqual(mockItemServico);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar item de serviço existente', async () => {
      const itemAtualizado = { ...mockItemServico, descricao: 'Extintor CO2' };
      vi.mocked(api.put).mockResolvedValue({ data: itemAtualizado });

      const result = await itemServicoService.atualizar('1', { descricao: 'Extintor CO2' });

      expect(api.put).toHaveBeenCalledWith('/itens-servico/1', { descricao: 'Extintor CO2' });
      expect(result).toEqual(itemAtualizado);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status do item de serviço', async () => {
      const itemToggled = { ...mockItemServico, ativo: false };
      vi.mocked(api.patch).mockResolvedValue({ data: itemToggled });

      const result = await itemServicoService.toggleAtivo('1');

      expect(api.patch).toHaveBeenCalledWith('/itens-servico/1/toggle');
      expect(result).toEqual(itemToggled);
    });
  });

  describe('excluir', () => {
    it('deve excluir item de serviço', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await itemServicoService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/itens-servico/1');
    });
  });
});
