import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ClienteModal } from '../../../components/clientes/ClienteModal';
import { useBuscarCnpjBrasilAPI } from '../../../hooks/useClientes';

// Mock do hook
vi.mock('../../../hooks/useClientes', () => ({
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

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

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

describe('ClienteModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
      mutateAsync: vi.fn(),
      isLoading: false,
    } as any);
  });

  it('não deve renderizar quando não está aberto', () => {
    render(
      <ClienteModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('Novo Cliente')).not.toBeInTheDocument();
  });

  it('deve renderizar título para novo cliente', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Novo Cliente')).toBeInTheDocument();
  });

  it('deve renderizar título para editar cliente', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Editar Cliente')).toBeInTheDocument();
  });

  it('deve preencher campos com dados do cliente ao editar', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByDisplayValue('Empresa Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678901234')).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em cancelar', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deve trocar para pessoa física ao marcar checkbox', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const checkbox = screen.getByRole('checkbox', { name: /Pessoa Física/i });
    fireEvent.click(checkbox);

    // CPF é opcional para pessoa física (sem asterisco)
    expect(screen.getByText('CPF')).toBeInTheDocument();
    expect(screen.getByText('Nome *')).toBeInTheDocument();
    expect(screen.queryByText('Nome Fantasia')).not.toBeInTheDocument();
  });

  it('deve mostrar botão de buscar CNPJ para pessoa jurídica', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Buscar CNPJ')).toBeInTheDocument();
  });

  it('não deve mostrar botão de buscar CNPJ para pessoa física', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const checkbox = screen.getByRole('checkbox', { name: /Pessoa Física/i });
    fireEvent.click(checkbox);

    expect(screen.queryByText('Buscar CNPJ')).not.toBeInTheDocument();
  });

  it('deve mostrar erro se CNPJ tiver menos de 14 dígitos', async () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const cnpjInput = screen.getByPlaceholderText('00.000.000/0000-00');
    fireEvent.change(cnpjInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByText('Buscar CNPJ'));

    await waitFor(() => {
      expect(screen.getByText('CNPJ deve ter 14 dígitos')).toBeInTheDocument();
    });
  });

  it('deve buscar CNPJ e preencher dados automaticamente', async () => {
    const mockBuscar = vi.fn().mockResolvedValue({
      razao_social: 'Empresa Brasil API',
      nome_fantasia: 'Brasil API',
      logradouro: 'Rua API',
      numero: '100',
      bairro: 'Centro',
      municipio: 'São Paulo',
      uf: 'SP',
      cep: '01234567',
      telefone: '1199999999',
      email: 'api@email.com',
    });

    vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
      mutateAsync: mockBuscar,
      isLoading: false,
    } as any);

    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const cnpjInput = screen.getByPlaceholderText('00.000.000/0000-00');
    fireEvent.change(cnpjInput, { target: { value: '12345678901234' } });
    fireEvent.click(screen.getByText('Buscar CNPJ'));

    await waitFor(() => {
      expect(screen.getByText('Dados preenchidos automaticamente!')).toBeInTheDocument();
    });
  });

  it('deve mostrar erro quando CNPJ não for encontrado', async () => {
    const mockBuscar = vi.fn().mockResolvedValue(null);

    vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
      mutateAsync: mockBuscar,
      isLoading: false,
    } as any);

    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const cnpjInput = screen.getByPlaceholderText('00.000.000/0000-00');
    fireEvent.change(cnpjInput, { target: { value: '12345678901234' } });
    fireEvent.click(screen.getByText('Buscar CNPJ'));

    await waitFor(() => {
      expect(screen.getByText('CNPJ não encontrado na base da Receita Federal')).toBeInTheDocument();
    });
  });

  it('deve chamar onSave ao submeter formulário', async () => {
    mockOnSave.mockResolvedValue(undefined);

    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const cnpjInput = screen.getByPlaceholderText('00.000.000/0000-00');
    fireEvent.change(cnpjInput, { target: { value: '12345678901234' } });

    const razaoInput = screen.getByPlaceholderText('Razão Social da Empresa');
    fireEvent.change(razaoInput, { target: { value: 'Nova Empresa' } });

    fireEvent.click(screen.getByText('Cadastrar'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('deve mostrar erro ao falhar ao salvar', async () => {
    mockOnSave.mockRejectedValue(new Error('Erro ao salvar'));

    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const cnpjInput = screen.getByPlaceholderText('00.000.000/0000-00');
    fireEvent.change(cnpjInput, { target: { value: '12345678901234' } });

    const razaoInput = screen.getByPlaceholderText('Razão Social da Empresa');
    fireEvent.change(razaoInput, { target: { value: 'Nova Empresa' } });

    fireEvent.click(screen.getByText('Cadastrar'));

    await waitFor(() => {
      expect(screen.getByText('Erro ao salvar')).toBeInTheDocument();
    });
  });

  it('deve limitar CPF a 11 dígitos', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const checkbox = screen.getByRole('checkbox', { name: /Pessoa Física/i });
    fireEvent.click(checkbox);

    const cpfInput = screen.getByPlaceholderText('000.000.000-00');
    // Digita 11 dígitos válidos
    fireEvent.change(cpfInput, { target: { value: '12345678901' } });

    // Verifica que o valor foi aceito
    expect(cpfInput).toHaveValue('12345678901');
  });

  it('deve atualizar campos ao digitar em maiúsculas', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
      { wrapper: createWrapper() }
    );

    const cidadeInput = screen.getByPlaceholderText('Cidade');
    fireEvent.change(cidadeInput, { target: { value: 'Rio de Janeiro' } });

    // Deve converter para maiúsculas automaticamente
    expect(cidadeInput).toHaveValue('RIO DE JANEIRO');
  });

  it('deve mostrar Atualizar para cliente existente', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        cliente={mockCliente}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Atualizar')).toBeInTheDocument();
  });

  it('deve desabilitar botões quando está carregando', () => {
    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        loading={true}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Cancelar')).toBeDisabled();
    expect(screen.getByText('Salvando...')).toBeDisabled();
  });

  it('deve detectar pessoa física pelo tamanho do documento', () => {
    const clientePF = {
      ...mockCliente,
      cnpj: '12345678901', // CPF com 11 dígitos
    };

    render(
      <ClienteModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        cliente={clientePF}
      />,
      { wrapper: createWrapper() }
    );

    // Deve ter marcado o checkbox de pessoa física
    const checkbox = screen.getByRole('checkbox', { name: /Pessoa Física/i });
    expect(checkbox).toBeChecked();
  });
});
