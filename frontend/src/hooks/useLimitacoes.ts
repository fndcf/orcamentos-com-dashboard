import { useQuery, useMutation, useQueryClient } from 'react-query';
import { limitacaoService } from '../services/limitacaoService';
import { Limitacao } from '../types';

export function useLimitacoes() {
  return useQuery<Limitacao[]>('limitacoes', limitacaoService.listar);
}

export function useLimitacoesAtivas() {
  return useQuery<Limitacao[]>('limitacoes-ativas', limitacaoService.listarAtivas);
}

export function useCriarLimitacao() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { texto: string; ativo?: boolean }) => limitacaoService.criar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('limitacoes');
        queryClient.invalidateQueries('limitacoes-ativas');
      },
    }
  );
}

export function useAtualizarLimitacao() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: { texto?: string; ativo?: boolean; ordem?: number } }) =>
      limitacaoService.atualizar(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('limitacoes');
        queryClient.invalidateQueries('limitacoes-ativas');
      },
    }
  );
}

export function useToggleLimitacao() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => limitacaoService.toggleAtivo(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('limitacoes');
      queryClient.invalidateQueries('limitacoes-ativas');
    },
  });
}

export function useExcluirLimitacao() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => limitacaoService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('limitacoes');
      queryClient.invalidateQueries('limitacoes-ativas');
    },
  });
}
