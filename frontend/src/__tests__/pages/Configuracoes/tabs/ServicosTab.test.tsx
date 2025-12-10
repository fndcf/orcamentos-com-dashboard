import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ServicosTab } from '../../../../pages/Configuracoes/tabs/ServicosTab';
import {
  useServicos,
  useCriarServico,
  useAtualizarServico,
  useToggleServico,
  useExcluirServico,
} from '../../../../hooks/useServicos';

// Mock dos hooks
vi.mock('../../../../hooks/useServicos', () => ({
  useServicos: vi.fn(),
  useCriarServico: vi.fn(),
  useAtualizarServico: vi.fn(),
  useToggleServico: vi.fn(),
  useExcluirServico: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockServicos = [
  {
    id: '1',
    descricao: 'Assessoria, fornecimento, manutenção e instalação de equipamentos',
    ativo: true,
    ordem: 1,
  },
  {
    id: '2',
    descricao: 'Serviço de manutenção preventiva de extintores de incêndio',
    ativo: false,
    ordem: 2,
  },
];

const mockCriarMutateAsync = vi.fn();
const mockAtualizarMutateAsync = vi.fn();
const mockToggleMutateAsync = vi.fn();
const mockExcluirMutateAsync = vi.fn();

describe('ServicosTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useServicos).mockReturnValue({
      data: mockServicos,
      isLoading: false,
    } as any);

    vi.mocked(useCriarServico).mockReturnValue({
      mutateAsync: mockCriarMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useAtualizarServico).mockReturnValue({
      mutateAsync: mockAtualizarMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useToggleServico).mockReturnValue({
      mutateAsync: mockToggleMutateAsync,
      isLoading: false,
    } as any);

    vi.mocked(useExcluirServico).mockReturnValue({
      mutateAsync: mockExcluirMutateAsync,
      isLoading: false,
    } as any);
  });

  describe('Renderização básica', () => {
    it('deve renderizar título e descrição', () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Serviços para Orçamento Completo')).toBeInTheDocument();
      expect(
        screen.getByText(/Cadastre os tipos de serviço/)
      ).toBeInTheDocument();
    });

    it('deve renderizar botão de novo serviço', () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: '+ Novo Serviço' })).toBeInTheDocument();
    });

    it('deve renderizar lista de serviços', () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Serviço #1')).toBeInTheDocument();
      expect(screen.getByText('Serviço #2')).toBeInTheDocument();
      expect(screen.getByText('Assessoria, fornecimento, manutenção e instalação de equipamentos')).toBeInTheDocument();
    });

    it('deve mostrar status do serviço', () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Ativo')).toBeInTheDocument();
      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('deve mostrar estado vazio quando não há serviços', () => {
      vi.mocked(useServicos).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<ServicosTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Nenhum serviço cadastrado')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cadastrar Primeiro Serviço' })).toBeInTheDocument();
    });

    it('deve mostrar estado vazio quando data é undefined', () => {
      vi.mocked(useServicos).mockReturnValue({
        data: undefined,
        isLoading: false,
      } as any);

      render(<ServicosTab />, { wrapper: createWrapper() });

      expect(screen.getByText('Nenhum serviço cadastrado')).toBeInTheDocument();
    });

    it('deve mostrar botões de ação para cada serviço', () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      const excluirButtons = screen.getAllByText('Excluir');

      expect(editarButtons).toHaveLength(2);
      expect(excluirButtons).toHaveLength(2);
      expect(screen.getByText('Desativar')).toBeInTheDocument();
      expect(screen.getByText('Ativar')).toBeInTheDocument();
    });
  });

  describe('Modal de novo serviço', () => {
    it('deve abrir modal ao clicar em novo serviço', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
        expect(screen.getByText('Descrição do Serviço')).toBeInTheDocument();
      });
    });

    it('deve abrir modal ao clicar em cadastrar primeiro serviço', async () => {
      vi.mocked(useServicos).mockReturnValue({
        data: [],
        isLoading: false,
      } as any);

      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Primeiro Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });
    });

    it('deve fechar modal ao clicar em cancelar', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      await waitFor(() => {
        expect(screen.queryByText('Novo(a) Serviço')).not.toBeInTheDocument();
      });
    });

    it('deve desabilitar botão cadastrar com descrição curta', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });

    it('deve habilitar botão cadastrar com descrição válida', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: 'Descrição válida com mais de 10 caracteres' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).not.toBeDisabled();
    });

    it('deve criar serviço com sucesso', async () => {
      mockCriarMutateAsync.mockResolvedValue({});

      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: 'Novo serviço de manutenção' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(mockCriarMutateAsync).toHaveBeenCalledWith({
          descricao: 'Novo serviço de manutenção',
        });
      });
    });

    it('deve mostrar erro ao falhar criação', async () => {
      mockCriarMutateAsync.mockRejectedValue({
        response: { data: { error: 'Serviço já existe' } },
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: 'Novo serviço de manutenção' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Serviço já existe')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('deve mostrar mensagem genérica ao falhar criação sem mensagem específica', async () => {
      mockCriarMutateAsync.mockRejectedValue(new Error());
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: 'Novo serviço de manutenção' } });

      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Erro ao salvar. Tente novamente.')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Modal de editar serviço', () => {
    it('deve abrir modal de edição ao clicar em editar', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Serviço')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Assessoria, fornecimento, manutenção e instalação de equipamentos')).toBeInTheDocument();
      });
    });

    it('deve atualizar serviço com sucesso', async () => {
      mockAtualizarMutateAsync.mockResolvedValue({});

      render(<ServicosTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByDisplayValue('Assessoria, fornecimento, manutenção e instalação de equipamentos');
      fireEvent.change(textarea, { target: { value: 'Descrição alterada do serviço' } });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

      await waitFor(() => {
        expect(mockAtualizarMutateAsync).toHaveBeenCalledWith({
          id: '1',
          data: { descricao: 'Descrição alterada do serviço' },
        });
      });
    });

    it('deve mostrar erro ao falhar atualização', async () => {
      mockAtualizarMutateAsync.mockRejectedValue({
        response: { data: { message: 'Erro ao atualizar' } },
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ServicosTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByDisplayValue('Assessoria, fornecimento, manutenção e instalação de equipamentos');
      fireEvent.change(textarea, { target: { value: 'Descrição alterada' } });

      fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }));

      await waitFor(() => {
        expect(screen.getByText('Erro ao atualizar')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('não deve salvar com descrição curta', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      const editarButtons = screen.getAllByText('Editar');
      fireEvent.click(editarButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Editar Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByDisplayValue('Assessoria, fornecimento, manutenção e instalação de equipamentos');
      fireEvent.change(textarea, { target: { value: 'curto' } });

      const salvarButton = screen.getByRole('button', { name: 'Salvar Alterações' });
      expect(salvarButton).toBeDisabled();
    });
  });

  describe('Toggle de serviço', () => {
    it('deve chamar toggle ao clicar em desativar', async () => {
      mockToggleMutateAsync.mockResolvedValue({});

      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Desativar'));

      await waitFor(() => {
        expect(mockToggleMutateAsync).toHaveBeenCalledWith('1');
      });
    });

    it('deve chamar toggle ao clicar em ativar', async () => {
      mockToggleMutateAsync.mockResolvedValue({});

      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Ativar'));

      await waitFor(() => {
        expect(mockToggleMutateAsync).toHaveBeenCalledWith('2');
      });
    });

    it('deve logar erro ao falhar toggle', async () => {
      mockToggleMutateAsync.mockRejectedValue(new Error('Erro de rede'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByText('Desativar'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao alterar status do serviço'));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Exclusão de serviço', () => {
    it('deve abrir modal de confirmação ao clicar em excluir', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });
    });

    it('deve excluir serviço ao confirmar', async () => {
      mockExcluirMutateAsync.mockResolvedValue({});

      render(<ServicosTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      // O botão de confirmar no modal tem 3 botões Excluir na tela - pegamos o último (no modal)
      const allExcluirButtons = screen.getAllByRole('button', { name: /Excluir/i });
      const modalConfirmButton = allExcluirButtons[allExcluirButtons.length - 1];
      fireEvent.click(modalConfirmButton);

      await waitFor(() => {
        expect(mockExcluirMutateAsync).toHaveBeenCalledWith('1');
      });
    });

    it('deve fechar modal ao cancelar exclusão', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      const cancelarButton = screen.getByRole('button', { name: /Cancelar|Não/i });
      fireEvent.click(cancelarButton);

      await waitFor(() => {
        expect(screen.queryByText(/Tem certeza/)).not.toBeInTheDocument();
      });
    });

    it('deve logar erro ao falhar exclusão', async () => {
      mockExcluirMutateAsync.mockRejectedValue(new Error('Erro de rede'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ServicosTab />, { wrapper: createWrapper() });

      const excluirButtons = screen.getAllByText('Excluir');
      fireEvent.click(excluirButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
      });

      // O botão de confirmar no modal tem 3 botões Excluir na tela - pegamos o último (no modal)
      const allExcluirButtons = screen.getAllByRole('button', { name: /Excluir/i });
      const modalConfirmButton = allExcluirButtons[allExcluirButtons.length - 1];
      fireEvent.click(modalConfirmButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Erro ao excluir serviço'));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Validação do formulário', () => {
    it('não deve salvar com descrição vazia', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: '   ' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();
    });

    it('não deve salvar com descrição menor que 10 caracteres', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: '123456789' } });

      const cadastrarButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(cadastrarButton).toBeDisabled();

      fireEvent.change(textarea, { target: { value: '1234567890' } });
      expect(cadastrarButton).not.toBeDisabled();
    });
  });

  describe('Reset do formulário', () => {
    it('deve limpar formulário ao fechar modal', async () => {
      render(<ServicosTab />, { wrapper: createWrapper() });

      // Abre modal e preenche
      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: 'Texto de teste' } });

      // Fecha modal
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      // Reabre modal
      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        const newTextarea = screen.getByPlaceholderText(/Ex: Assessoria/);
        expect(newTextarea).toHaveValue('');
      });
    });

    it('deve limpar erro ao reabrir modal', async () => {
      mockCriarMutateAsync.mockRejectedValue({
        response: { data: { error: 'Erro de teste' } },
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<ServicosTab />, { wrapper: createWrapper() });

      // Abre modal e gera erro
      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.getByText('Novo(a) Serviço')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText(/Ex: Assessoria/);
      fireEvent.change(textarea, { target: { value: 'Texto de teste para erro' } });
      fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

      await waitFor(() => {
        expect(screen.getByText('Erro de teste')).toBeInTheDocument();
      });

      // Fecha modal
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

      mockCriarMutateAsync.mockResolvedValue({});

      // Reabre modal - erro deve estar limpo
      fireEvent.click(screen.getByRole('button', { name: '+ Novo Serviço' }));

      await waitFor(() => {
        expect(screen.queryByText('Erro de teste')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });
});
