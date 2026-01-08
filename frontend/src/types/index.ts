// Tipos de Status do Orçamento
export type OrcamentoStatus = "aberto" | "aceito" | "recusado" | "expirado";

// Re-exporta tipos discriminados de orçamento
export * from "./orcamento.types";

// Tipos de Orçamento (mantido apenas 'completo')
export type OrcamentoTipo = "completo";

// Tipos de Etapa do Item (Residencial/Comercial)
export type EtapaTipo = "comercial" | "residencial";

// Interface do Cliente
export interface Cliente {
  id?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
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
export type TipoPessoa = "fisica" | "juridica";

// Interface para opção de parcelamento
export interface ParcelamentoOpcao {
  numeroParcelas: number;
  valorParcela: number;
  valorTotal: number;
  temJuros: boolean;
  taxaJuros: number;
  abaixoDoMinimo?: boolean; // Indica se está abaixo do valor mínimo configurado
}

// Interface para dados de parcelamento completos
export interface ParcelamentoDados {
  entradaPercent: number;
  valorEntrada: number;
  valorRestante: number;
  opcoes: ParcelamentoOpcao[];
  parcelasSelecionadas?: number[]; // Números das parcelas selecionadas para exibir no PDF (ex: [1, 2, 3])
}

// Interface para dados de desconto à vista
export interface DescontoAVistaDados {
  percentual: number;
  valorDesconto: number;
  valorFinal: number;
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
  email?: string; // Email específico do orçamento (prioridade sobre clienteEmail)
  telefone?: string; // Telefone específico do orçamento (prioridade sobre clienteTelefone)
  enderecoServico?: string; // Endereço onde o serviço será executado
  status: OrcamentoStatus;
  dataEmissao: Date | string;
  dataValidade: Date | string;
  dataAceite?: Date | string;
  // Campos do orçamento
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number; // Dias úteis para execução dos serviços (podendo ser intercalados)
  prazoVistoriaBombeiros?: number | null; // Dias para vistoria do Corpo de Bombeiros (após protocolo)
  condicaoPagamento?: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados; // Dados estruturados do parcelamento para o PDF
  descontoAVista?: DescontoAVistaDados; // Dados de desconto para pagamento à vista
  mostrarValoresDetalhados?: boolean; // Se true, mostra tabela de MdO/Material no PDF; se false, só valor total
  // Totais
  valorTotal: number;
  valorTotalMaoDeObra?: number;
  valorTotalMaterial?: number;
  observacoes?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Interface do Serviço (Configuração)
export interface Servico {
  id?: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Interface da Categoria de Item (Configuração)
export interface CategoriaItem {
  id?: string;
  nome: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Interface do Item de Serviço Pré-definido (dentro de uma categoria)
export interface ItemServico {
  id?: string;
  categoriaId: string;
  descricao: string;
  unidade: string;
  valorUnitario?: number; // Valor unitário de venda
  valorMaoDeObraUnitario?: number; // Valor unitário de mão de obra
  valorCusto?: number; // Valor de custo (para referência interna)
  valorMaoDeObraCusto?: number; // Valor de custo de mão de obra (para referência interna)
  ativo: boolean;
  ordem: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Interface da Limitação/Observação (Configuração)
export interface Limitacao {
  id?: string;
  texto: string;
  ordem: number;
  ativo: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Interface da Palavra-chave (Configuração)
export interface PalavraChave {
  id?: string;
  palavra: string;
  prazoDias: number; // Prazo em dias para notificação (ex: 345 dias = 11 meses e 15 dias)
  ativo: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
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
  // Custo fixo mensal da empresa (para cálculo de lucro líquido)
  custoFixoMensal?: number;
  // Impostos para cálculo de lucro
  impostoMaterial?: number; // Percentual de imposto sobre material (ex: 10%)
  impostoServico?: number; // Percentual de imposto sobre serviço/mão de obra (ex: 15%)
}

// Interface da Notificação
export interface Notificacao {
  id?: string;
  orcamentoId: string;
  orcamentoNumero: number;
  orcamentoDataEmissao?: Date | string; // Data de emissão do orçamento para formatação do número
  clienteId: string;
  clienteNome: string;
  itemDescricao: string;
  palavraChave: string;
  dataVencimento: Date | string;
  lida: boolean;
  createdAt: Date | string;
}

// Interface do Usuário
export interface Usuario {
  id?: string;
  email: string;
  nome: string;
  createdAt: Date | string;
}

// Interface para resposta da BrasilAPI (CNPJ)
export interface BrasilAPICNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
}

// Interface genérica para resposta paginada
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  cursor?: string;
}

// Interface do Histórico de Valores de Item de Serviço
export interface HistoricoValorItem {
  id?: string;
  itemServicoId: string; // ID do item de serviço
  descricao: string; // Descrição do item (para facilitar consultas)
  dataVigencia: Date | string; // Data em que os valores entraram em vigor
  valorUnitario: number; // Valor de venda unitário
  valorMaoDeObraUnitario: number; // Valor de venda de mão de obra unitário
  valorCusto: number; // Custo de material
  valorMaoDeObraCusto: number; // Custo de mão de obra
  createdAt: Date | string; // Quando o registro foi criado
}

// Interface do Histórico de Configurações (impostos e custo fixo)
export interface HistoricoConfiguracao {
  id?: string;
  dataVigencia: Date | string; // Data em que os valores entraram em vigor
  custoFixoMensal: number; // Custo fixo mensal da empresa
  impostoMaterial: number; // Percentual de imposto sobre material
  impostoServico: number; // Percentual de imposto sobre serviço
  createdAt: Date | string; // Quando o registro foi criado
}

// Interface para estatísticas do Dashboard (dados agregados do backend)
export interface DashboardMesStats {
  mes: string; // Ex: "Jan/26"
  ano: number;
  mesIndex: number;
  total: number;
  aceitos: number;
  valor: number; // Em reais
}

export interface DashboardStats {
  total: number;
  abertos: number;
  aceitos: number;
  recusados: number;
  expirados: number;
  valorTotal: number;
  valorAceitos: number;
  totalClientes: number;
  porMes: DashboardMesStats[];
}

// Interface para dados de salvamento do Orçamento
export interface OrcamentoSaveData {
  tipo: OrcamentoTipo;
  clienteId: string;
  // Campos do orçamento
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number;
  prazoVistoriaBombeiros?: number | null;
  condicaoPagamento?: "a_vista" | "a_combinar" | "parcelado";
  parcelamentoTexto?: string;
  parcelamentoDados?: ParcelamentoDados;
  descontoAVista?: DescontoAVistaDados | null;
  mostrarValoresDetalhados?: boolean;
  // Campos opcionais compartilhados
  observacoes?: string;
  consultor?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  enderecoServico?: string;
}
