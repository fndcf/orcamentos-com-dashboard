import { describe, it, expect, vi, beforeEach } from 'vitest';
import { limitacaoService } from '../../services/limitacaoService';
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

const mockLimitacao = {
  id: '1',
  texto: 'Esta proposta é válida por 30 dias.',
  ativo: true,
  ordem: 1,
  createdAt: new Date(),
};

describe('limitacaoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todas as limitações', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockLimitacao] });

      const result = await limitacaoService.listar();

      expect(api.get).toHaveBeenCalledWith('/limitacoes');
      expect(result).toEqual([mockLimitacao]);
    });
  });

  describe('listarAtivas', () => {
    it('deve listar apenas limitações ativas', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockLimitacao] });

      const result = await limitacaoService.listarAtivas();

      expect(api.get).toHaveBeenCalledWith('/limitacoes/ativas');
      expect(result).toEqual([mockLimitacao]);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar limitação por id', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockLimitacao });

      const result = await limitacaoService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/limitacoes/1');
      expect(result).toEqual(mockLimitacao);
    });
  });

  describe('criar', () => {
    it('deve criar nova limitação', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockLimitacao });

      const result = await limitacaoService.criar({ texto: 'Esta proposta é válida por 30 dias.', ativo: true });

      expect(api.post).toHaveBeenCalledWith('/limitacoes', { texto: 'Esta proposta é válida por 30 dias.', ativo: true });
      expect(result).toEqual(mockLimitacao);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar limitação existente', async () => {
      const limitacaoAtualizada = { ...mockLimitacao, texto: 'Nova limitação' };
      vi.mocked(api.put).mockResolvedValue({ data: limitacaoAtualizada });

      const result = await limitacaoService.atualizar('1', { texto: 'Nova limitação' });

      expect(api.put).toHaveBeenCalledWith('/limitacoes/1', { texto: 'Nova limitação' });
      expect(result).toEqual(limitacaoAtualizada);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status da limitação', async () => {
      const limitacaoToggled = { ...mockLimitacao, ativo: false };
      vi.mocked(api.patch).mockResolvedValue({ data: limitacaoToggled });

      const result = await limitacaoService.toggleAtivo('1');

      expect(api.patch).toHaveBeenCalledWith('/limitacoes/1/toggle');
      expect(result).toEqual(limitacaoToggled);
    });
  });

  describe('excluir', () => {
    it('deve excluir limitação', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await limitacaoService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/limitacoes/1');
    });
  });
});
