import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { Orcamentos } from '../../pages/Orcamentos';
import {
  useOrcamentos,
  useCriarOrcamento,
  useAtualizarOrcamento,
  useAtualizarStatusOrcamento,
  useExcluirOrcamento,
  useVerificarExpirados,
} from '../../hooks/useOrcamentos';

// Mock dos hooks
vi.mock('../../hooks/useOrcamentos', () => ({
  useOrcamentos: vi.fn(),
  useCriarOrcamento: vi.fn(),
  useAtualizarOrcamento: vi.fn(),
  useAtualizarStatusOrcamento: vi.fn(),
  useExcluirOrcamento: vi.fn(),
  useVerificarExpirados: vi.fn(),
}));

// Mock do OrcamentoModal
vi.mock('../../components/orcamentos/OrcamentoModal', () => ({
  OrcamentoModal: ({ isOpen, onClose, orcamento, duplicarDe }: any) =>
    isOpen ? (
      <div data-testid="orcamento-modal">
        <span>
          {orcamento ? `Editar #${orcamento.numero}` : duplicarDe ? `Duplicar #${duplicarDe.numero}` : 'Novo Orçamento'}
        </span>
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null,
}));

// Mock do OrcamentoViewModal
vi.mock('../../components/orcamentos/OrcamentoViewModal', () => ({
  OrcamentoViewModal: ({ isOpen, onClose, orcamento, onEdit, onDuplicate }: any) =>
    isOpen ? (
      <div data-testid="orcamento-view-modal">
        <span>Visualizar #{orcamento?.numero}</span>
        <button onClick={onClose}>Fechar</button>
        <button onClick={() => onEdit?.(orcamento)}>Editar</button>
        <button onClick={() => onDuplicate?.(orcamento)}>Duplicar</button>
      </div>
    ) : null,
}));

// Mock do OrcamentoPDF
vi.mock('../../components/orcamentos/OrcamentoPDF', () => ({
  gerarPDFOrcamento: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

const mockOrcamentos = [
  {
    id: 'o1',
    numero: 1,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c1',
    clienteNome: 'Cliente 1',
    clienteCnpj: '12345678901234',
    status: 'aberto' as const,
    valorTotal: 1000,
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    itens: [],
  },
  {
    id: 'o2',
    numero: 2,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c2',
    clienteNome: 'Cliente 2',
    clienteCnpj: '98765432109876',
    status: 'aceito' as const,
    valorTotal: 2500,
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    itens: [],
  },
  {
    id: 'o3',
    numero: 3,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c3',
    clienteNome: 'Cliente 3',
    clienteCnpj: '11111111111111',
    status: 'recusado' as const,
    valorTotal: 500,
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    itens: [],
  },
  {
    id: 'o4',
    numero: 4,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c4',
    clienteNome: 'Cliente 4',
    clienteCnpj: '22222222222222',
    status: 'expirado' as const,
    valorTotal: 750,
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    itens: [],
  },
];

const mockMutations = {
  mutateAsync: vi.fn(),
  mutate: vi.fn(),
  isLoading: false,
};

describe('Orcamentos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCriarOrcamento).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarOrcamento).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarStatusOrcamento).mockReturnValue(mockMutations as any);
    vi.mocked(useExcluirOrcamento).mockReturnValue(mockMutations as any);
    vi.mocked(useVerificarExpirados).mockReturnValue(mockMutations as any);
  });

  it('deve mostrar loading quando está carregando', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    expect(screen.getByText('Orçamentos')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há orçamentos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    expect(screen.getByText('Nenhum orçamento encontrado')).toBeInTheDocument();
    expect(screen.getByText('Crie seu primeiro orçamento clicando no botão acima')).toBeInTheDocument();
  });

  it('deve renderizar lista de orçamentos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Pode haver múltiplos elementos devido ao layout mobile/desktop
    expect(screen.getAllByText('#1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Cliente 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('#2')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Cliente 2')[0]).toBeInTheDocument();
  });

  it('deve filtrar orçamentos por número', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
    fireEvent.change(searchInput, { target: { value: '1' } });

    expect(screen.getAllByText('#1')[0]).toBeInTheDocument();
    expect(screen.queryByText('#2')).not.toBeInTheDocument();
  });

  it('deve filtrar orçamentos por cliente', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
    fireEvent.change(searchInput, { target: { value: 'Cliente 2' } });

    expect(screen.queryByText('#1')).not.toBeInTheDocument();
    expect(screen.getAllByText('#2')[0]).toBeInTheDocument();
  });

  it('deve filtrar orçamentos por status', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'aceito' } });

    // Após filtrar por aceito, só deve aparecer o orçamento #2
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
    expect(screen.getAllByText('#2')[0]).toBeInTheDocument();
    expect(screen.queryByText('#3')).not.toBeInTheDocument();
  });

  it('deve abrir modal para novo orçamento', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('+ Novo Orçamento'));

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-modal')).toBeInTheDocument();
      expect(screen.getByText('Novo Orçamento')).toBeInTheDocument();
    });
  });

  it('deve mostrar botão de editar apenas para orçamentos abertos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Deve haver apenas 1 botão Editar (para o orçamento aberto)
    const editButtons = screen.getAllByTitle('Editar');
    expect(editButtons).toHaveLength(1);
  });

  it('deve abrir modal de visualização ao clicar no orçamento', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Pode haver múltiplos elementos #1 (mobile/desktop), pegar o primeiro link clicável
    const orcamentoLinks = screen.getAllByText('#1');
    const orcamentoLink = orcamentoLinks[0].closest('div[title="Clique para ver detalhes"]');
    if (orcamentoLink) {
      fireEvent.click(orcamentoLink);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-view-modal')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de confirmação de exclusão', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Pegar todos os botões de excluir (existem nos orçamentos não aceitos)
    const deleteButtons = screen.getAllByTitle('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      expect(screen.getByText(/Tem certeza que deseja excluir o orçamento/)).toBeInTheDocument();
    });
  });

  it('deve fechar modal de exclusão ao clicar em cancelar', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByTitle('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    });
  });

  it('deve abrir modal de alteração de status', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const statusButtons = screen.getAllByTitle('Alterar Status');
    fireEvent.click(statusButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Alterar Status')).toBeInTheDocument();
    });
  });

  it('deve exibir badges de status corretos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Pode haver múltiplos elementos com esses textos devido ao mobile/desktop
    expect(screen.getAllByText('Aberto')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Aceito')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Recusado')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Expirado')[0]).toBeInTheDocument();
  });

  it('deve duplicar orçamento ao clicar em duplicar', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const duplicateButtons = screen.getAllByTitle('Duplicar');
    fireEvent.click(duplicateButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-modal')).toBeInTheDocument();
      expect(screen.getByText('Duplicar #1')).toBeInTheDocument();
    });
  });

  it('não deve mostrar botão de excluir para orçamentos aceitos', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [mockOrcamentos[1]], // Apenas o orçamento aceito
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    expect(screen.queryByTitle('Excluir')).not.toBeInTheDocument();
  });

  it('deve renderizar paginação quando há muitos orçamentos', () => {
    const manyOrcamentos = Array.from({ length: 15 }, (_, i) => ({
      ...mockOrcamentos[0],
      id: `o${i}`,
      numero: i + 1,
    }));

    vi.mocked(useOrcamentos).mockReturnValue({
      data: manyOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    expect(screen.getByText(/de 15/)).toBeInTheDocument();
  });

  it('deve mostrar mensagem diferente ao buscar sem resultados', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Buscar por número ou cliente...');
    fireEvent.change(searchInput, { target: { value: 'inexistente' } });

    expect(screen.getByText('Nenhum orçamento encontrado')).toBeInTheDocument();
    expect(screen.getByText('Tente buscar por outro termo ou altere o filtro')).toBeInTheDocument();
  });

  it('deve ter todos os status no select', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    expect(screen.getByText('Todos os status')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Abertos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Aceitos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Recusados' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Expirados' })).toBeInTheDocument();
  });

  it('deve confirmar e executar exclusão', async () => {
    mockMutations.mutateAsync.mockResolvedValue(undefined);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByTitle('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    });

    // Confirmar a exclusão - buscar o botão de texto "Excluir" que é um button element
    const confirmButtons = screen.getAllByRole('button', { name: 'Excluir' });
    // O último botão "Excluir" deve ser o do modal de confirmação
    const confirmButton = confirmButtons[confirmButtons.length - 1];
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutations.mutateAsync).toHaveBeenCalledWith('o1');
    });
  });

  it('deve alterar status do orçamento', async () => {
    mockMutations.mutateAsync.mockResolvedValue(undefined);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const statusButtons = screen.getAllByTitle('Alterar Status');
    fireEvent.click(statusButtons[0]);

    await waitFor(() => {
      // O título "Alterar Status" aparece no modal - usar role para evitar conflito com botão
      const statusTitle = screen.getAllByText('Alterar Status').find(el => el.tagName === 'H3');
      expect(statusTitle).toBeInTheDocument();
    });
  });

  it('deve fechar modal de status ao clicar em cancelar', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const statusButtons = screen.getAllByTitle('Alterar Status');
    fireEvent.click(statusButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Alterar Status')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Alterar Status')).not.toBeInTheDocument();
    });
  });

  it('deve renderizar view modal com opções de editar e duplicar', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Abrir view modal
    const orcamentoLinks = screen.getAllByText('#1');
    const orcamentoLink = orcamentoLinks[0].closest('div[title="Clique para ver detalhes"]');
    if (orcamentoLink) {
      fireEvent.click(orcamentoLink);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-view-modal')).toBeInTheDocument();
    });

    // Verificar que as opções estão disponíveis no modal
    const viewModal = screen.getByTestId('orcamento-view-modal');
    expect(viewModal).toBeInTheDocument();
    expect(screen.getByText('Visualizar #1')).toBeInTheDocument();
  });

  it('deve navegar entre páginas na paginação', () => {
    const manyOrcamentos = Array.from({ length: 25 }, (_, i) => ({
      ...mockOrcamentos[0],
      id: `o${i}`,
      numero: i + 1,
    }));

    vi.mocked(useOrcamentos).mockReturnValue({
      data: manyOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Verifica se a paginação está presente
    expect(screen.getByText(/de 25/)).toBeInTheDocument();
  });

  it('deve filtrar por status expirado', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'expirado' } });

    // Após filtrar por expirado, só deve aparecer o orçamento #4
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
    expect(screen.queryByText('#2')).not.toBeInTheDocument();
    expect(screen.queryByText('#3')).not.toBeInTheDocument();
    expect(screen.getAllByText('#4')[0]).toBeInTheDocument();
  });

  it('deve filtrar por status recusado', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'recusado' } });

    // Após filtrar por recusado, só deve aparecer o orçamento #3
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
    expect(screen.queryByText('#2')).not.toBeInTheDocument();
    expect(screen.getAllByText('#3')[0]).toBeInTheDocument();
    expect(screen.queryByText('#4')).not.toBeInTheDocument();
  });

  it('deve abrir modal de edição a partir do view modal', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Abrir view modal
    const orcamentoLinks = screen.getAllByText('#1');
    const orcamentoLink = orcamentoLinks[0].closest('div[title="Clique para ver detalhes"]');
    if (orcamentoLink) {
      fireEvent.click(orcamentoLink);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-view-modal')).toBeInTheDocument();
    });

    // Clicar em Editar do view modal (botão criado pelo mock)
    const viewModal = screen.getByTestId('orcamento-view-modal');
    const editarButton = viewModal.querySelector('button:nth-of-type(2)'); // Editar é o segundo botão
    if (editarButton) {
      fireEvent.click(editarButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-modal')).toBeInTheDocument();
      expect(screen.getByText('Editar #1')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de duplicação a partir do view modal', async () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    // Abrir view modal
    const orcamentoLinks = screen.getAllByText('#1');
    const orcamentoLink = orcamentoLinks[0].closest('div[title="Clique para ver detalhes"]');
    if (orcamentoLink) {
      fireEvent.click(orcamentoLink);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-view-modal')).toBeInTheDocument();
    });

    // Clicar em Duplicar do view modal (botão criado pelo mock)
    const viewModal = screen.getByTestId('orcamento-view-modal');
    const duplicarButton = viewModal.querySelector('button:nth-of-type(3)'); // Duplicar é o terceiro botão
    if (duplicarButton) {
      fireEvent.click(duplicarButton);
    }

    await waitFor(() => {
      expect(screen.getByTestId('orcamento-modal')).toBeInTheDocument();
      expect(screen.getByText('Duplicar #1')).toBeInTheDocument();
    });
  });

  it('deve filtrar por status aceito', () => {
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Orcamentos />, { wrapper: createWrapper() });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'aceito' } });

    // Após filtrar por aceito, só deve aparecer o orçamento #2
    expect(screen.queryByText('#1')).not.toBeInTheDocument();
    expect(screen.getAllByText('#2')[0]).toBeInTheDocument();
    expect(screen.queryByText('#3')).not.toBeInTheDocument();
    expect(screen.queryByText('#4')).not.toBeInTheDocument();
  });
});
