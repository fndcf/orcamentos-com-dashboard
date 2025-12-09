import { useQuery, useMutation, useQueryClient } from 'react-query';
import { servicoService } from '../services/servicoService';
import { Servico } from '../types';

export function useServicos() {
  return useQuery<Servico[]>('servicos', servicoService.listar);
}

export function useServicosAtivos() {
  return useQuery<Servico[]>('servicos-ativos', servicoService.listarAtivos);
}

export function useCriarServico() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { descricao: string; ativo?: boolean }) => servicoService.criar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servicos');
        queryClient.invalidateQueries('servicos-ativos');
      },
    }
  );
}

export function useAtualizarServico() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: { descricao?: string; ativo?: boolean; ordem?: number } }) =>
      servicoService.atualizar(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('servicos');
        queryClient.invalidateQueries('servicos-ativos');
      },
    }
  );
}

export function useToggleServico() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => servicoService.toggleAtivo(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('servicos');
      queryClient.invalidateQueries('servicos-ativos');
    },
  });
}

export function useExcluirServico() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => servicoService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('servicos');
      queryClient.invalidateQueries('servicos-ativos');
    },
  });
}
