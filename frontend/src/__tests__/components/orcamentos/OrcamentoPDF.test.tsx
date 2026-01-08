import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  OrcamentoCompletoPDFDocument,
  gerarPDFOrcamento,
  gerarPDFExecucao,
} from "../../../components/orcamentos/OrcamentoPDF";
import { pdf } from "@react-pdf/renderer";
import { Orcamento } from "../../../types";
import { formatOrcamentoNumero } from "../../../utils/constants";

// Mock do @react-pdf/renderer
vi.mock("@react-pdf/renderer", async () => {
  const actual = await vi.importActual("@react-pdf/renderer");
  return {
    ...actual,
    pdf: vi.fn(() => ({
      toBlob: vi
        .fn()
        .mockResolvedValue(
          new Blob(["pdf content"], { type: "application/pdf" })
        ),
    })),
  };
});

// Mock URL.createObjectURL e revokeObjectURL que não existem no JSDOM
const mockCreateObjectURL = vi.fn().mockReturnValue("blob:test-url");
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  // @ts-ignore
  global.URL.createObjectURL = mockCreateObjectURL;
  // @ts-ignore
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

const mockOrcamento = {
  id: "o1",
  numero: 1,
  versao: 0,
  tipo: "completo" as const,
  clienteId: "c1",
  clienteNome: "Empresa Teste",
  clienteCnpj: "12345678901234",
  clienteEndereco: "Rua Teste, 123",
  clienteCidade: "São Paulo",
  clienteEstado: "SP",
  clienteCep: "01234567",
  clienteTelefone: "11999999999",
  clienteEmail: "teste@email.com",
  status: "aberto" as const,
  valorTotal: 1500,
  valorTotalMaoDeObra: 600,
  valorTotalMaterial: 900,
  dataEmissao: "2024-01-15T00:00:00.000Z",
  dataValidade: "2024-02-15T00:00:00.000Z",
  servicoDescricao: "Assessoria e consultoria",
  itensCompleto: [
    {
      etapa: "comercial" as const,
      categoriaId: "cat1",
      categoriaNome: "Extintores",
      descricao: "Serviço 1",
      quantidade: 1,
      unidade: "Serv.",
      valorUnitarioMaoDeObra: 400,
      valorUnitarioMaterial: 600,
      valorTotalMaoDeObra: 400,
      valorTotalMaterial: 600,
      valorTotal: 1000,
    },
    {
      etapa: "comercial" as const,
      categoriaId: "cat1",
      categoriaNome: "Extintores",
      descricao: "Serviço 2",
      quantidade: 2,
      unidade: "Un.",
      valorUnitarioMaoDeObra: 100,
      valorUnitarioMaterial: 150,
      valorTotalMaoDeObra: 200,
      valorTotalMaterial: 300,
      valorTotal: 500,
    },
  ],
  observacoes: "Observações de teste",
  consultor: "João Consultor",
  contato: "Maria Contato",
  createdAt: new Date("2024-01-15T00:00:00.000Z"),
};

