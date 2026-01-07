import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HistoricoOrcamentosModal } from '../../../components/clientes/HistoricoOrcamentosModal';
import { useOrcamentosPorCliente } from '../../../hooks/useOrcamentos';
import { formatOrcamentoNumero } from '../../../utils/constants';

// Mock do hook
vi.mock('../../../hooks/useOrcamentos', () => ({
  useOrcamentosPorCliente: vi.fn(),
}));

// Mock do OrcamentoPDF
vi.mock('../../../components/orcamentos/OrcamentoPDF', () => ({
  gerarPDFOrcamento: vi.fn(),
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

const mockCliente = {
  id: 'c1',
  razaoSocial: 'Empresa Teste',
  nomeFantasia: 'Teste',
  cnpj: '12345678901234',
  endereco: 'Rua Teste, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234567',
  telefone: '11999999999',
  email: 'teste@email.com',
  createdAt: new Date(),
};

const mockOrcamentos = [
  {
    id: 'o1',
    numero: 1,
    versao: 0,
    tipo: 'completo' as const,
    clienteId: 'c1',
    clienteNome: 'Empresa Teste',
    clienteCnpj: '12345678901234',
    status: 'aberto' as const,
    valorTotal: 1000,
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    itensCompleto: [
      {
        etapa: 'comercial' as const,
        categoriaId: 'cat1',
        categoriaNome: 'Categoria 1',
        descricao: 'Item 1',
        quantidade: 1,
        unidade: 'un',
        valorUnitarioMaoDeObra: 500,
        valorUnitarioMaterial: 500,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
    ],
    createdAt: new Date(),
  },
  {
    id: 'o2',
    numero: 2,
    versao: 1,
    tipo: 'completo' as const,
    clienteId: 'c1',
    clienteNome: 'Empresa Teste',
    clienteCnpj: '12345678901234',
    status: 'aceito' as const,
    valorTotal: 2500,
    dataEmissao: new Date().toISOString(),
    dataValidade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    itensCompleto: [
      {
        etapa: 'comercial' as const,
        categoriaId: 'cat1',
        categoriaNome: 'Categoria 1',
        descricao: 'Item 1',
        quantidade: 1,
        unidade: 'un',
        valorUnitarioMaoDeObra: 750,
        valorUnitarioMaterial: 750,
        valorTotalMaoDeObra: 750,
        valorTotalMaterial: 750,
        valorTotal: 1500,
      },
      {
        etapa: 'comercial' as const,
        categoriaId: 'cat1',
        categoriaNome: 'Categoria 1',
        descricao: 'Item 2',
        quantidade: 1,
        unidade: 'un',
        valorUnitarioMaoDeObra: 500,
        valorUnitarioMaterial: 500,
        valorTotalMaoDeObra: 500,
        valorTotalMaterial: 500,
        valorTotal: 1000,
      },
    ],
    createdAt: new Date(),
  },
];

describe('HistoricoOrcamentosModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar quando cliente é null', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { container } = render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={null}
      />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('deve mostrar loading quando está carregando', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('deve renderizar informações do cliente', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Histórico de Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('Empresa Teste')).toBeInTheDocument();
    expect(screen.getByText('Teste')).toBeInTheDocument();
    expect(screen.getByText('CNPJ/CPF: 12345678901234')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há orçamentos', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Nenhum orçamento encontrado')).toBeInTheDocument();
    expect(screen.getByText('Este cliente ainda não possui orçamentos cadastrados.')).toBeInTheDocument();
  });

  it('deve renderizar lista de orçamentos', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    const orc1Numero = formatOrcamentoNumero(mockOrcamentos[0].numero, mockOrcamentos[0].dataEmissao, mockOrcamentos[0].versao);
    const orc2Numero = formatOrcamentoNumero(mockOrcamentos[1].numero, mockOrcamentos[1].dataEmissao, mockOrcamentos[1].versao);
    expect(screen.getByText(`Orçamento ${orc1Numero}`)).toBeInTheDocument();
    expect(screen.getByText(`Orçamento ${orc2Numero}`)).toBeInTheDocument();
  });

  it('deve exibir quantidade de itens corretamente', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.getByText('2 itens')).toBeInTheDocument();
  });

  it('deve exibir badges de status corretos', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Aberto')).toBeInTheDocument();
    expect(screen.getByText('Aceito')).toBeInTheDocument();
  });

  it('deve exibir resumo com totais corretos', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    // Total de orçamentos: 2
    expect(screen.getByText('Total de Orçamentos')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Aceitos: 1
    expect(screen.getByText('Aceitos')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Valor Total Aceitos
    expect(screen.getByText('Valor Total Aceitos')).toBeInTheDocument();
  });

  it('deve ter botões de PDF para cada orçamento', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    const pdfButtons = screen.getAllByText('Baixar PDF');
    expect(pdfButtons).toHaveLength(2);
  });

  it('deve chamar gerarPDFOrcamento ao clicar em Baixar PDF', async () => {
    const { gerarPDFOrcamento } = await import('../../../components/orcamentos/OrcamentoPDF');

    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: mockOrcamentos,
      isLoading: false,
    } as any);

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    const pdfButtons = screen.getAllByText('Baixar PDF');
    fireEvent.click(pdfButtons[0]);

    expect(gerarPDFOrcamento).toHaveBeenCalledWith(mockOrcamentos[0]);
  });

  it('deve exibir cliente sem nome fantasia', () => {
    vi.mocked(useOrcamentosPorCliente).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const clienteSemFantasia = {
      id: 'c1',
      razaoSocial: 'Empresa Sem Fantasia',
      nomeFantasia: '',
      cnpj: '12345678901234',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234567',
      telefone: '11999999999',
      email: 'teste@email.com',
      createdAt: new Date(),
    };

    render(
      <HistoricoOrcamentosModal
        isOpen={true}
        onClose={mockOnClose}
        cliente={clienteSemFantasia}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Empresa Sem Fantasia')).toBeInTheDocument();
    expect(screen.queryByText('Teste')).not.toBeInTheDocument();
  });
});
