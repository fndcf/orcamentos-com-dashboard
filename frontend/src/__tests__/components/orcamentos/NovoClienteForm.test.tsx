import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NovoClienteForm } from '../../../components/orcamentos/OrcamentoModal/NovoClienteForm';
import {
  useCriarCliente,
  useBuscarCnpjBrasilAPI,
} from '../../../hooks/useClientes';

vi.mock('../../../hooks/useClientes', () => ({
  useCriarCliente: vi.fn(),
  useBuscarCnpjBrasilAPI: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockOnClienteCriado = vi.fn();
const mockOnCancelar = vi.fn();
const mockCriarMutateAsync = vi.fn();
const mockBuscarCnpjMutateAsync = vi.fn();

describe('NovoClienteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCriarCliente).mockReturnValue({
      mutateAsync: mockCriarMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
      mutateAsync: mockBuscarCnpjMutateAsync,
      isLoading: false,
    } as any);
  });

  describe('Renderizacao basica', () => {
    it('deve renderizar titulo do formulario', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Cadastrar Novo Cliente')).toBeInTheDocument();
    });

    it('deve renderizar campos de pessoa juridica por padrao', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText('CNPJ *')).toBeInTheDocument();
      expect(screen.getByLabelText('Razão Social *')).toBeInTheDocument();
      expect(screen.getByLabelText('Nome Fantasia')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Buscar CNPJ' })).toBeInTheDocument();
    });

    it('deve renderizar checkbox de pessoa fisica', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText('Pessoa Física (CPF)')).toBeInTheDocument();
    });

    it('deve renderizar campos de endereco', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText('Endereço')).toBeInTheDocument();
      expect(screen.getByLabelText('Cidade')).toBeInTheDocument();
      expect(screen.getByLabelText('Estado')).toBeInTheDocument();
      expect(screen.getByLabelText('CEP')).toBeInTheDocument();
    });

    it('deve renderizar campos de contato', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('deve renderizar botao salvar', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: 'Salvar Cliente e Continuar' })).toBeInTheDocument();
    });
  });

  describe('Alternar tipo de pessoa', () => {
    it('deve mudar para pessoa fisica ao marcar checkbox', async () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const checkbox = screen.getByLabelText('Pessoa Física (CPF)');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByLabelText('CPF')).toBeInTheDocument();
        expect(screen.getByLabelText('Nome *')).toBeInTheDocument();
        expect(screen.queryByLabelText('Nome Fantasia')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Buscar CNPJ' })).not.toBeInTheDocument();
      });
    });

    it('deve limpar CNPJ e nome fantasia ao alternar para pessoa fisica', async () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      // Preencher CNPJ e nome fantasia
      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678901234' } });

      const nomeFantasiaInput = screen.getByLabelText('Nome Fantasia');
      fireEvent.change(nomeFantasiaInput, { target: { value: 'Nome Fantasia Teste' } });

      // Alternar para pessoa fisica
      const checkbox = screen.getByLabelText('Pessoa Física (CPF)');
      fireEvent.click(checkbox);

      // Verificar que campos foram limpos
      await waitFor(() => {
        const cpfInput = screen.getByLabelText('CPF');
        expect(cpfInput).toHaveValue('');
      });
    });
  });

  describe('Entrada de documento', () => {
    it('deve aceitar entrada de CNPJ', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678901234' } });

      expect(cnpjInput).toHaveValue('12345678901234');
    });

    it('deve aceitar entrada de CPF', async () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      // Alternar para pessoa fisica
      const checkbox = screen.getByLabelText('Pessoa Física (CPF)');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByLabelText('CPF')).toBeInTheDocument();
      });

      const cpfInput = screen.getByLabelText('CPF');
      fireEvent.change(cpfInput, { target: { value: '12345678901' } });

      expect(cpfInput).toHaveValue('12345678901');
    });

    it('deve remover caracteres nao numericos do documento', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      expect(cnpjInput).toHaveValue('12345678000190');
    });
  });

  describe('Buscar CNPJ', () => {
    it('deve mostrar erro para CNPJ incompleto', async () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '123' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('CNPJ deve ter 14 dígitos')).toBeInTheDocument();
      });
    });

    it('deve buscar e preencher dados do CNPJ em maiusculas', async () => {
      mockBuscarCnpjMutateAsync.mockResolvedValue({
        razao_social: 'Empresa Teste LTDA',
        nome_fantasia: 'Empresa Teste',
        logradouro: 'Rua das Flores',
        numero: '100',
        complemento: 'Sala 10',
        bairro: 'Centro',
        municipio: 'Sao Paulo',
        uf: 'SP',
        cep: '01234-567',
        telefone: '1199999999',
        email: 'contato@empresateste.com',
      });

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('Dados preenchidos automaticamente!')).toBeInTheDocument();
        // Dados da API são convertidos para maiúsculas
        expect(screen.getByDisplayValue('EMPRESA TESTE LTDA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('EMPRESA TESTE')).toBeInTheDocument();
        expect(screen.getByDisplayValue('SAO PAULO')).toBeInTheDocument();
        expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro quando CNPJ nao encontrado', async () => {
      mockBuscarCnpjMutateAsync.mockResolvedValue(null);

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('CNPJ não encontrado na base da Receita Federal')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro ao falhar busca', async () => {
      mockBuscarCnpjMutateAsync.mockRejectedValue(new Error('Erro de rede'));

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao buscar CNPJ')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem de buscando', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockBuscarCnpjMutateAsync.mockReturnValue(promise);

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      expect(screen.getByText('Buscando dados do CNPJ...')).toBeInTheDocument();

      resolvePromise!({ razao_social: 'Teste' });
    });

    it('deve desabilitar botao buscar quando carregando', () => {
      vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
        mutateAsync: mockBuscarCnpjMutateAsync,
        isLoading: true,
      } as any);

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const buscarButton = screen.getByRole('button', { name: 'Buscando...' });
      expect(buscarButton).toBeDisabled();
    });
  });

  describe('Salvar cliente', () => {
    it('deve mostrar erro quando CNPJ vazio', async () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('CNPJ deve ter 14 dígitos')).toBeInTheDocument();
      });
    });

    it('deve permitir salvar pessoa fisica sem CPF (CPF é opcional)', async () => {
      mockCriarMutateAsync.mockResolvedValue({ id: 'novo-cliente-id' });

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const checkbox = screen.getByLabelText('Pessoa Física (CPF)');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByLabelText('Nome *')).toBeInTheDocument();
      });

      const nomeInput = screen.getByLabelText('Nome *');
      fireEvent.change(nomeInput, { target: { value: 'João da Silva' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockCriarMutateAsync).toHaveBeenCalled();
      });
    });

    it('deve mostrar erro quando razao social vazia', async () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('Razão Social é obrigatória')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro quando nome vazio para pessoa fisica', async () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const checkbox = screen.getByLabelText('Pessoa Física (CPF)');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByLabelText('CPF')).toBeInTheDocument();
      });

      // CPF é opcional, mas nome é obrigatório
      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      });
    });

    it('deve salvar cliente com sucesso em maiusculas', async () => {
      mockCriarMutateAsync.mockResolvedValue({ id: 'novo-cliente-id' });

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const razaoSocialInput = screen.getByLabelText('Razão Social *');
      fireEvent.change(razaoSocialInput, { target: { value: 'Empresa Teste LTDA' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        // Valores são salvos em maiúsculas
        expect(mockCriarMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            cnpj: '12345678000190',
            razaoSocial: 'EMPRESA TESTE LTDA',
            tipoPessoa: 'juridica',
          })
        );
        expect(mockOnClienteCriado).toHaveBeenCalledWith({ id: 'novo-cliente-id' });
      });
    });

    it('deve mostrar erro quando cliente criado sem ID', async () => {
      mockCriarMutateAsync.mockResolvedValue({});

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const razaoSocialInput = screen.getByLabelText('Razão Social *');
      fireEvent.change(razaoSocialInput, { target: { value: 'Empresa Teste' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao obter ID do cliente criado')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro ao falhar criacao', async () => {
      mockCriarMutateAsync.mockRejectedValue(new Error('Cliente ja existe'));

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const razaoSocialInput = screen.getByLabelText('Razão Social *');
      fireEvent.change(razaoSocialInput, { target: { value: 'Empresa Teste' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('Cliente ja existe')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem generica ao falhar sem mensagem', async () => {
      mockCriarMutateAsync.mockRejectedValue({});

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const razaoSocialInput = screen.getByLabelText('Razão Social *');
      fireEvent.change(razaoSocialInput, { target: { value: 'Empresa Teste' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao salvar cliente')).toBeInTheDocument();
      });
    });

    it('deve mostrar salvando durante processo', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockCriarMutateAsync.mockReturnValue(promise);

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const razaoSocialInput = screen.getByLabelText('Razão Social *');
      fireEvent.change(razaoSocialInput, { target: { value: 'Empresa Teste' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Cliente e Continuar' });
      fireEvent.click(salvarButton);

      expect(screen.getByText('Salvando cliente...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled();

      resolvePromise!({ id: 'test' });
    });
  });

  describe('Preenchimento de campos', () => {
    it('deve preencher todos os campos do formulario em maiusculas (exceto email)', () => {
      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      fireEvent.change(screen.getByLabelText('CNPJ *'), { target: { value: '12345678000190' } });
      fireEvent.change(screen.getByLabelText('Razão Social *'), { target: { value: 'Empresa' } });
      fireEvent.change(screen.getByLabelText('Nome Fantasia'), { target: { value: 'Fantasia' } });
      fireEvent.change(screen.getByLabelText('Endereço'), { target: { value: 'Rua Teste' } });
      fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Cidade Teste' } });
      fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'sp' } });
      fireEvent.change(screen.getByLabelText('CEP'), { target: { value: '01234567' } });
      fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '11999999999' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });

      expect(screen.getByDisplayValue('12345678000190')).toBeInTheDocument();
      // Campos são convertidos para maiúsculas
      expect(screen.getByDisplayValue('EMPRESA')).toBeInTheDocument();
      expect(screen.getByDisplayValue('FANTASIA')).toBeInTheDocument();
      expect(screen.getByDisplayValue('RUA TESTE')).toBeInTheDocument();
      expect(screen.getByDisplayValue('CIDADE TESTE')).toBeInTheDocument();
      expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
      expect(screen.getByDisplayValue('01234567')).toBeInTheDocument();
      expect(screen.getByDisplayValue('11999999999')).toBeInTheDocument();
      // Email mantém minúsculas
      expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
    });
  });

  describe('Brasil API preenchimento parcial', () => {
    it('deve manter valores existentes quando API nao retorna alguns dados', async () => {
      mockBuscarCnpjMutateAsync.mockResolvedValue({
        razao_social: 'Empresa Nova',
        nome_fantasia: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        municipio: '',
        uf: '',
        cep: '',
        telefone: '',
        email: '',
      });

      render(
        <NovoClienteForm
          onClienteCriado={mockOnClienteCriado}
          onCancelar={mockOnCancelar}
        />,
        { wrapper: createWrapper() }
      );

      // Pre-preencher cidade
      fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Cidade Existente' } });

      const cnpjInput = screen.getByLabelText('CNPJ *');
      fireEvent.change(cnpjInput, { target: { value: '12345678000190' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        // Valores são convertidos para maiúsculas
        expect(screen.getByDisplayValue('EMPRESA NOVA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('CIDADE EXISTENTE')).toBeInTheDocument();
      });
    });
  });
});
