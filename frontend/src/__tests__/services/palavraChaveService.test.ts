import { describe, it, expect, vi, beforeEach } from 'vitest';
import { palavraChaveService } from '../../services/palavraChaveService';
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

const mockPalavraChave = {
  id: '1',
  palavra: 'EXTINTOR',
  prazoDias: 365,
  ativo: true,
  createdAt: new Date(),
};

describe('palavraChaveService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todas as palavras-chave', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockPalavraChave] });

      const result = await palavraChaveService.listar();

      expect(api.get).toHaveBeenCalledWith('/palavras-chave');
      expect(result).toEqual([mockPalavraChave]);
    });
  });

  describe('listarAtivas', () => {
    it('deve listar apenas palavras-chave ativas', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockPalavraChave] });

      const result = await palavraChaveService.listarAtivas();

      expect(api.get).toHaveBeenCalledWith('/palavras-chave/ativas');
      expect(result).toEqual([mockPalavraChave]);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar palavra-chave por id', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockPalavraChave });

      const result = await palavraChaveService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/palavras-chave/1');
      expect(result).toEqual(mockPalavraChave);
    });
  });

  describe('criar', () => {
    it('deve criar nova palavra-chave', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockPalavraChave });

      const result = await palavraChaveService.criar({ palavra: 'EXTINTOR', prazoDias: 365, ativo: true });

      expect(api.post).toHaveBeenCalledWith('/palavras-chave', { palavra: 'EXTINTOR', prazoDias: 365, ativo: true });
      expect(result).toEqual(mockPalavraChave);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar palavra-chave existente', async () => {
      const palavraAtualizada = { ...mockPalavraChave, prazoDias: 180 };
      vi.mocked(api.put).mockResolvedValue({ data: palavraAtualizada });

      const result = await palavraChaveService.atualizar('1', { prazoDias: 180 });

      expect(api.put).toHaveBeenCalledWith('/palavras-chave/1', { prazoDias: 180 });
      expect(result).toEqual(palavraAtualizada);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status da palavra-chave', async () => {
      const palavraToggled = { ...mockPalavraChave, ativo: false };
      vi.mocked(api.patch).mockResolvedValue({ data: palavraToggled });

      const result = await palavraChaveService.toggleAtivo('1');

      expect(api.patch).toHaveBeenCalledWith('/palavras-chave/1/toggle');
      expect(result).toEqual(palavraToggled);
    });
  });

  describe('excluir', () => {
    it('deve excluir palavra-chave', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await palavraChaveService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/palavras-chave/1');
    });
  });
});
