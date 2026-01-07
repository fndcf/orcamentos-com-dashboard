import api from './api';
import { HistoricoValorItem, HistoricoConfiguracao } from '../types';

export const historicoValoresService = {
  async buscarHistoricoItens(dataInicio: string, dataFim: string): Promise<HistoricoValorItem[]> {
    const response = await api.get('/historico-valores/itens', {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  async buscarHistoricoConfiguracoes(dataInicio: string, dataFim: string): Promise<HistoricoConfiguracao[]> {
    const response = await api.get('/historico-valores/configuracoes', {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },
};
