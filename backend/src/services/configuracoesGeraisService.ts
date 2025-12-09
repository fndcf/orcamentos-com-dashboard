import { configuracoesGeraisRepository } from '../repositories/configuracoesGeraisRepository';
import { ConfiguracoesGerais } from '../models';
import { ValidationError } from '../utils/errors';

export const configuracoesGeraisService = {
  async buscar(): Promise<ConfiguracoesGerais> {
    return configuracoesGeraisRepository.get();
  },

  async atualizar(data: Partial<ConfiguracoesGerais>): Promise<ConfiguracoesGerais> {
    // Validações
    if (data.diasValidadeOrcamento !== undefined) {
      if (data.diasValidadeOrcamento < 1 || data.diasValidadeOrcamento > 365) {
        throw new ValidationError('Dias de validade deve ser entre 1 e 365');
      }
    }

    if (data.cnpjEmpresa !== undefined && data.cnpjEmpresa.trim() !== '') {
      // Remove formatação do CNPJ para validar
      const cnpjLimpo = data.cnpjEmpresa.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) {
        throw new ValidationError('CNPJ inválido');
      }
    }

    if (data.emailEmpresa !== undefined && data.emailEmpresa.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.emailEmpresa)) {
        throw new ValidationError('Email inválido');
      }
    }

    return configuracoesGeraisRepository.update(data);
  },
};
