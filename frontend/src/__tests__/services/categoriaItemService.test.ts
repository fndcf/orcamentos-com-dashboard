import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoriaItemService } from '../../services/categoriaItemService';
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

const mockCategoria = {
  id: '1',
  nome: 'Extintores',
  ativo: true,
  ordem: 1,
  createdAt: new Date(),
};

describe('categoriaItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todas as categorias', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockCategoria] });

      const result = await categoriaItemService.listar();

      expect(api.get).toHaveBeenCalledWith('/categorias-item');
      expect(result).toEqual([mockCategoria]);
    });
  });

  describe('listarAtivas', () => {
    it('deve listar apenas categorias ativas', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockCategoria] });

      const result = await categoriaItemService.listarAtivas();

      expect(api.get).toHaveBeenCalledWith('/categorias-item/ativas');
      expect(result).toEqual([mockCategoria]);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar categoria por id', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockCategoria });

      const result = await categoriaItemService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/categorias-item/1');
      expect(result).toEqual(mockCategoria);
    });
  });

  describe('criar', () => {
    it('deve criar nova categoria', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockCategoria });

      const result = await categoriaItemService.criar({ nome: 'Extintores', ativo: true });

      expect(api.post).toHaveBeenCalledWith('/categorias-item', { nome: 'Extintores', ativo: true });
      expect(result).toEqual(mockCategoria);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar categoria existente', async () => {
      const categoriaAtualizada = { ...mockCategoria, nome: 'Hidrantes' };
      vi.mocked(api.put).mockResolvedValue({ data: categoriaAtualizada });

      const result = await categoriaItemService.atualizar('1', { nome: 'Hidrantes' });

      expect(api.put).toHaveBeenCalledWith('/categorias-item/1', { nome: 'Hidrantes' });
      expect(result).toEqual(categoriaAtualizada);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status da categoria', async () => {
      const categoriaToggled = { ...mockCategoria, ativo: false };
      vi.mocked(api.patch).mockResolvedValue({ data: categoriaToggled });

      const result = await categoriaItemService.toggleAtivo('1');

      expect(api.patch).toHaveBeenCalledWith('/categorias-item/1/toggle');
      expect(result).toEqual(categoriaToggled);
    });
  });

  describe('excluir', () => {
    it('deve excluir categoria', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await categoriaItemService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/categorias-item/1');
    });
  });
});
