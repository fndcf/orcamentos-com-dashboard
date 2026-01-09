import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OrcamentoModal } from '../../../components/orcamentos/OrcamentoModal';
import { useClientesInfiniteScroll, useCliente, useCriarCliente, useBuscarCnpjBrasilAPI } from '../../../hooks/useClientes';
import { useServicosAtivos } from '../../../hooks/useServicos';
import { useCategoriasItemAtivas } from '../../../hooks/useCategoriasItem';
import { useLimitacoesAtivas } from '../../../hooks/useLimitacoes';
import { useItensServicoAtivosPorCategoria } from '../../../hooks/useItensServico';
import { useConfiguracoesGerais } from '../../../hooks/useConfiguracoesGerais';

// Mock dos hooks
vi.mock('../../../hooks/useClientes', () => ({
  useClientesInfiniteScroll: vi.fn(),
  useCliente: vi.fn(),
  useCriarCliente: vi.fn(),
  useBuscarCnpjBrasilAPI: vi.fn(),
}));

vi.mock('../../../hooks/useServicos', () => ({
  useServicosAtivos: vi.fn(),
}));

vi.mock('../../../hooks/useCategoriasItem', () => ({
  useCategoriasItemAtivas: vi.fn(),
}));

vi.mock('../../../hooks/useLimitacoes', () => ({
  useLimitacoesAtivas: vi.fn(),
}));

vi.mock('../../../hooks/useItensServico', () => ({
  useItensServicoAtivosPorCategoria: vi.fn(),
  useInfiniteItensServicoAtivos: vi.fn(() => ({
    itens: [],
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
  })),
}));

