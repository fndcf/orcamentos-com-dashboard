import { useQuery, useMutation, useQueryClient } from 'react-query';
import { configuracoesGeraisService } from '../services/configuracoesGeraisService';
import { ConfiguracoesGerais } from '../types';

export function useConfiguracoesGerais() {
  return useQuery<ConfiguracoesGerais>('configuracoes-gerais', configuracoesGeraisService.buscar);
}

export function useAtualizarConfiguracoesGerais() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Partial<ConfiguracoesGerais>) => configuracoesGeraisService.atualizar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('configuracoes-gerais');
      },
    }
  );
}
