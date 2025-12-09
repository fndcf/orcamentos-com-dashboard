import { useQuery, useMutation, useQueryClient } from 'react-query';
import { palavraChaveService } from '../services/palavraChaveService';
import { PalavraChave } from '../types';

export function usePalavrasChave() {
  return useQuery<PalavraChave[]>('palavrasChave', palavraChaveService.listar);
}

export function usePalavrasChaveAtivas() {
  return useQuery<PalavraChave[]>('palavrasChaveAtivas', palavraChaveService.listarAtivas);
}

export function useCriarPalavraChave() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { palavra: string; prazoDias: number; ativo?: boolean }) =>
      palavraChaveService.criar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('palavrasChave');
        queryClient.invalidateQueries('palavrasChaveAtivas');
      },
    }
  );
}

export function useAtualizarPalavraChave() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: { palavra?: string; prazoDias?: number; ativo?: boolean } }) =>
      palavraChaveService.atualizar(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('palavrasChave');
        queryClient.invalidateQueries('palavrasChaveAtivas');
      },
    }
  );
}

export function useTogglePalavraChave() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => palavraChaveService.toggleAtivo(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('palavrasChave');
      queryClient.invalidateQueries('palavrasChaveAtivas');
    },
  });
}

export function useExcluirPalavraChave() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => palavraChaveService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('palavrasChave');
      queryClient.invalidateQueries('palavrasChaveAtivas');
    },
  });
}
