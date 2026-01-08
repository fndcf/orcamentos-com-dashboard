import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { Orcamento, ConfiguracoesGerais } from "../../types";
import { configuracoesGeraisService } from "../../services/configuracoesGeraisService";
import { logger } from "../../utils/logger";
import { formatOrcamentoNumero } from "../../utils/constants";

// Cores do tema
const COLORS = {
  primary: "#CC0000",
  primaryLight: "#fee2e2",
  dark: "#1a1a1a",
  gray: "#666666",
  lightGray: "#f8f8f8",
  border: "#e0e0e0",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 90, // Espaço para o rodapé fixo
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.dark,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  logoSection: {
    flex: 1,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 4,
  },
  logoSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
    letterSpacing: 1,
  },
  orcamentoInfo: {
    alignItems: "flex-end",
  },
  orcamentoNumero: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  orcamentoInfoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  orcamentoLabel: {
    color: COLORS.gray,
    marginRight: 5,
  },
  orcamentoValue: {
    fontWeight: "bold",
  },
  // Seção do Cliente
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clienteSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  clienteNome: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.dark,
  },
  clienteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  clienteItem: {
    width: "50%",
    marginBottom: 6,
  },
  clienteItemFull: {
    width: "100%",
    marginBottom: 6,
  },
  clienteLabel: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 1,
    textTransform: "uppercase",
  },
  clienteValue: {
    fontSize: 9,
  },
  // Tabela de Itens
  itensSection: {
    marginBottom: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#4a4a4a",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 8,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: COLORS.lightGray,
  },
  tableRowLast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  colItem: {
    width: 35,
    textAlign: "center",
  },
  colQtd: {
    width: 35,
    textAlign: "center",
  },
  colDescricao: {
    flex: 1,
    paddingHorizontal: 8,
    textAlign: "justify",
  },
  colUnid: {
    width: 45,
    textAlign: "center",
  },
  colValorUnit: {
    width: 70,
    textAlign: "right",
  },
  colValorTotal: {
    width: 75,
    textAlign: "right",
  },
  // Total
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalBox: {
    backgroundColor: "#4a4a4a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    color: "white",
    fontSize: 10,
    marginRight: 15,
  },
  totalValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Condições
  condicoesSection: {
    marginBottom: 20,
    flexDirection: "row",
    gap: 15,
  },
  condicoesBox: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  condicoesTitle: {
    fontSize: 8,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  condicoesValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  // Observações
  observacoesSection: {
    marginBottom: 20,
  },
  observacoesBox: {
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    minHeight: 50,
  },
  observacoesText: {
    lineHeight: 1.5,
    color: COLORS.dark,
    textAlign: "justify",
  },
  servicoText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: COLORS.dark,
    textAlign: "justify",
  },
  servicoLabel: {
    fontSize: 8,
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  // Termo
  termoSection: {
    marginBottom: 25,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    // @ts-ignore - propriedade válida no react-pdf
    minPresenceAhead: 100,
  },
  termoTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.gray,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  termoText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: COLORS.gray,
    textAlign: "justify",
  },
  // Assinatura
  assinaturaSection: {
    alignItems: "center",
    marginTop: 30,
    // @ts-ignore - propriedade válida no react-pdf
    minPresenceAhead: 80,
  },
  assinaturaTexto: {
    color: COLORS.gray,
    marginBottom: 35,
  },
  assinaturaLinha: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark,
    marginBottom: 8,
  },
  assinaturaNome: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  assinaturaSubtitle: {
    fontSize: 8,
    color: COLORS.gray,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    paddingTop: 10,
  },
  footerEmpresa: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 2,
  },
  footerCnpj: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 2,
  },
  footerEndereco: {
    fontSize: 7,
    color: COLORS.gray,
  },
});

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatCurrencyShort = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
};

const formatCEP = (cep: string | undefined): string => {
  if (!cep) return "";
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
};

