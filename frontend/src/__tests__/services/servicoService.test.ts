import { describe, it, expect, vi, beforeEach } from 'vitest';
import { servicoService } from '../../services/servicoService';
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

const mockServico = {
  id: '1',
  descricao: 'Instalação de extintores',
  ativo: true,
  ordem: 1,
  createdAt: new Date(),
};

describe('servicoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listar', () => {
    it('deve listar todos os serviços', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockServico] });

      const result = await servicoService.listar();

      expect(api.get).toHaveBeenCalledWith('/servicos');
      expect(result).toEqual([mockServico]);
    });
  });

  describe('listarAtivos', () => {
    it('deve listar apenas serviços ativos', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: [mockServico] });

      const result = await servicoService.listarAtivos();

      expect(api.get).toHaveBeenCalledWith('/servicos/ativos');
      expect(result).toEqual([mockServico]);
    });
  });

  describe('buscarPorId', () => {
    it('deve buscar serviço por id', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockServico });

      const result = await servicoService.buscarPorId('1');

      expect(api.get).toHaveBeenCalledWith('/servicos/1');
      expect(result).toEqual(mockServico);
    });
  });

  describe('criar', () => {
    it('deve criar novo serviço', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: mockServico });

      const result = await servicoService.criar({ descricao: 'Instalação de extintores', ativo: true });

      expect(api.post).toHaveBeenCalledWith('/servicos', { descricao: 'Instalação de extintores', ativo: true });
      expect(result).toEqual(mockServico);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar serviço existente', async () => {
      const servicoAtualizado = { ...mockServico, descricao: 'Manutenção de hidrantes' };
      vi.mocked(api.put).mockResolvedValue({ data: servicoAtualizado });

      const result = await servicoService.atualizar('1', { descricao: 'Manutenção de hidrantes' });

      expect(api.put).toHaveBeenCalledWith('/servicos/1', { descricao: 'Manutenção de hidrantes' });
      expect(result).toEqual(servicoAtualizado);
    });
  });

  describe('toggleAtivo', () => {
    it('deve alternar status do serviço', async () => {
      const servicoToggled = { ...mockServico, ativo: false };
      vi.mocked(api.patch).mockResolvedValue({ data: servicoToggled });

      const result = await servicoService.toggleAtivo('1');

      expect(api.patch).toHaveBeenCalledWith('/servicos/1/toggle');
      expect(result).toEqual(servicoToggled);
    });
  });

  describe('excluir', () => {
    it('deve excluir serviço', async () => {
      vi.mocked(api.delete).mockResolvedValue({});

      await servicoService.excluir('1');

      expect(api.delete).toHaveBeenCalledWith('/servicos/1');
    });
  });
});
