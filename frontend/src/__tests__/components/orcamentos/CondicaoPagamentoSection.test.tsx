import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CondicaoPagamentoFormSection } from '../../../components/orcamentos/OrcamentoModal/OrcamentoCompletoSections';
import { ConfiguracoesGerais, ParcelamentoDados } from '../../../types';

// Mock para scrollIntoView que não existe no jsdom
Element.prototype.scrollIntoView = vi.fn();

const mockOnCondicaoChange = vi.fn();
const mockOnParcelamentoTextoChange = vi.fn();
const mockOnParcelamentoDadosChange = vi.fn();
const mockOnDescontoAVistaChange = vi.fn();

const defaultConfiguracoes: ConfiguracoesGerais = {
  diasValidadeOrcamento: 30,
  nomeEmpresa: 'Empresa Teste',
  cnpjEmpresa: '12.345.678/0001-00',
  enderecoEmpresa: 'Rua Teste, 123',
  telefoneEmpresa: '(11) 99999-9999',
  parcelamentoMaxParcelas: 6,
  parcelamentoValorMinimo: 1000,
  parcelamentoJurosAPartirDe: 3,
  parcelamentoTaxaJuros: 2.5,
};

const defaultProps = {
  condicao: 'parcelado' as const,
  parcelamentoTexto: '',
  parcelamentoDados: undefined,
  descontoAVista: undefined,
  onCondicaoChange: mockOnCondicaoChange,
  onParcelamentoTextoChange: mockOnParcelamentoTextoChange,
  onParcelamentoDadosChange: mockOnParcelamentoDadosChange,
  onDescontoAVistaChange: mockOnDescontoAVistaChange,
  valorTotal: 10000,
  configuracoes: defaultConfiguracoes,
};

describe('CondicaoPagamentoFormSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Seleção de Parcelas', () => {
    it('deve renderizar opções de parcelamento quando condição é parcelado', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      expect(screen.getByText('Opções de Parcelamento (aparecerão no PDF)')).toBeInTheDocument();
      expect(screen.getByText(/1x de/)).toBeInTheDocument();
      expect(screen.getByText(/2x de/)).toBeInTheDocument();
    });

    it('deve mostrar checkboxes para cada parcela', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // Deve haver checkboxes para as parcelas (até 6 conforme configuração)
      expect(checkboxes.length).toBeGreaterThanOrEqual(6);
    });

    it('deve permitir selecionar uma parcela clicando no checkbox', async () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const primeiroCheckbox = checkboxes[0];

      fireEvent.click(primeiroCheckbox);

      await waitFor(() => {
        expect(primeiroCheckbox).toBeChecked();
      });
    });

    it('deve permitir desselecionar uma parcela já selecionada', async () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const primeiroCheckbox = checkboxes[0];

      // Seleciona
      fireEvent.click(primeiroCheckbox);
      await waitFor(() => {
        expect(primeiroCheckbox).toBeChecked();
      });

      // Desseleciona
      fireEvent.click(primeiroCheckbox);
      await waitFor(() => {
        expect(primeiroCheckbox).not.toBeChecked();
      });
    });

    it('deve permitir selecionar múltiplas parcelas', async () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');

      fireEvent.click(checkboxes[0]); // 1x
      fireEvent.click(checkboxes[1]); // 2x
      fireEvent.click(checkboxes[2]); // 3x

      await waitFor(() => {
        expect(checkboxes[0]).toBeChecked();
        expect(checkboxes[1]).toBeChecked();
        expect(checkboxes[2]).toBeChecked();
      });
    });

    it('deve chamar onParcelamentoDadosChange com parcelasSelecionadas quando há seleção', async () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');

      fireEvent.click(checkboxes[0]); // Seleciona 1x

      await waitFor(() => {
        expect(mockOnParcelamentoDadosChange).toHaveBeenCalled();
        const ultimaChamada = mockOnParcelamentoDadosChange.mock.calls[mockOnParcelamentoDadosChange.mock.calls.length - 1][0];
        expect(ultimaChamada.parcelasSelecionadas).toContain(1);
      });
    });

    it('deve chamar onParcelamentoDadosChange sem parcelasSelecionadas quando nenhuma está selecionada', async () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      // Aguarda a chamada inicial
      await waitFor(() => {
        expect(mockOnParcelamentoDadosChange).toHaveBeenCalled();
        const ultimaChamada = mockOnParcelamentoDadosChange.mock.calls[mockOnParcelamentoDadosChange.mock.calls.length - 1][0];
        expect(ultimaChamada.parcelasSelecionadas).toBeUndefined();
      });
    });

    it('deve marcar parcelas abaixo do mínimo com abaixoDoMinimo=true', async () => {
      // Valor total baixo para que algumas parcelas fiquem abaixo do mínimo
      const props = {
        ...defaultProps,
        valorTotal: 3000, // Com entrada de 20% (600), restante é 2400
        // 6x de 400 < 1000 (mínimo) - está abaixo
      };

      render(<CondicaoPagamentoFormSection {...props} />);

      await waitFor(() => {
        expect(mockOnParcelamentoDadosChange).toHaveBeenCalled();
        const ultimaChamada = mockOnParcelamentoDadosChange.mock.calls[mockOnParcelamentoDadosChange.mock.calls.length - 1][0];

        // Verifica que há parcelas marcadas como abaixo do mínimo
        const parcelasAbaixo = ultimaChamada.opcoes.filter((o: { abaixoDoMinimo?: boolean }) => o.abaixoDoMinimo);
        expect(parcelasAbaixo.length).toBeGreaterThan(0);
      });
    });

    it('deve permitir selecionar parcelas que estão abaixo do mínimo', async () => {
      // Valor total baixo para que algumas parcelas fiquem abaixo do mínimo
      const props = {
        ...defaultProps,
        valorTotal: 3000,
      };

      render(<CondicaoPagamentoFormSection {...props} />);

      // Encontra todos os checkboxes (incluindo os de parcelas abaixo do mínimo)
      const checkboxes = screen.getAllByRole('checkbox');

      // Tenta selecionar a última parcela (provavelmente abaixo do mínimo)
      const ultimoCheckbox = checkboxes[checkboxes.length - 1];

      fireEvent.click(ultimoCheckbox);

      await waitFor(() => {
        expect(ultimoCheckbox).toBeChecked();
      });
    });

    it('deve mostrar texto "(abaixo do mínimo)" para parcelas abaixo do valor mínimo', () => {
      const props = {
        ...defaultProps,
        valorTotal: 3000,
      };

      render(<CondicaoPagamentoFormSection {...props} />);

      expect(screen.getAllByText('(abaixo do mínimo)').length).toBeGreaterThan(0);
    });

    it('deve manter checkboxes de parcelas abaixo do mínimo clicáveis (não disabled)', () => {
      const props = {
        ...defaultProps,
        valorTotal: 3000,
      };

      render(<CondicaoPagamentoFormSection {...props} />);

      const checkboxes = screen.getAllByRole('checkbox');

      // Nenhum checkbox deve estar disabled
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeDisabled();
      });
    });
  });

  describe('Persistência de seleção ao editar', () => {
    it('deve restaurar parcelas selecionadas ao editar orçamento', async () => {
      const parcelamentoDados: ParcelamentoDados = {
        entradaPercent: 20,
        valorEntrada: 2000,
        valorRestante: 8000,
        opcoes: [
          { numeroParcelas: 1, valorParcela: 8000, valorTotal: 10000, temJuros: false, taxaJuros: 0 },
          { numeroParcelas: 2, valorParcela: 4000, valorTotal: 10000, temJuros: false, taxaJuros: 0 },
          { numeroParcelas: 3, valorParcela: 2666.67, valorTotal: 10000, temJuros: true, taxaJuros: 2.5 },
        ],
        parcelasSelecionadas: [1, 3], // Selecionou 1x e 3x
      };

      render(
        <CondicaoPagamentoFormSection
          {...defaultProps}
          parcelamentoDados={parcelamentoDados}
        />
      );

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        // O primeiro (1x) e terceiro (3x) devem estar marcados
        expect(checkboxes[0]).toBeChecked(); // 1x
        expect(checkboxes[1]).not.toBeChecked(); // 2x
        expect(checkboxes[2]).toBeChecked(); // 3x
      });
    });
  });

  describe('Opções de entrada', () => {
    it('deve mostrar opções de entrada de 10% a 50%', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      expect(screen.getByRole('button', { name: '10%' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '20%' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '30%' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '40%' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '50%' })).toBeInTheDocument();
    });

    it('deve recalcular parcelas ao mudar percentual de entrada', async () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const botao30 = screen.getByRole('button', { name: '30%' });
      fireEvent.click(botao30);

      await waitFor(() => {
        expect(mockOnParcelamentoDadosChange).toHaveBeenCalled();
        const ultimaChamada = mockOnParcelamentoDadosChange.mock.calls[mockOnParcelamentoDadosChange.mock.calls.length - 1][0];
        expect(ultimaChamada.entradaPercent).toBe(30);
      });
    });
  });

  describe('Condições de pagamento', () => {
    it('deve chamar onCondicaoChange ao selecionar À vista', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const radioAVista = screen.getByRole('radio', { name: /À vista/i });
      fireEvent.click(radioAVista);

      expect(mockOnCondicaoChange).toHaveBeenCalledWith('a_vista');
    });

    it('deve chamar onCondicaoChange ao selecionar A combinar', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      const radioACombinar = screen.getByRole('radio', { name: /A combinar/i });
      fireEvent.click(radioACombinar);

      expect(mockOnCondicaoChange).toHaveBeenCalledWith('a_combinar');
    });

    it('deve mostrar campo de desconto quando condição é À vista', () => {
      render(
        <CondicaoPagamentoFormSection
          {...defaultProps}
          condicao="a_vista"
        />
      );

      expect(screen.getByText(/Desconto para pagamento à vista/i)).toBeInTheDocument();
    });

    it('não deve mostrar parcelamento quando condição é À vista', () => {
      render(
        <CondicaoPagamentoFormSection
          {...defaultProps}
          condicao="a_vista"
        />
      );

      expect(screen.queryByText('Opções de Parcelamento (aparecerão no PDF)')).not.toBeInTheDocument();
    });
  });

  describe('Juros', () => {
    it('deve mostrar indicação de juros para parcelas a partir do limite configurado', () => {
      render(<CondicaoPagamentoFormSection {...defaultProps} />);

      // Juros a partir de 3x conforme configuração
      const textoJuros = screen.getAllByText(/\+2\.5% juros/);
      expect(textoJuros.length).toBeGreaterThan(0);
    });
  });
});
