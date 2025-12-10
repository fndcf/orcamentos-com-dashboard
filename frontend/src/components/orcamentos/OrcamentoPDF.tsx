import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { Orcamento, ConfiguracoesGerais } from '../../types';
import { configuracoesGeraisService } from '../../services/configuracoesGeraisService';
import { logger } from '../../utils/logger';

// Cores do tema
const COLORS = {
  primary: '#CC0000',
  primaryLight: '#fee2e2',
  dark: '#1a1a1a',
  gray: '#666666',
  lightGray: '#f8f8f8',
  border: '#e0e0e0',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 75, // Espaço para o rodapé fixo
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.dark,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontWeight: 'bold',
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
    alignItems: 'flex-end',
  },
  orcamentoNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  orcamentoInfoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  orcamentoLabel: {
    color: COLORS.gray,
    marginRight: 5,
  },
  orcamentoValue: {
    fontWeight: 'bold',
  },
  // Seção do Cliente
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
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
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.dark,
  },
  clienteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clienteItem: {
    width: '50%',
    marginBottom: 6,
  },
  clienteItemFull: {
    width: '100%',
    marginBottom: 6,
  },
  clienteLabel: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 1,
    textTransform: 'uppercase',
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
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4a4a4a',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: COLORS.lightGray,
  },
  tableRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  colItem: {
    width: 35,
    textAlign: 'center',
  },
  colQtd: {
    width: 35,
    textAlign: 'center',
  },
  colDescricao: {
    flex: 1,
    paddingHorizontal: 8,
    textAlign: 'justify',
  },
  colUnid: {
    width: 45,
    textAlign: 'center',
  },
  colValorUnit: {
    width: 70,
    textAlign: 'right',
  },
  colValorTotal: {
    width: 75,
    textAlign: 'right',
  },
  // Total
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalBox: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    color: 'white',
    fontSize: 10,
    marginRight: 15,
  },
  totalValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Condições
  condicoesSection: {
    marginBottom: 20,
    flexDirection: 'row',
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
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  condicoesValue: {
    fontSize: 10,
    fontWeight: 'bold',
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
    textAlign: 'justify',
  },
  servicoText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: COLORS.dark,
    textAlign: 'justify',
  },
  servicoLabel: {
    fontSize: 8,
    color: COLORS.gray,
    textTransform: 'uppercase',
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
    fontWeight: 'bold',
    color: COLORS.gray,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  termoText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: COLORS.gray,
    textAlign: 'justify',
  },
  // Assinatura
  assinaturaSection: {
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  assinaturaSubtitle: {
    fontSize: 8,
    color: COLORS.gray,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    paddingTop: 8,
  },
  footerEmpresa: {
    fontSize: 9,
    fontWeight: 'bold',
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
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatCurrencyShort = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

const formatCEP = (cep: string | undefined): string => {
  if (!cep) return '';
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
};

// Converte número para texto por extenso (português)
const numeroPorExtenso = (num: number): string => {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (num === 0) return 'zero';
  if (num === 100) return 'cem';
  if (num < 20) return unidades[num];
  if (num < 100) {
    const dezena = Math.floor(num / 10);
    const unidade = num % 10;
    return unidade ? `${dezenas[dezena]} e ${unidades[unidade]}` : dezenas[dezena];
  }
  if (num < 1000) {
    const centena = Math.floor(num / 100);
    const resto = num % 100;
    if (resto === 0) return centenas[centena] === 'cento' ? 'cem' : centenas[centena];
    return `${centenas[centena]} e ${numeroPorExtenso(resto)}`;
  }
  return String(num); // Para números maiores, retorna o número
};

interface OrcamentoPDFProps {
  orcamento: Orcamento;
  configuracoes?: ConfiguracoesGerais;
}

export function OrcamentoPDFDocument({ orcamento, configuracoes }: OrcamentoPDFProps) {
  const ano = new Date(orcamento.dataEmissao).getFullYear();

  // Formatar versão como _v00, _v01, etc
  const versaoFormatada = `_v${String(orcamento.versao || 0).padStart(2, '0')}`;

  // Montar endereço completo
  const enderecoCompleto = [
    orcamento.clienteEndereco,
    orcamento.clienteCidade,
    orcamento.clienteEstado,
  ].filter(Boolean).join(' - ');

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
              Orçamento #{orcamento.numero}/{ano}{versaoFormatada}
            </Text>
            <View style={styles.orcamentoInfoRow}>
              <Text style={styles.orcamentoLabel}>Emissão:</Text>
              <Text style={styles.orcamentoValue}>{formatDate(orcamento.dataEmissao)}</Text>
            </View>
            <View style={styles.orcamentoInfoRow}>
              <Text style={styles.orcamentoLabel}>Validade:</Text>
              <Text style={styles.orcamentoValue}>{formatDate(orcamento.dataValidade)}</Text>
            </View>
            {orcamento.consultor && (
              <View style={styles.orcamentoInfoRow}>
                <Text style={styles.orcamentoLabel}>Consultor:</Text>
                <Text style={styles.orcamentoValue}>{orcamento.consultor}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Dados do Cliente */}
        <Text style={styles.sectionTitle}>Dados do Cliente</Text>
        <View style={styles.clienteSection}>
          <Text style={styles.clienteNome}>
            {orcamento.clienteTipoPessoa === 'fisica' ? 'Cliente: ' : 'Empresa: '}{orcamento.clienteNome}
          </Text>
          <View style={styles.clienteGrid}>
            {orcamento.clienteCnpj && orcamento.clienteCnpj.trim() !== '' && (
              <View style={styles.clienteItem}>
                <Text style={styles.clienteLabel}>{orcamento.clienteTipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'}</Text>
                <Text style={styles.clienteValue}>{orcamento.clienteCnpj}</Text>
              </View>
            )}
            {orcamento.contato && orcamento.contato.trim() !== '' && (
              <View style={styles.clienteItem}>
                <Text style={styles.clienteLabel}>Contato</Text>
                <Text style={styles.clienteValue}>{orcamento.contato}</Text>
              </View>
            )}
            {enderecoCompleto && enderecoCompleto.trim() !== '' && (
              <View style={styles.clienteItemFull}>
                <Text style={styles.clienteLabel}>Endereço</Text>
                <Text style={styles.clienteValue}>
                  {enderecoCompleto}
                  {orcamento.clienteCep && orcamento.clienteCep.trim() !== '' ? ` - CEP: ${formatCEP(orcamento.clienteCep)}` : ''}
                </Text>
              </View>
            )}
            {orcamento.clienteTelefone && orcamento.clienteTelefone.trim() !== '' && (
              <View style={styles.clienteItem}>
                <Text style={styles.clienteLabel}>Telefone</Text>
                <Text style={styles.clienteValue}>{orcamento.clienteTelefone}</Text>
              </View>
            )}
            {orcamento.clienteEmail && orcamento.clienteEmail.trim() !== '' && (
              <View style={styles.clienteItem}>
                <Text style={styles.clienteLabel}>E-mail</Text>
                <Text style={styles.clienteValue}>{orcamento.clienteEmail}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Itens do Orçamento */}
        <Text style={styles.sectionTitle}>Serviços / Materiais</Text>
        <View style={styles.itensSection}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
              <Text style={[styles.tableHeaderText, styles.colQtd]}>Qtd</Text>
              <Text style={[styles.tableHeaderText, styles.colDescricao]}>Descrição</Text>
              <Text style={[styles.tableHeaderText, styles.colUnid]}>Unid</Text>
              <Text style={[styles.tableHeaderText, styles.colValorUnit]}>Valor Unit.</Text>
              <Text style={[styles.tableHeaderText, styles.colValorTotal]}>Total</Text>
            </View>

            {orcamento.itens.map((item, index) => {
              const isLast = index === orcamento.itens.length - 1;
              const isAlt = index % 2 === 1;
              const rowStyle = isLast
                ? (isAlt ? [styles.tableRowLast, { backgroundColor: COLORS.lightGray }] : styles.tableRowLast)
                : (isAlt ? styles.tableRowAlt : styles.tableRow);

              return (
                <View key={index} style={rowStyle}>
                  <Text style={styles.colItem}>{index + 1}</Text>
                  <Text style={styles.colQtd}>{item.quantidade}</Text>
                  <Text style={styles.colDescricao}>{item.descricao}</Text>
                  <Text style={styles.colUnid}>{item.unidade || 'Serv.'}</Text>
                  <Text style={styles.colValorUnit}>{formatCurrency(item.valorUnitario)}</Text>
                  <Text style={styles.colValorTotal}>{formatCurrency(item.valorTotal)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.totalSection}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{formatCurrency(orcamento.valorTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Condições */}
        <Text style={styles.sectionTitle}>Condições</Text>
        <View style={styles.condicoesSection}>
          <View style={styles.condicoesBox}>
            <Text style={styles.condicoesTitle}>Validade da Proposta</Text>
            <Text style={styles.condicoesValue}>{configuracoes?.diasValidadeOrcamento || 30} dias</Text>
          </View>
          <View style={styles.condicoesBox}>
            <Text style={styles.condicoesTitle}>Condição de Pagamento</Text>
            <Text style={styles.condicoesValue}>À vista</Text>
          </View>
          <View style={styles.condicoesBox}>
            <Text style={styles.condicoesTitle}>Forma de Pagamento</Text>
            <Text style={styles.condicoesValue}>PIX / Boleto / Dinheiro</Text>
          </View>
        </View>

        {/* Observações (inclui limitações selecionadas + observações adicionais) */}
        {(orcamento.limitacoesSelecionadas?.length || orcamento.observacoes) && (
          <>
            <Text style={styles.sectionTitle}>Observações</Text>
            <View style={styles.observacoesSection}>
              <View style={styles.observacoesBox}>
                {/* Limitações selecionadas como bullets */}
                {orcamento.limitacoesSelecionadas && orcamento.limitacoesSelecionadas.length > 0 && (
                  orcamento.limitacoesSelecionadas.map((limitacao, index) => (
                    <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
                      <Text style={{ marginRight: 6 }}>•</Text>
                      <Text style={styles.observacoesText}>{limitacao}</Text>
                    </View>
                  ))
                )}
                {/* Observações adicionais também como bullet */}
                {orcamento.observacoes && (
                  <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                    <Text style={{ marginRight: 6 }}>•</Text>
                    <Text style={styles.observacoesText}>{orcamento.observacoes}</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* Termo de Responsabilidade + Assinatura (agrupados para não quebrar) */}
        <View wrap={false}>
          <View style={styles.termoSection}>
            <Text style={styles.termoTitle}>Termo de Responsabilidade</Text>
            <Text style={styles.termoText}>
              Comprometemo-nos em não divulgar quaisquer informações da edificação ou dos seus ocupantes, à exceção de decisão judicial.
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
            <Text style={styles.footerEmpresa}>{configuracoes.nomeEmpresa}</Text>
            <Text style={styles.footerCnpj}>CNPJ: {configuracoes.cnpjEmpresa}</Text>
            <Text style={styles.footerEndereco}>{configuracoes.enderecoEmpresa}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// Estilos adicionais para orçamento completo
const stylesCompleto = StyleSheet.create({
  // Tabela com colunas M.O. e Material - Novo layout
  colItem: {
    width: 30,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  colDescricaoCompleto: {
    flex: 1,
    paddingHorizontal: 4,
    textAlign: 'justify',
  },
  colUnidCompleto: {
    width: 32,
    textAlign: 'center',
  },
  colQtdCompleto: {
    width: 28,
    textAlign: 'center',
  },
  colMaoDeObraUnit: {
    width: 52,
    textAlign: 'right',
  },
  colMaoDeObraTotal: {
    width: 52,
    textAlign: 'right',
  },
  colMaterialUnit: {
    width: 52,
    textAlign: 'right',
  },
  colMaterialTotal: {
    width: 52,
    textAlign: 'right',
  },
  colTotalCompleto: {
    width: 55,
    textAlign: 'right',
  },
  // Header com duas linhas
  tableHeaderCompleto: {
    backgroundColor: '#4a4a4a', // Cinza escuro consistente com o resto do layout
  },
  tableHeaderRow1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderRow2: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#666666',
  },
  tableHeaderTextCompleto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 7,
    textTransform: 'uppercase',
  },
  // Grupos de colunas no header
  headerGroupLeft: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  headerGroupMaoDeObra: {
    width: 104,
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#666666',
    paddingVertical: 4,
  },
  headerGroupMaterial: {
    width: 104,
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#666666',
    paddingVertical: 4,
  },
  headerGroupTotal: {
    width: 55,
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#666666',
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
    textAlign: 'center',
  },
  headerCellQtd: {
    width: 28,
    paddingVertical: 4,
    textAlign: 'center',
  },
  headerCellMaoDeObraUnit: {
    width: 52,
    paddingVertical: 4,
    textAlign: 'right',
    borderLeftWidth: 1,
    borderLeftColor: '#666666',
  },
  headerCellMaoDeObraTotal: {
    width: 52,
    paddingVertical: 4,
    textAlign: 'right',
  },
  headerCellMaterialUnit: {
    width: 52,
    paddingVertical: 4,
    textAlign: 'right',
    borderLeftWidth: 1,
    borderLeftColor: '#666666',
  },
  headerCellMaterialTotal: {
    width: 52,
    paddingVertical: 4,
    textAlign: 'right',
  },
  headerCellTotal: {
    width: 55,
    paddingVertical: 4,
    textAlign: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#666666',
  },
  // Seção de categoria (ex: SISTEMA DE HIDRANTES)
  categoriaRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight, // Vermelho claro da marca
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriaText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.primary, // Vermelho da marca
  },
  // Linha de subtotal da categoria
  subtotalRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray, // Cinza claro consistente
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subtotalText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  subtotalValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.dark,
    textAlign: 'right',
  },
  // Linha de total da etapa (RESIDENCIAL/COMERCIAL)
  totalEtapaRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary, // Vermelho da marca para destaque
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  totalEtapaText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
  },
  totalEtapaValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'right',
  },
  // Texto introdutório do escopo
  escopoIntro: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.dark,
    marginBottom: 15,
    textAlign: 'justify',
  },
  etapaTitulo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 10,
    marginTop: 5,
  },
  // Totais com M.O. e Material
  totaisGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    alignItems: 'center',
  },
  totalBoxMain: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
  },
  totalLabelSmall: {
    fontSize: 8,
    color: COLORS.gray,
    marginBottom: 2,
  },
  totalValueSmall: {
    fontSize: 10,
    fontWeight: 'bold',
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
    flexDirection: 'row',
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
    textAlign: 'justify',
  },
  // Prazo e condições
  prazoCondicoesSection: {
    marginBottom: 20,
    flexDirection: 'row',
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
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  precosTexto: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.dark,
    textAlign: 'justify',
  },
  precosValorTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  precosCondicao: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 6,
  },
  prazoItem: {
    flexDirection: 'row',
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
    textAlign: 'justify',
  },
  // Tabela de parcelamento
  parcelamentoTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  parcelamentoTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4a4a4a',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  parcelamentoTableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 8,
  },
  parcelamentoTableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  parcelamentoTableRowAlt: {
    flexDirection: 'row',
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
    textAlign: 'right',
  },
  parcelamentoColJuros: {
    width: 70,
    fontSize: 8,
    textAlign: 'center',
    color: COLORS.gray,
  },
  parcelamentoColTotal: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  parcelamentoEntradaBox: {
    backgroundColor: COLORS.primaryLight,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  parcelamentoEntradaText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  parcelamentoRestanteText: {
    fontSize: 9,
    color: COLORS.dark,
    marginTop: 4,
  },
});

// Componente PDF para orçamento completo
export function OrcamentoCompletoPDFDocument({ orcamento, configuracoes }: OrcamentoPDFProps) {
  const ano = new Date(orcamento.dataEmissao).getFullYear();
  const versaoFormatada = `_v${String(orcamento.versao || 0).padStart(2, '0')}`;

  const enderecoCompleto = [
    orcamento.clienteEndereco,
    orcamento.clienteCidade,
    orcamento.clienteEstado,
  ].filter(Boolean).join(' - ');

  const itensCompleto = orcamento.itensCompleto || [];
  const valorTotalMaoDeObra = orcamento.valorTotalMaoDeObra || 0;
  const valorTotalMaterial = orcamento.valorTotalMaterial || 0;

  // Separar itens por etapa (residencial/comercial)
  const itensResidenciais = itensCompleto.filter(item => item.etapa === 'residencial');
  const itensComerciais = itensCompleto.filter(item => item.etapa === 'comercial');

  // Obter categorias únicas por etapa
  const categoriasResidenciais = [...new Set(itensResidenciais.map(item => item.categoriaNome))];
  const categoriasComerciais = [...new Set(itensComerciais.map(item => item.categoriaNome))];

  const condicaoPagamentoTexto = orcamento.condicaoPagamento === 'parcelado'
    ? orcamento.parcelamentoTexto || 'Parcelado'
    : 'A combinar';

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
              Orçamento #{orcamento.numero}/{ano}{versaoFormatada}
            </Text>
            <View style={styles.orcamentoInfoRow}>
              <Text style={styles.orcamentoLabel}>Emissão:</Text>
              <Text style={styles.orcamentoValue}>{formatDate(orcamento.dataEmissao)}</Text>
            </View>
            <View style={styles.orcamentoInfoRow}>
              <Text style={styles.orcamentoLabel}>Validade:</Text>
              <Text style={styles.orcamentoValue}>{formatDate(orcamento.dataValidade)}</Text>
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
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 10, color: COLORS.dark }}>À</Text>
          <View style={{ marginBottom: 4 }}>
            <Text style={styles.clienteValue}>
              <Text style={{ fontWeight: 'bold' }}>{orcamento.clienteTipoPessoa === 'fisica' ? 'Cliente: ' : 'Empresa: '}</Text>
              {orcamento.clienteNome}
            </Text>
          </View>
          {enderecoCompleto && enderecoCompleto.trim() !== '' && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: 'bold' }}>Endereço: </Text>
                {enderecoCompleto}
                {orcamento.clienteCep && orcamento.clienteCep.trim() !== '' ? ` - CEP: ${formatCEP(orcamento.clienteCep)}` : ''}
              </Text>
            </View>
          )}
          {orcamento.clienteTelefone && orcamento.clienteTelefone.trim() !== '' && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: 'bold' }}>Telefone: </Text>
                {orcamento.clienteTelefone}
              </Text>
            </View>
          )}
          {orcamento.contato && orcamento.contato.trim() !== '' && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: 'bold' }}>Contato: </Text>
                {orcamento.contato}
              </Text>
            </View>
          )}
          {orcamento.clienteEmail && orcamento.clienteEmail.trim() !== '' && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: 'bold' }}>E-mail: </Text>
                {orcamento.clienteEmail}
              </Text>
            </View>
          )}
          {orcamento.servicoDescricao && orcamento.servicoDescricao.trim() !== '' && (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.clienteValue}>
                <Text style={{ fontWeight: 'bold' }}>Serviço: </Text>
                {orcamento.servicoDescricao.replace(/\n/g, ' ')}
              </Text>
            </View>
          )}
        </View>

        {/* Introdução */}
        <Text style={styles.sectionTitle}>Introdução</Text>
        <View style={styles.clienteSection}>
          <Text style={styles.servicoText}>
            Apresentamos a proposta técnica e comercial para o desenvolvimento das atividades na edificação acima discriminada, em consonância com as exigências técnicas do Corpo de Bombeiros do Estado de São Paulo.
          </Text>
        </View>

        {/* Escopo Técnico dos Serviços */}
        <Text style={styles.sectionTitle}>Escopo Técnico dos Serviços</Text>
        <Text style={stylesCompleto.escopoIntro}>
          Os trabalhos de execução do projeto serão desenvolvidos de forma direcionada e envolverão as seguintes etapas:
        </Text>

        {/* Tabela Residencial */}
        {itensResidenciais.length > 0 && (
          <View style={styles.itensSection}>
            <Text style={stylesCompleto.etapaTitulo}>RESIDENCIAL</Text>
            <View style={styles.table}>
              {/* Header com duas linhas */}
              <View style={stylesCompleto.tableHeaderCompleto}>
                <View style={stylesCompleto.tableHeaderRow1}>
                  <View style={stylesCompleto.headerGroupLeft}>
                    <Text style={stylesCompleto.tableHeaderTextCompleto}></Text>
                  </View>
                  <View style={stylesCompleto.headerGroupMaoDeObra}>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MÃO DE OBRA</Text>
                  </View>
                  <View style={stylesCompleto.headerGroupMaterial}>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MATERIAIS</Text>
                  </View>
                  <View style={stylesCompleto.headerGroupTotal}>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MDO +</Text>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MAT</Text>
                  </View>
                </View>
                <View style={stylesCompleto.tableHeaderRow2}>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellItem]}>ITEM</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellDescricao]}>DESCRIÇÃO DOS SERVIÇOS</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellUnid]}>UNID.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellQtd]}>QTE.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaoDeObraUnit]}>UNIT.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaoDeObraTotal]}>TOTAL</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaterialUnit]}>UNIT.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaterialTotal]}>TOTAL</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellTotal]}>TOTAL</Text>
                </View>
              </View>

              {/* Agrupar por categoria */}
              {categoriasResidenciais.map((categoria, catIdx) => {
                const itensCategoria = itensResidenciais.filter(item => item.categoriaNome === categoria);
                const subtotalMaoDeObra = itensCategoria.reduce((acc, item) => acc + item.valorTotalMaoDeObra, 0);
                const subtotalMaterial = itensCategoria.reduce((acc, item) => acc + item.valorTotalMaterial, 0);
                const subtotalTotal = itensCategoria.reduce((acc, item) => acc + item.valorTotal, 0);
                const categoriaNumero = catIdx + 1;
                return (
                  <View key={categoria}>
                    {/* Linha da categoria */}
                    <View style={stylesCompleto.categoriaRow}>
                      <Text style={[stylesCompleto.categoriaText, stylesCompleto.colItem]}>{categoriaNumero}.0</Text>
                      <Text style={stylesCompleto.categoriaText}>{categoria}</Text>
                    </View>
                    {/* Itens da categoria */}
                    {itensCategoria.map((item, idx) => {
                      const itemNum = `${categoriaNumero}.${idx + 1}`;
                      const isAlt = idx % 2 === 1;
                      return (
                        <View key={idx} style={isAlt ? styles.tableRowAlt : styles.tableRow}>
                          <Text style={stylesCompleto.colItem}>{itemNum}</Text>
                          <Text style={stylesCompleto.colDescricaoCompleto}>{item.descricao}</Text>
                          <Text style={stylesCompleto.colUnidCompleto}>{item.unidade || 'un'}</Text>
                          <Text style={stylesCompleto.colQtdCompleto}>{item.quantidade}</Text>
                          <Text style={stylesCompleto.colMaoDeObraUnit}>{formatCurrencyShort(item.valorUnitarioMaoDeObra)}</Text>
                          <Text style={stylesCompleto.colMaoDeObraTotal}>{formatCurrencyShort(item.valorTotalMaoDeObra)}</Text>
                          <Text style={stylesCompleto.colMaterialUnit}>{formatCurrencyShort(item.valorUnitarioMaterial)}</Text>
                          <Text style={stylesCompleto.colMaterialTotal}>{formatCurrencyShort(item.valorTotalMaterial)}</Text>
                          <Text style={stylesCompleto.colTotalCompleto}>{formatCurrencyShort(item.valorTotal)}</Text>
                        </View>
                      );
                    })}
                    {/* Linha de subtotal da categoria */}
                    <View style={stylesCompleto.subtotalRow}>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colItem]}></Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colDescricaoCompleto]}>SUBTOTAL ITEM {categoriaNumero}.0</Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colUnidCompleto]}></Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colQtdCompleto]}></Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colMaoDeObraUnit]}></Text>
                      <Text style={[stylesCompleto.subtotalValue, stylesCompleto.colMaoDeObraTotal]}>{formatCurrencyShort(subtotalMaoDeObra)}</Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colMaterialUnit]}></Text>
                      <Text style={[stylesCompleto.subtotalValue, stylesCompleto.colMaterialTotal]}>{formatCurrencyShort(subtotalMaterial)}</Text>
                      <Text style={[stylesCompleto.subtotalValue, stylesCompleto.colTotalCompleto]}>{formatCurrencyShort(subtotalTotal)}</Text>
                    </View>
                  </View>
                );
              })}
              {/* Total RESIDENCIAL */}
              <View style={stylesCompleto.totalEtapaRow}>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colItem]}></Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colDescricaoCompleto]}>TOTAL RESIDENCIAL</Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colUnidCompleto]}></Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colQtdCompleto]}></Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colMaoDeObraUnit]}></Text>
                <Text style={[stylesCompleto.totalEtapaValue, stylesCompleto.colMaoDeObraTotal]}>{formatCurrencyShort(itensResidenciais.reduce((acc, item) => acc + item.valorTotalMaoDeObra, 0))}</Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colMaterialUnit]}></Text>
                <Text style={[stylesCompleto.totalEtapaValue, stylesCompleto.colMaterialTotal]}>{formatCurrencyShort(itensResidenciais.reduce((acc, item) => acc + item.valorTotalMaterial, 0))}</Text>
                <Text style={[stylesCompleto.totalEtapaValue, stylesCompleto.colTotalCompleto]}>{formatCurrencyShort(itensResidenciais.reduce((acc, item) => acc + item.valorTotal, 0))}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tabela Comercial */}
        {itensComerciais.length > 0 && (
          <View style={styles.itensSection}>
            <Text style={stylesCompleto.etapaTitulo}>COMERCIAL</Text>
            <View style={styles.table}>
              {/* Header com duas linhas */}
              <View style={stylesCompleto.tableHeaderCompleto}>
                <View style={stylesCompleto.tableHeaderRow1}>
                  <View style={stylesCompleto.headerGroupLeft}>
                    <Text style={stylesCompleto.tableHeaderTextCompleto}></Text>
                  </View>
                  <View style={stylesCompleto.headerGroupMaoDeObra}>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MÃO DE OBRA</Text>
                  </View>
                  <View style={stylesCompleto.headerGroupMaterial}>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MATERIAIS</Text>
                  </View>
                  <View style={stylesCompleto.headerGroupTotal}>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MDO +</Text>
                    <Text style={[stylesCompleto.tableHeaderTextCompleto, { textAlign: 'center' }]}>MAT</Text>
                  </View>
                </View>
                <View style={stylesCompleto.tableHeaderRow2}>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellItem]}>ITEM</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellDescricao]}>DESCRIÇÃO DOS SERVIÇOS</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellUnid]}>UNID.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellQtd]}>QTE.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaoDeObraUnit]}>UNIT.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaoDeObraTotal]}>TOTAL</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaterialUnit]}>UNIT.</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellMaterialTotal]}>TOTAL</Text>
                  <Text style={[stylesCompleto.tableHeaderTextCompleto, stylesCompleto.headerCellTotal]}>TOTAL</Text>
                </View>
              </View>

              {/* Agrupar por categoria */}
              {categoriasComerciais.map((categoria, catIdx) => {
                const itensCategoria = itensComerciais.filter(item => item.categoriaNome === categoria);
                const subtotalMaoDeObra = itensCategoria.reduce((acc, item) => acc + item.valorTotalMaoDeObra, 0);
                const subtotalMaterial = itensCategoria.reduce((acc, item) => acc + item.valorTotalMaterial, 0);
                const subtotalTotal = itensCategoria.reduce((acc, item) => acc + item.valorTotal, 0);
                const categoriaNumero = catIdx + 1;
                return (
                  <View key={categoria}>
                    {/* Linha da categoria */}
                    <View style={stylesCompleto.categoriaRow}>
                      <Text style={[stylesCompleto.categoriaText, stylesCompleto.colItem]}>{categoriaNumero}.0</Text>
                      <Text style={stylesCompleto.categoriaText}>{categoria}</Text>
                    </View>
                    {/* Itens da categoria */}
                    {itensCategoria.map((item, idx) => {
                      const itemNum = `${categoriaNumero}.${idx + 1}`;
                      const isAlt = idx % 2 === 1;
                      return (
                        <View key={idx} style={isAlt ? styles.tableRowAlt : styles.tableRow}>
                          <Text style={stylesCompleto.colItem}>{itemNum}</Text>
                          <Text style={stylesCompleto.colDescricaoCompleto}>{item.descricao}</Text>
                          <Text style={stylesCompleto.colUnidCompleto}>{item.unidade || 'un'}</Text>
                          <Text style={stylesCompleto.colQtdCompleto}>{item.quantidade}</Text>
                          <Text style={stylesCompleto.colMaoDeObraUnit}>{formatCurrencyShort(item.valorUnitarioMaoDeObra)}</Text>
                          <Text style={stylesCompleto.colMaoDeObraTotal}>{formatCurrencyShort(item.valorTotalMaoDeObra)}</Text>
                          <Text style={stylesCompleto.colMaterialUnit}>{formatCurrencyShort(item.valorUnitarioMaterial)}</Text>
                          <Text style={stylesCompleto.colMaterialTotal}>{formatCurrencyShort(item.valorTotalMaterial)}</Text>
                          <Text style={stylesCompleto.colTotalCompleto}>{formatCurrencyShort(item.valorTotal)}</Text>
                        </View>
                      );
                    })}
                    {/* Linha de subtotal da categoria */}
                    <View style={stylesCompleto.subtotalRow}>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colItem]}></Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colDescricaoCompleto]}>SUBTOTAL ITEM {categoriaNumero}.0</Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colUnidCompleto]}></Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colQtdCompleto]}></Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colMaoDeObraUnit]}></Text>
                      <Text style={[stylesCompleto.subtotalValue, stylesCompleto.colMaoDeObraTotal]}>{formatCurrencyShort(subtotalMaoDeObra)}</Text>
                      <Text style={[stylesCompleto.subtotalText, stylesCompleto.colMaterialUnit]}></Text>
                      <Text style={[stylesCompleto.subtotalValue, stylesCompleto.colMaterialTotal]}>{formatCurrencyShort(subtotalMaterial)}</Text>
                      <Text style={[stylesCompleto.subtotalValue, stylesCompleto.colTotalCompleto]}>{formatCurrencyShort(subtotalTotal)}</Text>
                    </View>
                  </View>
                );
              })}
              {/* Total COMERCIAL */}
              <View style={stylesCompleto.totalEtapaRow}>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colItem]}></Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colDescricaoCompleto]}>TOTAL COMERCIAL</Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colUnidCompleto]}></Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colQtdCompleto]}></Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colMaoDeObraUnit]}></Text>
                <Text style={[stylesCompleto.totalEtapaValue, stylesCompleto.colMaoDeObraTotal]}>{formatCurrencyShort(itensComerciais.reduce((acc, item) => acc + item.valorTotalMaoDeObra, 0))}</Text>
                <Text style={[stylesCompleto.totalEtapaText, stylesCompleto.colMaterialUnit]}></Text>
                <Text style={[stylesCompleto.totalEtapaValue, stylesCompleto.colMaterialTotal]}>{formatCurrencyShort(itensComerciais.reduce((acc, item) => acc + item.valorTotalMaterial, 0))}</Text>
                <Text style={[stylesCompleto.totalEtapaValue, stylesCompleto.colTotalCompleto]}>{formatCurrencyShort(itensComerciais.reduce((acc, item) => acc + item.valorTotal, 0))}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Totais */}
        <View style={stylesCompleto.totaisGrid}>
          <View style={stylesCompleto.totalBoxCompleto}>
            <Text style={stylesCompleto.totalLabelSmall}>Mão de Obra</Text>
            <Text style={stylesCompleto.totalValueSmall}>{formatCurrency(valorTotalMaoDeObra)}</Text>
          </View>
          <View style={stylesCompleto.totalBoxCompleto}>
            <Text style={stylesCompleto.totalLabelSmall}>Material</Text>
            <Text style={stylesCompleto.totalValueSmall}>{formatCurrency(valorTotalMaterial)}</Text>
          </View>
          <View style={stylesCompleto.totalBoxMain}>
            <Text style={[stylesCompleto.totalLabelSmall, { color: 'white' }]}>TOTAL GERAL</Text>
            <Text style={styles.totalValue}>{formatCurrency(orcamento.valorTotal)}</Text>
          </View>
        </View>

        {/* Observações e Limitações - View wrapper para evitar sobreposição com rodapé */}
        <View style={stylesCompleto.limitacoesSection}>
          <Text style={styles.sectionTitle}>Observações e Limitações</Text>
          <View style={stylesCompleto.limitacoesBox}>
            {/* Parágrafos fixos */}
            <View style={stylesCompleto.limitacaoItem}>
              <Text style={stylesCompleto.limitacaoBullet}>•</Text>
              <Text style={stylesCompleto.limitacaoText}>
                O Contratante deverá nos informar procedimentos e rotinas operacionais ligadas à saúde e segurança a serem observadas e seguidas por nossos profissionais durante a execução dos trabalhos de campo.
              </Text>
            </View>
            <View style={stylesCompleto.limitacaoItem}>
              <Text style={stylesCompleto.limitacaoBullet}>•</Text>
              <Text style={stylesCompleto.limitacaoText}>
                Os serviços serão realizados em horário comercial, de segunda a sexta-feira, das 8 às 17h, ou em horário a combinar.
              </Text>
            </View>
            {/* Limitações selecionadas */}
            {orcamento.limitacoesSelecionadas && orcamento.limitacoesSelecionadas.map((limitacao, index) => (
              <View key={index} style={stylesCompleto.limitacaoItem}>
                <Text style={stylesCompleto.limitacaoBullet}>•</Text>
                <Text style={stylesCompleto.limitacaoText}>{limitacao}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Preços e Condições de Pagamento */}
        <Text style={styles.sectionTitle}>Preços e Condições de Pagamento</Text>

        {/* Composição do Preço */}
        <View style={stylesCompleto.precosBox}>
          <Text style={stylesCompleto.precosSubtitulo}>Composição do Preço</Text>
          <Text style={stylesCompleto.precosTexto}>
            O preço para execução do escopo especificado nesta proposta é de:
          </Text>
          <Text style={stylesCompleto.precosValorTotal}>{formatCurrency(orcamento.valorTotal)}</Text>
        </View>

        {/* Condições de Pagamento */}
        <View style={stylesCompleto.precosBox}>
          <Text style={stylesCompleto.precosSubtitulo}>Condições de Pagamento</Text>
          <Text style={stylesCompleto.precosTexto}>
            Propomos as seguintes condições de pagamento para os investimentos referentes aos seus serviços:
          </Text>

          {/* Se tem dados de parcelamento, mostrar tabela detalhada */}
          {orcamento.parcelamentoDados && orcamento.parcelamentoDados.opcoes.length > 0 ? (
            <>
              {/* Box de entrada */}
              <View style={stylesCompleto.parcelamentoEntradaBox}>
                <Text style={stylesCompleto.parcelamentoEntradaText}>
                  Entrada: {orcamento.parcelamentoDados.entradaPercent}% - {formatCurrency(orcamento.parcelamentoDados.valorEntrada)}
                </Text>
                <Text style={stylesCompleto.parcelamentoRestanteText}>
                  Restante: {formatCurrency(orcamento.parcelamentoDados.valorRestante)}
                </Text>
              </View>

              {/* Tabela de opções de parcelamento */}
              <View style={stylesCompleto.parcelamentoTable}>
                <View style={stylesCompleto.parcelamentoTableHeader}>
                  <Text style={[stylesCompleto.parcelamentoTableHeaderText, stylesCompleto.parcelamentoColParcelas]}>PARCELAS</Text>
                  <Text style={[stylesCompleto.parcelamentoTableHeaderText, stylesCompleto.parcelamentoColValor]}>VALOR/PARCELA</Text>
                  <Text style={[stylesCompleto.parcelamentoTableHeaderText, stylesCompleto.parcelamentoColJuros]}>JUROS</Text>
                  <Text style={[stylesCompleto.parcelamentoTableHeaderText, stylesCompleto.parcelamentoColTotal]}>TOTAL FINAL</Text>
                </View>
                {orcamento.parcelamentoDados.opcoes.map((opcao, index) => (
                  <View
                    key={opcao.numeroParcelas}
                    style={index % 2 === 0 ? stylesCompleto.parcelamentoTableRow : stylesCompleto.parcelamentoTableRowAlt}
                  >
                    <Text style={stylesCompleto.parcelamentoColParcelas}>{opcao.numeroParcelas}x</Text>
                    <Text style={stylesCompleto.parcelamentoColValor}>{formatCurrency(opcao.valorParcela)}</Text>
                    <Text style={stylesCompleto.parcelamentoColJuros}>
                      {opcao.temJuros ? `+${opcao.taxaJuros}%` : 'Sem juros'}
                    </Text>
                    <Text style={stylesCompleto.parcelamentoColTotal}>{formatCurrency(opcao.valorTotal)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={stylesCompleto.precosCondicao}>{condicaoPagamentoTexto}</Text>
          )}
        </View>

        {/* Prazo de Execução */}
        <Text style={styles.sectionTitle}>Prazo de Execução</Text>
        <View style={stylesCompleto.precosBox}>
          <View style={stylesCompleto.prazoItem}>
            <Text style={stylesCompleto.prazoBullet}>•</Text>
            <Text style={stylesCompleto.prazoTexto}>
              Até {orcamento.prazoExecucaoServicos || 20} dias úteis para execução dos serviços, podendo ser intercalados;
            </Text>
          </View>
          <View style={stylesCompleto.prazoItem}>
            <Text style={stylesCompleto.prazoBullet}>•</Text>
            <Text style={stylesCompleto.prazoTexto}>
              Até {orcamento.prazoVistoriaBombeiros || 30} dias para a vistoria do Corpo de Bombeiros, depois de gerado o protocolo.
            </Text>
          </View>
        </View>

        {/* Prazo de Validade da Proposta */}
        <Text style={styles.sectionTitle}>Prazo de Validade da Proposta</Text>
        <View style={stylesCompleto.precosBox}>
          <Text style={stylesCompleto.precosTexto}>
            Esta proposta tem validade de {configuracoes?.diasValidadeOrcamento || 30} ({numeroPorExtenso(configuracoes?.diasValidadeOrcamento || 30)}) dias e o seu aceite poderá ser efetuado por e-mail ou fax.
          </Text>
        </View>

        {/* Observações adicionais */}
        {orcamento.observacoes && (
          <>
            <Text style={styles.sectionTitle}>Observações Adicionais</Text>
            <View style={styles.observacoesSection}>
              <View style={styles.observacoesBox}>
                <Text style={styles.observacoesText}>{orcamento.observacoes}</Text>
              </View>
            </View>
          </>
        )}

        {/* Termo de Responsabilidade + Assinatura (agrupados para não quebrar) */}
        <View wrap={false}>
          <View style={styles.termoSection}>
            <Text style={styles.termoTitle}>Termo de Responsabilidade</Text>
            <Text style={styles.termoText}>
              Comprometemo-nos em não divulgar quaisquer informações da edificação ou dos seus ocupantes, à exceção de decisão judicial.
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
            <Text style={styles.footerEmpresa}>{configuracoes.nomeEmpresa}</Text>
            <Text style={styles.footerCnpj}>CNPJ: {configuracoes.cnpjEmpresa}</Text>
            <Text style={styles.footerEndereco}>{configuracoes.enderecoEmpresa}</Text>
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
    logger.error('Erro ao buscar configurações para PDF', { error });
  }

  // Escolher o template correto baseado no tipo
  const PDFDocument = orcamento.tipo === 'completo'
    ? <OrcamentoCompletoPDFDocument orcamento={orcamento} configuracoes={configuracoes} />
    : <OrcamentoPDFDocument orcamento={orcamento} configuracoes={configuracoes} />;

  const blob = await pdf(PDFDocument).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `orcamento-${orcamento.numero}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
