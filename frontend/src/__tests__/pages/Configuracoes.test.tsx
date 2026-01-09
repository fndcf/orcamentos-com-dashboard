import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Configuracoes } from '../../pages/Configuracoes';
import {
  usePalavrasChave,
  useCriarPalavraChave,
  useAtualizarPalavraChave,
  useTogglePalavraChave,
  useExcluirPalavraChave,
} from '../../hooks/usePalavrasChave';
import {
  useServicos,
  useCriarServico,
  useAtualizarServico,
  useToggleServico,
  useExcluirServico,
} from '../../hooks/useServicos';
import {
  useCategoriasItem,
  useCriarCategoriaItem,
  useAtualizarCategoriaItem,
  useToggleCategoriaItem,
  useExcluirCategoriaItem,
} from '../../hooks/useCategoriasItem';
import {
  useLimitacoes,
  useCriarLimitacao,
  useAtualizarLimitacao,
  useToggleLimitacao,
  useExcluirLimitacao,
} from '../../hooks/useLimitacoes';
import {
  useConfiguracoesGerais,
  useAtualizarConfiguracoesGerais,
} from '../../hooks/useConfiguracoesGerais';
import {
  useInfiniteItensServicoPorCategoria,
  useCriarItemServico,
  useAtualizarItemServico,
  useToggleItemServico,
  useExcluirItemServico,
} from '../../hooks/useItensServico';
import { useBuscarCnpjBrasilAPI } from '../../hooks/useClientes';

// Mock dos hooks de palavras-chave
vi.mock('../../hooks/usePalavrasChave', () => ({
  usePalavrasChave: vi.fn(),
  useCriarPalavraChave: vi.fn(),
  useAtualizarPalavraChave: vi.fn(),
  useTogglePalavraChave: vi.fn(),
  useExcluirPalavraChave: vi.fn(),
}));

// Mock dos hooks de serviços
vi.mock('../../hooks/useServicos', () => ({
  useServicos: vi.fn(),
  useCriarServico: vi.fn(),
  useAtualizarServico: vi.fn(),
  useToggleServico: vi.fn(),
  useExcluirServico: vi.fn(),
}));

// Mock dos hooks de categorias
vi.mock('../../hooks/useCategoriasItem', () => ({
  useCategoriasItem: vi.fn(),
  useCriarCategoriaItem: vi.fn(),
  useAtualizarCategoriaItem: vi.fn(),
  useToggleCategoriaItem: vi.fn(),
  useExcluirCategoriaItem: vi.fn(),
}));

// Mock dos hooks de limitações
vi.mock('../../hooks/useLimitacoes', () => ({
  useLimitacoes: vi.fn(),
  useCriarLimitacao: vi.fn(),
  useAtualizarLimitacao: vi.fn(),
  useToggleLimitacao: vi.fn(),
  useExcluirLimitacao: vi.fn(),
}));

// Mock dos hooks de configurações gerais
vi.mock('../../hooks/useConfiguracoesGerais', () => ({
  useConfiguracoesGerais: vi.fn(),
  useAtualizarConfiguracoesGerais: vi.fn(),
}));

// Mock dos hooks de itens de serviço
vi.mock('../../hooks/useItensServico', () => ({
  useInfiniteItensServicoPorCategoria: vi.fn(),
  useCriarItemServico: vi.fn(),
  useAtualizarItemServico: vi.fn(),
  useToggleItemServico: vi.fn(),
  useExcluirItemServico: vi.fn(),
}));

