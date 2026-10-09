import { z, ZodTypeAny } from "zod";
import { ValidationError } from "../utils/errors";

/**
 * Schemas de entrada da API.
 *
 * Campos desconhecidos são descartados (comportamento padrão do zod), então só os campos
 * declarados aqui chegam aos services/repositórios. Regras de negócio (tamanho mínimo do nome,
 * CPF/CNPJ, itens obrigatórios etc.) continuam nos services.
 */

const texto = z.string();
const numero = z.number().finite();
const inteiro = z.number().int();

// ---------------------------------------------------------------- Cliente

export const clienteCriarSchema = z.object({
  razaoSocial: texto,
  nomeFantasia: texto.optional(),
  cnpj: texto.optional(),
  tipoPessoa: z.enum(["fisica", "juridica"]).optional(),
  endereco: texto.optional(),
  cidade: texto.optional(),
  estado: texto.optional(),
  cep: texto.optional(),
  telefone: texto.optional(),
  email: texto.optional(),
});

export const clienteAtualizarSchema = clienteCriarSchema.partial();

// ---------------------------------------------------------------- Configurações gerais

export const configuracoesGeraisAtualizarSchema = z
  .object({
    diasValidadeOrcamento: inteiro,
    nomeEmpresa: texto,
    cnpjEmpresa: texto,
    enderecoEmpresa: texto,
    telefoneEmpresa: texto,
    emailEmpresa: texto,
    // Ainda não é exibido; só https para não virar vetor de javascript:/data: quando passar a ser usado
    logoUrl: z.union([z.literal(""), z.string().url().startsWith("https://")]),
    parcelamentoMaxParcelas: inteiro.min(1),
    parcelamentoValorMinimo: numero.nonnegative(),
    parcelamentoJurosAPartirDe: inteiro.min(1),
    parcelamentoTaxaJuros: numero.nonnegative(),
    custoFixoMensal: numero.nonnegative(),
    impostoMaterial: numero.nonnegative(),
    impostoServico: numero.nonnegative(),
  })
  .partial();

// ---------------------------------------------------------------- Orçamento

const itemCompletoSchema = z.object({
  etapa: z.enum(["comercial", "residencial"]),
  categoriaId: texto,
  categoriaNome: texto,
  descricao: texto,
  unidade: texto,
  quantidade: numero,
  valorUnitarioMaoDeObra: numero,
  valorUnitarioMaterial: numero,
  // Totais são recalculados no servidor a partir de quantidade e valores unitários
  valorTotalMaoDeObra: numero.default(0),
  valorTotalMaterial: numero.default(0),
  valorTotal: numero.default(0),
});

const parcelamentoDadosSchema = z.object({
  entradaPercent: numero,
  valorEntrada: numero,
  valorRestante: numero,
  opcoes: z.array(
    z.object({
      numeroParcelas: inteiro,
      valorParcela: numero,
      valorTotal: numero,
      temJuros: z.boolean(),
      taxaJuros: numero,
      abaixoDoMinimo: z.boolean().optional(),
    })
  ),
  parcelasSelecionadas: z.array(inteiro).optional(),
});

const descontoAVistaSchema = z.object({
  percentual: numero,
  valorDesconto: numero,
  valorFinal: numero,
  tipo: z.enum(["percentual", "valor"]).optional(),
});

const orcamentoCamposComunsSchema = z.object({
  servicoId: texto.optional(),
  servicoDescricao: texto.optional(),
  itensCompleto: z.array(itemCompletoSchema).optional(),
  limitacoesSelecionadas: z.array(texto).optional(),
  prazoExecucaoServicos: inteiro.optional(),
  prazoVistoriaBombeiros: inteiro.nullable().optional(),
  condicaoPagamento: z.enum(["a_vista", "a_combinar", "parcelado"]).optional(),
  parcelamentoTexto: texto.optional(),
  parcelamentoDados: parcelamentoDadosSchema.nullable().optional(),
  descontoAVista: descontoAVistaSchema.nullable().optional(),
  mostrarValoresDetalhados: z.boolean().optional(),
  mostrarDocumento: z.boolean().optional(),
  observacoes: texto.optional(),
  consultor: texto.optional(),
  contato: texto.optional(),
  email: texto.optional(),
  telefone: texto.optional(),
  enderecoServico: texto.optional(),
});

export const orcamentoCriarSchema = orcamentoCamposComunsSchema.extend({
  tipo: z.literal("completo").default("completo"),
  clienteId: texto.min(1),
  diasValidade: inteiro.positive().optional(),
});

export const orcamentoAtualizarSchema = orcamentoCamposComunsSchema.extend({
  dataValidade: z.coerce.date().optional(),
});

export const orcamentoStatusSchema = z.object({
  status: z.enum(["aberto", "aceito", "recusado", "expirado"]),
});

// ---------------------------------------------------------------- Catálogo (Configurações)

const ativo = z.boolean().optional();
const ordem = inteiro.nonnegative().optional();
const valorMonetario = numero.nonnegative().optional();

export const servicoCriarSchema = z.object({ descricao: texto, ativo });
export const servicoAtualizarSchema = servicoCriarSchema.partial().extend({ ordem });

export const categoriaItemCriarSchema = z.object({ nome: texto, ativo });
export const categoriaItemAtualizarSchema = categoriaItemCriarSchema.partial().extend({ ordem });

export const limitacaoCriarSchema = z.object({ texto, ativo });
export const limitacaoAtualizarSchema = limitacaoCriarSchema.partial().extend({ ordem });

export const palavraChaveCriarSchema = z.object({ palavra: texto, prazoDias: inteiro, ativo });
export const palavraChaveAtualizarSchema = palavraChaveCriarSchema.partial();

const itemServicoCamposSchema = z.object({
  descricao: texto,
  unidade: texto,
  ativo,
  valorUnitario: valorMonetario,
  valorMaoDeObraUnitario: valorMonetario,
  valorCusto: valorMonetario,
  valorMaoDeObraCusto: valorMonetario,
});

export const itemServicoCriarSchema = itemServicoCamposSchema.extend({ categoriaId: texto });
export const itemServicoAtualizarSchema = itemServicoCamposSchema.partial().extend({ ordem });

// ---------------------------------------------------------------- Helper

const NOMES_DE_TIPO: Record<string, string> = {
  string: "texto",
  number: "número",
  integer: "número inteiro",
  boolean: "verdadeiro ou falso",
  array: "lista",
  object: "objeto",
  date: "data",
};

/**
 * Valida o corpo da requisição contra o schema e devolve apenas os campos declarados.
 * Lança ValidationError (400) com o primeiro problema encontrado.
 */
export function validar<T extends ZodTypeAny>(schema: T, dados: unknown): z.infer<T> {
  const resultado = schema.safeParse(dados);

  if (resultado.success) {
    return resultado.data;
  }

  const problema = resultado.error.issues[0];
  const campo = problema.path.join(".") || "corpo da requisição";

  if (problema.code === "invalid_type" && problema.received === "undefined") {
    throw new ValidationError(`Campo obrigatório ausente: ${campo}`);
  }
  if (problema.code === "invalid_type") {
    const esperado = NOMES_DE_TIPO[problema.expected] || problema.expected;
    throw new ValidationError(`Campo "${campo}" deve ser ${esperado}`);
  }
  throw new ValidationError(`Campo "${campo}" inválido`);
}
