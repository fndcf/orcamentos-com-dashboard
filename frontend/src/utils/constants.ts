// Dados da Empresa
export const EMPRESA = {
  nome: "FLAMA Sistemas de Proteção",
  cnpj: "54.513.212/0001-00",
  endereco: "Rua José Apelian, 196, Savoy",
  cidade: "Itanhaém",
  estado: "SP",
  cep: "11742-630",
  telefones: ["13 99173-7341", "13 3411-5455"],
  email: "", // Adicionar quando tiver
};

// Status do Orçamento
export const STATUS_ORCAMENTO = {
  aberto: { label: "Em Aberto", color: "#FFC107" },
  aceito: { label: "Aceito", color: "#4CAF50" },
  recusado: { label: "Recusado", color: "#F44336" },
  expirado: { label: "Expirado", color: "#9E9E9E" },
};

// Validade padrão do orçamento (em dias)
export const VALIDADE_ORCAMENTO_DIAS = 30;

// Formatação de moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Formatação de data
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
};

// Formatação de CPF
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
};

// Formatação de CNPJ
export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, "");
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

// Formatação de CPF ou CNPJ (detecta automaticamente)
export const formatDocument = (doc: string): string => {
  const cleaned = doc.replace(/\D/g, "");
  if (cleaned.length <= 11) {
    return formatCPF(cleaned);
  }
  return formatCNPJ(cleaned);
};

// Formatação de CEP
export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, "");
  return cleaned.replace(/^(\d{5})(\d{3})$/, "$1-$2");
};

// Formatação de telefone
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
};

// Formatação do número do orçamento no padrão #AANNNN_vXX
// Exemplo: #260084_v00 (ano 2026, número 84, versão 0)
export const formatOrcamentoNumero = (
  numero: number,
  dataEmissao: Date | string,
  versao: number = 0
): string => {
  const ano = new Date(dataEmissao).getFullYear().toString().slice(-2);
  const numeroFormatado = String(numero).padStart(4, "0");
  const versaoFormatada = `_v${String(versao).padStart(2, "0")}`;
  return `${ano}${numeroFormatado}${versaoFormatada}`;
};

// Formatação simplificada do número do orçamento (sem versão) para relatórios
// Exemplo: #260084 (ano 2026, número 84)
export const formatOrcamentoNumeroSimples = (
  numero: number,
  dataEmissao: Date | string | undefined | null
): string => {
  // Se dataEmissao for inválida, retorna apenas o número
  if (!dataEmissao) {
    return `${numero}`;
  }
  const date = new Date(dataEmissao);
  if (isNaN(date.getTime())) {
    return `${numero}`;
  }
  const ano = date.getFullYear().toString().slice(-2);
  const numeroFormatado = String(numero).padStart(4, "0");
  return `${ano}${numeroFormatado}`;
};