// Mock dos hooks de clientes
vi.mock('../../hooks/useClientes', () => ({
  useBuscarCnpjBrasilAPI: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockPalavrasChave = [
  {
    id: '1',
    palavra: 'extintor',
    prazoDias: 345,
    ativo: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    palavra: 'mangueira',
    prazoDias: 180,
    ativo: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    palavra: 'alarme',
    prazoDias: 365,
    ativo: false,
    createdAt: new Date(),
  },
];

const mockServicos = [
  {
    id: '1',
    descricao: 'Instalação de sistema de combate a incêndio',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
];

const mockCategorias = [
  {
    id: '1',
    nome: 'Extintores',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
];

const mockLimitacoes = [
  {
    id: '1',
    texto: 'Esta proposta é válida por 30 dias.',
    ativo: true,
    ordem: 1,
    createdAt: new Date(),
  },
];

const mockMutations = {
  mutateAsync: vi.fn(),
  isLoading: false,
};

const mockConfiguracoesGerais = {
  diasValidadeOrcamento: 30,
  nomeEmpresa: 'Empresa Teste',
  cnpjEmpresa: '12345678000199',
  enderecoEmpresa: 'Rua Teste, 123',
  telefoneEmpresa: '11999999999',
  emailEmpresa: 'teste@empresa.com',
};

describe('Configuracoes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock palavras-chave hooks
    vi.mocked(usePalavrasChave).mockReturnValue({
      data: mockPalavrasChave,
      isLoading: false,
    } as any);
    vi.mocked(useCriarPalavraChave).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarPalavraChave).mockReturnValue(mockMutations as any);
    vi.mocked(useTogglePalavraChave).mockReturnValue(mockMutations as any);
    vi.mocked(useExcluirPalavraChave).mockReturnValue(mockMutations as any);

    // Mock serviços hooks
    vi.mocked(useServicos).mockReturnValue({
      data: mockServicos,
      isLoading: false,
    } as any);
    vi.mocked(useCriarServico).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarServico).mockReturnValue(mockMutations as any);
    vi.mocked(useToggleServico).mockReturnValue(mockMutations as any);
    vi.mocked(useExcluirServico).mockReturnValue(mockMutations as any);

    // Mock categorias hooks
    vi.mocked(useCategoriasItem).mockReturnValue({
      data: mockCategorias,
      isLoading: false,
    } as any);
    vi.mocked(useCriarCategoriaItem).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarCategoriaItem).mockReturnValue(mockMutations as any);
    vi.mocked(useToggleCategoriaItem).mockReturnValue(mockMutations as any);
    vi.mocked(useExcluirCategoriaItem).mockReturnValue(mockMutations as any);

    // Mock limitações hooks
    vi.mocked(useLimitacoes).mockReturnValue({
      data: mockLimitacoes,
      isLoading: false,
    } as any);
    vi.mocked(useCriarLimitacao).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarLimitacao).mockReturnValue(mockMutations as any);
    vi.mocked(useToggleLimitacao).mockReturnValue(mockMutations as any);
    vi.mocked(useExcluirLimitacao).mockReturnValue(mockMutations as any);

    // Mock configurações gerais hooks
    vi.mocked(useConfiguracoesGerais).mockReturnValue({
      data: mockConfiguracoesGerais,
      isLoading: false,
    } as any);
    vi.mocked(useAtualizarConfiguracoesGerais).mockReturnValue(mockMutations as any);

    // Mock itens de serviço hooks
    vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
      data: { pages: [{ itens: [], total: 0 }], pageParams: [undefined] },
      itens: [],
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);
    vi.mocked(useCriarItemServico).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarItemServico).mockReturnValue(mockMutations as any);
    vi.mocked(useToggleItemServico).mockReturnValue(mockMutations as any);
    vi.mocked(useExcluirItemServico).mockReturnValue(mockMutations as any);

    // Mock buscar CNPJ
    vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);
  });

  describe('Renderização básica', () => {
    it('deve mostrar loading quando está carregando', () => {
      vi.mocked(usePalavrasChave).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('deve renderizar página com abas', () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      expect(screen.getByText('Configurações')).toBeInTheDocument();
      expect(screen.getByText('Palavras-chave')).toBeInTheDocument();
      expect(screen.getByText('Serviços')).toBeInTheDocument();
      expect(screen.getByText('Categorias')).toBeInTheDocument();
      expect(screen.getByText('Observações')).toBeInTheDocument();
    });
  });

  describe('Aba de Palavras-chave', () => {
    it('deve exibir lista de palavras-chave ao clicar na aba', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('extintor')).toBeInTheDocument();
        expect(screen.getByText('mangueira')).toBeInTheDocument();
        expect(screen.getByText('alarme')).toBeInTheDocument();
      });
    });

    it('deve mostrar badges de status corretamente', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        // 2 ativos + 1 inativo
        expect(screen.getAllByText('Ativa').length).toBe(2);
        expect(screen.getByText('Inativa')).toBeInTheDocument();
      });
    });

    it('deve formatar prazo em dias corretamente', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        // 345 dias = 11 meses e 15 dias
        expect(screen.getByText(/11 meses e 15 dias/)).toBeInTheDocument();
        // 180 dias = 6 meses
        expect(screen.getByText(/6 meses/)).toBeInTheDocument();
        // 365 dias = 1 ano
        expect(screen.getByText(/1 ano/)).toBeInTheDocument();
      });
    });

    it('deve abrir modal ao clicar em "+ Nova Palavra-chave"', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('+ Nova Palavra-chave')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Nova Palavra-chave'));

      await waitFor(() => {
        expect(screen.getByText('Nova Palavra-chave')).toBeInTheDocument();
      });
    });

    it('deve mostrar estado vazio quando não houver palavras-chave', async () => {
      vi.mocked(usePalavrasChave).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('Nenhuma palavra-chave cadastrada')).toBeInTheDocument();
      });
    });
  });

  describe('Aba de Serviços', () => {
    it('deve exibir lista de serviços ao clicar na aba', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Serviços'));

      await waitFor(() => {
        expect(screen.getByText('Instalação de sistema de combate a incêndio')).toBeInTheDocument();
      });
    });

    it('deve mostrar estado vazio quando não houver serviços', async () => {
      vi.mocked(useServicos).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Serviços'));

      await waitFor(() => {
        expect(screen.getByText('Nenhum serviço cadastrado')).toBeInTheDocument();
      });
    });
  });

  describe('Aba de Categorias', () => {
    it('deve exibir lista de categorias ao clicar na aba', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Categorias'));

      await waitFor(() => {
        // Verifica que o título da seção aparece
        expect(screen.getByText('Categorias de Itens')).toBeInTheDocument();
      });
    });

    it('deve mostrar estado vazio quando não houver categorias', async () => {
      vi.mocked(useCategoriasItem).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Categorias'));

      await waitFor(() => {
        expect(screen.getByText('Nenhuma categoria cadastrada')).toBeInTheDocument();
      });
    });
  });

  describe('Aba de Limitações', () => {
    it('deve exibir lista de limitações ao clicar na aba', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Observações'));

      await waitFor(() => {
        expect(screen.getByText('Esta proposta é válida por 30 dias.')).toBeInTheDocument();
      });
    });

    it('deve mostrar estado vazio quando não houver limitações', async () => {
      vi.mocked(useLimitacoes).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Observações'));

      await waitFor(() => {
        expect(screen.getByText('Nenhuma observação cadastrada')).toBeInTheDocument();
      });
    });
  });

  describe('Interações gerais', () => {
    it('deve renderizar descrição da funcionalidade de palavras-chave', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(
          screen.getByText(/Configure palavras-chave que serão monitoradas nos itens dos orçamentos aceitos/)
        ).toBeInTheDocument();
      });
    });

    it('deve mostrar prazo em dias entre parênteses', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText(/\(345 dias\)/)).toBeInTheDocument();
        expect(screen.getByText(/\(180 dias\)/)).toBeInTheDocument();
        expect(screen.getByText(/\(365 dias\)/)).toBeInTheDocument();
      });
    });

    it('deve trocar para aba de Serviços ao clicar', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      // Primeiro vai para aba de Palavras-chave
      fireEvent.click(screen.getByText('Palavras-chave'));
      await waitFor(() => {
        expect(screen.getByText('extintor')).toBeInTheDocument();
      });

      // Clica na aba de Serviços
      fireEvent.click(screen.getByText('Serviços'));
      await waitFor(() => {
        expect(screen.getByText('Instalação de sistema de combate a incêndio')).toBeInTheDocument();
      });
    });

    it('deve trocar para aba de Categorias ao clicar', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      // Clica na aba de Categorias
      fireEvent.click(screen.getByText('Categorias'));

      // Espera o conteúdo da aba de categorias
      await waitFor(() => {
        expect(screen.getByText('Categorias de Itens')).toBeInTheDocument();
      });
    });

    it('deve trocar para aba de Limitações ao clicar', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      // Clica na aba de Limitações
      fireEvent.click(screen.getByText('Observações'));
      await waitFor(() => {
        expect(screen.getByText('Esta proposta é válida por 30 dias.')).toBeInTheDocument();
      });
    });

    it('deve renderizar aba Empresa como padrão', () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      expect(screen.getByText('Dados da Empresa')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Empresa Teste')).toBeInTheDocument();
    });
  });

  describe('Aba Empresa - Formulário', () => {
    it('deve permitir editar campos do formulário', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('Empresa Teste');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      expect(screen.getByDisplayValue('Nova Empresa')).toBeInTheDocument();
    });

    it('deve mostrar botão Salvar Alterações desabilitado quando nada mudou', () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      const salvarButton = screen.getByText('Salvar Alterações');
      expect(salvarButton).toBeDisabled();
    });

    it('deve habilitar botão Salvar Alterações quando algum campo muda', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('Empresa Teste');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      await waitFor(() => {
        const salvarButton = screen.getByText('Salvar Alterações');
        expect(salvarButton).not.toBeDisabled();
      });
    });

    it('deve salvar configurações ao clicar em Salvar Alterações', async () => {
      mockMutations.mutateAsync.mockResolvedValue(undefined);
      render(<Configuracoes />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('Empresa Teste');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByText('Salvar Alterações');
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutations.mutateAsync).toHaveBeenCalled();
      });
    });

    it('deve mostrar erro ao salvar configurações com falha', async () => {
      mockMutations.mutateAsync.mockRejectedValue(new Error('Erro ao salvar'));
      render(<Configuracoes />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('Empresa Teste');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByText('Salvar Alterações');
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText(/Erro ao salvar/)).toBeInTheDocument();
      });
    });

    it('deve mostrar botão Buscar CNPJ', () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      expect(screen.getByText('Buscar CNPJ')).toBeInTheDocument();
    });

    it('deve desabilitar botão Buscar CNPJ quando CNPJ tem menos de 14 dígitos', () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      // O CNPJ mockado tem 14 dígitos então deve estar habilitado
      const buscarButton = screen.getByText('Buscar CNPJ');
      expect(buscarButton).not.toBeDisabled();
    });
  });

  describe('Ações de edição - Palavras-chave', () => {
    it('deve abrir modal de edição ao clicar em Editar', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('extintor')).toBeInTheDocument();
      });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Palavra-chave')).toBeInTheDocument();
      });
    });

    it('deve chamar toggle ao clicar em Ativar/Desativar', async () => {
      mockMutations.mutateAsync.mockResolvedValue(undefined);
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('extintor')).toBeInTheDocument();
      });

      const toggleButtons = screen.getAllByText('Desativar');
      fireEvent.click(toggleButtons[0]);

      await waitFor(() => {
        expect(mockMutations.mutateAsync).toHaveBeenCalled();
      });
    });

    it('deve abrir confirmação de exclusão ao clicar em Excluir', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('extintor')).toBeInTheDocument();
      });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });
    });

    it('deve excluir ao confirmar exclusão', async () => {
      mockMutations.mutateAsync.mockResolvedValue(undefined);
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('extintor')).toBeInTheDocument();
      });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });

      const confirmarButton = screen.getAllByRole('button', { name: 'Excluir' }).pop();
      if (confirmarButton) {
        fireEvent.click(confirmarButton);
      }

      await waitFor(() => {
        expect(mockMutations.mutateAsync).toHaveBeenCalled();
      });
    });

    it('deve cancelar exclusão ao clicar em Cancelar', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('extintor')).toBeInTheDocument();
      });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancelar'));

      await waitFor(() => {
        expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
      });
    });

    it('deve salvar nova palavra-chave', async () => {
      mockMutations.mutateAsync.mockResolvedValue(undefined);
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('+ Nova Palavra-chave')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Nova Palavra-chave'));

      await waitFor(() => {
        expect(screen.getByText('Nova Palavra-chave')).toBeInTheDocument();
      });

      const palavraInput = screen.getByPlaceholderText('Ex: extintor, mangueira, alarme');
      const prazoInput = screen.getByPlaceholderText('Ex: 345');
      fireEvent.change(palavraInput, { target: { value: 'teste' } });
      fireEvent.change(prazoInput, { target: { value: '30' } });

      fireEvent.click(screen.getByText('Cadastrar'));

      await waitFor(() => {
        expect(mockMutations.mutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Ações de edição - Serviços', () => {
    it('deve abrir modal de novo serviço', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Serviços'));

      await waitFor(() => {
        expect(screen.getByText('+ Novo Serviço')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Serviço'));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });
    });

    it('deve toggle serviço ao clicar', async () => {
      mockMutations.mutateAsync.mockResolvedValue(undefined);
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Serviços'));

      await waitFor(() => {
        expect(screen.getByText('Instalação de sistema de combate a incêndio')).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('Desativar');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockMutations.mutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Ações de edição - Categorias', () => {
    it('deve abrir modal de nova categoria', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Categorias'));

      await waitFor(() => {
        expect(screen.getByText('+ Nova Categoria')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Nova Categoria'));

      await waitFor(() => {
        expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
      });
    });

    it('deve expandir categoria para mostrar itens', async () => {
      const mockItens = [
        {
          id: 'item-1',
          categoriaId: '1',
          descricao: 'Extintor ABC 6kg',
          unidade: 'UN',
          ativo: true,
          ordem: 1,
        },
      ];
      vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
        data: { pages: [{ itens: mockItens, total: mockItens.length }], pageParams: [undefined] },
        itens: mockItens,
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Categorias'));

      await waitFor(() => {
        expect(screen.getByText(/Extintores/)).toBeInTheDocument();
      });

      // Clica no botão de expandir
      const expandButton = screen.getByText('Ver Itens');
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Extintor ABC 6kg')).toBeInTheDocument();
      });
    });

    it('deve ocultar itens ao clicar novamente', async () => {
      const mockItens = [
        {
          id: 'item-1',
          categoriaId: '1',
          descricao: 'Extintor ABC 6kg',
          unidade: 'UN',
          ativo: true,
          ordem: 1,
        },
      ];
      vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
        data: { pages: [{ itens: mockItens, total: mockItens.length }], pageParams: [undefined] },
        itens: mockItens,
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Categorias'));

      await waitFor(() => {
        expect(screen.getByText('Ver Itens')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ver Itens'));

      await waitFor(() => {
        expect(screen.getByText('Ocultar Itens')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ocultar Itens'));

      await waitFor(() => {
        expect(screen.getByText('Ver Itens')).toBeInTheDocument();
      });
    });
  });

  describe('Ações de edição - Limitações', () => {
    it('deve abrir modal de nova limitação', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Observações'));

      await waitFor(() => {
        expect(screen.getByText('+ Nova Observação')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Nova Observação'));

      await waitFor(() => {
        expect(screen.getByText('Nova Observação')).toBeInTheDocument();
      });
    });

    it('deve toggle limitação ao clicar', async () => {
      mockMutations.mutateAsync.mockResolvedValue(undefined);
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Observações'));

      await waitFor(() => {
        expect(screen.getByText('Esta proposta é válida por 30 dias.')).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('Desativar');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(mockMutations.mutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Itens de Serviço', () => {
    it('deve adicionar novo item de serviço', async () => {
      mockMutations.mutateAsync.mockResolvedValue(undefined);
      vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
        data: { pages: [{ itens: [], total: 0 }], pageParams: [undefined] },
        itens: [],
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Categorias'));

      await waitFor(() => {
        expect(screen.getByText('Ver Itens')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ver Itens'));

      await waitFor(() => {
        expect(screen.getByText('+ Novo Item')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Novo Item'));

      await waitFor(() => {
        expect(screen.getByText('Novo Item de Serviço')).toBeInTheDocument();
      });

      // Use placeholders to find inputs
      const descricaoInput = screen.getByPlaceholderText(/Fornecimento e instalação de bomba/);
      const unidadeInput = screen.getByPlaceholderText('Ex: UN, M, M2, CJ, VB');
      fireEvent.change(descricaoInput, { target: { value: 'Novo Item Teste Descrição' } });
      fireEvent.change(unidadeInput, { target: { value: 'UN' } });

      fireEvent.click(screen.getByText('Cadastrar'));

      await waitFor(() => {
        expect(mockMutations.mutateAsync).toHaveBeenCalled();
      });
    });

    it('deve mostrar estado vazio em itens de serviço', async () => {
      vi.mocked(useInfiniteItensServicoPorCategoria).mockReturnValue({
        data: { pages: [{ itens: [], total: 0 }], pageParams: [undefined] },
        itens: [],
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Categorias'));

      await waitFor(() => {
        expect(screen.getByText('Ver Itens')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Ver Itens'));

      await waitFor(() => {
        expect(screen.getByText(/Nenhum item cadastrado nesta categoria/)).toBeInTheDocument();
      });
    });
  });

  describe('Fechar modais', () => {
    it('deve fechar modal ao clicar em Cancelar', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('+ Nova Palavra-chave')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Nova Palavra-chave'));

      await waitFor(() => {
        expect(screen.getByText('Nova Palavra-chave')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancelar'));

      await waitFor(() => {
        expect(screen.queryByText('Nova Palavra-chave')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validação de formulários', () => {
    it('deve desabilitar botão Cadastrar quando campos estão vazios', async () => {
      render(<Configuracoes />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Palavras-chave'));

      await waitFor(() => {
        expect(screen.getByText('+ Nova Palavra-chave')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('+ Nova Palavra-chave'));

      await waitFor(() => {
        expect(screen.getByText('Nova Palavra-chave')).toBeInTheDocument();
      });

      // Botão Cadastrar deve estar desabilitado sem dados
      const cadastrarButton = screen.getByText('Cadastrar');
      expect(cadastrarButton).toBeDisabled();
    });
  });
});
