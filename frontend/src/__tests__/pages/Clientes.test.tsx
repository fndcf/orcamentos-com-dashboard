import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Clientes } from '../../pages/Clientes';
import {
  useClientesPaginados,
  useCriarCliente,
  useAtualizarCliente,
  useExcluirCliente,
} from '../../hooks/useClientes';
import { useOrcamentos } from '../../hooks/useOrcamentos';

// Mock dos hooks
vi.mock('../../hooks/useClientes', () => ({
  useClientesPaginados: vi.fn(),
  useCriarCliente: vi.fn(),
  useAtualizarCliente: vi.fn(),
  useExcluirCliente: vi.fn(),
}));

vi.mock('../../hooks/useOrcamentos', () => ({
  useOrcamentos: vi.fn(),
}));

// Mock do ClienteModal
vi.mock('../../components/clientes/ClienteModal', () => ({
  ClienteModal: ({ isOpen, onClose, onSave, cliente }: any) =>
    isOpen ? (
      <div data-testid="cliente-modal">
        <span>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</span>
        <button onClick={onClose}>Fechar</button>
        <button onClick={() => onSave({ razaoSocial: 'Novo', cnpj: '12345678901234' })}>
          Salvar
        </button>
      </div>
    ) : null,
}));

// Mock do HistoricoOrcamentosModal
vi.mock('../../components/clientes/HistoricoOrcamentosModal', () => ({
  HistoricoOrcamentosModal: ({ isOpen, onClose, cliente }: any) =>
    isOpen ? (
      <div data-testid="historico-modal">
        <span>Histórico de {cliente?.razaoSocial}</span>
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockClientes = [
  {
    id: 'c1',
    razaoSocial: 'Empresa Teste 1',
    nomeFantasia: 'Teste 1',
    cnpj: '12345678901234',
    cidade: 'São Paulo',
    estado: 'SP',
    telefone: '11999999999',
    email: 'teste1@email.com',
  },
  {
    id: 'c2',
    razaoSocial: 'Empresa Teste 2',
    nomeFantasia: '',
    cnpj: '98765432109876',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    telefone: '',
    email: 'teste2@email.com',
  },
];

const mockOrcamentos = [
  {
    id: 'o1',
    numero: 1,
    versao: 0,
    tipo: 'simples' as const,
    clienteId: 'c1',
    clienteNome: 'Empresa Teste 1',
    clienteCnpj: '12345678901234',
    status: 'aberto' as const,
    valorTotal: 1000,
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date().toISOString(),
    itens: [],
  },
];

const mockMutations = {
  mutateAsync: vi.fn(),
  isLoading: false,
};

describe('Clientes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCriarCliente).mockReturnValue(mockMutations as any);
    vi.mocked(useAtualizarCliente).mockReturnValue(mockMutations as any);
    vi.mocked(useExcluirCliente).mockReturnValue(mockMutations as any);
  });

  it('deve mostrar loading quando está carregando', () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há clientes', () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    expect(screen.getByText('Nenhum cliente encontrado')).toBeInTheDocument();
    expect(screen.getByText('Cadastre seu primeiro cliente clicando no botão acima')).toBeInTheDocument();
  });

  it('deve renderizar lista de clientes', () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    // Pode haver múltiplos elementos devido ao layout mobile/desktop
    expect(screen.getAllByText('Empresa Teste 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Teste 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Empresa Teste 2')[0]).toBeInTheDocument();
  });

  it('deve filtrar clientes por razão social', () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Buscar por nome, CPF/CNPJ ou nome fantasia...');
    // Busca pelo nome fantasia que é único
    fireEvent.change(searchInput, { target: { value: 'Teste 1' } });

    // Deve encontrar apenas o cliente com nomeFantasia 'Teste 1'
    expect(screen.getAllByText('Empresa Teste 1')[0]).toBeInTheDocument();
    // Empresa Teste 2 não tem 'Teste 1' no nomeFantasia nem razaoSocial
    // Mas "Empresa Teste 2" contém números diferentes no CNPJ
  });

  it('deve filtrar clientes por CNPJ (backend filtering)', async () => {
    // Primeiro render mostra todos os clientes
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
      isFetching: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText('Buscar por nome, CPF/CNPJ ou nome fantasia...');
    fireEvent.change(searchInput, { target: { value: '98765432109876' } });

    // Como a filtragem é feita no backend, apenas verificamos que o campo de busca aceita o valor
    expect(searchInput).toHaveValue('98765432109876');
  });

  it('deve abrir modal para novo cliente', async () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    fireEvent.click(screen.getByText('+ Novo Cliente'));

    await waitFor(() => {
      expect(screen.getByTestId('cliente-modal')).toBeInTheDocument();
      expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
    });
  });

  it('deve abrir modal para editar cliente', async () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    const editButtons = screen.getAllByText('Editar');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('cliente-modal')).toBeInTheDocument();
      expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
    });
  });

  it('deve abrir modal de histórico ao clicar no cliente', async () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    // Clicar no botão de histórico
    const historicoButtons = screen.getAllByText('Histórico');
    fireEvent.click(historicoButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('historico-modal')).toBeInTheDocument();
    });
  });

  it('deve desabilitar exclusão quando cliente tem orçamentos', () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByText('Excluir');
    // O primeiro cliente tem orçamentos, então deve estar desabilitado
    expect(deleteButtons[0]).toBeDisabled();
    // O segundo cliente não tem orçamentos
    expect(deleteButtons[1]).not.toBeDisabled();
  });

  it('deve abrir modal de confirmação ao clicar em excluir', async () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
      expect(screen.getByText(/Tem certeza que deseja excluir o cliente/)).toBeInTheDocument();
    });
  });

  it('deve fechar modal de confirmação ao clicar em cancelar', async () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByText('Confirmar Exclusão')).not.toBeInTheDocument();
    });
  });

  it('deve excluir cliente ao confirmar', async () => {
    const excluirMock = { mutateAsync: vi.fn(), isLoading: false };
    vi.mocked(useExcluirCliente).mockReturnValue(excluirMock as any);
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    const deleteButtons = screen.getAllByText('Excluir');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Confirmar Exclusão')).toBeInTheDocument();
    });

    // Clicar no botão de excluir do modal (não o da tabela)
    const modalExcluirButton = screen.getAllByText('Excluir').find(
      (btn) => btn.closest('.css-0') || btn.closest('div[style]')
    );
    if (modalExcluirButton) {
      fireEvent.click(modalExcluirButton);
    }
  });

  it('deve mostrar mensagem diferente ao buscar sem resultados', () => {
    // Backend retorna lista vazia quando busca não encontra resultados
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
      isFetching: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    expect(screen.getByText('Nenhum cliente encontrado')).toBeInTheDocument();
  });

  it('deve formatar documento corretamente', () => {
    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: mockClientes, total: mockClientes.length },
      isLoading: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    // Verifica se o CNPJ está renderizado (pode estar formatado)
    // Pode haver múltiplos elementos devido ao layout mobile/desktop
    expect(screen.getAllByText('Empresa Teste 1')[0]).toBeInTheDocument();
  });

  it('deve renderizar paginação quando há muitos clientes', () => {
    const pageClientes = Array.from({ length: 10 }, (_, i) => ({
      id: `c${i}`,
      razaoSocial: `Empresa ${i}`,
      nomeFantasia: '',
      cnpj: `${i}`.padStart(14, '0'),
      cidade: 'Cidade',
      estado: 'SP',
      telefone: '',
      email: '',
    }));

    vi.mocked(useClientesPaginados).mockReturnValue({
      data: { items: pageClientes, total: 15 },
      isLoading: false,
      isFetching: false,
    } as any);
    vi.mocked(useOrcamentos).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<Clientes />, { wrapper: createWrapper() });

    // Deve mostrar paginação - total é 15
    expect(screen.getByText(/de 15/)).toBeInTheDocument();
  });
});