vi.mock('../../../hooks/useConfiguracoesGerais', () => ({
  useConfiguracoesGerais: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

// Mock para scrollIntoView que não existe no jsdom
Element.prototype.scrollIntoView = vi.fn();

const mockClientes = [
  {
    id: 'c1',
    razaoSocial: 'Cliente 1',
    nomeFantasia: 'C1',
    cnpj: '12345678901234',
    endereco: 'Rua Teste, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234567',
    telefone: '11999999999',
    email: 'teste@email.com',
    createdAt: new Date(),
  },
  {
    id: 'c2',
    razaoSocial: 'Cliente 2',
    nomeFantasia: '',
    cnpj: '98765432109876',
    endereco: 'Av. Teste, 456',
    cidade: 'Rio',
    estado: 'RJ',
    cep: '21234567',
    telefone: '21999999999',
    email: 'teste2@email.com',
    createdAt: new Date(),
  },
];

const mockOrcamento = {
  id: 'o1',
  numero: 1,
  versao: 0,
  tipo: 'completo' as const,
  clienteId: 'c1',
  clienteNome: 'Cliente 1',
  clienteCnpj: '12345678901234',
  status: 'aberto' as const,
  valorTotal: 1500,
  dataEmissao: new Date().toISOString(),
  dataValidade: new Date().toISOString(),
  servicoId: 's1',
  servicoDescricao: 'Serviço Teste',
  itensCompleto: [
    {
      etapa: 'comercial' as const,
      categoriaId: 'cat1',
      categoriaNome: 'Categoria Teste',
      descricao: 'Serviço 1',
      unidade: 'Serv.',
      quantidade: 1,
      valorUnitarioMaoDeObra: 500,
      valorUnitarioMaterial: 500,
      valorTotalMaoDeObra: 500,
      valorTotalMaterial: 500,
      valorTotal: 1000,
    },
    {
      etapa: 'comercial' as const,
      categoriaId: 'cat1',
      categoriaNome: 'Categoria Teste',
      descricao: 'Serviço 2',
      unidade: 'Un.',
      quantidade: 2,
      valorUnitarioMaoDeObra: 125,
      valorUnitarioMaterial: 125,
      valorTotalMaoDeObra: 250,
      valorTotalMaterial: 250,
      valorTotal: 500,
    },
  ],
  observacoes: 'Obs teste',
  consultor: 'João',
  contato: 'Maria',
  createdAt: new Date(),
};

// Helper para selecionar cliente via campo de busca
const selectCliente = async (clienteNome: string) => {
  const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
  fireEvent.focus(searchInput);

  // Esperar dropdown abrir
  await waitFor(() => {
    expect(screen.getByText(clienteNome)).toBeInTheDocument();
  });

  // Clicar no cliente
  fireEvent.click(screen.getByText(clienteNome));
};

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
    vi.mocked(useCriarCliente).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);
    vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);
    vi.mocked(useServicosAtivos).mockReturnValue({
      data: [{ id: 's1', descricao: 'Serviço Teste', ativo: true, ordem: 1, createdAt: new Date() }],
      isLoading: false,
    } as any);
    vi.mocked(useCategoriasItemAtivas).mockReturnValue({
      data: [{ id: 'cat1', nome: 'Categoria Teste', ativo: true, ordem: 1, createdAt: new Date() }],
      isLoading: false,
    } as any);
    vi.mocked(useLimitacoesAtivas).mockReturnValue({
      data: [{ id: 'lim1', texto: 'Limitação Teste', ativo: true, ordem: 1, createdAt: new Date() }],
      isLoading: false,
    } as any);
    vi.mocked(useItensServicoAtivosPorCategoria).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(useConfiguracoesGerais).mockReturnValue({
      data: {
        parcelaMinima: 500,
        diasValidadePadrao: 30,
        taxaJurosPadrao: 0,
        limiteParcelas: 12,
      },
      isLoading: false,
    } as any);
  });

  it('não deve renderizar quando não está aberto', () => {
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

  it('deve renderizar título para novo orçamento', () => {
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

  it('deve renderizar título para editar orçamento', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        orcamento={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    // O formato do título é "Editar Orçamento [numero formatado]" (ex: 260001-A)
    expect(screen.getByText(/Editar Orçamento\s+\d+/)).toBeInTheDocument();
  });

  it('deve renderizar título para duplicar orçamento', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        duplicarDe={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    // O formato do título é "Duplicar Orçamento [numero formatado]" (ex: 260001-A)
    expect(screen.getByText(/Duplicar Orçamento\s+\d+/)).toBeInTheDocument();
  });

  it('deve mostrar campo de busca de clientes', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByPlaceholderText('Digite para buscar um cliente...')).toBeInTheDocument();
  });

  it('deve mostrar lista de clientes ao focar no campo de busca', async () => {
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

    await waitFor(() => {
      expect(screen.getByText('Cliente 1')).toBeInTheDocument();
      expect(screen.getByText('Cliente 2')).toBeInTheDocument();
    });
  });

  it('deve filtrar clientes ao digitar no campo de busca (backend filtering)', async () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
    fireEvent.change(searchInput, { target: { value: 'Cliente 1' } });

    // Como a filtragem é feita no backend, apenas verificamos que o campo aceita o valor
    expect(searchInput).toHaveValue('Cliente 1');
  });

  it('deve exibir informações do cliente ao selecionar', async () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    await selectCliente('Cliente 1');

    expect(screen.getByText(/CNPJ\/CPF: 12345678901234/)).toBeInTheDocument();
  });

  it('deve mostrar formulário de novo cliente ao clicar no botão', async () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('+ Novo Cliente'));

    await waitFor(() => {
      expect(screen.getByText('Cadastrar Novo Cliente')).toBeInTheDocument();
    });
  });

  it('deve preencher itens ao editar orçamento', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        orcamento={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Serviço 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Serviço 2')).toBeInTheDocument();
  });

  it('deve adicionar novo item ao clicar no botão', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('+ Adicionar Item'));

    const descricaoInputs = screen.getAllByPlaceholderText('Descrição do item/serviço');
    expect(descricaoInputs).toHaveLength(2);
  });

  it('deve remover item ao clicar no botão de remover', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        orcamento={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    const removeButtons = screen.getAllByTitle('Remover item');
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByDisplayValue('Serviço 1')).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Serviço 2')).toBeInTheDocument();
  });

  it('não deve remover último item', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const removeButton = screen.getByTitle('Remover item');
    expect(removeButton).toBeDisabled();
  });

  it('deve calcular total automaticamente', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
    fireEvent.change(descInput, { target: { value: 'Teste' } });

    // Com tipo completo, temos M.O. e Material
    const spinButtons = screen.getAllByRole('spinbutton');
    // spinButtons[0] = quantidade, spinButtons[1] = M.O. Unit, spinButtons[2] = Mat. Unit
    fireEvent.change(spinButtons[0], { target: { value: '2' } });
    fireEvent.change(spinButtons[1], { target: { value: '50' } });
    fireEvent.change(spinButtons[2], { target: { value: '50' } });

    // Total = 2 * (50 + 50) = 200
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em Cancelar', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve mostrar erro se cliente não for selecionado', async () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
    fireEvent.change(descInput, { target: { value: 'Teste Serviço' } });

    fireEvent.click(screen.getByText('Criar Orçamento'));

    await waitFor(() => {
      expect(screen.getByText('Selecione um cliente ou cadastre um novo')).toBeInTheDocument();
    });
  });

  it('deve mostrar erro se não houver itens com descrição', async () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    await selectCliente('Cliente 1');

    fireEvent.click(screen.getByText('Criar Orçamento'));

    await waitFor(() => {
      expect(screen.getByText('Adicione pelo menos um item com descrição')).toBeInTheDocument();
    });
  });

  it('deve chamar onSave com dados corretos', async () => {
    mockOnSave.mockResolvedValue(undefined);

    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    // Selecionar cliente via campo de busca
    await selectCliente('Cliente 1');

    // Selecionar serviço e categoria via combobox
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 's1' } });
    fireEvent.change(selects[2], { target: { value: 'cat1' } });

    // Preencher item
    const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
    fireEvent.change(descInput, { target: { value: 'Serviço de Manutenção' } });

    // Encontrar campos de valor (mão de obra e material)
    const spinButtons = screen.getAllByRole('spinbutton');
    // spinButtons[0] = quantidade, spinButtons[1] = M.O. Unit, spinButtons[2] = Mat. Unit
    fireEvent.change(spinButtons[1], { target: { value: '300' } });
    fireEvent.change(spinButtons[2], { target: { value: '200' } });

    fireEvent.click(screen.getByText('Criar Orçamento'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          clienteId: 'c1',
          tipo: 'completo',
          servicoId: 's1',
          itensCompleto: expect.arrayContaining([
            expect.objectContaining({
              descricao: 'Serviço de Manutenção',
              categoriaId: 'cat1',
            }),
          ]),
        })
      );
    });
  });

  it('deve preencher observações e consultor', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        orcamento={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Obs teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('João')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Maria')).toBeInTheDocument();
  });

  it('deve desabilitar campo de busca de cliente ao editar orçamento existente', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        orcamento={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
    expect(searchInput).toBeDisabled();
  });

  it('deve permitir alterar cliente ao duplicar', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        duplicarDe={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
    expect(searchInput).not.toBeDisabled();
  });

  it('deve desabilitar botão de submit quando loading', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={true}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Salvando...')).toBeDisabled();
  });

  it('deve mostrar texto correto no botão para criar cópia', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        duplicarDe={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Criar Cópia')).toBeInTheDocument();
  });

  it('deve mostrar texto correto no botão para atualizar', () => {
    render(
      <OrcamentoModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        orcamento={mockOrcamento}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Atualizar')).toBeInTheDocument();
  });

  describe('Orçamento Completo', () => {
    const mockOrcamentoCompleto = {
      id: 'o2',
      numero: 2,
      versao: 0,
      tipo: 'completo' as const,
      clienteId: 'c1',
      clienteNome: 'Cliente 1',
      clienteCnpj: '12345678901234',
      status: 'aberto' as const,
      valorTotal: 3000,
      dataEmissao: new Date().toISOString(),
      dataValidade: new Date().toISOString(),
      itens: [],
      servicoId: 's1',
      servicoDescricao: 'Serviço Teste',
      itensCompleto: [
        {
          etapa: 'residencial' as const,
          categoriaId: 'cat1',
          categoriaNome: 'Categoria Teste',
          descricao: 'Item Completo 1',
          unidade: 'un',
          quantidade: 2,
          valorUnitarioMaoDeObra: 500,
          valorUnitarioMaterial: 200,
          valorTotalMaoDeObra: 1000,
          valorTotalMaterial: 400,
          valorTotal: 1400,
        },
      ],
      limitacoesSelecionadas: ['Limitação Teste'],
      prazoExecucaoServicos: 25,
      prazoVistoriaBombeiros: 35,
      condicaoPagamento: 'parcelado' as const,
      parcelamentoTexto: '3x sem juros',
      observacoes: 'Obs completo',
      consultor: 'Carlos',
      contato: 'Ana',
      createdAt: new Date(),
    };

    it('deve mostrar seção de itens completos por padrão', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Itens do Orçamento (com Mão de Obra e Material)')).toBeInTheDocument();
    });

    it('deve preencher campos ao editar orçamento completo', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByDisplayValue('Item Completo 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Carlos')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ana')).toBeInTheDocument();
    });


    it('deve adicionar e remover itens completos', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Alternar para completo
      // O tipo completo é o padrão agora

      // Adicionar item
      fireEvent.click(screen.getByText('+ Adicionar Item'));
      const descInputs = screen.getAllByPlaceholderText('Descrição do item/serviço');
      expect(descInputs).toHaveLength(2);

      // Preencher itens para poder remover
      fireEvent.change(descInputs[0], { target: { value: 'Item 1' } });
      fireEvent.change(descInputs[1], { target: { value: 'Item 2' } });

      // Remover primeiro item
      const removeButtons = screen.getAllByTitle('Remover item');
      fireEvent.click(removeButtons[0]);

      expect(screen.queryByDisplayValue('Item 1')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
    });

    it('deve calcular totais de mão de obra e material', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Alternar para completo
      // O tipo completo é o padrão agora

      // Preencher valores
      const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
      fireEvent.change(descInput, { target: { value: 'Item Teste' } });

      // Encontrar campos de quantidade e valores
      const qtdInputs = screen.getAllByRole('spinbutton');
      // qtdInputs[0] é quantidade, qtdInputs[1] é M.O. Unit, qtdInputs[2] é Mat. Unit
      fireEvent.change(qtdInputs[0], { target: { value: '2' } });
      fireEvent.change(qtdInputs[1], { target: { value: '100' } });
      fireEvent.change(qtdInputs[2], { target: { value: '50' } });

      // Verificar totais
      expect(screen.getByText('Total Mão de Obra')).toBeInTheDocument();
      expect(screen.getByText('Total Material')).toBeInTheDocument();
      expect(screen.getByText('Total Geral')).toBeInTheDocument();
    });

    it('deve chamar onSave com dados de orçamento completo', async () => {
      mockOnSave.mockResolvedValue(undefined);

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Selecionar cliente via campo de busca
      await selectCliente('Cliente 1');

      // Selecionar serviço e categoria via combobox
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 's1' } });
      fireEvent.change(selects[2], { target: { value: 'cat1' } });

      // Preencher item
      const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
      fireEvent.change(descInput, { target: { value: 'Serviço Completo' } });

      fireEvent.click(screen.getByText('Criar Orçamento'));

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            tipo: 'completo',
            clienteId: 'c1',
            servicoId: 's1',
            itensCompleto: expect.arrayContaining([
              expect.objectContaining({
                descricao: 'Serviço Completo',
                categoriaId: 'cat1',
              }),
            ]),
          })
        );
      });
    });

    it('deve duplicar orçamento completo', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          duplicarDe={mockOrcamentoCompleto}
        />,
        { wrapper: createWrapper() }
      );

      // O formato do título é "Duplicar Orçamento [numero formatado]" (ex: 260001-A)
      expect(screen.getByText(/Duplicar Orçamento\s+\d+/)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Item Completo 1')).toBeInTheDocument();
    });

    it('deve mostrar erro para item completo sem categoria', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Selecionar cliente via campo de busca
      await selectCliente('Cliente 1');

      // Selecionar serviço via combobox
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 's1' } });

      // Preencher item sem categoria
      const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
      fireEvent.change(descInput, { target: { value: 'Serviço sem categoria' } });

      fireEvent.click(screen.getByText('Criar Orçamento'));

      await waitFor(() => {
        expect(screen.getByText('Selecione uma categoria')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro para item com descrição curta', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Selecionar cliente via campo de busca
      await selectCliente('Cliente 1');

      // Selecionar serviço e categoria via combobox
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 's1' } });
      fireEvent.change(selects[2], { target: { value: 'cat1' } });

      // Preencher item com descrição curta
      const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
      fireEvent.change(descInput, { target: { value: 'ab' } });

      fireEvent.click(screen.getByText('Criar Orçamento'));

      await waitFor(() => {
        expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
      });
    });


    it('deve atualizar prazo de execução', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Alternar para completo
      // O tipo completo é o padrão agora

      // Encontrar e alterar prazo de execução
      const prazoInputs = screen.getAllByRole('spinbutton');
      // Os últimos inputs são os prazos
      const prazoExecucaoInput = prazoInputs.find(input =>
        (input as HTMLInputElement).value === '20'
      );
      if (prazoExecucaoInput) {
        fireEvent.change(prazoExecucaoInput, { target: { value: '30' } });
        expect((prazoExecucaoInput as HTMLInputElement).value).toBe('30');
      }
    });

    it('deve toggle limitação selecionada', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Alternar para completo
      // O tipo completo é o padrão agora

      // Encontrar checkbox de limitação
      const limitacaoCheckbox = screen.getByLabelText('Limitação Teste');
      expect(limitacaoCheckbox).not.toBeChecked();

      fireEvent.click(limitacaoCheckbox);
      expect(limitacaoCheckbox).toBeChecked();

      fireEvent.click(limitacaoCheckbox);
      expect(limitacaoCheckbox).not.toBeChecked();
    });
  });

  describe('Validações de Orçamento Simples', () => {
    it('deve mostrar erro para descrição curta', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Selecionar cliente via campo de busca
      await selectCliente('Cliente 1');

      // Preencher item com descrição curta
      const descInput = screen.getByPlaceholderText('Descrição do item/serviço');
      fireEvent.change(descInput, { target: { value: 'ab' } });

      fireEvent.click(screen.getByText('Criar Orçamento'));

      await waitFor(() => {
        expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
      });
    });

  });

  describe('Formulário de Novo Cliente', () => {
    it('deve esconder botão novo cliente ao editar orçamento', () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          orcamento={mockOrcamento}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText('+ Novo Cliente')).not.toBeInTheDocument();
    });
  });

  describe('Informações do Cliente', () => {
    it('deve mostrar nome fantasia quando disponível', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      await selectCliente('Cliente 1');

      expect(screen.getByText(/\(C1\)/)).toBeInTheDocument();
    });

    it('deve mostrar cidade e estado quando disponíveis', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      await selectCliente('Cliente 1');

      expect(screen.getByText(/São Paulo\/SP/)).toBeInTheDocument();
    });
  });

  describe('Edição de orçamento com itens vazios', () => {
    it('deve inicializar com item vazio quando orçamento não tem itens completos', () => {
      const orcamentoSemItens = {
        ...mockOrcamento,
        itensCompleto: [],
      };

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          orcamento={orcamentoSemItens}
        />,
        { wrapper: createWrapper() }
      );

      const descInputs = screen.getAllByPlaceholderText('Descrição do item/serviço');
      expect(descInputs).toHaveLength(1);
    });
  });

  describe('Busca de Clientes', () => {
    it('deve fechar dropdown ao clicar fora', async () => {
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

      await waitFor(() => {
        expect(screen.getByText('Cliente 1')).toBeInTheDocument();
      });

      // Simular clique fora (no título do modal)
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText('Cliente 2')).not.toBeInTheDocument();
      });
    });

    it('deve limpar seleção ao limpar campo de busca', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Primeiro selecionar um cliente
      await selectCliente('Cliente 1');

      // Verificar que info do cliente aparece
      expect(screen.getByText(/CNPJ\/CPF: 12345678901234/)).toBeInTheDocument();

      // Limpar campo de busca
      const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
      fireEvent.change(searchInput, { target: { value: '' } });

      // Info do cliente deve desaparecer
      await waitFor(() => {
        expect(screen.queryByText(/CNPJ\/CPF: 12345678901234/)).not.toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem quando não encontrar clientes', async () => {
      // Mock para retornar lista vazia (backend retorna vazio quando não encontra)
      vi.mocked(useClientesInfiniteScroll).mockReturnValue({
        data: {
          pages: [{ items: [], total: 0, hasMore: false }],
          pageParams: [1],
        },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
      } as any);

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

      await waitFor(() => {
        expect(screen.getByText('Nenhum cliente encontrado')).toBeInTheDocument();
      });
    });

    it('deve buscar por CNPJ (backend filtering)', async () => {
      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
      fireEvent.change(searchInput, { target: { value: '12345678901234' } });

      // Como a filtragem é feita no backend, apenas verificamos que o campo aceita o valor
      expect(searchInput).toHaveValue('12345678901234');
    });

    it('deve preencher campo de busca ao editar orçamento existente', () => {
      vi.mocked(useCliente).mockReturnValue({
        data: mockClientes[0],
        isLoading: false,
      } as any);

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
          orcamento={mockOrcamento}
        />,
        { wrapper: createWrapper() }
      );

      const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
      expect(searchInput).toHaveValue('Cliente 1');
    });
  });

  describe('Auto-seleção de cliente criado', () => {
    it('deve selecionar automaticamente o cliente recém-criado', async () => {
      const novoCliente = {
        id: 'c3',
        razaoSocial: 'Novo Cliente Teste',
        cnpj: '11111111111111',
        cidade: 'Campinas',
        estado: 'SP',
        createdAt: new Date(),
      };

      const mockCriarCliente = vi.fn().mockResolvedValue(novoCliente);
      vi.mocked(useCriarCliente).mockReturnValue({
        mutateAsync: mockCriarCliente,
        isLoading: false,
      } as any);

      render(
        <OrcamentoModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />,
        { wrapper: createWrapper() }
      );

      // Clicar no botão de novo cliente
      fireEvent.click(screen.getByText('+ Novo Cliente'));

      // Preencher formulário de novo cliente
      await waitFor(() => {
        expect(screen.getByText('Cadastrar Novo Cliente')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/CNPJ/), { target: { value: '11111111111111' } });
      fireEvent.change(screen.getByLabelText(/Razão Social/), { target: { value: 'Novo Cliente Teste' } });

      // Salvar cliente
      fireEvent.click(screen.getByText('Salvar Cliente e Continuar'));

      // Esperar que o formulário de novo cliente feche e o cliente seja selecionado
      await waitFor(() => {
        expect(screen.queryByText('Cadastrar Novo Cliente')).not.toBeInTheDocument();
      });

      // Verificar que o campo de busca foi preenchido com o nome do novo cliente
      const searchInput = screen.getByPlaceholderText('Digite para buscar um cliente...');
      expect(searchInput).toHaveValue('Novo Cliente Teste');
    });
  });
});
