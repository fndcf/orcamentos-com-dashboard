import { historicoValoresRepository } from '../repositories/historicoValoresRepository';
import { HistoricoValorItem, HistoricoConfiguracao } from '../models';
import { ValidationError } from '../utils/errors';
import { inicioDoDia, fimDoDia } from '../utils/datas';

export const historicoValoresService = {
  async buscarHistoricoItensPorPeriodo(
    dataInicio: string,
    dataFim: string
  ): Promise<HistoricoValorItem[]> {
    if (!dataInicio || !dataFim) {
      throw new ValidationError('Data início e data fim são obrigatórias');
    }

    // Dias inteiros no horário de Brasília (o servidor roda em UTC)
    const inicio = inicioDoDia(dataInicio);
    const fim = fimDoDia(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new ValidationError('Datas inválidas');
    }

    return historicoValoresRepository.buscarHistoricoItensPorPeriodo(inicio, fim);
  },

  async buscarHistoricoConfiguracoesPorPeriodo(
    dataInicio: string,
    dataFim: string
  ): Promise<HistoricoConfiguracao[]> {
    if (!dataInicio || !dataFim) {
      throw new ValidationError('Data início e data fim são obrigatórias');
    }

    // Dias inteiros no horário de Brasília (o servidor roda em UTC)
    const inicio = inicioDoDia(dataInicio);
    const fim = fimDoDia(dataFim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new ValidationError('Datas inválidas');
    }

    return historicoValoresRepository.buscarHistoricoConfiguracoesPorPeriodo(inicio, fim);
  },
};