// Converte número para texto por extenso (português)
const numeroPorExtenso = (num: number): string => {
  const unidades = [
    "",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
    "dez",
    "onze",
    "doze",
    "treze",
    "quatorze",
    "quinze",
    "dezesseis",
    "dezessete",
    "dezoito",
    "dezenove",
  ];
  const dezenas = [
    "",
    "",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];
  const centenas = [
    "",
    "cento",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  if (num === 0) return "zero";
  if (num === 100) return "cem";
  if (num < 20) return unidades[num];
  if (num < 100) {
    const dezena = Math.floor(num / 10);
    const unidade = num % 10;
    return unidade
      ? `${dezenas[dezena]} e ${unidades[unidade]}`
      : dezenas[dezena];
  }
  if (num < 1000) {
    const centena = Math.floor(num / 100);
    const resto = num % 100;
    if (resto === 0)
      return centenas[centena] === "cento" ? "cem" : centenas[centena];
    return `${centenas[centena]} e ${numeroPorExtenso(resto)}`;
  }
  return String(num); // Para números maiores, retorna o número
};

interface OrcamentoPDFProps {
  orcamento: Orcamento;
  configuracoes?: ConfiguracoesGerais;
}

// Estilos adicionais para orçamento completo
const stylesCompleto = StyleSheet.create({
  // Tabela com colunas M.O. e Material - Novo layout
  colItem: {
    width: 30,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  colDescricaoCompleto: {
    flex: 1,
    paddingHorizontal: 4,
    textAlign: "justify",
  },
  colUnidCompleto: {
    width: 32,
    textAlign: "center",
  },
  colQtdCompleto: {
    width: 28,
    textAlign: "center",
  },
  colMaoDeObraUnit: {
    width: 52,
    textAlign: "right",
  },
  colMaoDeObraTotal: {
    width: 52,
    textAlign: "right",
  },
  colMaterialUnit: {
    width: 52,
    textAlign: "right",
  },
  colMaterialTotal: {
    width: 52,
    textAlign: "right",
  },
  colTotalCompleto: {
    width: 55,
    textAlign: "right",
  },
  // Header com duas linhas
  tableHeaderCompleto: {
    backgroundColor: "#4a4a4a", // Cinza escuro consistente com o resto do layout
  },
  tableHeaderRow1: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeaderRow2: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#666666",
  },
  tableHeaderTextCompleto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 7,
    textTransform: "uppercase",
  },
  // Grupos de colunas no header
  headerGroupLeft: {
    flexDirection: "row",
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  headerGroupMaoDeObra: {
    width: 104,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#666666",
    paddingVertical: 4,
  },
  headerGroupMaterial: {
    width: 104,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#666666",
    paddingVertical: 4,
  },
  headerGroupTotal: {
    width: 55,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#666666",
    paddingVertical: 4,
  },
  // Células do header row 2
  headerCellItem: {
    width: 30,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  headerCellDescricao: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  headerCellUnid: {
    width: 32,
    paddingVertical: 4,
    textAlign: "center",
  },
  headerCellQtd: {
    width: 28,
    paddingVertical: 4,
    textAlign: "center",
  },
  headerCellMaoDeObraUnit: {
    width: 52,
    paddingVertical: 4,
    textAlign: "right",
    borderLeftWidth: 1,
    borderLeftColor: "#666666",
  },
  headerCellMaoDeObraTotal: {
    width: 52,
    paddingVertical: 4,
    textAlign: "right",
  },
  headerCellMaterialUnit: {
    width: 52,
    paddingVertical: 4,
    textAlign: "right",
    borderLeftWidth: 1,
    borderLeftColor: "#666666",
  },
  headerCellMaterialTotal: {
    width: 52,
    paddingVertical: 4,
    textAlign: "right",
  },
  headerCellTotal: {
    width: 55,
    paddingVertical: 4,
    textAlign: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#666666",
  },
  // Seção de categoria (ex: SISTEMA DE HIDRANTES)
  categoriaRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primaryLight, // Vermelho claro da marca
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriaText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.primary, // Vermelho da marca
  },
  // Linha de subtotal da categoria
  subtotalRow: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGray, // Cinza claro consistente
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subtotalText: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.gray,
  },
  subtotalValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.dark,
    textAlign: "right",
  },
  // Linha de total da etapa (RESIDENCIAL/COMERCIAL)
  totalEtapaRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primary, // Vermelho da marca para destaque
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  totalEtapaText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "white",
  },
  totalEtapaValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "white",
    textAlign: "right",
  },
  // Texto introdutório do escopo
  escopoIntro: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.dark,
    marginBottom: 15,
    textAlign: "justify",
  },
  etapaTitulo: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 10,
    marginTop: 5,
  },
  // Totais com M.O. e Material
  totaisGrid: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    marginBottom: 25,
    gap: 10,
    // @ts-ignore - propriedade válida no react-pdf
    minPresenceAhead: 40,
  },
  totalBoxCompleto: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignItems: "center",
  },
  totalBoxMain: {
    backgroundColor: "#4a4a4a",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: "center",
  },
  totalLabelSmall: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 2,
  },
  totalValueSmall: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  // Limitações
  limitacoesSection: {
    marginBottom: 20,
    // @ts-ignore - propriedade válida no react-pdf
    minPresenceAhead: 60,
  },
  limitacoesBox: {
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  limitacaoItem: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 5,
  },
  limitacaoBullet: {
    width: 15,
    fontSize: 9,
    color: COLORS.primary,
  },
  limitacaoText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: COLORS.dark,
    textAlign: "justify",
  },
  // Prazo e condições
  prazoCondicoesSection: {
    marginBottom: 20,
    flexDirection: "row",
    gap: 15,
  },
  // Preços e Condições de Pagamento
  precosBox: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    // @ts-ignore - propriedade válida no react-pdf
    minPresenceAhead: 50,
  },
  precosSubtitulo: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  precosTexto: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.dark,
    textAlign: "justify",
  },
  precosValorTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 8,
  },
  precosCondicao: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.dark,
    marginTop: 6,
  },
  prazoItem: {
    flexDirection: "row",
    marginTop: 4,
    paddingLeft: 5,
  },
  prazoBullet: {
    width: 15,
    fontSize: 9,
    color: COLORS.primary,
  },
  prazoTexto: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: COLORS.dark,
    textAlign: "justify",
  },
  // Tabela de parcelamento
  parcelamentoTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  parcelamentoTableHeader: {
    flexDirection: "row",
    backgroundColor: "#4a4a4a",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  parcelamentoTableHeaderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 8,
  },
  parcelamentoTableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  parcelamentoTableRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.lightGray,
  },
  parcelamentoColParcelas: {
    width: 60,
    fontSize: 9,
  },
  parcelamentoColValor: {
    width: 90,
    fontSize: 9,
    textAlign: "right",
  },
  parcelamentoColJuros: {
    width: 70,
    fontSize: 8,
    textAlign: "center",
    color: COLORS.gray,
  },
  parcelamentoColTotal: {
    flex: 1,
    fontSize: 9,
    textAlign: "right",
    fontWeight: "bold",
  },
  parcelamentoEntradaBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  parcelamentoEntradaText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  parcelamentoRestanteText: {
    fontSize: 9,
    color: COLORS.dark,
    marginTop: 4,
  },
});

