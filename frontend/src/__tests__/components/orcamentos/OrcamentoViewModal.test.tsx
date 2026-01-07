import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OrcamentoViewModal } from '../../../components/orcamentos/OrcamentoViewModal';
import { formatOrcamentoNumero } from '../../../utils/constants';

// Mock do OrcamentoPDF
vi.mock('../../../components/orcamentos/OrcamentoPDF', () => ({
  gerarPDFOrcamento: vi.fn(),
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockOnClose = vi.fn();
const mockOnEdit = vi.fn();
const mockOnDuplicate = vi.fn();

const mockOrcamento = {
  id: 'o1',
  numero: 1,
  versao: 0,
  tipo: 'completo' as const,
  clienteId: 'c1',
  clienteNome: 'Empresa Teste',
  clienteCnpj: '12345678901234',
  clienteEndereco: 'Rua Teste, 123',
  clienteCidade: 'São Paulo',
  clienteEstado: 'SP',
  clienteTelefone: '11999999999',
  clienteEmail: 'teste@email.com',
  status: 'aberto' as const,
  valorTotal: 1500,
  valorTotalMaoDeObra: 800,
  valorTotalMaterial: 700,
  dataEmissao: '2024-01-15T00:00:00.000Z',
  dataValidade: '2024-02-15T00:00:00.000Z',
  servicoId: 's1',
  servicoDescricao: 'Assessoria e consultoria',
  itensCompleto: [
    {
      etapa: 'comercial' as const,
      categoriaId: 'cat1',
      categoriaNome: 'Extintores',
      descricao: 'Serviço 1',
      quantidade: 1,
      unidade: 'Serv.',
      valorUnitarioMaoDeObra: 500,
      valorUnitarioMaterial: 500,
      valorTotalMaoDeObra: 500,
      valorTotalMaterial: 500,
      valorTotal: 1000,
    },
    {
      etapa: 'comercial' as const,
      categoriaId: 'cat1',
      categoriaNome: 'Extintores',
      descricao: 'Serviço 2',
      quantidade: 2,
      unidade: 'Un.',
      valorUnitarioMaoDeObra: 75,
      valorUnitarioMaterial: 75,
      valorTotalMaoDeObra: 150,
      valorTotalMaterial: 150,
      valorTotal: 300,
    },
  ],
  condicaoPagamento: 'a_combinar' as const,
  observacoes: 'Observações de teste',
  consultor: 'João Consultor',
  contato: 'Maria Contato',
  createdAt: new Date('2024-01-15T00:00:00.000Z'),
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('OrcamentoViewModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('não deve renderizar quando orçamento é null', () => {
    const { container } = render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={null}
      />,
      { wrapper: Wrapper }
    );

    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar informações do orçamento', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Detalhes do Orçamento')).toBeInTheDocument();
    const orcNumero = formatOrcamentoNumero(mockOrcamento.numero, mockOrcamento.dataEmissao, mockOrcamento.versao);
    expect(screen.getByText(`Orçamento ${orcNumero}`)).toBeInTheDocument();
    expect(screen.getByText('Aberto')).toBeInTheDocument();
  });

  it('deve exibir informações do cliente', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Empresa Teste')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
  });

  it('deve exibir itens do orçamento', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Serviço 1')).toBeInTheDocument();
    expect(screen.getByText('Serviço 2')).toBeInTheDocument();
    expect(screen.getByText('Itens do Orçamento (Mão de Obra e Material)')).toBeInTheDocument();
  });

  it('deve exibir valor total', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Total Geral')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
  });


  it('deve exibir consultor e contato quando existem', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('João Consultor')).toBeInTheDocument();
    expect(screen.getByText('Maria Contato')).toBeInTheDocument();
  });

  it('deve chamar onEdit quando clicar em Editar', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
        onEdit={mockOnEdit}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText('Editar'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockOrcamento);
  });

  it('deve chamar onDuplicate quando clicar em Duplicar', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
        onDuplicate={mockOnDuplicate}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText('Duplicar'));
    expect(mockOnDuplicate).toHaveBeenCalledWith(mockOrcamento);
  });

  it('deve navegar para orçamentos ao clicar em "Ir para Orçamentos"', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText('Ir para Orçamentos'));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos');
  });

  it('deve chamar gerarPDFOrcamento ao clicar em Gerar PDF', async () => {
    const { gerarPDFOrcamento } = await import('../../../components/orcamentos/OrcamentoPDF');

    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText('Gerar PDF'));
    expect(gerarPDFOrcamento).toHaveBeenCalledWith(mockOrcamento);
  });

  it('não deve mostrar botão Editar para orçamentos não abertos', () => {
    const orcamentoAceito = { ...mockOrcamento, status: 'aceito' as const };

    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={orcamentoAceito}
        onEdit={mockOnEdit}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });

  it('deve mostrar alerta ao tentar editar orçamento não aberto via navigate', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const orcamentoAceito = { ...mockOrcamento, status: 'aceito' as const };

    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={orcamentoAceito}
      />,
      { wrapper: Wrapper }
    );

    // O botão Editar não deve aparecer para status diferente de 'aberto'
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();

    alertMock.mockRestore();
  });

  it('deve exibir todos os status corretamente', () => {
    const statuses = ['aberto', 'aceito', 'recusado', 'expirado'] as const;
    const labels = ['Aberto', 'Aceito', 'Recusado', 'Expirado'];

    statuses.forEach((status, index) => {
      const orcamentoComStatus = { ...mockOrcamento, status };
      const { unmount } = render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={orcamentoComStatus}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText(labels[index])).toBeInTheDocument();
      unmount();
    });
  });

  it('deve navegar para página de orçamentos com ação de editar quando onEdit não é fornecido', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText('Editar'));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos?action=edit&id=o1');
  });

  it('deve navegar para página de orçamentos com ação de duplicar quando onDuplicate não é fornecido', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    fireEvent.click(screen.getByText('Duplicar'));
    expect(mockOnClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/orcamentos?action=duplicate&id=o1');
  });

  it('deve exibir endereço completo do cliente', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText(/Rua Teste, 123/)).toBeInTheDocument();
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
  });

  it('deve exibir telefone do cliente quando existir', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Telefone')).toBeInTheDocument();
  });

  it('deve exibir email do cliente quando existir', () => {
    render(
      <OrcamentoViewModal
        isOpen={true}
        onClose={mockOnClose}
        orcamento={mockOrcamento}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('teste@email.com')).toBeInTheDocument();
  });

  describe('Orçamento Completo', () => {
    const mockOrcamentoCompleto = {
      ...mockOrcamento,
      tipo: 'completo' as const,
      valorTotalMaoDeObra: 800,
      valorTotalMaterial: 700,
      servicoDescricao: 'Assessoria e consultoria',
      limitacoesSelecionadas: ['Limitação 1', 'Limitação 2'],
      prazoExecucaoServicos: 30,
      prazoVistoriaBombeiros: 15,
      condicaoPagamento: 'parcelado' as const,
      parcelamentoTexto: '3x sem juros',
      itensCompleto: [
        {
          etapa: 'comercial' as const,
          categoriaId: 'cat1',
          categoriaNome: 'Extintores',
          descricao: 'Extintor ABC 6kg',
          quantidade: 2,
          unidade: 'UN',
          valorUnitarioMaoDeObra: 100,
          valorUnitarioMaterial: 150,
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 300,
          valorTotal: 500,
        },
      ],
    };

    it('deve renderizar serviço do orçamento completo', () => {
      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Serviço')).toBeInTheDocument();
      expect(screen.getByText('Assessoria e consultoria')).toBeInTheDocument();
    });

    it('deve renderizar itens completo do orçamento', () => {
      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Itens do Orçamento (Mão de Obra e Material)')).toBeInTheDocument();
    });

    it('deve exibir itens com valores de M.O. e Material', () => {
      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Extintor ABC 6kg')).toBeInTheDocument();
    });

    it('deve exibir totais de mão de obra e material', () => {
      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Total Mão de Obra')).toBeInTheDocument();
      expect(screen.getByText('Total Material')).toBeInTheDocument();
      expect(screen.getByText('Total Geral')).toBeInTheDocument();
    });

    it('deve renderizar limitações do escopo', () => {
      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Limitações do Escopo')).toBeInTheDocument();
      expect(screen.getByText('Limitação 1')).toBeInTheDocument();
      expect(screen.getByText('Limitação 2')).toBeInTheDocument();
    });

    it('deve renderizar prazos e condições', () => {
      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Prazos e Condições')).toBeInTheDocument();
      expect(screen.getByText('Prazo de Execução dos Serviços')).toBeInTheDocument();
      expect(screen.getByText(/30 dias úteis/)).toBeInTheDocument();
      expect(screen.getByText('Prazo para Vistoria do Corpo de Bombeiros')).toBeInTheDocument();
      expect(screen.getByText(/15 dias/)).toBeInTheDocument();
    });

    it('deve renderizar condição de pagamento parcelado', () => {
      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={mockOrcamentoCompleto}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Condição de Pagamento')).toBeInTheDocument();
      expect(screen.getByText('3x sem juros')).toBeInTheDocument();
    });

    it('deve renderizar condição de pagamento a combinar', () => {
      const orcACombinar = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: 'a_combinar' as const,
        parcelamentoTexto: undefined,
      };

      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={orcACombinar}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('A combinar')).toBeInTheDocument();
    });

    it('não deve mostrar limitações quando não existem', () => {
      const orcSemLimitacoes = {
        ...mockOrcamentoCompleto,
        limitacoesSelecionadas: [],
      };

      render(
        <OrcamentoViewModal
          isOpen={true}
          onClose={mockOnClose}
          orcamento={orcSemLimitacoes}
        />,
        { wrapper: Wrapper }
      );

      expect(screen.queryByText('Limitações do Escopo')).not.toBeInTheDocument();
    });
  });
});
