// Dados da Empresa
export const EMPRESA = {
  nome: 'FLAMA Sistemas de Proteção',
  cnpj: '54.513.212/0001-00',
  endereco: 'Rua José Apelian, 196, Savoy',
  cidade: 'Itanhaém',
  estado: 'SP',
  cep: '11742-630',
  telefones: ['13 99173-7341', '13 3411-5455'],
  email: '',
};

// Validade padrão do orçamento (em dias)
export const VALIDADE_ORCAMENTO_DIAS = 30;

// Coleções do Firestore
export const COLLECTIONS = {
  USUARIOS: 'usuarios',
  CLIENTES: 'clientes',
  ORCAMENTOS: 'orcamentos',
  NOTIFICACOES: 'notificacoes',
  CONFIGURACOES: 'configuracoes',
  PALAVRAS_CHAVE: 'palavrasChave',
  CONTADORES: 'contadores',
};

// Documentos de contadores
export const CONTADORES = {
  ORCAMENTOS: 'orcamentos',
};
