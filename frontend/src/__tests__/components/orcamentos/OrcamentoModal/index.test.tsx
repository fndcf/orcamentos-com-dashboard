import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OrcamentoModal } from '../../../../components/orcamentos/OrcamentoModal';
import { useClientesInfiniteScroll, useCliente } from '../../../../hooks/useClientes';
import { useServicosAtivos } from '../../../../hooks/useServicos';
import { useCategoriasItemAtivas } from '../../../../hooks/useCategoriasItem';
import { useLimitacoesAtivas } from '../../../../hooks/useLimitacoes';
import { useConfiguracoesGerais } from '../../../../hooks/useConfiguracoesGerais';

vi.mock('../../../../hooks/useClientes', () => ({
  useClientesInfiniteScroll: vi.fn(),
  useCliente: vi.fn(),
  useCriarCliente: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  })),
  useBuscarCnpjBrasilAPI: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock('../../../../hooks/useServicos', () => ({
  useServicosAtivos: vi.fn(),
}));

vi.mock('../../../../hooks/useCategoriasItem', () => ({
  useCategoriasItemAtivas: vi.fn(),
}));

vi.mock('../../../../hooks/useLimitacoes', () => ({
  useLimitacoesAtivas: vi.fn(),
}));

vi.mock('../../../../hooks/useItensServico', () => ({
  useItensServicoPorCategoria: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useItensServicoAtivosPorCategoria: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useInfiniteItensServicoAtivos: vi.fn(() => ({
    itens: [],
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  })),
}));

