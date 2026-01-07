import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { EmpresaTab } from '../../../../pages/Configuracoes/tabs/EmpresaTab';
import {
  useConfiguracoesGerais,
  useAtualizarConfiguracoesGerais,
} from '../../../../hooks/useConfiguracoesGerais';
import { useBuscarCnpjBrasilAPI } from '../../../../hooks/useClientes';

// Mock dos hooks
vi.mock('../../../../hooks/useConfiguracoesGerais', () => ({
  useConfiguracoesGerais: vi.fn(),
  useAtualizarConfiguracoesGerais: vi.fn(),
}));

vi.mock('../../../../hooks/useClientes', () => ({
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

const mockConfiguracoesGerais = {
  nomeEmpresa: 'FLAMA Proteção',
  cnpjEmpresa: '12.345.678/0001-90',
  enderecoEmpresa: 'Rua das Flores, 123 - Centro',
  telefoneEmpresa: '(11) 99999-9999',
  emailEmpresa: 'contato@flama.com.br',
  diasValidadeOrcamento: 30,
};

const mockMutateAsync = vi.fn();
const mockBuscarCnpjMutateAsync = vi.fn();

describe('EmpresaTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useConfiguracoesGerais).mockReturnValue({
      data: mockConfiguracoesGerais,
      isLoading: false,
    } as any);

    vi.mocked(useAtualizarConfiguracoesGerais).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
      mutateAsync: mockBuscarCnpjMutateAsync,
      isLoading: false,
    } as any);
  });

  describe('Renderização básica', () => {
    it('deve renderizar título e descrição', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Dados da Empresa')).toBeInTheDocument();
      expect(
        screen.getByText(/Configure os dados da sua empresa/)
      ).toBeInTheDocument();
    });

    it('deve renderizar campos do formulário', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('CNPJ')).toBeInTheDocument();
      expect(screen.getByText('Nome da Empresa *')).toBeInTheDocument();
      expect(screen.getByText('Endereço Completo')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Telefone')).toBeInTheDocument();
      expect(screen.getByText('Dias de Validade do Orçamento')).toBeInTheDocument();
    });

    it('deve preencher formulário com dados existentes', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('FLAMA Proteção')).toBeInTheDocument();
      expect(screen.getByDisplayValue('12.345.678/0001-90')).toBeInTheDocument();
      expect(screen.getByDisplayValue('contato@flama.com.br')).toBeInTheDocument();
      expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    });

    it('deve mostrar botão Salvar desabilitado quando form não está dirty', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).toBeDisabled();
    });

    it('deve renderizar com valores default quando não há dados', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });
  });

  describe('Interações com formulário', () => {
    it('deve atualizar campo nome da empresa', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      expect(screen.getByDisplayValue('Nova Empresa')).toBeInTheDocument();
    });

    it('deve formatar CNPJ ao digitar', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      expect(screen.getByDisplayValue('11.222.333/0001-81')).toBeInTheDocument();
    });

    it('deve formatar telefone fixo ao digitar', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const telefoneInput = screen.getByDisplayValue('(11) 99999-9999');
      fireEvent.change(telefoneInput, { target: { value: '1133334444' } });

      expect(screen.getByDisplayValue('(11) 3333-4444')).toBeInTheDocument();
    });

    it('deve formatar telefone celular ao digitar', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const telefoneInput = screen.getByDisplayValue('(11) 99999-9999');
      fireEvent.change(telefoneInput, { target: { value: '11988887777' } });

      expect(screen.getByDisplayValue('(11) 98888-7777')).toBeInTheDocument();
    });

    it('deve atualizar dias de validade', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const diasInput = screen.getByDisplayValue('30');
      fireEvent.change(diasInput, { target: { value: '45' } });

      expect(screen.getByDisplayValue('45')).toBeInTheDocument();
    });

    it('deve mostrar botão Cancelar quando form está dirty', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('deve habilitar botão Salvar quando form está dirty', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).not.toBeDisabled();
    });
  });

  describe('Salvar configurações', () => {
    it('deve salvar configurações com sucesso', async () => {
      mockMutateAsync.mockResolvedValue({});

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
        expect(screen.getByText('Configurações salvas com sucesso!')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro ao falhar salvar', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Erro de rede'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nova Empresa' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao salvar configurações')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Buscar CNPJ', () => {
    it('deve buscar e preencher dados do CNPJ', async () => {
      mockBuscarCnpjMutateAsync.mockResolvedValue({
        razao_social: 'Empresa Brasil LTDA',
        logradouro: 'Av. Paulista',
        numero: '1000',
        complemento: 'Sala 101',
        bairro: 'Bela Vista',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01310-100',
        telefone: '1133334444',
        email: 'contato@empresabrasil.com.br',
      });

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('Dados preenchidos automaticamente!')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Empresa Brasil LTDA')).toBeInTheDocument();
        expect(screen.getByDisplayValue('contato@empresabrasil.com.br')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro quando CNPJ não encontrado', async () => {
      mockBuscarCnpjMutateAsync.mockResolvedValue(null);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('CNPJ não encontrado na base da Receita Federal')).toBeInTheDocument();
      });
    });

    it('deve mostrar erro ao falhar busca do CNPJ', async () => {
      mockBuscarCnpjMutateAsync.mockRejectedValue(new Error('Erro de API'));

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao buscar CNPJ')).toBeInTheDocument();
      });
    });

    it('deve mostrar mensagem de buscando ao iniciar busca', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockBuscarCnpjMutateAsync.mockReturnValue(promise);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      expect(screen.getByText('Buscando dados do CNPJ...')).toBeInTheDocument();

      resolvePromise!({ razao_social: 'Teste' });
    });

    it('deve desabilitar botão buscar quando carregando', () => {
      vi.mocked(useBuscarCnpjBrasilAPI).mockReturnValue({
        mutateAsync: mockBuscarCnpjMutateAsync,
        isLoading: true,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const buscarButton = screen.getByRole('button', { name: 'Buscando...' });
      expect(buscarButton).toBeDisabled();
    });

    it('deve desabilitar botão buscar quando CNPJ incompleto', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '123' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      expect(buscarButton).toBeDisabled();
    });
  });

  describe('Cancelar alterações', () => {
    it('deve restaurar valores originais ao cancelar', async () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nome Alterado' } });

      expect(screen.getByDisplayValue('Nome Alterado')).toBeInTheDocument();

      const cancelarButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('FLAMA Proteção')).toBeInTheDocument();
      });
    });

    it('deve esconder botão cancelar após cancelar', async () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const nomeInput = screen.getByDisplayValue('FLAMA Proteção');
      fireEvent.change(nomeInput, { target: { value: 'Nome Alterado' } });

      const cancelarButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButton);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Preenchimento com Brasil API', () => {
    it('deve preencher endereço completo sem complemento', async () => {
      mockBuscarCnpjMutateAsync.mockResolvedValue({
        razao_social: 'Empresa Test LTDA',
        logradouro: 'Rua Teste',
        numero: '100',
        complemento: '',
        bairro: 'Centro',
        municipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20000-000',
        telefone: '',
        email: '',
      });

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue(/Rua Teste, 100, Centro - Rio de Janeiro\/RJ/)).toBeInTheDocument();
      });
    });

    it('deve manter valores anteriores quando API não retorna dados', async () => {
      mockBuscarCnpjMutateAsync.mockResolvedValue({
        razao_social: '',
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

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const cnpjInput = screen.getByDisplayValue('12.345.678/0001-90');
      fireEvent.change(cnpjInput, { target: { value: '11222333000181' } });

      const buscarButton = screen.getByRole('button', { name: 'Buscar CNPJ' });
      fireEvent.click(buscarButton);

      await waitFor(() => {
        // Nome original deve ser mantido pois razao_social está vazio
        expect(screen.getByDisplayValue('FLAMA Proteção')).toBeInTheDocument();
      });
    });
  });

  describe('Valores default para diasValidadeOrcamento', () => {
    it('deve usar 30 como valor default quando vazio', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      const diasInput = screen.getByDisplayValue('30');
      fireEvent.change(diasInput, { target: { value: '' } });

      // Ao limpar, deve usar 30 como default (parseInt('') || 30)
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });
  });

  describe('Configurações de Impostos', () => {
    it('deve renderizar seção de impostos', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Impostos')).toBeInTheDocument();
      expect(
        screen.getByText(/Configure os percentuais de impostos/)
      ).toBeInTheDocument();
    });

    it('deve renderizar campos de imposto sobre material e serviço', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Imposto sobre Material (%)')).toBeInTheDocument();
      expect(screen.getByText('Imposto sobre Serviço (%)')).toBeInTheDocument();
    });

    it('deve preencher campos de impostos com valores existentes', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 10,
          impostoServico: 15,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    });

    it('deve usar 0 como valor default para impostos quando não definidos', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: mockConfiguracoesGerais, // Sem impostoMaterial e impostoServico
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Deve haver campos com valor 0 para impostos
      const zeroInputs = screen.getAllByDisplayValue('0');
      expect(zeroInputs.length).toBeGreaterThanOrEqual(2);
    });

    it('deve atualizar campo imposto sobre material', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Encontrar o input pelo label
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '12.5' } });

      expect(screen.getByDisplayValue('12.5')).toBeInTheDocument();
    });

    it('deve atualizar campo imposto sobre serviço', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Encontrar o input pelo label
      const impostoServicoLabel = screen.getByText('Imposto sobre Serviço (%)');
      const formGroup = impostoServicoLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '18' } });

      expect(screen.getByDisplayValue('18')).toBeInTheDocument();
    });

    it('deve marcar formulário como dirty ao alterar impostos', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 5,
          impostoServico: 10,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Inicialmente o botão Salvar deve estar desabilitado
      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).toBeDisabled();

      // Encontrar e alterar o input de imposto sobre material
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '8' } });

      // Agora o botão Salvar deve estar habilitado
      expect(salvarButton).not.toBeDisabled();
    });

    it('deve salvar impostos junto com outras configurações', async () => {
      mockMutateAsync.mockResolvedValue({});

      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 5,
          impostoServico: 10,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Alterar imposto sobre material
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '12' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      fireEvent.click(salvarButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            impostoMaterial: 12,
            impostoServico: 10,
          })
        );
      });
    });

    it('deve restaurar valores de impostos ao cancelar', async () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 8,
          impostoServico: 12,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      // Alterar imposto sobre material
      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '20' } });
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();

      // Cancelar
      const cancelarButton = screen.getByRole('button', { name: 'Cancelar' });
      fireEvent.click(cancelarButton);

      await waitFor(() => {
        // Valor original deve ser restaurado
        expect(screen.getByDisplayValue('8')).toBeInTheDocument();
      });
    });

    it('deve aceitar valores decimais para impostos', () => {
      vi.mocked(useConfiguracoesGerais).mockReturnValue({
        data: {
          ...mockConfiguracoesGerais,
          impostoMaterial: 0,
          impostoServico: 0,
        },
        isLoading: false,
      } as any);

      render(<EmpresaTab />, { wrapper: createWrapper() });

      const impostoMaterialLabel = screen.getByText('Imposto sobre Material (%)');
      const formGroup = impostoMaterialLabel.closest('div');
      const input = formGroup?.querySelector('input');

      fireEvent.change(input!, { target: { value: '9.75' } });

      expect(screen.getByDisplayValue('9.75')).toBeInTheDocument();
    });

    it('deve mostrar texto de ajuda para campos de impostos', () => {
      render(<EmpresaTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Percentual de imposto sobre vendas de material')).toBeInTheDocument();
      expect(screen.getByText('Percentual de imposto sobre mão de obra/serviços')).toBeInTheDocument();
    });
  });
});
