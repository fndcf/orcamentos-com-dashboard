import { useQuery, useMutation, useQueryClient } from 'react-query';
import { clienteService } from '../services/clienteService';
import { Cliente } from '../types';

export function useClientes() {
  return useQuery('clientes', clienteService.listar, {
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCliente(id: string) {
  return useQuery(['cliente', id], () => clienteService.buscarPorId(id), {
    enabled: !!id,
  });
}

export function usePesquisarClientes(termo: string) {
  return useQuery(
    ['clientes', 'pesquisa', termo],
    () => clienteService.pesquisar(termo),
    {
      enabled: termo.length >= 2,
      staleTime: 30 * 1000, // 30 segundos
    }
  );
}

export function useCriarCliente() {
  const queryClient = useQueryClient();

  return useMutation(
    (data: Omit<Cliente, 'id' | 'createdAt'>) => clienteService.criar(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('clientes');
      },
    }
  );
}

export function useAtualizarCliente() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ id, data }: { id: string; data: Partial<Cliente> }) =>
      clienteService.atualizar(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries('clientes');
        queryClient.invalidateQueries(['cliente', id]);
      },
    }
  );
}

export function useExcluirCliente() {
  const queryClient = useQueryClient();

  return useMutation((id: string) => clienteService.excluir(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('clientes');
    },
  });
}

export function useBuscarCnpjBrasilAPI() {
  return useMutation((cnpj: string) => clienteService.buscarCnpjBrasilAPI(cnpj));
}
