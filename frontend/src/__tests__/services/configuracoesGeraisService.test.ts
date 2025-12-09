import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configuracoesGeraisService } from '../../services/configuracoesGeraisService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const mockConfiguracoes = {
  diasValidadeOrcamento: 30,
  nomeEmpresa: 'FLAMA Proteção',
  cnpjEmpresa: '12345678000199',
  enderecoEmpresa: 'Rua das Flores, 123',
  telefoneEmpresa: '11999999999',
  emailEmpresa: 'contato@flama.com.br',
  logoUrl: 'https://example.com/logo.png',
};

describe('configuracoesGeraisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buscar', () => {
    it('deve buscar configurações gerais', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: mockConfiguracoes });

      const result = await configuracoesGeraisService.buscar();

      expect(api.get).toHaveBeenCalledWith('/configuracoes-gerais');
      expect(result).toEqual(mockConfiguracoes);
    });
  });

  describe('atualizar', () => {
    it('deve atualizar configurações gerais', async () => {
      const configuracoesAtualizadas = { ...mockConfiguracoes, diasValidadeOrcamento: 45 };
      vi.mocked(api.put).mockResolvedValue({ data: configuracoesAtualizadas });

      const result = await configuracoesGeraisService.atualizar({ diasValidadeOrcamento: 45 });

      expect(api.put).toHaveBeenCalledWith('/configuracoes-gerais', { diasValidadeOrcamento: 45 });
      expect(result).toEqual(configuracoesAtualizadas);
    });

    it('deve atualizar múltiplos campos', async () => {
      const dadosAtualizacao = {
        nomeEmpresa: 'Nova Empresa',
        telefoneEmpresa: '21888888888',
      };
      const configuracoesAtualizadas = { ...mockConfiguracoes, ...dadosAtualizacao };
      vi.mocked(api.put).mockResolvedValue({ data: configuracoesAtualizadas });

      const result = await configuracoesGeraisService.atualizar(dadosAtualizacao);

      expect(api.put).toHaveBeenCalledWith('/configuracoes-gerais', dadosAtualizacao);
      expect(result).toEqual(configuracoesAtualizadas);
    });
  });
});
