import { useQuery } from 'react-query';
import { historicoValoresService } from '../services/historicoValoresService';
import { HistoricoValorItem, HistoricoConfiguracao } from '../types';

export function useHistoricoItens(dataInicio: string, dataFim: string, enabled = true) {
  return useQuery<HistoricoValorItem[]>(
    ['historico-itens', dataInicio, dataFim],
    () => historicoValoresService.buscarHistoricoItens(dataInicio, dataFim),
    {
      enabled: enabled && !!dataInicio && !!dataFim,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
}

export function useHistoricoConfiguracoes(dataInicio: string, dataFim: string, enabled = true) {
  return useQuery<HistoricoConfiguracao[]>(
    ['historico-configuracoes', dataInicio, dataFim],
    () => historicoValoresService.buscarHistoricoConfiguracoes(dataInicio, dataFim),
    {
      enabled: enabled && !!dataInicio && !!dataFim,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
}