vi.mock('../../../../hooks/useConfiguracoesGerais', () => ({
  useConfiguracoesGerais: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockClientes = [
  {
    id: 'cliente1',
    razaoSocial: 'Cliente Teste LTDA',
    cnpj: '12345678000190',
    tipoPessoa: 'juridica',
  },
  {
    id: 'cliente2',
    razaoSocial: 'Outro Cliente',
    cnpj: '98765432000110',
    tipoPessoa: 'juridica',
  },
];

const mockServicos = [
  { id: 'serv1', descricao: 'Instalação de Hidrantes', ativo: true },
  { id: 'serv2', descricao: 'Manutenção de Extintores', ativo: true },
];

const mockCategorias = [
  { id: 'cat1', nome: 'Bomba de Incêndio', ativo: true, ordem: 1 },
  { id: 'cat2', nome: 'Sistema de Hidrantes', ativo: true, ordem: 2 },
];

const mockLimitacoes = [
  { id: 'lim1', texto: 'Limitação 1', ativo: true, ordem: 1 },
  { id: 'lim2', texto: 'Limitação 2', ativo: true, ordem: 2 },
];

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

describe('OrcamentoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useClientesInfiniteScroll).mockReturnValue({
      data: {
        pages: [{ items: mockClientes, total: mockClientes.length, hasMore: false }],
        pageParams: [1],
      },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    vi.mocked(useCliente).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    vi.mocked(useServicosAtivos).mockReturnValue({
      data: mockServicos,
      isLoading: false,
    } as any);

    vi.mocked(useCategoriasItemAtivas).mockReturnValue({
      data: mockCategorias,
      isLoading: false,
    } as any);

    vi.mocked(useLimitacoesAtivas).mockReturnValue({
      data: mockLimitacoes,
      isLoading: false,
    } as any);

    vi.mocked(useConfiguracoesGerais).mockReturnValue({
      data: { proximoNumeroOrcamento: 1 },
      isLoading: false,
    } as any);
  });

  // Helper para selecionar cliente via campo de busca
  const selectCliente = async (clienteNome: string) => {
    const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
    fireEvent.focus(searchInput);
    await waitFor(() => {
      expect(screen.getByText(clienteNome)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(clienteNome));
  };

  describe('Renderização básica', () => {
    it('deve renderizar modal com título Novo Orçamento', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Novo Orçamento')).toBeInTheDocument();
    });

    it('deve renderizar seletor de cliente', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Cliente *')).toBeInTheDocument();
    });

    it('não deve renderizar quando fechado', () => {
      render(
        <OrcamentoModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText('Novo Orçamento')).not.toBeInTheDocument();
    });
  });

  describe('Validação de orçamento simples', () => {
    it('deve mostrar erro quando cliente não selecionado', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Encontra o botão de submit
      const submitButtons = screen.getAllByRole('button');
      const salvarButton = submitButtons.find(btn =>
        btn.textContent?.includes('Orçamento') && btn.getAttribute('type') === 'submit'
      );
      if (salvarButton) {
        fireEvent.click(salvarButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Selecione um cliente ou cadastre um novo')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro quando itens vazios', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Selecionar cliente via campo de busca
      await selectCliente('Cliente Teste LTDA');

      // Encontra o botão de submit
      const submitButtons = screen.getAllByRole('button');
      const salvarButton = submitButtons.find(btn =>
        btn.textContent?.includes('Orçamento') && btn.getAttribute('type') === 'submit'
      );
      if (salvarButton) {
        fireEvent.click(salvarButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Adicione pelo menos um item com descrição')).toBeInTheDocument();
      });
    });
  });

  describe('Edição de orçamento existente', () => {
    it('deve preencher dados de orçamento simples existente', () => {
      const orcamentoExistente = {
        id: 'orc1',
        numero: 123,
        versao: 1,
        tipo: 'simples' as const,
        clienteId: 'cliente1',
        clienteNome: 'Cliente Teste LTDA',
        clienteCnpj: '12345678000190',
        itens: [
          { descricao: 'Item teste', quantidade: 2, unidade: 'UN', valorUnitario: 100, valorTotal: 200 },
        ],
        observacoes: 'Obs teste',
        consultor: 'João',
        contato: '11999999999',
        status: 'aberto' as const,
        dataEmissao: new Date(),
        dataValidade: new Date(),
        createdAt: new Date(),
        valorTotal: 200,
      };

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          orcamento={orcamentoExistente as any}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Editar Orçamento\s+\d+/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Obs teste')).toBeInTheDocument();
      expect(screen.getByDisplayValue('João')).toBeInTheDocument();
    });

    it('deve preencher dados de orçamento completo existente', () => {
      const orcamentoCompleto = {
        id: 'orc2',
        numero: 456,
        versao: 1,
        tipo: 'completo' as const,
        clienteId: 'cliente1',
        clienteNome: 'Cliente Teste LTDA',
        clienteCnpj: '12345678000190',
        servicoId: 'serv1',
        itens: [],
        itensCompleto: [
          {
            etapa: 'residencial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Bomba de Incêndio',
            descricao: 'Item completo',
            unidade: 'UN',
            quantidade: 1,
            valorUnitarioMaoDeObra: 100,
            valorUnitarioMaterial: 50,
            valorTotalMaoDeObra: 100,
            valorTotalMaterial: 50,
            valorTotal: 150,
          },
        ],
        limitacoesSelecionadas: ['Limitação 1'],
        prazoExecucaoServicos: 25,
        prazoVistoriaBombeiros: 35,
        condicaoPagamento: 'parcelado' as const,
        parcelamentoTexto: '3x sem juros',
        status: 'aberto' as const,
        dataEmissao: new Date(),
        dataValidade: new Date(),
        createdAt: new Date(),
        valorTotal: 150,
      };

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          orcamento={orcamentoCompleto as any}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Editar Orçamento\s+\d+/)).toBeInTheDocument();
    });
  });

  describe('Duplicar orçamento', () => {
    it('deve preencher dados para duplicar orçamento simples', () => {
      const orcamentoOriginal = {
        id: 'orc1',
        numero: 789,
        versao: 1,
        tipo: 'simples' as const,
        clienteId: 'cliente1',
        clienteNome: 'Cliente Teste LTDA',
        clienteCnpj: '12345678000190',
        itens: [
          { descricao: 'Item para duplicar', quantidade: 3, unidade: 'UN', valorUnitario: 50, valorTotal: 150 },
        ],
        status: 'aberto' as const,
        dataEmissao: new Date(),
        dataValidade: new Date(),
        createdAt: new Date(),
        valorTotal: 150,
      };

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          duplicarDe={orcamentoOriginal as any}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Duplicar Orçamento\s+\d+/)).toBeInTheDocument();
    });

    it('deve preencher dados para duplicar orçamento completo', () => {
      const orcamentoCompleto = {
        id: 'orc2',
        numero: 999,
        versao: 1,
        tipo: 'completo' as const,
        clienteId: 'cliente1',
        clienteNome: 'Cliente Teste LTDA',
        clienteCnpj: '12345678000190',
        servicoId: 'serv1',
        itens: [],
        itensCompleto: [
          {
            etapa: 'comercial' as const,
            categoriaId: 'cat2',
            categoriaNome: 'Sistema de Hidrantes',
            descricao: 'Item duplicado',
            unidade: 'M',
            quantidade: 10,
            valorUnitarioMaoDeObra: 200,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 2000,
            valorTotalMaterial: 1000,
            valorTotal: 3000,
          },
        ],
        limitacoesSelecionadas: ['Limitação 2'],
        prazoExecucaoServicos: 30,
        prazoVistoriaBombeiros: 40,
        condicaoPagamento: 'a_combinar' as const,
        status: 'aberto' as const,
        dataEmissao: new Date(),
        dataValidade: new Date(),
        createdAt: new Date(),
        valorTotal: 3000,
      };

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          duplicarDe={orcamentoCompleto as any}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/Duplicar Orçamento\s+\d+/)).toBeInTheDocument();
    });
  });

  describe('Novo cliente inline', () => {
    it('deve mostrar formulário de novo cliente ao clicar no botão', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      const novoClienteButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Novo Cliente')
      );
      if (novoClienteButton) {
        fireEvent.click(novoClienteButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Cadastrar Novo Cliente')).toBeInTheDocument();
      });
    });

    it('deve esconder formulário de novo cliente ao clicar novamente', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      const novoClienteButton = screen.getAllByRole('button').find(btn =>
        btn.textContent?.includes('Novo Cliente')
      );
      if (novoClienteButton) {
        fireEvent.click(novoClienteButton);
        await waitFor(() => {
          expect(screen.getByText('Cadastrar Novo Cliente')).toBeInTheDocument();
        });

        fireEvent.click(novoClienteButton);
        await waitFor(() => {
          expect(screen.queryByText('Cadastrar Novo Cliente')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Botões de ação', () => {
    it('deve chamar onClose ao clicar em cancelar', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      const cancelarButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('deve mostrar botão desabilitado quando loading', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          loading={true}
        />,
        { wrapper: createWrapper() }
      );

      const submitButtons = screen.getAllByRole('button');
      const salvarButton = submitButtons.find(btn =>
        btn.getAttribute('type') === 'submit'
      );
      expect(salvarButton).toBeDisabled();
    });
  });

  describe('Busca de cliente', () => {
    it('deve conseguir selecionar cliente via campo de busca', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      await selectCliente('Cliente Teste LTDA');

      // Verifica que o cliente foi selecionado (nome aparece no campo)
      const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
      expect(searchInput).toHaveValue('Cliente Teste LTDA');
    });

    it('deve filtrar clientes ao digitar (backend filtering)', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'Outro' } });

      // Como a filtragem é feita no backend, apenas verificamos que o campo aceita o valor
      expect(searchInput).toHaveValue('Outro');
    });
  });
});