describe("OrcamentoPDF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("gerarPDFOrcamento", () => {
    it("deve gerar e baixar o PDF", async () => {
      // Mock do document methods
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);

      const linkClickSpy = vi.fn();

      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
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

    it("deve usar o número do orçamento no nome do arquivo", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);

      let downloadName = "";
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              set href(_: string) {},
              set download(name: string) {
                downloadName = name;
              },
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      await gerarPDFOrcamento(mockOrcamento);

      const expectedNumero = formatOrcamentoNumero(
        mockOrcamento.numero,
        mockOrcamento.dataEmissao,
        mockOrcamento.versao
      ).replace("#", "");
      expect(downloadName).toBe(`Orçamento Flama-${expectedNumero}.pdf`);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF completo para orçamento tipo completo", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoCompleto = {
        ...mockOrcamento,
        tipo: "completo" as const,
        itensCompleto: [
          {
            etapa: "residencial" as const,
            categoriaId: "cat1",
            categoriaNome: "Extintores",
            descricao: "Extintor ABC 6kg",
            unidade: "UN",
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

  describe("OrcamentoCompletoPDFDocument", () => {
    const mockOrcamentoCompleto = {
      id: "o2",
      numero: 2,
      versao: 1,
      tipo: "completo" as const,
      clienteId: "c1",
      clienteNome: "Empresa Teste Completo",
      clienteCnpj: "12345678901234",
      clienteTipoPessoa: "juridica" as const,
      clienteEndereco: "Rua Teste, 456",
      clienteCidade: "São Paulo",
      clienteEstado: "SP",
      clienteCep: "01234567",
      clienteTelefone: "11988888888",
      clienteEmail: "completo@email.com",
      status: "aberto" as const,
      valorTotal: 2500,
      valorTotalMaoDeObra: 1000,
      valorTotalMaterial: 1500,
      dataEmissao: "2024-01-15T00:00:00.000Z",
      dataValidade: "2024-02-15T00:00:00.000Z",
      servicoId: "s1",
      servicoDescricao:
        "Instalação de sistema de combate a incêndio\ncom hidrantes e extintores",
      itens: [],
      itensCompleto: [
        {
          etapa: "residencial" as const,
          categoriaId: "cat1",
          categoriaNome: "Extintores",
          descricao: "Extintor ABC 6kg",
          unidade: "UN",
          quantidade: 5,
          valorUnitarioMaoDeObra: 50,
          valorUnitarioMaterial: 100,
          valorTotalMaoDeObra: 250,
          valorTotalMaterial: 500,
          valorTotal: 750,
        },
        {
          etapa: "residencial" as const,
          categoriaId: "cat1",
          categoriaNome: "Extintores",
          descricao: "Extintor CO2 4kg",
          unidade: "UN",
          quantidade: 3,
          valorUnitarioMaoDeObra: 60,
          valorUnitarioMaterial: 150,
          valorTotalMaoDeObra: 180,
          valorTotalMaterial: 450,
          valorTotal: 630,
        },
        {
          etapa: "comercial" as const,
          categoriaId: "cat2",
          categoriaNome: "Hidrantes",
          descricao: "Hidrante de parede",
          unidade: "UN",
          quantidade: 2,
          valorUnitarioMaoDeObra: 100,
          valorUnitarioMaterial: 200,
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 400,
          valorTotal: 600,
        },
      ],
      limitacoesSelecionadas: [
        "Não inclui obras civis",
        "Prazo sujeito a disponibilidade",
      ],
      prazoExecucaoServicos: 15,
      prazoVistoriaBombeiros: 45,
      condicaoPagamento: "parcelado" as const,
      parcelamentoTexto: "50% entrada + 50% na conclusão",
      observacoes: "Observações do orçamento completo",
      consultor: "Pedro Consultor",
      contato: "Ana Contato",
      createdAt: new Date("2024-01-15T00:00:00.000Z"),
    };

    it("deve renderizar documento PDF completo corretamente", () => {
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: mockOrcamentoCompleto as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com cliente pessoa física", () => {
      const orcamentoPF = {
        ...mockOrcamentoCompleto,
        clienteTipoPessoa: "fisica" as const,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({ orcamento: orcamentoPF as Orcamento });
      }).not.toThrow();
    });

    it("deve renderizar sem endereço", () => {
      const orcamentoSemEndereco = {
        ...mockOrcamentoCompleto,
        clienteEndereco: undefined,
        clienteCidade: undefined,
        clienteEstado: undefined,
        clienteCep: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemEndereco as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem telefone", () => {
      const orcamentoSemTel = {
        ...mockOrcamentoCompleto,
        clienteTelefone: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemTel as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem contato", () => {
      const orcamentoSemContato = {
        ...mockOrcamentoCompleto,
        contato: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemContato as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem email", () => {
      const orcamentoSemEmail = {
        ...mockOrcamentoCompleto,
        clienteEmail: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemEmail as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem descrição de serviço", () => {
      const orcamentoSemServico = {
        ...mockOrcamentoCompleto,
        servicoDescricao: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemServico as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem limitações", () => {
      const orcamentoSemLimitacoes = {
        ...mockOrcamentoCompleto,
        limitacoesSelecionadas: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemLimitacoes as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com limitações vazias", () => {
      const orcamentoLimitacoesVazias = {
        ...mockOrcamentoCompleto,
        limitacoesSelecionadas: [],
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoLimitacoesVazias as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem observações", () => {
      const orcamentoSemObs = {
        ...mockOrcamentoCompleto,
        observacoes: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemObs as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem consultor", () => {
      const orcamentoSemConsultor = {
        ...mockOrcamentoCompleto,
        consultor: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemConsultor as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com condição de pagamento a combinar", () => {
      const orcamentoACombinar = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: "a_combinar" as const,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoACombinar as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem parcelamento texto", () => {
      const orcamentoSemParc = {
        ...mockOrcamentoCompleto,
        parcelamentoTexto: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemParc as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem prazos definidos", () => {
      const orcamentoSemPrazos = {
        ...mockOrcamentoCompleto,
        prazoExecucaoServicos: undefined,
        prazoVistoriaBombeiros: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemPrazos as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar apenas com itens residenciais", () => {
      const orcamentoSoResidencial = {
        ...mockOrcamentoCompleto,
        itensCompleto: mockOrcamentoCompleto.itensCompleto.filter(
          (i) => i.etapa === "residencial"
        ),
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSoResidencial as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar apenas com itens comerciais", () => {
      const orcamentoSoComercial = {
        ...mockOrcamentoCompleto,
        itensCompleto: mockOrcamentoCompleto.itensCompleto.filter(
          (i) => i.etapa === "comercial"
        ),
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSoComercial as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com itens sem unidade", () => {
      const orcamentoSemUnidade = {
        ...mockOrcamentoCompleto,
        itensCompleto: [
          { ...mockOrcamentoCompleto.itensCompleto[0], unidade: "" },
        ],
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemUnidade as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com múltiplas categorias na mesma etapa", () => {
      const orcamentoMultiCat = {
        ...mockOrcamentoCompleto,
        itensCompleto: [
          ...mockOrcamentoCompleto.itensCompleto,
          {
            etapa: "residencial" as const,
            categoriaId: "cat3",
            categoriaNome: "Alarmes",
            descricao: "Central de alarme",
            unidade: "UN",
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
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoMultiCat as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com configurações da empresa", () => {
      const configuracoes = {
        nomeEmpresa: "FLAMA Sistemas",
        cnpjEmpresa: "12.345.678/0001-90",
        enderecoEmpresa: "Rua da Empresa, 100 - São Paulo/SP",
        telefoneEmpresa: "(11) 99999-9999",
        diasValidadeOrcamento: 30,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: mockOrcamentoCompleto as Orcamento,
          configuracoes,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem valores de M.O. e Material", () => {
      const orcamentoSemValores = {
        ...mockOrcamentoCompleto,
        valorTotalMaoDeObra: undefined,
        valorTotalMaterial: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemValores as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com itensCompleto vazio", () => {
      const orcamentoVazio = {
        ...mockOrcamentoCompleto,
        itensCompleto: [],
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoVazio as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com itensCompleto undefined", () => {
      const orcamentoSemItens = {
        ...mockOrcamentoCompleto,
        itensCompleto: undefined,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemItens as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com parcelamentoDados", () => {
      const orcamentoComParcelamento = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: "parcelado" as const,
        parcelamentoDados: {
          entradaPercent: 30,
          valorEntrada: 750,
          valorRestante: 1750,
          opcoes: [
            {
              numeroParcelas: 2,
              valorParcela: 875,
              valorTotal: 1750,
              temJuros: false,
              taxaJuros: 0,
            },
            {
              numeroParcelas: 3,
              valorParcela: 600,
              valorTotal: 1800,
              temJuros: true,
              taxaJuros: 2.5,
            },
          ],
        },
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoComParcelamento as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com parcelasSelecionadas", () => {
      const orcamentoComParcelasSelecionadas = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: "parcelado" as const,
        parcelamentoDados: {
          entradaPercent: 20,
          valorEntrada: 500,
          valorRestante: 2000,
          opcoes: [
            {
              numeroParcelas: 1,
              valorParcela: 2000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
            },
            {
              numeroParcelas: 2,
              valorParcela: 1000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
            },
            {
              numeroParcelas: 3,
              valorParcela: 700,
              valorTotal: 2600,
              temJuros: true,
              taxaJuros: 2.5,
            },
            {
              numeroParcelas: 4,
              valorParcela: 550,
              valorTotal: 2700,
              temJuros: true,
              taxaJuros: 2.5,
            },
          ],
          parcelasSelecionadas: [1, 3], // Apenas 1x e 3x selecionadas
        },
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoComParcelasSelecionadas as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com parcelas abaixo do mínimo marcadas", () => {
      const orcamentoComParcelasAbaixoMinimo = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: "parcelado" as const,
        parcelamentoDados: {
          entradaPercent: 20,
          valorEntrada: 500,
          valorRestante: 2000,
          opcoes: [
            {
              numeroParcelas: 1,
              valorParcela: 2000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
              abaixoDoMinimo: false,
            },
            {
              numeroParcelas: 2,
              valorParcela: 1000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
              abaixoDoMinimo: false,
            },
            {
              numeroParcelas: 3,
              valorParcela: 700,
              valorTotal: 2600,
              temJuros: true,
              taxaJuros: 2.5,
              abaixoDoMinimo: true,
            },
            {
              numeroParcelas: 4,
              valorParcela: 550,
              valorTotal: 2700,
              temJuros: true,
              taxaJuros: 2.5,
              abaixoDoMinimo: true,
            },
          ],
        },
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoComParcelasAbaixoMinimo as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar filtrando parcelas abaixo do mínimo quando não há seleção", () => {
      const orcamentoSemSelecao = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: "parcelado" as const,
        parcelamentoDados: {
          entradaPercent: 20,
          valorEntrada: 500,
          valorRestante: 2000,
          opcoes: [
            {
              numeroParcelas: 1,
              valorParcela: 2000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
              abaixoDoMinimo: false,
            },
            {
              numeroParcelas: 2,
              valorParcela: 1000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
              abaixoDoMinimo: false,
            },
            {
              numeroParcelas: 3,
              valorParcela: 700,
              valorTotal: 2600,
              temJuros: true,
              taxaJuros: 2.5,
              abaixoDoMinimo: true,
            },
          ],
          // Sem parcelasSelecionadas - deve filtrar as abaixo do mínimo
        },
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemSelecao as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar incluindo parcelas abaixo do mínimo quando selecionadas manualmente", () => {
      const orcamentoComSelecaoManual = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: "parcelado" as const,
        parcelamentoDados: {
          entradaPercent: 20,
          valorEntrada: 500,
          valorRestante: 2000,
          opcoes: [
            {
              numeroParcelas: 1,
              valorParcela: 2000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
              abaixoDoMinimo: false,
            },
            {
              numeroParcelas: 2,
              valorParcela: 1000,
              valorTotal: 2500,
              temJuros: false,
              taxaJuros: 0,
              abaixoDoMinimo: false,
            },
            {
              numeroParcelas: 3,
              valorParcela: 700,
              valorTotal: 2600,
              temJuros: true,
              taxaJuros: 2.5,
              abaixoDoMinimo: true,
            },
          ],
          parcelasSelecionadas: [1, 3], // Incluindo a parcela 3x que está abaixo do mínimo
        },
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoComSelecaoManual as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com mostrarValoresDetalhados como false", () => {
      const orcamentoSemDetalhes = {
        ...mockOrcamentoCompleto,
        mostrarValoresDetalhados: false,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemDetalhes as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar com condição de pagamento à vista", () => {
      const orcamentoAVista = {
        ...mockOrcamentoCompleto,
        condicaoPagamento: "a_vista" as const,
      };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoAVista as Orcamento,
        });
      }).not.toThrow();
    });

    it("deve renderizar sem CNPJ", () => {
      const orcamentoSemCnpj = { ...mockOrcamentoCompleto, clienteCnpj: "" };
      expect(() => {
        OrcamentoCompletoPDFDocument({
          orcamento: orcamentoSemCnpj as Orcamento,
        });
      }).not.toThrow();
    });
  });

  describe("gerarPDFExecucao", () => {
    const mockOrcamentoAceito = {
      id: "o3",
      numero: 3,
      versao: 1,
      tipo: "completo" as const,
      clienteId: "c1",
      clienteNome: "Empresa Aceita LTDA",
      clienteCnpj: "12345678901234",
      clienteTipoPessoa: "juridica" as const,
      clienteEndereco: "Rua Aceita, 789",
      clienteCidade: "São Paulo",
      clienteEstado: "SP",
      clienteCep: "01234567",
      clienteTelefone: "11977777777",
      clienteEmail: "aceito@email.com",
      status: "aceito" as const,
      dataAceite: "2024-01-20T00:00:00.000Z",
      valorTotal: 3000,
      valorTotalMaoDeObra: 1200,
      valorTotalMaterial: 1800,
      dataEmissao: "2024-01-15T00:00:00.000Z",
      dataValidade: "2024-02-15T00:00:00.000Z",
      servicoDescricao: "Instalação de sistema de incêndio",
      itensCompleto: [
        {
          etapa: "residencial" as const,
          categoriaId: "cat1",
          categoriaNome: "Extintores",
          descricao: "Extintor ABC 6kg",
          unidade: "UN",
          quantidade: 5,
          valorUnitarioMaoDeObra: 50,
          valorUnitarioMaterial: 100,
          valorTotalMaoDeObra: 250,
          valorTotalMaterial: 500,
          valorTotal: 750,
        },
        {
          etapa: "comercial" as const,
          categoriaId: "cat2",
          categoriaNome: "Hidrantes",
          descricao: "Hidrante de parede",
          unidade: "UN",
          quantidade: 2,
          valorUnitarioMaoDeObra: 100,
          valorUnitarioMaterial: 200,
          valorTotalMaoDeObra: 200,
          valorTotalMaterial: 400,
          valorTotal: 600,
        },
      ],
      contato: "Pedro Contato",
      observacoes: "Obs de execução",
      createdAt: new Date("2024-01-15T00:00:00.000Z"),
    };

    it("deve gerar e baixar o PDF de execução", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);

      const linkClickSpy = vi.fn();
      let downloadName = "";

      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              set href(_: string) {},
              set download(name: string) {
                downloadName = name;
              },
              click: linkClickSpy,
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      await gerarPDFExecucao(mockOrcamentoAceito as Orcamento);

      expect(pdf).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(linkClickSpy).toHaveBeenCalled();
      const expectedNumero = formatOrcamentoNumero(
        mockOrcamentoAceito.numero,
        mockOrcamentoAceito.dataEmissao,
        mockOrcamentoAceito.versao
      ).replace("#", "");
      expect(downloadName).toBe(`ordem-execucao-${expectedNumero}.pdf`);
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução sem dataAceite (usa data atual)", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoSemDataAceite = {
        ...mockOrcamentoAceito,
        dataAceite: undefined,
      };

      await gerarPDFExecucao(orcamentoSemDataAceite as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução sem CNPJ", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoSemCnpj = { ...mockOrcamentoAceito, clienteCnpj: "" };

      await gerarPDFExecucao(orcamentoSemCnpj as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução sem endereço", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoSemEndereco = {
        ...mockOrcamentoAceito,
        clienteEndereco: undefined,
        clienteCidade: undefined,
        clienteEstado: undefined,
        clienteCep: undefined,
      };

      await gerarPDFExecucao(orcamentoSemEndereco as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução sem telefone e contato", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoSemTelContato = {
        ...mockOrcamentoAceito,
        clienteTelefone: undefined,
        contato: undefined,
      };

      await gerarPDFExecucao(orcamentoSemTelContato as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução apenas com itens residenciais", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoSoResidencial = {
        ...mockOrcamentoAceito,
        itensCompleto: mockOrcamentoAceito.itensCompleto.filter(
          (i) => i.etapa === "residencial"
        ),
      };

      await gerarPDFExecucao(orcamentoSoResidencial as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução apenas com itens comerciais", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoSoComercial = {
        ...mockOrcamentoAceito,
        itensCompleto: mockOrcamentoAceito.itensCompleto.filter(
          (i) => i.etapa === "comercial"
        ),
      };

      await gerarPDFExecucao(orcamentoSoComercial as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução sem itens", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoSemItens = {
        ...mockOrcamentoAceito,
        itensCompleto: undefined,
      };

      await gerarPDFExecucao(orcamentoSemItens as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução com cliente pessoa física", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoPF = {
        ...mockOrcamentoAceito,
        clienteTipoPessoa: "fisica" as const,
      };

      await gerarPDFExecucao(orcamentoPF as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução com múltiplas categorias na mesma etapa", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      const orcamentoMultiCat = {
        ...mockOrcamentoAceito,
        itensCompleto: [
          ...mockOrcamentoAceito.itensCompleto,
          {
            etapa: "residencial" as const,
            categoriaId: "cat3",
            categoriaNome: "Alarmes",
            descricao: "Central de alarme",
            unidade: "UN",
            quantidade: 1,
            valorUnitarioMaoDeObra: 200,
            valorUnitarioMaterial: 500,
            valorTotalMaoDeObra: 200,
            valorTotalMaterial: 500,
            valorTotal: 700,
          },
          {
            etapa: "residencial" as const,
            categoriaId: "cat1",
            categoriaNome: "Extintores",
            descricao: "Extintor CO2 4kg",
            unidade: "",
            quantidade: 3,
            valorUnitarioMaoDeObra: 60,
            valorUnitarioMaterial: 150,
            valorTotalMaoDeObra: 180,
            valorTotalMaterial: 450,
            valorTotal: 630,
          },
        ],
      };

      await gerarPDFExecucao(orcamentoMultiCat as Orcamento);

      expect(pdf).toHaveBeenCalled();

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("deve gerar PDF de execução com cidade e estado parciais", async () => {
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => null as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => null as any);
      const createElementSpy = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName: string) => {
          if (tagName === "a") {
            return {
              href: "",
              download: "",
              click: vi.fn(),
            } as unknown as HTMLElement;
          }
          return document.createElement(tagName);
        });

      // Apenas cidade, sem estado
      const orcamentoSoCidade = {
        ...mockOrcamentoAceito,
        clienteEstado: undefined,
      };
      await gerarPDFExecucao(orcamentoSoCidade as Orcamento);
      expect(pdf).toHaveBeenCalled();

      // Apenas estado, sem cidade
      const orcamentoSoEstado = {
        ...mockOrcamentoAceito,
        clienteCidade: undefined,
      };
      await gerarPDFExecucao(orcamentoSoEstado as Orcamento);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
