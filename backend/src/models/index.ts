// Tipos de Status do Orçamento
export type OrcamentoStatus = 'aberto' | 'aceito' | 'recusado' | 'expirado';

// Tipos de Orçamento
export type OrcamentoTipo = 'simples' | 'completo';

// Tipos de Etapa do Item (Residencial/Comercial)
export type EtapaTipo = 'residencial' | 'comercial';

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
  createdAt: Date;
  updatedAt?: Date;
}

// Interface do Item do Orçamento Simples
export interface OrcamentoItem {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
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
  // Campos para orçamento simples
  itens: OrcamentoItem[];
  // Campos para orçamento completo
  servicoId?: string;
  servicoDescricao?: string;
  itensCompleto?: OrcamentoItemCompleto[];
  limitacoesSelecionadas?: string[];
  prazoExecucaoServicos?: number; // Dias úteis para execução dos serviços
  prazoVistoriaBombeiros?: number; // Dias para vistoria do Corpo de Bombeiros
  condicaoPagamento?: 'a_combinar' | 'parcelado';
  parcelamentoTexto?: string;
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
