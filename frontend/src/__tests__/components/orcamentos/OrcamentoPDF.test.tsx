import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrcamentoPDFDocument, OrcamentoCompletoPDFDocument, gerarPDFOrcamento } from '../../../components/orcamentos/OrcamentoPDF';
import { pdf } from '@react-pdf/renderer';
import { Orcamento } from '../../../types';

// Mock do @react-pdf/renderer
vi.mock('@react-pdf/renderer', async () => {
  const actual = await vi.importActual('@react-pdf/renderer');
  return {
    ...actual,
    pdf: vi.fn(() => ({
      toBlob: vi.fn().mockResolvedValue(new Blob(['pdf content'], { type: 'application/pdf' })),
    })),
  };
});

// Mock URL.createObjectURL e revokeObjectURL que não existem no JSDOM
const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  // @ts-ignore
  global.URL.createObjectURL = mockCreateObjectURL;
  // @ts-ignore
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

const mockOrcamento = {
  id: 'o1',
  numero: 1,
  versao: 0,
  tipo: 'simples' as const,
  clienteId: 'c1',
  clienteNome: 'Empresa Teste',
  clienteCnpj: '12345678901234',
  clienteEndereco: 'Rua Teste, 123',
  clienteCidade: 'São Paulo',
  clienteEstado: 'SP',
  clienteCep: '01234567',
  clienteTelefone: '11999999999',
  clienteEmail: 'teste@email.com',
  status: 'aberto' as const,
  valorTotal: 1500,
  dataEmissao: '2024-01-15T00:00:00.000Z',
  dataValidade: '2024-02-15T00:00:00.000Z',
  itens: [
    { descricao: 'Serviço 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 1000, valorTotal: 1000 },
    { descricao: 'Serviço 2', quantidade: 2, unidade: 'Un.', valorUnitario: 250, valorTotal: 500 },
  ],
  observacoes: 'Observações de teste',
  consultor: 'João Consultor',
  contato: 'Maria Contato',
  createdAt: new Date('2024-01-15T00:00:00.000Z'),
};

describe('OrcamentoPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OrcamentoPDFDocument', () => {
    it('deve renderizar o documento PDF corretamente', () => {
      // Devido à natureza do react-pdf, testamos apenas se o componente não lança erro
      expect(() => {
        OrcamentoPDFDocument({ orcamento: mockOrcamento });
      }).not.toThrow();
    });

    it('deve renderizar com versão formatada', () => {
      const orcamentoComVersao = { ...mockOrcamento, versao: 5 };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoComVersao });
      }).not.toThrow();
    });

    it('deve renderizar sem observações', () => {
      const orcamentoSemObs = { ...mockOrcamento, observacoes: undefined };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoSemObs });
      }).not.toThrow();
    });

    it('deve renderizar sem consultor', () => {
      const orcamentoSemConsultor = { ...mockOrcamento, consultor: undefined };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoSemConsultor });
      }).not.toThrow();
    });

    it('deve renderizar sem contato', () => {
      const orcamentoSemContato = { ...mockOrcamento, contato: undefined };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoSemContato });
      }).not.toThrow();
    });

    it('deve renderizar sem endereço completo', () => {
      const orcamentoSemEndereco = {
        ...mockOrcamento,
        clienteEndereco: undefined,
        clienteCidade: undefined,
        clienteEstado: undefined,
        clienteCep: undefined,
      };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoSemEndereco });
      }).not.toThrow();
    });

    it('deve renderizar sem telefone', () => {
      const orcamentoSemTelefone = { ...mockOrcamento, clienteTelefone: undefined };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoSemTelefone });
      }).not.toThrow();
    });

    it('deve renderizar sem email', () => {
      const orcamentoSemEmail = { ...mockOrcamento, clienteEmail: undefined };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoSemEmail });
      }).not.toThrow();
    });

    it('deve renderizar com múltiplos itens (linhas alternadas)', () => {
      const orcamentoMultiplosItens = {
        ...mockOrcamento,
        itens: [
          { descricao: 'Item 1', quantidade: 1, unidade: 'Serv.', valorUnitario: 100, valorTotal: 100 },
          { descricao: 'Item 2', quantidade: 2, unidade: 'Un.', valorUnitario: 200, valorTotal: 400 },
          { descricao: 'Item 3', quantidade: 3, unidade: 'Kg', valorUnitario: 50, valorTotal: 150 },
          { descricao: 'Item 4', quantidade: 1, unidade: 'Serv.', valorUnitario: 300, valorTotal: 300 },
        ],
      };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoMultiplosItens });
      }).not.toThrow();
    });

    it('deve renderizar com item sem unidade', () => {
      const orcamentoItemSemUnidade = {
        ...mockOrcamento,
        itens: [
          { descricao: 'Item 1', quantidade: 1, unidade: '', valorUnitario: 100, valorTotal: 100 },
        ],
      };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoItemSemUnidade });
      }).not.toThrow();
    });

    it('deve renderizar com CEP incompleto', () => {
      const orcamentoCepIncompleto = { ...mockOrcamento, clienteCep: '123' };
      expect(() => {
        OrcamentoPDFDocument({ orcamento: orcamentoCepIncompleto });
      }).not.toThrow();
    });
  });

  describe('gerarPDFOrcamento', () => {
    it('deve gerar e baixar o PDF', async () => {
      // Mock do document methods
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      const linkClickSpy = vi.fn();

      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: linkClickSpy,
          } as unknown as HTMLElement;
        }
        return document.createElement(tagName);
      });

      await gerarPDFOrcamento(mockOrcamento);

      expect(pdf).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(linkClickSpy).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('deve usar o número do orçamento no nome do arquivo', async () => {
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

      let downloadName = '';
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            set href(_: string) {},
            set download(name: string) { downloadName = name; },
            click: vi.fn(),
          } as unknown as HTMLElement;
        }
        return document.createElement(tagName);
      });

      await gerarPDFOrcamento(mockOrcamento);

      expect(downloadName).toBe('orcamento-1.pdf');

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('deve gerar PDF completo para orçamento tipo completo', async () => {
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
      const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return { href: '', download: '', click: vi.fn() } as unknown as HTMLElement;
        }
        return document.createElement(tagName);
      });

      const orcamentoCompleto = {
        ...mockOrcamento,
        tipo: 'completo' as const,
        itensCompleto: [
          {
            etapa: 'residencial' as const,
            categoriaId: 'cat1',
            categoriaNome: 'Extintores',
            descricao: 'Extintor ABC 6kg',
            unidade: 'UN',
            quantidade: 5,
            valorUnitarioMaoDeObra: 50,
            valorUnitarioMaterial: 100,
            valorTotalMaoDeObra: 250,
            valorTotalMaterial: 500,
            valorTotal: 750,
          },
        ],
        valorTotalMaoDeObra: 250,
        valorTotalMaterial: 500,
      };

      await gerarPDFOrcamento(orcamentoCompleto as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('OrcamentoCompletoPDFDocument', () => {
    const mockOrcamentoCompleto = {
      id: 'o2',
      numero: 2,
      versao: 1,
      tipo: 'completo' as const,
      clienteId: 'c1',
      clienteNome: 'Empresa Teste Completo',
      clienteCnpj: '12345678901234',
      clienteTipoPessoa: 'juridica' as const,
      clienteEndereco: 'Rua Teste, 456',
      clienteCidade: 'São Paulo',
      clienteEstado: 'SP',
      clienteCep: '01234567',
      clienteTelefone: '11988888888',
      clienteEmail: 'completo@email.com',
      status: 'aberto' as const,
      valorTotal: 2500,
      valorTotalMaoDeObra: 1000,
      valorTotalMaterial: 1500,
      dataEmissao: '2024-01-15T00:00:00.000Z',
      dataValidade: '2024-02-15T00:00:00.000Z',
      servicoId: 's1',
      servicoDescricao: 'Instalação de sistema de combate a incêndio\ncom hidrantes e extintores',
      itensCompleto: [
        {
          etapa: 'residencial' as const,
          categoriaId: 'cat1',
          categoriaNome: 'Extintores',
          descricao: 'Extintor ABC 6kg',
          unidade: 'UN',
          quantidade: 5,
          valorUnitarioMaoDeObra: 50,
          valorUnitarioMaterial: 100,
          valorTotalMaoDeObra: 250,
          valorTotalMaterial: 500,
          valorTotal: 750,
        },
        {
          etapa: 'residencial' as const,
          categoriaId: 'cat1',
          categoriaNome: 'Extintores',
          descricao: 'Extintor CO2 4kg',
          unidade: 'UN',
          quantidade: 3,
          valorUnitarioMaoDeObra: 60,
          valorUnitarioMaterial: 150,
          valorTotalMaoDeObra: 180,
          valorTotalMaterial: 450,
          valorTotal: 630,
        },
        {
          etapa: 'comercial' as const,
          categoriaId: 'cat2',
          categoriaNome: 'Hidrantes',
          descricao: 'Hidrante de parede',
          unidade: 'UN',
          quantidade: 2,
          valorUnitarioMaoDeObra: 100,
          valorUnitarioMaterial: 200,
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 400,
          valorTotal: 600,
        },
      ],
      limitacoesSelecionadas: [
        'Não inclui obras civis',
        'Prazo sujeito a disponibilidade',
      ],
      prazoExecucaoServicos: 15,
      prazoVistoriaBombeiros: 45,
      condicaoPagamento: 'parcelado' as const,
      parcelamentoTexto: '50% entrada + 50% na conclusão',
      observacoes: 'Observações do orçamento completo',
      consultor: 'Pedro Consultor',
      contato: 'Ana Contato',
      createdAt: new Date('2024-01-15T00:00:00.000Z'),
    };

    it('deve renderizar documento PDF completo corretamente', () => {
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: mockOrcamentoCompleto as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com cliente pessoa física', () => {
      const orcamentoPF = { ...mockOrcamentoCompleto, clienteTipoPessoa: 'fisica' as const };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoPF as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem endereço', () => {
      const orcamentoSemEndereco = {
        ...mockOrcamentoCompleto,
        clienteEndereco: undefined,
        clienteCidade: undefined,
        clienteEstado: undefined,
        clienteCep: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemEndereco as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem telefone', () => {
      const orcamentoSemTel = { ...mockOrcamentoCompleto, clienteTelefone: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemTel as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem contato', () => {
      const orcamentoSemContato = { ...mockOrcamentoCompleto, contato: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemContato as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem email', () => {
      const orcamentoSemEmail = { ...mockOrcamentoCompleto, clienteEmail: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemEmail as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem descrição de serviço', () => {
      const orcamentoSemServico = { ...mockOrcamentoCompleto, servicoDescricao: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemServico as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem limitações', () => {
      const orcamentoSemLimitacoes = { ...mockOrcamentoCompleto, limitacoesSelecionadas: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemLimitacoes as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com limitações vazias', () => {
      const orcamentoLimitacoesVazias = { ...mockOrcamentoCompleto, limitacoesSelecionadas: [] };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoLimitacoesVazias as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem observações', () => {
      const orcamentoSemObs = { ...mockOrcamentoCompleto, observacoes: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemObs as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem consultor', () => {
      const orcamentoSemConsultor = { ...mockOrcamentoCompleto, consultor: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemConsultor as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com condição de pagamento a combinar', () => {
      const orcamentoACombinar = { ...mockOrcamentoCompleto, condicaoPagamento: 'a_combinar' as const };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoACombinar as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem parcelamento texto', () => {
      const orcamentoSemParc = { ...mockOrcamentoCompleto, parcelamentoTexto: undefined };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemParc as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar sem prazos definidos', () => {
      const orcamentoSemPrazos = {
        ...mockOrcamentoCompleto,
        prazoExecucaoServicos: undefined,
        prazoVistoriaBombeiros: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemPrazos as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar apenas com itens residenciais', () => {
      const orcamentoSoResidencial = {
        ...mockOrcamentoCompleto,
        itensCompleto: mockOrcamentoCompleto.itensCompleto.filter(i => i.etapa === 'residencial'),
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSoResidencial as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar apenas com itens comerciais', () => {
      const orcamentoSoComercial = {
        ...mockOrcamentoCompleto,
        itensCompleto: mockOrcamentoCompleto.itensCompleto.filter(i => i.etapa === 'comercial'),
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSoComercial as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com itens sem unidade', () => {
      const orcamentoSemUnidade = {
        ...mockOrcamentoCompleto,
        itensCompleto: [
          { ...mockOrcamentoCompleto.itensCompleto[0], unidade: '' },
        ],
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemUnidade as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com múltiplas categorias na mesma etapa', () => {
      const orcamentoMultiCat = {
        ...mockOrcamentoCompleto,
        itensCompleto: [
          ...mockOrcamentoCompleto.itensCompleto,
          {
            etapa: 'residencial' as const,
            categoriaId: 'cat3',
            categoriaNome: 'Alarmes',
            descricao: 'Central de alarme',
            unidade: 'UN',
            quantidade: 1,
            valorUnitarioMaoDeObra: 200,
            valorUnitarioMaterial: 500,
            valorTotalMaoDeObra: 200,
            valorTotalMaterial: 500,
            valorTotal: 700,
          },
        ],
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoMultiCat as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com configurações da empresa', () => {
      const configuracoes = {
        nomeEmpresa: 'FLAMA Sistemas',
        cnpjEmpresa: '12.345.678/0001-90',
        enderecoEmpresa: 'Rua da Empresa, 100 - São Paulo/SP',
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: mockOrcamentoCompleto as Orcamento,
          configuracoes,
        });
      }).not.toThrow();
    });

    it('deve renderizar sem valores de M.O. e Material', () => {
      const orcamentoSemValores = {
        ...mockOrcamentoCompleto,
        valorTotalMaoDeObra: undefined,
        valorTotalMaterial: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemValores as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com itensCompleto vazio', () => {
      const orcamentoVazio = {
        ...mockOrcamentoCompleto,
        itensCompleto: [],
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoVazio as Orcamento });
      }).not.toThrow();
    });

    it('deve renderizar com itensCompleto undefined', () => {
      const orcamentoSemItens = {
        ...mockOrcamentoCompleto,
        itensCompleto: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoSemItens as Orcamento });
      }).not.toThrow();
    });
  });
});
