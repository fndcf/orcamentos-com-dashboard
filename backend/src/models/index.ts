// Tipos de Status do Orçamento
export type OrcamentoStatus = 'aberto' | 'aceito' | 'recusado' | 'expirado';

// Tipos de Orçamento (mantido apenas 'completo')
export type OrcamentoTipo = 'completo';

// Tipos de Etapa do Item (Residencial/Comercial)
export type EtapaTipo = 'residencial' | 'comercial';

// Interface do Cliente
export interface Cliente {
  id?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  tipoPessoa?: 'fisica' | 'juridica';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface do Item do Orçamento Completo
export interface OrcamentoItemCompleto {
  etapa: EtapaTipo; // Residencial ou Comercial
  categoriaId: string;
  categoriaNome: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitarioMaoDeObra: number;
  valorUnitarioMaterial: number;
  valorTotalMaoDeObra: number;
  valorTotalMaterial: number;
  valorTotal: number;
}

// Tipos de Pessoa (Cliente)
export type TipoPessoa = 'fisica' | 'juridica';

// Interface para opção de parcelamento
export interface ParcelamentoOpcao {
  numeroParcelas: number;
  valorParcela: number;
  valorTotal: number;
  temJuros: boolean;
  taxaJuros: number;
}

// Interface para dados de parcelamento completos
export interface ParcelamentoDados {
  entradaPercent: number;
  valorEntrada: number;
  valorRestante: number;
  opcoes: ParcelamentoOpcao[];
}

// Interface do Orçamento
export interface Orcamento {
  id?: string;
  numero: number;
  versao: number;
  tipo: OrcamentoTipo;
  clienteId: string;
  clienteNome: string;
  clienteCnpj: string;
  clienteTipoPessoa?: TipoPessoa;
  clienteEndereco?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  clienteCep?: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  consultor?: string;
  contato?: string;
  status: OrcamentoStatus;
  dataEmissao: Date;
  dataValidade: Date;
  dataAceite?: Date;
  // Campos do orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number; // Dias úteis para execução dos serviços
  prazoVistoriaBombeiros?: number; // Dias para vistoria do Corpo de Bombeiros
  condicaoPagamento?: 'a_vista' | 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados; // Dados estruturados do parcelamento para o PDF
  mostrarValoresDetalhados?: boolean; // Se true, mostra tabela de MdO/Material no PDF; se false, só valor total
  // Totais
  valorTotal: number;
  valorTotalMaoDeObra?: number;
  valorTotalMaterial?: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface do Serviço (Configuração)
export interface Servico {
  id?: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface da Categoria de Item (Configuração)
export interface CategoriaItem {
  id?: string;
  nome: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface do Item de Serviço Pré-definido (dentro de uma categoria)
export interface ItemServico {
  id?: string;
  categoriaId: string;
  descricao: string;
  unidade: string;
  valorUnitario?: number;           // Valor unitário de venda
  valorMaoDeObraUnitario?: number;  // Valor unitário de mão de obra
  valorCusto?: number;              // Valor de custo (para referência interna)
  valorMaoDeObraCusto?: number;     // Valor de custo de mão de obra (para referência interna)
  ativo: boolean;
  ordem: number;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface da Limitação/Observação (Configuração)
export interface Limitacao {
  id?: string;
  texto: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface da Palavra-chave (Configuração)
export interface PalavraChave {
  id?: string;
  palavra: string;
  prazoDias: number; // Prazo em dias para notificação (ex: 345 dias = 11 meses e 15 dias)
  ativo: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface das Configurações Gerais
export interface ConfiguracoesGerais {
  diasValidadeOrcamento: number;
  nomeEmpresa: string;
  cnpjEmpresa: string;
  enderecoEmpresa: string;
  telefoneEmpresa: string;
  emailEmpresa?: string;
  logoUrl?: string;
  // Configurações de parcelamento
  parcelamentoMaxParcelas?: number; // Máximo de parcelas (ex: 6)
  parcelamentoValorMinimo?: number; // Valor mínimo por parcela (ex: 1000)
  parcelamentoJurosAPartirDe?: number; // A partir de qual parcela aplica juros (ex: 3)
  parcelamentoTaxaJuros?: number; // Taxa de juros por parcela em % (ex: 2.5)
}

// Interface da Notificação
export interface Notificacao {
  id?: string;
  orcamentoId: string;
  orcamentoNumero: number;
  clienteId: string;
  clienteNome: string;
  itemDescricao: string;
  palavraChave: string;
  dataVencimento: Date;
  lida: boolean;
  createdAt: Date;
}

// Interface do Usuário
export interface Usuario {
  id?: string;
  email: string;
  nome: string;
  createdAt: Date;
}

// Interface genérica para resposta paginada
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}
