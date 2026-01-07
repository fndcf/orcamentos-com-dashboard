import { historicoValoresRepository } from '../repositories/historicoValoresRepository';
import { HistoricoValorItem, HistoricoConfiguracao } from '../models';
import { ValidationError } from '../utils/errors';

export const historicoValoresService = {
  async buscarHistoricoItensPorPeriodo(
    dataInicio: string,
    dataFim: string
  ): Promise<HistoricoValorItem[]> {
    if (!dataInicio || !dataFim) {
      throw new ValidationError('Data início e data fim são obrigatórias');
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new ValidationError('Datas inválidas');
    }

    // Ajustar fim para o final do dia
    fim.setHours(23, 59, 59, 999);

    return historicoValoresRepository.buscarHistoricoItensPorPeriodo(inicio, fim);
  },

  async buscarHistoricoConfiguracoesPorPeriodo(
    dataInicio: string,
    dataFim: string
  ): Promise<HistoricoConfiguracao[]> {
    if (!dataInicio || !dataFim) {
      throw new ValidationError('Data início e data fim são obrigatórias');
    }

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new ValidationError('Datas inválidas');
    }

    // Ajustar fim para o final do dia
    fim.setHours(23, 59, 59, 999);

    return historicoValoresRepository.buscarHistoricoConfiguracoesPorPeriodo(inicio, fim);
  },
};
