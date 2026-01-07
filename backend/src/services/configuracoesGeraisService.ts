import { configuracoesGeraisRepository } from '../repositories/configuracoesGeraisRepository';
import { historicoValoresRepository } from '../repositories/historicoValoresRepository';
import { ConfiguracoesGerais } from '../models';
import { ValidationError } from '../utils/errors';

// Função auxiliar para verificar se os valores de impostos/custo fixo mudaram
function valoresFinanceirosMudaram(
  existente: ConfiguracoesGerais,
  novosValores: Partial<ConfiguracoesGerais>
): boolean {
  if (
    novosValores.custoFixoMensal !== undefined &&
    novosValores.custoFixoMensal !== (existente.custoFixoMensal || 0)
  ) {
    return true;
  }
  if (
    novosValores.impostoMaterial !== undefined &&
    novosValores.impostoMaterial !== (existente.impostoMaterial || 0)
  ) {
    return true;
  }
  if (
    novosValores.impostoServico !== undefined &&
    novosValores.impostoServico !== (existente.impostoServico || 0)
  ) {
    return true;
  }
  return false;
}

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

    // Buscar configurações atuais para verificar se valores financeiros mudaram
    const existente = await configuracoesGeraisRepository.get();
    const deveSalvarHistorico = valoresFinanceirosMudaram(existente, data);

    const updated = await configuracoesGeraisRepository.update(data);

    // Salvar histórico se os valores financeiros mudaram
    if (deveSalvarHistorico) {
      await historicoValoresRepository.salvarHistoricoConfiguracao({
        dataVigencia: new Date(),
        custoFixoMensal: updated.custoFixoMensal || 0,
        impostoMaterial: updated.impostoMaterial || 0,
        impostoServico: updated.impostoServico || 0,
      });
    }

    return updated;
  },
};