// Componente PDF para orçamento completo
export function OrcamentoCompletoPDFDocument({
  orcamento,
  configuracoes,
}: OrcamentoPDFProps) {
  const numeroOrcamentoFormatado = formatOrcamentoNumero(
    orcamento.numero,
    orcamento.dataEmissao,
    orcamento.versao
  );

  const enderecoCompleto = [
    orcamento.clienteEndereco,
    orcamento.clienteCidade,
    orcamento.clienteEstado,
  ]
    .filter(Boolean)
    .join(" - ");

  const itensCompleto = orcamento.itensCompleto || [];
  const valorTotalMaoDeObra = orcamento.valorTotalMaoDeObra || 0;
  const valorTotalMaterial = orcamento.valorTotalMaterial || 0;

  // Separar itens por etapa (residencial/comercial)
  const itensComerciais = itensCompleto.filter(
    (item) => item.etapa === "comercial"
  );
  const itensResidenciais = itensCompleto.filter(
    (item) => item.etapa === "residencial"
  );

  // Obter categorias únicas por etapa
  const categoriasComerciais = [
    ...new Set(itensComerciais.map((item) => item.categoriaNome)),
  ];
  const categoriasResidenciais = [
    ...new Set(itensResidenciais.map((item) => item.categoriaNome)),
  ];

  // Gerar texto da condição de pagamento (desconto à vista é tratado no JSX)
  const condicaoPagamentoTexto = (() => {
    if (orcamento.condicaoPagamento === "parcelado") {
      return orcamento.parcelamentoTexto || "Parcelado";
    }
    if (orcamento.condicaoPagamento === "a_vista") {
      return "À vista";
    }
    return "A combinar";
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Text style={styles.logoText}>FLAMA</Text>
            <Text style={styles.logoSubtitle}>SISTEMAS DE PROTEÇÃO</Text>
          </View>
          <View style={styles.orcamentoInfo}>
            <Text style={styles.orcamentoNumero}>
              Orçamento {numeroOrcamentoFormatado}
            </Text>
            <View style={styles.orcamentoInfoRow}>
              <Text style={styles.orcamentoLabel}>Emissão:</Text>
              <Text style={styles.orcamentoValue}>
                {formatDate(orcamento.dataEmissao)}
              </Text>
            </View>
            <View style={styles.orcamentoInfoRow}>
              <Text style={styles.orcamentoLabel}>Validade:</Text>
              <Text style={styles.orcamentoValue}>
                {formatDate(orcamento.dataValidade)}
              </Text>
            </View>
            {orcamento.consultor && (
              <View style={styles.orcamentoInfoRow}>
                <Text style={styles.orcamentoLabel}>Consultor:</Text>
                <Text style={styles.orcamentoValue}>{orcamento.consultor}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Proposta Técnica e Comercial */}
        <Text style={styles.sectionTitle}>Proposta Técnica e Comercial</Text>
        <View style={styles.clienteSection}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "bold",
              marginBottom: 10,
              color: COLORS.dark,
            }}
          >
            À
          </Text>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.clienteValue}>
              <Text style={{ fontWeight: "bold" }}>
                {orcamento.clienteTipoPessoa === "fisica"
                  ? "Cliente: "
                  : "Empresa: "}
              </Text>
              {orcamento.clienteNome}
            </Text>
          </View>
          {enderecoCompleto && enderecoCompleto.trim() !== "" && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: "bold" }}>Endereço: </Text>
                {enderecoCompleto}
                {orcamento.clienteCep && orcamento.clienteCep.trim() !== ""
                  ? ` - CEP: ${formatCEP(orcamento.clienteCep)}`
                  : ""}
              </Text>
            </View>
          )}
          {/* Telefone: prioridade modal > cliente */}
          {(orcamento.telefone?.trim() ||
            orcamento.clienteTelefone?.trim()) && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: "bold" }}>Telefone: </Text>
                {orcamento.telefone?.trim() || orcamento.clienteTelefone}
              </Text>
            </View>
          )}
          {orcamento.contato && orcamento.contato.trim() !== "" && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: "bold" }}>Contato: </Text>
                {orcamento.contato}
              </Text>
            </View>
          )}
          {/* E-mail: prioridade modal > cliente */}
          {(orcamento.email?.trim() || orcamento.clienteEmail?.trim()) && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: "bold" }}>E-mail: </Text>
                {orcamento.email?.trim() || orcamento.clienteEmail}
              </Text>
            </View>
          )}
          {orcamento.enderecoServico &&
            orcamento.enderecoServico.trim() !== "" && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.clienteValue}>
                  <Text style={{ fontWeight: "bold" }}>
                    Endereço do Serviço:{" "}
                  </Text>
                  {orcamento.enderecoServico}
                </Text>
              </View>
            )}
          {orcamento.servicoDescricao &&
            orcamento.servicoDescricao.trim() !== "" && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.clienteValue}>
                  <Text style={{ fontWeight: "bold" }}>Serviço: </Text>
                  {orcamento.servicoDescricao.replace(/\n/g, " ")}
                </Text>
              </View>
            )}
        </View>

        {/* Introdução */}
        <Text style={styles.sectionTitle}>Introdução</Text>
        <View style={styles.clienteSection}>
          <Text style={styles.servicoText}>
            Apresentamos a proposta técnica e comercial para o desenvolvimento
            das atividades na edificação acima discriminada, em consonância com
            as exigências técnicas do Corpo de Bombeiros do Estado de São Paulo.
          </Text>
        </View>

        {/* Escopo Técnico dos Serviços */}
        <Text style={styles.sectionTitle}>Escopo Técnico dos Serviços</Text>
        <Text style={stylesCompleto.escopoIntro}>
          Os trabalhos de execução do projeto serão desenvolvidos de forma
          direcionada e envolverão as seguintes etapas:
        </Text>

        {/* Tabela Comercial */}
        {itensComerciais.length > 0 && (
          <View style={styles.itensSection}>
            <Text style={stylesCompleto.etapaTitulo}>COMERCIAL</Text>
            <View style={styles.table}>
              {/* Header - versão detalhada ou simplificada */}
              {orcamento.mostrarValoresDetalhados !== false ? (
                <View style={stylesCompleto.tableHeaderCompleto}>
                  <View style={stylesCompleto.tableHeaderRow1}>
                    <View style={stylesCompleto.headerGroupLeft}>
                      <Text
                        style={stylesCompleto.tableHeaderTextCompleto}
                      ></Text>
                    </View>
                    <View style={stylesCompleto.headerGroupMaoDeObra}>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MÃO DE OBRA
                      </Text>
                    </View>
                    <View style={stylesCompleto.headerGroupMaterial}>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MATERIAIS
                      </Text>
                    </View>
                    <View style={stylesCompleto.headerGroupTotal}>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MDO +
                      </Text>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MAT
                      </Text>
                    </View>
                  </View>
                  <View style={stylesCompleto.tableHeaderRow2}>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellItem,
                      ]}
                    >
                      ITEM
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellDescricao,
                      ]}
                    >
                      DESCRIÇÃO DOS SERVIÇOS
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellUnid,
                      ]}
                    >
                      UNID.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellQtd,
                      ]}
                    >
                      QTE.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaoDeObraUnit,
                      ]}
                    >
                      UNIT.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaoDeObraTotal,
                      ]}
                    >
                      TOTAL
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaterialUnit,
                      ]}
                    >
                      UNIT.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaterialTotal,
                      ]}
                    >
                      TOTAL
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellTotal,
                      ]}
                    >
                      TOTAL
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: "10%" }]}>
                    ITEM
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "70%" }]}>
                    DESCRIÇÃO DOS SERVIÇOS
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "10%" }]}>
                    UNID.
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "10%" }]}>
                    QTE.
                  </Text>
                </View>
              )}

              {/* Agrupar por categoria */}
              {categoriasComerciais.map((categoria, catIdx) => {
                const itensCategoria = itensComerciais.filter(
                  (item) => item.categoriaNome === categoria
                );
                const subtotalMaoDeObra = itensCategoria.reduce(
                  (acc, item) => acc + item.valorTotalMaoDeObra,
                  0
                );
                const subtotalMaterial = itensCategoria.reduce(
                  (acc, item) => acc + item.valorTotalMaterial,
                  0
                );
                const subtotalTotal = itensCategoria.reduce(
                  (acc, item) => acc + item.valorTotal,
                  0
                );
                const categoriaNumero = catIdx + 1;
                return (
                  <View key={categoria}>
                    {/* Linha da categoria */}
                    <View style={stylesCompleto.categoriaRow}>
                      <Text
                        style={[
                          stylesCompleto.categoriaText,
                          {
                            width:
                              orcamento.mostrarValoresDetalhados !== false
                                ? "8%"
                                : "10%",
                          },
                        ]}
                      >
                        {categoriaNumero}.0
                      </Text>
                      <Text style={stylesCompleto.categoriaText}>
                        {categoria}
                      </Text>
                    </View>
                    {/* Itens da categoria */}
                    {itensCategoria.map((item, idx) => {
                      const itemNum = `${categoriaNumero}.${idx + 1}`;
                      const isAlt = idx % 2 === 1;
                      return orcamento.mostrarValoresDetalhados !== false ? (
                        <View
                          key={idx}
                          style={isAlt ? styles.tableRowAlt : styles.tableRow}
                        >
                          <Text style={stylesCompleto.colItem}>{itemNum}</Text>
                          <Text style={stylesCompleto.colDescricaoCompleto}>
                            {item.descricao}
                          </Text>
                          <Text style={stylesCompleto.colUnidCompleto}>
                            {item.unidade || "un"}
                          </Text>
                          <Text style={stylesCompleto.colQtdCompleto}>
                            {item.quantidade}
                          </Text>
                          <Text style={stylesCompleto.colMaoDeObraUnit}>
                            {formatCurrencyShort(item.valorUnitarioMaoDeObra)}
                          </Text>
                          <Text style={stylesCompleto.colMaoDeObraTotal}>
                            {formatCurrencyShort(item.valorTotalMaoDeObra)}
                          </Text>
                          <Text style={stylesCompleto.colMaterialUnit}>
                            {formatCurrencyShort(item.valorUnitarioMaterial)}
                          </Text>
                          <Text style={stylesCompleto.colMaterialTotal}>
                            {formatCurrencyShort(item.valorTotalMaterial)}
                          </Text>
                          <Text style={stylesCompleto.colTotalCompleto}>
                            {formatCurrencyShort(item.valorTotal)}
                          </Text>
                        </View>
                      ) : (
                        <View
                          key={idx}
                          style={isAlt ? styles.tableRowAlt : styles.tableRow}
                        >
                          <Text
                            style={{
                              width: "10%",
                              fontSize: 8,
                              textAlign: "center",
                            }}
                          >
                            {itemNum}
                          </Text>
                          <Text style={{ width: "70%", fontSize: 8 }}>
                            {item.descricao}
                          </Text>
                          <Text
                            style={{
                              width: "10%",
                              fontSize: 8,
                              textAlign: "center",
                            }}
                          >
                            {item.unidade || "un"}
                          </Text>
                          <Text
                            style={{
                              width: "10%",
                              fontSize: 8,
                              textAlign: "center",
                            }}
                          >
                            {item.quantidade}
                          </Text>
                        </View>
                      );
                    })}
                    {/* Linha de subtotal da categoria - só mostra na versão detalhada */}
                    {orcamento.mostrarValoresDetalhados !== false && (
                      <View style={stylesCompleto.subtotalRow}>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colItem,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colDescricaoCompleto,
                          ]}
                        >
                          SUBTOTAL ITEM {categoriaNumero}.0
                        </Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colUnidCompleto,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colQtdCompleto,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colMaoDeObraUnit,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalValue,
                            stylesCompleto.colMaoDeObraTotal,
                          ]}
                        >
                          {formatCurrencyShort(subtotalMaoDeObra)}
                        </Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colMaterialUnit,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalValue,
                            stylesCompleto.colMaterialTotal,
                          ]}
                        >
                          {formatCurrencyShort(subtotalMaterial)}
                        </Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalValue,
                            stylesCompleto.colTotalCompleto,
                          ]}
                        >
                          {formatCurrencyShort(subtotalTotal)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
              {/* Total COMERCIAL */}
              {orcamento.mostrarValoresDetalhados !== false ? (
                <View style={stylesCompleto.totalEtapaRow}>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colItem,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colDescricaoCompleto,
                    ]}
                  >
                    TOTAL COMERCIAL
                  </Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colUnidCompleto,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colQtdCompleto,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colMaoDeObraUnit,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaValue,
                      stylesCompleto.colMaoDeObraTotal,
                    ]}
                  >
                    {formatCurrencyShort(
                      itensComerciais.reduce(
                        (acc, item) => acc + item.valorTotalMaoDeObra,
                        0
                      )
                    )}
                  </Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colMaterialUnit,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaValue,
                      stylesCompleto.colMaterialTotal,
                    ]}
                  >
                    {formatCurrencyShort(
                      itensComerciais.reduce(
                        (acc, item) => acc + item.valorTotalMaterial,
                        0
                      )
                    )}
                  </Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaValue,
                      stylesCompleto.colTotalCompleto,
                    ]}
                  >
                    {formatCurrencyShort(
                      itensComerciais.reduce(
                        (acc, item) => acc + item.valorTotal,
                        0
                      )
                    )}
                  </Text>
                </View>
              ) : (
                <View style={stylesCompleto.totalEtapaRow}>
                  <Text style={{ width: "10%", fontSize: 9 }}></Text>
                  <Text
                    style={{
                      width: "70%",
                      fontSize: 9,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    TOTAL COMERCIAL
                  </Text>
                  <Text
                    style={{
                      width: "20%",
                      fontSize: 9,
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    {formatCurrencyShort(
                      itensComerciais.reduce(
                        (acc, item) => acc + item.valorTotal,
                        0
                      )
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Tabela Residencial */}
        {itensResidenciais.length > 0 && (
          <View style={styles.itensSection}>
            <Text style={stylesCompleto.etapaTitulo}>RESIDENCIAL</Text>
            <View style={styles.table}>
              {/* Header - versão detalhada ou simplificada */}
              {orcamento.mostrarValoresDetalhados !== false ? (
                <View style={stylesCompleto.tableHeaderCompleto}>
                  <View style={stylesCompleto.tableHeaderRow1}>
                    <View style={stylesCompleto.headerGroupLeft}>
                      <Text
                        style={stylesCompleto.tableHeaderTextCompleto}
                      ></Text>
                    </View>
                    <View style={stylesCompleto.headerGroupMaoDeObra}>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MÃO DE OBRA
                      </Text>
                    </View>
                    <View style={stylesCompleto.headerGroupMaterial}>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MATERIAIS
                      </Text>
                    </View>
                    <View style={stylesCompleto.headerGroupTotal}>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MDO +
                      </Text>
                      <Text
                        style={[
                          stylesCompleto.tableHeaderTextCompleto,
                          { textAlign: "center" },
                        ]}
                      >
                        MAT
                      </Text>
                    </View>
                  </View>
                  <View style={stylesCompleto.tableHeaderRow2}>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellItem,
                      ]}
                    >
                      ITEM
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellDescricao,
                      ]}
                    >
                      DESCRIÇÃO DOS SERVIÇOS
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellUnid,
                      ]}
                    >
                      UNID.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellQtd,
                      ]}
                    >
                      QTE.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaoDeObraUnit,
                      ]}
                    >
                      UNIT.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaoDeObraTotal,
                      ]}
                    >
                      TOTAL
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaterialUnit,
                      ]}
                    >
                      UNIT.
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellMaterialTotal,
                      ]}
                    >
                      TOTAL
                    </Text>
                    <Text
                      style={[
                        stylesCompleto.tableHeaderTextCompleto,
                        stylesCompleto.headerCellTotal,
                      ]}
                    >
                      TOTAL
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: "10%" }]}>
                    ITEM
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "70%" }]}>
                    DESCRIÇÃO DOS SERVIÇOS
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "10%" }]}>
                    UNID.
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "10%" }]}>
                    QTE.
                  </Text>
                </View>
              )}

              {/* Agrupar por categoria */}
              {categoriasResidenciais.map((categoria, catIdx) => {
                const itensCategoria = itensResidenciais.filter(
                  (item) => item.categoriaNome === categoria
                );
                const subtotalMaoDeObra = itensCategoria.reduce(
                  (acc, item) => acc + item.valorTotalMaoDeObra,
                  0
                );
                const subtotalMaterial = itensCategoria.reduce(
                  (acc, item) => acc + item.valorTotalMaterial,
                  0
                );
                const subtotalTotal = itensCategoria.reduce(
                  (acc, item) => acc + item.valorTotal,
                  0
                );
                const categoriaNumero = catIdx + 1;
                return (
                  <View key={categoria}>
                    {/* Linha da categoria */}
                    <View style={stylesCompleto.categoriaRow}>
                      <Text
                        style={[
                          stylesCompleto.categoriaText,
                          {
                            width:
                              orcamento.mostrarValoresDetalhados !== false
                                ? "8%"
                                : "10%",
                          },
                        ]}
                      >
                        {categoriaNumero}.0
                      </Text>
                      <Text style={stylesCompleto.categoriaText}>
                        {categoria}
                      </Text>
                    </View>
                    {/* Itens da categoria */}
                    {itensCategoria.map((item, idx) => {
                      const itemNum = `${categoriaNumero}.${idx + 1}`;
                      const isAlt = idx % 2 === 1;
                      return orcamento.mostrarValoresDetalhados !== false ? (
                        <View
                          key={idx}
                          style={isAlt ? styles.tableRowAlt : styles.tableRow}
                        >
                          <Text style={stylesCompleto.colItem}>{itemNum}</Text>
                          <Text style={stylesCompleto.colDescricaoCompleto}>
                            {item.descricao}
                          </Text>
                          <Text style={stylesCompleto.colUnidCompleto}>
                            {item.unidade || "un"}
                          </Text>
                          <Text style={stylesCompleto.colQtdCompleto}>
                            {item.quantidade}
                          </Text>
                          <Text style={stylesCompleto.colMaoDeObraUnit}>
                            {formatCurrencyShort(item.valorUnitarioMaoDeObra)}
                          </Text>
                          <Text style={stylesCompleto.colMaoDeObraTotal}>
                            {formatCurrencyShort(item.valorTotalMaoDeObra)}
                          </Text>
                          <Text style={stylesCompleto.colMaterialUnit}>
                            {formatCurrencyShort(item.valorUnitarioMaterial)}
                          </Text>
                          <Text style={stylesCompleto.colMaterialTotal}>
                            {formatCurrencyShort(item.valorTotalMaterial)}
                          </Text>
                          <Text style={stylesCompleto.colTotalCompleto}>
                            {formatCurrencyShort(item.valorTotal)}
                          </Text>
                        </View>
                      ) : (
                        <View
                          key={idx}
                          style={isAlt ? styles.tableRowAlt : styles.tableRow}
                        >
                          <Text
                            style={{
                              width: "10%",
                              fontSize: 8,
                              textAlign: "center",
                            }}
                          >
                            {itemNum}
                          </Text>
                          <Text style={{ width: "70%", fontSize: 8 }}>
                            {item.descricao}
                          </Text>
                          <Text
                            style={{
                              width: "10%",
                              fontSize: 8,
                              textAlign: "center",
                            }}
                          >
                            {item.unidade || "un"}
                          </Text>
                          <Text
                            style={{
                              width: "10%",
                              fontSize: 8,
                              textAlign: "center",
                            }}
                          >
                            {item.quantidade}
                          </Text>
                        </View>
                      );
                    })}
                    {/* Linha de subtotal da categoria - só mostra na versão detalhada */}
                    {orcamento.mostrarValoresDetalhados !== false && (
                      <View style={stylesCompleto.subtotalRow}>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colItem,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colDescricaoCompleto,
                          ]}
                        >
                          SUBTOTAL ITEM {categoriaNumero}.0
                        </Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colUnidCompleto,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colQtdCompleto,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colMaoDeObraUnit,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalValue,
                            stylesCompleto.colMaoDeObraTotal,
                          ]}
                        >
                          {formatCurrencyShort(subtotalMaoDeObra)}
                        </Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalText,
                            stylesCompleto.colMaterialUnit,
                          ]}
                        ></Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalValue,
                            stylesCompleto.colMaterialTotal,
                          ]}
                        >
                          {formatCurrencyShort(subtotalMaterial)}
                        </Text>
                        <Text
                          style={[
                            stylesCompleto.subtotalValue,
                            stylesCompleto.colTotalCompleto,
                          ]}
                        >
                          {formatCurrencyShort(subtotalTotal)}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
              {/* Total RESIDENCIAL */}
              {orcamento.mostrarValoresDetalhados !== false ? (
                <View style={stylesCompleto.totalEtapaRow}>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colItem,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colDescricaoCompleto,
                    ]}
                  >
                    TOTAL RESIDENCIAL
                  </Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colUnidCompleto,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colQtdCompleto,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colMaoDeObraUnit,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaValue,
                      stylesCompleto.colMaoDeObraTotal,
                    ]}
                  >
                    {formatCurrencyShort(
                      itensResidenciais.reduce(
                        (acc, item) => acc + item.valorTotalMaoDeObra,
                        0
                      )
                    )}
                  </Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaText,
                      stylesCompleto.colMaterialUnit,
                    ]}
                  ></Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaValue,
                      stylesCompleto.colMaterialTotal,
                    ]}
                  >
                    {formatCurrencyShort(
                      itensResidenciais.reduce(
                        (acc, item) => acc + item.valorTotalMaterial,
                        0
                      )
                    )}
                  </Text>
                  <Text
                    style={[
                      stylesCompleto.totalEtapaValue,
                      stylesCompleto.colTotalCompleto,
                    ]}
                  >
                    {formatCurrencyShort(
                      itensResidenciais.reduce(
                        (acc, item) => acc + item.valorTotal,
                        0
                      )
                    )}
                  </Text>
                </View>
              ) : (
                <View style={stylesCompleto.totalEtapaRow}>
                  <Text style={{ width: "10%", fontSize: 9 }}></Text>
                  <Text
                    style={{
                      width: "70%",
                      fontSize: 9,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    TOTAL RESIDENCIAL
                  </Text>
                  <Text
                    style={{
                      width: "20%",
                      fontSize: 9,
                      textAlign: "right",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    {formatCurrencyShort(
                      itensResidenciais.reduce(
                        (acc, item) => acc + item.valorTotal,
                        0
                      )
                    )}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Totais */}
        {orcamento.mostrarValoresDetalhados !== false ? (
          <View style={stylesCompleto.totaisGrid}>
            <View style={stylesCompleto.totalBoxCompleto}>
              <Text style={stylesCompleto.totalLabelSmall}>Mão de Obra</Text>
              <Text style={stylesCompleto.totalValueSmall}>
                {formatCurrency(valorTotalMaoDeObra)}
              </Text>
            </View>
            <View style={stylesCompleto.totalBoxCompleto}>
              <Text style={stylesCompleto.totalLabelSmall}>Material</Text>
              <Text style={stylesCompleto.totalValueSmall}>
                {formatCurrency(valorTotalMaterial)}
              </Text>
            </View>
            <View style={stylesCompleto.totalBoxMain}>
              <Text
                style={[stylesCompleto.totalLabelSmall, { color: "white" }]}
              >
                TOTAL GERAL
              </Text>
              <Text style={styles.totalValue}>
                {formatCurrency(orcamento.valorTotal)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={stylesCompleto.totaisGrid}>
            <View style={stylesCompleto.totalBoxMain}>
              <Text
                style={[stylesCompleto.totalLabelSmall, { color: "white" }]}
              >
                TOTAL GERAL
              </Text>
              <Text style={styles.totalValue}>
                {formatCurrency(orcamento.valorTotal)}
              </Text>
            </View>
          </View>
        )}

        {/* Observações e Limitações - View wrapper para evitar sobreposição com rodapé */}
        <View style={stylesCompleto.limitacoesSection}>
          <Text style={styles.sectionTitle}>Observações e Limitações</Text>
          <View style={stylesCompleto.limitacoesBox}>
            {/* Parágrafos fixos */}
            <View style={stylesCompleto.limitacaoItem}>
              <Text style={stylesCompleto.limitacaoBullet}>•</Text>
              <Text style={stylesCompleto.limitacaoText}>
                O Contratante deverá nos informar procedimentos e rotinas
                operacionais ligadas à saúde e segurança a serem observadas e
                seguidas por nossos profissionais durante a execução dos
                trabalhos de campo.
              </Text>
            </View>
            <View style={stylesCompleto.limitacaoItem}>
              <Text style={stylesCompleto.limitacaoBullet}>•</Text>
              <Text style={stylesCompleto.limitacaoText}>
                Os serviços serão realizados em horário comercial, de segunda a
                sexta-feira, das 8 às 17h, ou em horário a combinar.
              </Text>
            </View>
            {/* Limitações selecionadas */}
            {orcamento.limitacoesSelecionadas &&
              orcamento.limitacoesSelecionadas.map((limitacao, index) => (
                <View key={index} style={stylesCompleto.limitacaoItem}>
                  <Text style={stylesCompleto.limitacaoBullet}>•</Text>
                  <Text style={stylesCompleto.limitacaoText}>{limitacao}</Text>
                </View>
              ))}
            {/* Observações adicionais como último bullet */}
            {orcamento.observacoes && (
              <View style={stylesCompleto.limitacaoItem}>
                <Text style={stylesCompleto.limitacaoBullet}>•</Text>
                <Text style={stylesCompleto.limitacaoText}>
                  {orcamento.observacoes}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Preços e Condições de Pagamento */}
        <Text style={styles.sectionTitle}>Preços e Condições de Pagamento</Text>

        {/* Composição do Preço */}
        <View style={stylesCompleto.precosBox}>
          <Text style={stylesCompleto.precosSubtitulo}>
            Composição do Preço
          </Text>
          <Text style={stylesCompleto.precosTexto}>
            O preço para execução do escopo especificado nesta proposta é de:
          </Text>
          <Text style={stylesCompleto.precosValorTotal}>
            {formatCurrency(orcamento.valorTotal)}
          </Text>
        </View>

        {/* Condições de Pagamento */}
        <View style={stylesCompleto.precosBox}>
          <Text style={stylesCompleto.precosSubtitulo}>
            Condições de Pagamento
          </Text>
          <Text style={stylesCompleto.precosTexto}>
            Propomos as seguintes condições de pagamento para os investimentos
            referentes aos seus serviços:
          </Text>

          {/* Se tem dados de parcelamento, mostrar tabela detalhada */}
          {orcamento.parcelamentoDados &&
          orcamento.parcelamentoDados.opcoes.length > 0 ? (
            (() => {
              // Filtrar parcelas baseado na seleção
              // Se parcelasSelecionadas está definido, usa a seleção do usuário
              // Caso contrário, mostra apenas as parcelas que NÃO estão abaixo do mínimo
              const parcelasSelecionadas =
                orcamento.parcelamentoDados.parcelasSelecionadas;
              const opcoesParaExibir =
                parcelasSelecionadas && parcelasSelecionadas.length > 0
                  ? orcamento.parcelamentoDados.opcoes.filter((opcao) =>
                      parcelasSelecionadas.includes(opcao.numeroParcelas)
                    )
                  : orcamento.parcelamentoDados.opcoes.filter(
                      (opcao) => !opcao.abaixoDoMinimo
                    );

              return (
                <>
                  {/* Box de entrada */}
                  <View style={stylesCompleto.parcelamentoEntradaBox}>
                    <Text style={stylesCompleto.parcelamentoEntradaText}>
                      Entrada: {orcamento.parcelamentoDados.entradaPercent}% -{" "}
                      {formatCurrency(orcamento.parcelamentoDados.valorEntrada)}
                    </Text>
                    <Text style={stylesCompleto.parcelamentoRestanteText}>
                      Restante:{" "}
                      {formatCurrency(
                        orcamento.parcelamentoDados.valorRestante
                      )}
                    </Text>
                  </View>

                  {/* Tabela de opções de parcelamento */}
                  <View style={stylesCompleto.parcelamentoTable}>
                    <View style={stylesCompleto.parcelamentoTableHeader}>
                      <Text
                        style={[
                          stylesCompleto.parcelamentoTableHeaderText,
                          stylesCompleto.parcelamentoColParcelas,
                        ]}
                      >
                        PARCELAS
                      </Text>
                      <Text
                        style={[
                          stylesCompleto.parcelamentoTableHeaderText,
                          stylesCompleto.parcelamentoColValor,
                        ]}
                      >
                        VALOR/PARCELA
                      </Text>
                      <Text
                        style={[
                          stylesCompleto.parcelamentoTableHeaderText,
                          stylesCompleto.parcelamentoColJuros,
                        ]}
                      >
                        JUROS
                      </Text>
                      <Text
                        style={[
                          stylesCompleto.parcelamentoTableHeaderText,
                          stylesCompleto.parcelamentoColTotal,
                        ]}
                      >
                        TOTAL FINAL
                      </Text>
                    </View>
                    {opcoesParaExibir.map((opcao, index) => (
                      <View
                        key={opcao.numeroParcelas}
                        style={
                          index % 2 === 0
                            ? stylesCompleto.parcelamentoTableRow
                            : stylesCompleto.parcelamentoTableRowAlt
                        }
                      >
                        <Text style={stylesCompleto.parcelamentoColParcelas}>
                          {opcao.numeroParcelas}x
                        </Text>
                        <Text style={stylesCompleto.parcelamentoColValor}>
                          {formatCurrency(opcao.valorParcela)}
                        </Text>
                        <Text style={stylesCompleto.parcelamentoColJuros}>
                          {opcao.temJuros
                            ? `+${opcao.taxaJuros}%`
                            : "Sem juros"}
                        </Text>
                        <Text style={stylesCompleto.parcelamentoColTotal}>
                          {formatCurrency(opcao.valorTotal)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              );
            })()
          ) : orcamento.condicaoPagamento === "a_vista" &&
            orcamento.descontoAVista &&
            orcamento.descontoAVista.percentual > 0 ? (
            <View>
              <Text style={stylesCompleto.precosCondicao}>
                À vista com {orcamento.descontoAVista.percentual}% de desconto:
              </Text>
              <Text style={stylesCompleto.precosValorTotal}>
                {formatCurrency(orcamento.descontoAVista.valorFinal)}
              </Text>
            </View>
          ) : (
            <Text style={stylesCompleto.precosCondicao}>
              {condicaoPagamentoTexto}
            </Text>
          )}
        </View>

        {/* Prazo de Execução */}
        <Text style={styles.sectionTitle}>Prazo de Execução</Text>
        <View style={stylesCompleto.precosBox}>
          <View style={stylesCompleto.prazoItem}>
            <Text style={stylesCompleto.prazoBullet}>•</Text>
            <Text style={stylesCompleto.prazoTexto}>
              Até {orcamento.prazoExecucaoServicos || 20} dias úteis para
              execução dos serviços, podendo ser intercalados;
            </Text>
          </View>
          {orcamento.prazoVistoriaBombeiros && (
            <View style={stylesCompleto.prazoItem}>
              <Text style={stylesCompleto.prazoBullet}>•</Text>
              <Text style={stylesCompleto.prazoTexto}>
                Até {orcamento.prazoVistoriaBombeiros} dias para a vistoria do
                Corpo de Bombeiros, depois de gerado o protocolo.
              </Text>
            </View>
          )}
        </View>

        {/* Prazo de Validade da Proposta */}
        <Text style={styles.sectionTitle}>Prazo de Validade da Proposta</Text>
        <View style={stylesCompleto.precosBox}>
          <Text style={stylesCompleto.precosTexto}>
            Esta proposta tem validade de{" "}
            {configuracoes?.diasValidadeOrcamento || 30} (
            {numeroPorExtenso(configuracoes?.diasValidadeOrcamento || 30)}) dias
            e o seu aceite poderá ser efetuado pelo WhatsApp ou e-mail.
          </Text>
        </View>

        {/* Termo de Responsabilidade + Assinatura (agrupados para não quebrar) */}
        <View wrap={false}>
          <View style={styles.termoSection}>
            <Text style={styles.termoTitle}>Termo de Responsabilidade</Text>
            <Text style={styles.termoText}>
              Comprometemo-nos em não divulgar quaisquer informações da
              edificação ou dos seus ocupantes, à exceção de decisão judicial.
            </Text>
          </View>

          {/* Assinatura */}
          <View style={styles.assinaturaSection}>
            <Text style={styles.assinaturaTexto}>Atenciosamente,</Text>
            <View style={styles.assinaturaLinha} />
            <Text style={styles.assinaturaNome}>FLAMA</Text>
            <Text style={styles.assinaturaSubtitle}>Sistemas de Proteção</Text>
          </View>
        </View>

        {/* Rodapé com dados da empresa */}
        {configuracoes && (
          <View style={styles.footer} fixed>
            <Text style={styles.footerEmpresa}>
              {configuracoes.nomeEmpresa}
            </Text>
            <Text style={styles.footerCnpj}>
              CNPJ: {configuracoes.cnpjEmpresa}
              {configuracoes.telefoneEmpresa
                ? ` | Tel: ${configuracoes.telefoneEmpresa}`
                : ""}
            </Text>
            <Text style={styles.footerEndereco}>
              {configuracoes.enderecoEmpresa}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// Função para gerar e baixar o PDF
export async function gerarPDFOrcamento(orcamento: Orcamento): Promise<void> {
  // Buscar configurações da empresa
  let configuracoes: ConfiguracoesGerais | undefined;
  try {
    configuracoes = await configuracoesGeraisService.buscar();
  } catch (error) {
    logger.error("Erro ao buscar configurações para PDF", { error });
  }

  // Usar sempre o template completo
  const PDFDocument = (
    <OrcamentoCompletoPDFDocument
      orcamento={orcamento}
      configuracoes={configuracoes}
    />
  );

  const blob = await pdf(PDFDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const numeroArquivo = formatOrcamentoNumero(
    orcamento.numero,
    orcamento.dataEmissao,
    orcamento.versao
  ).replace("#", "");
  link.download = `Orçamento Flama-${numeroArquivo}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Estilos específicos para o PDF de execução
const stylesExecucao = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 90,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.dark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  logoSection: {
    flex: 1,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 4,
  },
  logoSubtitle: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
    letterSpacing: 1,
  },
  infoSection: {
    alignItems: "flex-end",
  },
  titulo: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  infoLabel: {
    color: COLORS.gray,
    marginRight: 5,
  },
  infoValue: {
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clienteSection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
  },
  clienteNome: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: COLORS.dark,
  },
  clienteInfo: {
    fontSize: 9,
    color: COLORS.gray,
    marginBottom: 2,
  },
  tableContainer: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableHeaderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 8,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.lightGray,
  },
  categoriaRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriaText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  colItem: { width: "10%", fontSize: 8, textAlign: "center" },
  colDescricao: { width: "60%", fontSize: 8 },
  colUnidade: { width: "15%", fontSize: 8, textAlign: "center" },
  colQtd: { width: "15%", fontSize: 8, textAlign: "center" },
  etapaTitulo: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 5,
    textTransform: "uppercase",
    backgroundColor: COLORS.primaryLight,
    padding: 6,
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerEmpresa: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 2,
  },
  footerInfo: {
    fontSize: 8,
    color: COLORS.gray,
  },
  observacoesBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  observacoesTexto: {
    fontSize: 9,
    color: COLORS.dark,
    lineHeight: 1.4,
  },
});

// Componente PDF de Execução (para orçamentos aceitos)
function OrdemExecucaoPDFDocument({
  orcamento,
  configuracoes,
}: {
  orcamento: Orcamento;
  configuracoes?: ConfiguracoesGerais;
}) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
  };

  // Separar itens por etapa (residencial/comercial)
  const itensResidenciais =
    orcamento.itensCompleto?.filter((item) => item.etapa === "residencial") ||
    [];
  const itensComerciais =
    orcamento.itensCompleto?.filter((item) => item.etapa === "comercial") || [];

  // Obter categorias únicas
  const categoriasResidenciais = [
    ...new Set(itensResidenciais.map((item) => item.categoriaNome)),
  ];
  const categoriasComerciais = [
    ...new Set(itensComerciais.map((item) => item.categoriaNome)),
  ];

  return (
    <Document>
      <Page size="A4" style={stylesExecucao.page}>
        {/* Cabeçalho */}
        <View style={stylesExecucao.header}>
          <View style={stylesExecucao.logoSection}>
            <Text style={stylesExecucao.logoText}>FLAMA</Text>
            <Text style={stylesExecucao.logoSubtitle}>
              Sistemas de Proteção
            </Text>
          </View>
          <View style={stylesExecucao.infoSection}>
            <Text style={stylesExecucao.titulo}>ORDEM DE EXECUÇÃO</Text>
            <View style={stylesExecucao.infoRow}>
              <Text style={stylesExecucao.infoLabel}>Orçamento Nº:</Text>
              <Text style={stylesExecucao.infoValue}>
                {formatOrcamentoNumero(
                  orcamento.numero,
                  orcamento.dataEmissao,
                  orcamento.versao
                )}
              </Text>
            </View>
            <View style={stylesExecucao.infoRow}>
              <Text style={stylesExecucao.infoLabel}>Data Aceite:</Text>
              <Text style={stylesExecucao.infoValue}>
                {orcamento.dataAceite
                  ? formatDate(orcamento.dataAceite)
                  : formatDate(new Date())}
              </Text>
            </View>
          </View>
        </View>

        {/* Dados do Cliente */}
        <Text style={stylesExecucao.sectionTitle}>Dados do Cliente</Text>
        <View style={stylesExecucao.clienteSection}>
          <Text style={stylesExecucao.clienteNome}>
            {orcamento.clienteNome}
          </Text>
          {orcamento.clienteCnpj && (
            <Text style={stylesExecucao.clienteInfo}>
              {orcamento.clienteTipoPessoa === "fisica" ? "CPF" : "CNPJ"}:{" "}
              {orcamento.clienteCnpj}
            </Text>
          )}
          {orcamento.clienteEndereco && (
            <Text style={stylesExecucao.clienteInfo}>
              Endereço: {orcamento.clienteEndereco}
            </Text>
          )}
          {(orcamento.clienteCidade || orcamento.clienteEstado) && (
            <Text style={stylesExecucao.clienteInfo}>
              {orcamento.clienteCidade}
              {orcamento.clienteCidade && orcamento.clienteEstado ? " - " : ""}
              {orcamento.clienteEstado}
              {orcamento.clienteCep ? ` | CEP: ${orcamento.clienteCep}` : ""}
            </Text>
          )}
          {/* Telefone: prioridade modal > cliente */}
          {(orcamento.telefone?.trim() || orcamento.clienteTelefone) && (
            <Text style={stylesExecucao.clienteInfo}>
              Telefone:{" "}
              {orcamento.telefone?.trim() || orcamento.clienteTelefone}
            </Text>
          )}
          {orcamento.contato && (
            <Text style={stylesExecucao.clienteInfo}>
              Contato: {orcamento.contato}
            </Text>
          )}
          {/* E-mail: prioridade modal > cliente */}
          {(orcamento.email?.trim() || orcamento.clienteEmail) && (
            <Text style={stylesExecucao.clienteInfo}>
              E-mail: {orcamento.email?.trim() || orcamento.clienteEmail}
            </Text>
          )}
          {orcamento.enderecoServico && (
            <Text style={stylesExecucao.clienteInfo}>
              Endereço do Serviço: {orcamento.enderecoServico}
            </Text>
          )}
        </View>

        {/* Título Serviço */}
        <Text style={stylesExecucao.sectionTitle}>Serviço</Text>

        {/* Tabela de Itens - Residencial */}
        {itensResidenciais.length > 0 && (
          <>
            <Text style={stylesExecucao.etapaTitulo}>Itens - Residencial</Text>
            <View style={stylesExecucao.tableContainer}>
              <View style={stylesExecucao.tableHeader}>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colItem,
                  ]}
                >
                  ITEM
                </Text>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colDescricao,
                  ]}
                >
                  DESCRIÇÃO
                </Text>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colUnidade,
                  ]}
                >
                  UNID.
                </Text>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colQtd,
                  ]}
                >
                  QTE.
                </Text>
              </View>

              {categoriasResidenciais.map((categoria, catIdx) => {
                const itensCategoria = itensResidenciais.filter(
                  (item) => item.categoriaNome === categoria
                );
                const categoriaNumero = catIdx + 1;
                return (
                  <View key={categoria}>
                    <View style={stylesExecucao.categoriaRow}>
                      <Text
                        style={[stylesExecucao.categoriaText, { width: "10%" }]}
                      >
                        {categoriaNumero}.0
                      </Text>
                      <Text style={stylesExecucao.categoriaText}>
                        {categoria}
                      </Text>
                    </View>
                    {itensCategoria.map((item, idx) => {
                      const itemNum = `${categoriaNumero}.${idx + 1}`;
                      const isAlt = idx % 2 === 1;
                      return (
                        <View
                          key={idx}
                          style={
                            isAlt
                              ? stylesExecucao.tableRowAlt
                              : stylesExecucao.tableRow
                          }
                        >
                          <Text style={stylesExecucao.colItem}>{itemNum}</Text>
                          <Text style={stylesExecucao.colDescricao}>
                            {item.descricao}
                          </Text>
                          <Text style={stylesExecucao.colUnidade}>
                            {item.unidade || "un"}
                          </Text>
                          <Text style={stylesExecucao.colQtd}>
                            {item.quantidade}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Tabela de Itens - Comercial */}
        {itensComerciais.length > 0 && (
          <>
            <Text style={stylesExecucao.etapaTitulo}>Itens - Comercial</Text>
            <View style={stylesExecucao.tableContainer}>
              <View style={stylesExecucao.tableHeader}>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colItem,
                  ]}
                >
                  ITEM
                </Text>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colDescricao,
                  ]}
                >
                  DESCRIÇÃO
                </Text>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colUnidade,
                  ]}
                >
                  UNID.
                </Text>
                <Text
                  style={[
                    stylesExecucao.tableHeaderText,
                    stylesExecucao.colQtd,
                  ]}
                >
                  QTE.
                </Text>
              </View>

              {categoriasComerciais.map((categoria, catIdx) => {
                const itensCategoria = itensComerciais.filter(
                  (item) => item.categoriaNome === categoria
                );
                const categoriaNumero = catIdx + 1;
                return (
                  <View key={categoria}>
                    <View style={stylesExecucao.categoriaRow}>
                      <Text
                        style={[stylesExecucao.categoriaText, { width: "10%" }]}
                      >
                        {categoriaNumero}.0
                      </Text>
                      <Text style={stylesExecucao.categoriaText}>
                        {categoria}
                      </Text>
                    </View>
                    {itensCategoria.map((item, idx) => {
                      const itemNum = `${categoriaNumero}.${idx + 1}`;
                      const isAlt = idx % 2 === 1;
                      return (
                        <View
                          key={idx}
                          style={
                            isAlt
                              ? stylesExecucao.tableRowAlt
                              : stylesExecucao.tableRow
                          }
                        >
                          <Text style={stylesExecucao.colItem}>{itemNum}</Text>
                          <Text style={stylesExecucao.colDescricao}>
                            {item.descricao}
                          </Text>
                          <Text style={stylesExecucao.colUnidade}>
                            {item.unidade || "un"}
                          </Text>
                          <Text style={stylesExecucao.colQtd}>
                            {item.quantidade}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Rodapé */}
        {configuracoes && (
          <View style={stylesExecucao.footer} fixed>
            <Text style={stylesExecucao.footerEmpresa}>
              {configuracoes.nomeEmpresa}
            </Text>
            <Text style={stylesExecucao.footerInfo}>
              CNPJ: {configuracoes.cnpjEmpresa}
              {configuracoes.telefoneEmpresa
                ? ` | Tel: ${configuracoes.telefoneEmpresa}`
                : ""}{" "}
              | {configuracoes.enderecoEmpresa}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// Função para gerar e baixar o PDF de Execução (para orçamentos aceitos)
export async function gerarPDFExecucao(orcamento: Orcamento): Promise<void> {
  // Buscar configurações da empresa
  let configuracoes: ConfiguracoesGerais | undefined;
  try {
    configuracoes = await configuracoesGeraisService.buscar();
  } catch (error) {
    logger.error("Erro ao buscar configurações para PDF de execução", {
      error,
    });
  }

  const PDFDocument = (
    <OrdemExecucaoPDFDocument
      orcamento={orcamento}
      configuracoes={configuracoes}
    />
  );

  const blob = await pdf(PDFDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const numeroArquivo = formatOrcamentoNumero(
    orcamento.numero,
    orcamento.dataEmissao,
    orcamento.versao
  ).replace("#", "");
  link.download = `ordem-execucao-${numeroArquivo}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
