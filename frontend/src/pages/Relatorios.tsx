import { useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import { Modal } from "../components/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useOrcamentosPorPeriodo } from "../hooks/useOrcamentos";
import { useItensServico } from "../hooks/useItensServico";
import { useConfiguracoesGerais } from "../hooks/useConfiguracoesGerais";
import {
  useHistoricoItens,
  useHistoricoConfiguracoes,
} from "../hooks/useHistoricoValores";
import { Loading, Button } from "../components/ui";
import {
  formatCurrency,
  formatOrcamentoNumeroSimples,
} from "../utils/constants";
import {
  OrcamentoStatus,
  HistoricoValorItem,
  HistoricoConfiguracao,
  ItemServico,
} from "../types";
import Footer from "@/components/layout/Footer";

const Container = styled.div`
  padding: 24px;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px 8px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    color: var(--text-primary);
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;

    h1 {
      font-size: 1.5rem;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  input {
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    color: var(--text-primary);
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;

    input {
      flex: 1;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $color?: string }>`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  border-left: 4px solid ${({ $color }) => $color || "var(--primary)"};

  .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .subvalue {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .value {
      font-size: 1.3rem;
    }
  }

  @media (max-width: 600px) {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .label {
      font-size: 0.75rem;
      margin-bottom: 0;
      margin-right: 8px;
    }

    .value {
      font-size: 1rem;
      text-align: right;
    }

    .subvalue {
      font-size: 0.75rem;
    }
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  max-width: 100%;
  box-sizing: border-box;

  h3 {
    color: var(--text-primary);
    margin-bottom: 16px;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    padding: 16px;

    h3 {
      font-size: 0.95rem;
    }
  }

  @media (max-width: 480px) {
    padding: 12px;
    border-radius: 8px;

    h3 {
      font-size: 0.9rem;
      margin-bottom: 12px;
    }
  }
`;

const FullWidthChart = styled(ChartCard)`
  grid-column: 1 / -1;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
`;

const TableCard = styled(ChartCard)`
  overflow-x: auto;
`;

const RankingTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
  }

  td {
    color: var(--text-primary);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--background);
  }

  .rank {
    font-weight: 700;
    color: var(--primary);
    width: 40px;
  }

  .value {
    text-align: right;
    font-weight: 600;
  }

  .count {
    text-align: center;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;

    th,
    td {
      padding: 10px 8px;
    }
  }
`;

const ExportButton = styled(Button)`
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NoDataMessage = styled.p`
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
`;

const LucroPositivo = styled.span`
  color: #27ae60;
  font-weight: 600;
`;

const LucroNegativo = styled.span`
  color: #e74c3c;
  font-weight: 600;
`;

const MargemBadge = styled.span<{ $positiva: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ $positiva }) => ($positiva ? "#e8f5e9" : "#ffebee")};
  color: ${({ $positiva }) => ($positiva ? "#27ae60" : "#e74c3c")};

  @media (max-width: 480px) {
    padding: 2px 6px;
    font-size: 0.7rem;
  }
`;

const LucroStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const InfoText = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 12px;
  font-style: italic;
`;

const SectionTitle = styled.h4<{ $marginTop?: boolean }>`
  margin-bottom: 12px;
  margin-top: ${({ $marginTop }) => ($marginTop ? "16px" : "0")};
  color: var(--text-secondary);
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }
`;

const LucroTableWrapper = styled.div`
  overflow-x: auto;
  margin-top: 24px;

  @media (max-width: 768px) {
    margin-top: 16px;
  }
`;

const LucroTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;

  th,
  td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    font-size: 0.85rem;
  }

  th {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.75rem;
    text-transform: uppercase;
    white-space: nowrap;
  }

  td {
    color: var(--text-primary);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--background);
  }

  .rank {
    font-weight: 700;
    color: var(--primary);
    width: 50px;
  }

  .cliente {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value {
    text-align: right;
    font-weight: 500;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    min-width: 600px;

    th,
    td {
      padding: 8px 4px;
      font-size: 0.75rem;
    }

    th {
      font-size: 0.65rem;
    }

    .cliente {
      max-width: 100px;
    }
  }
`;

// Cards para mobile - exibição em lista
const MobileCardList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
  }
`;

const MobileCard = styled.div`
  background: var(--background);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid var(--border);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);

    .numero {
      font-weight: 700;
      color: var(--primary);
      font-size: 0.9rem;
    }

    .cliente {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.85rem;
      flex: 1;
      margin: 0 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .margem {
      flex-shrink: 0;
    }
  }

  .values-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .value-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;

    .label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .value {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
    }
  }

  .lucro-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border);

    .lucro-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .lucro-value {
      font-size: 1rem;
      font-weight: 600;
    }
  }
`;

const DesktopTableWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

// Styled components para linhas clicáveis
const ClickableTableRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover td {
    background: var(--primary-light, rgba(37, 99, 235, 0.1));
  }
`;

const ClickableMobileCard = styled(MobileCard)`
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Styled components para paginação
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PaginationInfo = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);

  @media (max-width: 480px) {
    text-align: center;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const PaginationButton = styled.button<{ $disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: ${(props) => (props.$disabled ? "var(--bg-secondary)" : "var(--bg-primary)")};
  color: ${(props) => (props.$disabled ? "var(--text-disabled)" : "var(--text-primary)")};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$disabled ? "var(--bg-secondary)" : "var(--bg-hover)")};
    border-color: var(--primary);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

// Styled components para o modal de análise individual
const ModalContent = styled.div`
  padding: 8px 0;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);

  .orcamento-info {
    .numero {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
    }

    .cliente {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
  }

  .margem-geral {
    text-align: right;

    .label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
    }

    .value {
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
`;

const ModalSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ModalSectionTitle = styled.h4`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModalStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ModalStatCard = styled.div<{ $color?: string }>`
  background: var(--background);
  padding: 16px;
  border-radius: 8px;
  border-left: 3px solid ${({ $color }) => $color || "var(--primary)"};

  .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
`;

const COLORS = {
  aberto: "#3498db",
  aceito: "#27ae60",
  recusado: "#e74c3c",
  expirado: "#95a5a6",
};

const STATUS_LABELS: Record<OrcamentoStatus, string> = {
  aberto: "Abertos",
  aceito: "Aceitos",
  recusado: "Recusados",
  expirado: "Expirados",
};

// Tipo para orçamento selecionado no modal
interface OrcamentoAnalise {
  numero: number;
  clienteNome: string;
  dataAceite: string;
  dataEmissao: string;
  versao: number;
  vendaMaterial: number;
  vendaMaoDeObra: number;
  custoMaterial: number;
  custoMaoDeObra: number;
  impostoMaterial: number;
  impostoMaoDeObra: number;
  lucroMaterial: number;
  lucroMaoDeObra: number;
  lucroTotal: number;
  margem: number;
}

// Função auxiliar para obter valores vigentes de um item na data de emissão do orçamento
function obterValoresVigentes(
  descricao: string,
  dataEmissao: Date,
  historicoItens: HistoricoValorItem[],
  itensServicoAtuais: ItemServico[]
): { valorCusto: number; valorMaoDeObraCusto: number } {
  const key = descricao.toLowerCase().trim();

  // Filtrar históricos do item pela descrição e ordenar por dataVigencia (mais recente primeiro)
  const historicosItem = historicoItens
    .filter((h) => h.descricao.toLowerCase().trim() === key)
    .sort(
      (a, b) =>
        new Date(b.dataVigencia).getTime() - new Date(a.dataVigencia).getTime()
    );

  if (historicosItem.length === 0) {
    // Sem histórico: usar valores atuais do item
    const itemAtual = itensServicoAtuais.find(
      (i) => i.descricao.toLowerCase().trim() === key
    );
    if (itemAtual) {
      return {
        valorCusto: itemAtual.valorCusto || 0,
        valorMaoDeObraCusto: itemAtual.valorMaoDeObraCusto || 0,
      };
    }
    return { valorCusto: 0, valorMaoDeObraCusto: 0 };
  }

  // Encontrar o registro vigente na data de emissão
  // (maior dataVigencia que seja <= dataEmissao)
  const vigente = historicosItem.find(
    (h) => new Date(h.dataVigencia) <= dataEmissao
  );

  if (vigente) {
    return {
      valorCusto: vigente.valorCusto || 0,
      valorMaoDeObraCusto: vigente.valorMaoDeObraCusto || 0,
    };
  }

  // Se não encontrou registro vigente, significa que a data de emissão é anterior
  // a todos os registros de histórico. Neste caso, usar o registro mais ANTIGO,
  // pois representa os valores que existiam antes de qualquer alteração registrada.
  const maisAntigo = historicosItem[historicosItem.length - 1];
  return {
    valorCusto: maisAntigo.valorCusto || 0,
    valorMaoDeObraCusto: maisAntigo.valorMaoDeObraCusto || 0,
  };
}

// Função auxiliar para obter configurações vigentes na data de emissão do orçamento
function obterConfiguracoesVigentes(
  dataEmissao: Date,
  historicoConfiguracoes: HistoricoConfiguracao[],
  configuracoesAtuais:
    | {
        custoFixoMensal?: number;
        impostoMaterial?: number;
        impostoServico?: number;
      }
    | undefined
): {
  custoFixoMensal: number;
  impostoMaterial: number;
  impostoServico: number;
} {
  // Ordenar por dataVigencia decrescente (mais recente primeiro)
  const historicosOrdenados = [...historicoConfiguracoes].sort(
    (a, b) =>
      new Date(b.dataVigencia).getTime() - new Date(a.dataVigencia).getTime()
  );

  if (historicosOrdenados.length === 0) {
    // Sem histórico: usar valores atuais das configurações
    return {
      custoFixoMensal: configuracoesAtuais?.custoFixoMensal || 0,
      impostoMaterial: configuracoesAtuais?.impostoMaterial || 0,
      impostoServico: configuracoesAtuais?.impostoServico || 0,
    };
  }

  // Encontrar o registro vigente na data de emissão
  const vigente = historicosOrdenados.find(
    (h) => new Date(h.dataVigencia) <= dataEmissao
  );

  if (vigente) {
    return {
      custoFixoMensal: vigente.custoFixoMensal,
      impostoMaterial: vigente.impostoMaterial,
      impostoServico: vigente.impostoServico,
    };
  }

  // Se não encontrou registro vigente, significa que a data de emissão é anterior
  // a todos os registros de histórico. Neste caso, usar o registro mais ANTIGO,
  // pois representa os valores que existiam antes de qualquer alteração registrada.
  const maisAntigo = historicosOrdenados[historicosOrdenados.length - 1];
  return {
    custoFixoMensal: maisAntigo.custoFixoMensal,
    impostoMaterial: maisAntigo.impostoMaterial,
    impostoServico: maisAntigo.impostoServico,
  };
}

export function Relatorios() {
  // Filtros de data - padrão: mês vigente (dia 1 até hoje)
  // Definidos primeiro para que possam ser usados nos hooks
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [dataInicio, setDataInicio] = useState(
    primeiroDiaMes.toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(hoje.toISOString().split("T")[0]);

  // Buscar orçamentos filtrados por período diretamente do backend (otimizado)
  const { data: orcamentosFiltrados = [], isLoading: loadingOrcamentos } = useOrcamentosPorPeriodo(dataInicio, dataFim);
  const { data: itensServico } = useItensServico();
  const { data: configuracoesGerais } = useConfiguracoesGerais();

  // Estado para modal de análise individual
  const [modalOrcamentoOpen, setModalOrcamentoOpen] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] =
    useState<OrcamentoAnalise | null>(null);

  // Handler para abrir modal com orçamento selecionado
  const handleOrcamentoClick = useCallback((orc: OrcamentoAnalise) => {
    setOrcamentoSelecionado(orc);
    setModalOrcamentoOpen(true);
  }, []);

  // Handler para fechar modal
  const handleCloseModal = useCallback(() => {
    setModalOrcamentoOpen(false);
    setOrcamentoSelecionado(null);
  }, []);

  // Estado para paginação do detalhamento de orçamentos
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Buscar históricos de valores para o período selecionado
  const { data: historicoItens } = useHistoricoItens(dataInicio, dataFim);
  const { data: historicoConfiguracoes } = useHistoricoConfiguracoes(
    dataInicio,
    dataFim
  );

  // KPIs
  const kpis = useMemo(() => {
    const total = orcamentosFiltrados.length;
    const aceitos = orcamentosFiltrados.filter((o) => o.status === "aceito");
    const abertos = orcamentosFiltrados.filter((o) => o.status === "aberto");
    const recusados = orcamentosFiltrados.filter(
      (o) => o.status === "recusado"
    );

    const valorTotal = orcamentosFiltrados.reduce(
      (sum, o) => sum + o.valorTotal,
      0
    );
    const valorAceitos = aceitos.reduce((sum, o) => sum + o.valorTotal, 0);

    const taxaConversao = total > 0 ? (aceitos.length / total) * 100 : 0;
    const ticketMedio = aceitos.length > 0 ? valorAceitos / aceitos.length : 0;

    return {
      total,
      aceitos: aceitos.length,
      abertos: abertos.length,
      recusados: recusados.length,
      valorTotal,
      valorAceitos,
      taxaConversao,
      ticketMedio,
    };
  }, [orcamentosFiltrados]);

  // Dados para gráfico de status (Pizza)
  const statusData = useMemo(() => {
    const counts: Record<OrcamentoStatus, number> = {
      aberto: 0,
      aceito: 0,
      recusado: 0,
      expirado: 0,
    };

    orcamentosFiltrados.forEach((orc) => {
      counts[orc.status]++;
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: STATUS_LABELS[status as OrcamentoStatus],
        value,
        color: COLORS[status as OrcamentoStatus],
      }));
  }, [orcamentosFiltrados]);

  // Dados para gráfico de valor por status (Barras)
  const valorPorStatusData = useMemo(() => {
    const valores: Record<OrcamentoStatus, number> = {
      aberto: 0,
      aceito: 0,
      recusado: 0,
      expirado: 0,
    };

    orcamentosFiltrados.forEach((orc) => {
      valores[orc.status] += orc.valorTotal;
    });

    return Object.entries(valores)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: STATUS_LABELS[status as OrcamentoStatus],
        valor: value / 1000, // Em milhares
        color: COLORS[status as OrcamentoStatus],
      }));
  }, [orcamentosFiltrados]);

  // Dados para gráfico de evolução diária (Linha)
  const evolucaoDiariaData = useMemo(() => {
    const dailyData: Record<string, { total: number; aceitos: number }> = {};

    orcamentosFiltrados.forEach((orc) => {
      const data = new Date(orc.dataEmissao).toISOString().split("T")[0];
      if (!dailyData[data]) {
        dailyData[data] = { total: 0, aceitos: 0 };
      }
      dailyData[data].total += orc.valorTotal;
      if (orc.status === "aceito") {
        dailyData[data].aceitos += orc.valorTotal;
      }
    });

    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, valores]) => ({
        data: new Date(data).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        total: valores.total / 1000,
        aceitos: valores.aceitos / 1000,
      }));
  }, [orcamentosFiltrados]);

  // Ranking de clientes
  const rankingClientes = useMemo(() => {
    const clienteStats: Record<
      string,
      { nome: string; valor: number; quantidade: number }
    > = {};

    orcamentosFiltrados
      .filter((o) => o.status === "aceito")
      .forEach((orc) => {
        if (!clienteStats[orc.clienteId]) {
          clienteStats[orc.clienteId] = {
            nome: orc.clienteNome,
            valor: 0,
            quantidade: 0,
          };
        }
        clienteStats[orc.clienteId].valor += orc.valorTotal;
        clienteStats[orc.clienteId].quantidade++;
      });

    return Object.values(clienteStats)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [orcamentosFiltrados]);

  // Produtos mais vendidos
  const produtosMaisVendidos = useMemo(() => {
    const produtoStats: Record<
      string,
      { descricao: string; quantidade: number; valor: number }
    > = {};

    const orcamentosAceitos = orcamentosFiltrados.filter(
      (o) => o.status === "aceito"
    );

    orcamentosAceitos.forEach((orc) => {
      // Itens do orçamento completo
      if (orc.itensCompleto && orc.itensCompleto.length > 0) {
        orc.itensCompleto.forEach((item) => {
          const key = item.descricao.toLowerCase().trim();
          if (!produtoStats[key]) {
            produtoStats[key] = {
              descricao: item.descricao,
              quantidade: 0,
              valor: 0,
            };
          }
          produtoStats[key].quantidade += item.quantidade;
          produtoStats[key].valor += item.valorTotal;
        });
      }
    });

    return Object.values(produtoStats)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);
  }, [orcamentosFiltrados]);

  // Análise de Lucro por Orçamento - usando valores históricos quando disponíveis
  const analiseLucro = useMemo(() => {
    if (!itensServico || itensServico.length === 0) {
      return null;
    }

    // Usar configurações atuais para o cálculo dos totais (fallback quando não há histórico)
    const impostoMaterialPercentAtual =
      configuracoesGerais?.impostoMaterial || 0;
    const impostoServicoPercentAtual = configuracoesGerais?.impostoServico || 0;

    // Criar mapa de custos e valores de venda por descrição do item (normalizada) - para fallback
    const itensPorDescricao: Record<
      string,
      {
        valorUnitario: number;
        valorMaoDeObraUnitario: number;
        valorCusto: number;
        valorMaoDeObraCusto: number;
      }
    > = {};
    itensServico.forEach((item) => {
      const key = item.descricao.toLowerCase().trim();
      itensPorDescricao[key] = {
        valorUnitario: item.valorUnitario || 0,
        valorMaoDeObraUnitario: item.valorMaoDeObraUnitario || 0,
        valorCusto: item.valorCusto || 0,
        valorMaoDeObraCusto: item.valorMaoDeObraCusto || 0,
      };
    });

    const orcamentosAceitos = orcamentosFiltrados.filter(
      (o) => o.status === "aceito"
    );

    // Função para verificar se um item tem custo cadastrado (no histórico ou atual)
    const itemTemCusto = (descricao: string, dataEmissao: Date): boolean => {
      const key = descricao.toLowerCase().trim();

      // Tentar buscar no histórico primeiro
      if (historicoItens && historicoItens.length > 0) {
        const valores = obterValoresVigentes(
          descricao,
          dataEmissao,
          historicoItens,
          itensServico
        );
        if (valores.valorCusto > 0 || valores.valorMaoDeObraCusto > 0) {
          return true;
        }
        // Se obterValoresVigentes retornou zeros, ainda tenta fallback direto
      }

      // Fallback: usar valores atuais diretamente
      const itemInfo = itensPorDescricao[key];
      return !!(
        itemInfo &&
        (itemInfo.valorCusto > 0 || itemInfo.valorMaoDeObraCusto > 0)
      );
    };

    // Função para obter valores de um item - usando histórico quando disponível
    const obterValoresItemHistorico = (
      descricao: string,
      quantidade: number,
      dataEmissao: Date
    ) => {
      const key = descricao.toLowerCase().trim();

      // Tentar buscar no histórico primeiro
      if (historicoItens && historicoItens.length > 0) {
        const valores = obterValoresVigentes(
          descricao,
          dataEmissao,
          historicoItens,
          itensServico
        );
        if (valores.valorCusto > 0 || valores.valorMaoDeObraCusto > 0) {
          return {
            custoMaterial: valores.valorCusto * quantidade,
            custoMaoDeObra: valores.valorMaoDeObraCusto * quantidade,
          };
        }
        // Se obterValoresVigentes retornou zeros, tenta fallback direto
      }

      // Fallback: usar valores atuais diretamente
      const itemInfo = itensPorDescricao[key];
      if (itemInfo) {
        return {
          custoMaterial: itemInfo.valorCusto * quantidade,
          custoMaoDeObra: itemInfo.valorMaoDeObraCusto * quantidade,
        };
      }
      return { custoMaterial: 0, custoMaoDeObra: 0 };
    };

    // Filtrar apenas orçamentos onde TODOS os itens têm custo cadastrado
    const orcamentosComCustoCompleto: OrcamentoAnalise[] = [];

    let orcamentosSemCustoCompleto = 0;

    orcamentosAceitos.forEach((orc) => {
      const dataEmissaoOrc = new Date(orc.dataEmissao);

      // Obter configurações vigentes na data de emissão do orçamento
      const configVigente = obterConfiguracoesVigentes(
        dataEmissaoOrc,
        historicoConfiguracoes || [],
        configuracoesGerais
      );
      const impostoMaterialPercentOrc = configVigente.impostoMaterial;
      const impostoServicoPercentOrc = configVigente.impostoServico;

      let todosItensTemCusto = true;
      let vendaMaterial = 0;
      let vendaMaoDeObra = 0;
      let custoMaterial = 0;
      let custoMaoDeObra = 0;

      // Verificar itens do orçamento completo
      if (orc.itensCompleto && orc.itensCompleto.length > 0) {
        for (const item of orc.itensCompleto) {
          if (!itemTemCusto(item.descricao, dataEmissaoOrc)) {
            todosItensTemCusto = false;
            break;
          }
          // No orçamento completo, temos separação de material e mão de obra
          vendaMaterial += item.valorTotalMaterial;
          vendaMaoDeObra += item.valorTotalMaoDeObra;
          const custos = obterValoresItemHistorico(
            item.descricao,
            item.quantidade,
            dataEmissaoOrc
          );
          custoMaterial += custos.custoMaterial;
          custoMaoDeObra += custos.custoMaoDeObra;
        }
      }

      if (todosItensTemCusto) {
        // Calcular impostos sobre as vendas usando configuração vigente na data de emissão
        const impostoMaterial =
          vendaMaterial * (impostoMaterialPercentOrc / 100);
        const impostoServico =
          vendaMaoDeObra * (impostoServicoPercentOrc / 100);

        // Lucro = Venda - Custo - Imposto
        const lucroMaterial = vendaMaterial - custoMaterial - impostoMaterial;
        const lucroMaoDeObra = vendaMaoDeObra - custoMaoDeObra - impostoServico;
        const lucroTotal = lucroMaterial + lucroMaoDeObra;
        const valorTotalVenda = vendaMaterial + vendaMaoDeObra;
        const margem =
          valorTotalVenda > 0 ? (lucroTotal / valorTotalVenda) * 100 : 0;

        orcamentosComCustoCompleto.push({
          numero: orc.numero,
          clienteNome: orc.clienteNome,
          dataAceite: orc.dataAceite
            ? new Date(orc.dataAceite).toLocaleDateString("pt-BR")
            : new Date(orc.dataEmissao).toLocaleDateString("pt-BR"),
          dataEmissao: orc.dataEmissao as string,
          versao: orc.versao || 0,
          vendaMaterial,
          vendaMaoDeObra,
          custoMaterial,
          custoMaoDeObra,
          impostoMaterial,
          impostoMaoDeObra: impostoServico,
          lucroMaterial,
          lucroMaoDeObra,
          lucroTotal,
          margem,
        });
      } else {
        orcamentosSemCustoCompleto++;
      }
    });

    // Calcular totais
    const totalVendaMaterial = orcamentosComCustoCompleto.reduce(
      (sum, o) => sum + o.vendaMaterial,
      0
    );
    const totalVendaMaoDeObra = orcamentosComCustoCompleto.reduce(
      (sum, o) => sum + o.vendaMaoDeObra,
      0
    );
    const totalCustoMaterial = orcamentosComCustoCompleto.reduce(
      (sum, o) => sum + o.custoMaterial,
      0
    );
    const totalCustoMaoDeObra = orcamentosComCustoCompleto.reduce(
      (sum, o) => sum + o.custoMaoDeObra,
      0
    );

    // Calcular impostos totais e lucros totais (já calculados por orçamento com valores históricos)
    const totalLucroMaterial = orcamentosComCustoCompleto.reduce(
      (sum, o) => sum + o.lucroMaterial,
      0
    );
    const totalLucroMaoDeObra = orcamentosComCustoCompleto.reduce(
      (sum, o) => sum + o.lucroMaoDeObra,
      0
    );

    // Calcular impostos totais baseados nos valores agregados
    const totalImpostoMaterial =
      totalVendaMaterial - totalCustoMaterial - totalLucroMaterial;
    const totalImpostoServico =
      totalVendaMaoDeObra - totalCustoMaoDeObra - totalLucroMaoDeObra;
    const totalImpostos = totalImpostoMaterial + totalImpostoServico;

    const lucroTotal = totalLucroMaterial + totalLucroMaoDeObra;
    const valorTotalVenda = totalVendaMaterial + totalVendaMaoDeObra;
    const margemLucro =
      valorTotalVenda > 0 ? (lucroTotal / valorTotalVenda) * 100 : 0;

    // Ordenar por número do orçamento (decrescente - mais recente primeiro)
    orcamentosComCustoCompleto.sort((a, b) => b.numero - a.numero);

    return {
      totalVendaMaterial,
      totalVendaMaoDeObra,
      totalCustoMaterial,
      totalCustoMaoDeObra,
      totalImpostoMaterial,
      totalImpostoServico,
      totalImpostos,
      impostoMaterialPercent: impostoMaterialPercentAtual,
      impostoServicoPercent: impostoServicoPercentAtual,
      totalLucroMaterial,
      totalLucroMaoDeObra,
      lucroTotal,
      margemLucro,
      orcamentos: orcamentosComCustoCompleto,
      orcamentosSemCustoCompleto,
      totalOrcamentosAceitos: orcamentosAceitos.length,
    };
  }, [
    orcamentosFiltrados,
    itensServico,
    configuracoesGerais,
    historicoItens,
    historicoConfiguracoes,
  ]);

  // Cálculo do Lucro Líquido (considerando custo fixo mensal e impostos)
  const lucroLiquido = useMemo(() => {
    // Função auxiliar para obter configuração vigente em um mês específico
    // Usa a alteração mais recente DENTRO do mês, ou a configuração vigente no final do mês
    const obterConfigMes = (
      inicioMes: Date,
      fimMes: Date,
      historicosOrdenados: HistoricoConfiguracao[]
    ) => {
      // Procurar alteração dentro do mês (a mais recente)
      const alteracaoNoMes = historicosOrdenados.find(
        (h) =>
          new Date(h.dataVigencia) >= inicioMes &&
          new Date(h.dataVigencia) <= fimMes
      );

      if (alteracaoNoMes) {
        return {
          custoFixoMensal: alteracaoNoMes.custoFixoMensal,
          impostoMaterial: alteracaoNoMes.impostoMaterial,
          impostoServico: alteracaoNoMes.impostoServico,
        };
      }

      // Não houve alteração no mês, usar a configuração vigente no final do mês
      const vigente = historicosOrdenados.find(
        (h) => new Date(h.dataVigencia) <= fimMes
      );

      if (vigente) {
        return {
          custoFixoMensal: vigente.custoFixoMensal,
          impostoMaterial: vigente.impostoMaterial,
          impostoServico: vigente.impostoServico,
        };
      }

      // Se não encontrou, usar o mais antigo
      if (historicosOrdenados.length > 0) {
        const maisAntigo = historicosOrdenados[historicosOrdenados.length - 1];
        return {
          custoFixoMensal: maisAntigo.custoFixoMensal,
          impostoMaterial: maisAntigo.impostoMaterial,
          impostoServico: maisAntigo.impostoServico,
        };
      }

      return null;
    };

    // Parsear datas evitando problemas de timezone
    // dataInicio e dataFim estão no formato "YYYY-MM-DD"
    const [anoInicio, mesInicio, diaInicio] = dataInicio.split("-").map(Number);
    const [anoFim, mesFim, diaFim] = dataFim.split("-").map(Number);

    const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999);

    // Ordenar por dataVigencia decrescente
    const historicosOrdenados = [...(historicoConfiguracoes || [])].sort(
      (a, b) =>
        new Date(b.dataVigencia).getTime() - new Date(a.dataVigencia).getTime()
    );

    // Gerar lista de meses no período (cada mês conta como 1 unidade, não importa quantos dias)
    const meses: { inicio: Date; fim: Date }[] = [];
    const dataAtual = new Date(anoInicio, mesInicio - 1, diaInicio);

    while (dataAtual <= fim) {
      const inicioMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
      const fimMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
      fimMes.setHours(23, 59, 59, 999);

      meses.push({
        inicio: inicioMes,
        fim: fimMes,
      });

      // Avançar para o próximo mês
      dataAtual.setMonth(dataAtual.getMonth() + 1);
      dataAtual.setDate(1);
    }

    // Calcular custo fixo total (1 custo fixo por mês, não proporcional aos dias)
    let custoFixoTotal = 0;
    let custoFixoMensalMedio = 0;
    const detalheMeses: { mes: string; custoFixo: number }[] = [];

    for (const mes of meses) {
      let configMes;

      if (historicosOrdenados.length === 0) {
        // Sem histórico: usar valores atuais
        configMes = {
          custoFixoMensal: configuracoesGerais?.custoFixoMensal || 0,
          impostoMaterial: configuracoesGerais?.impostoMaterial || 0,
          impostoServico: configuracoesGerais?.impostoServico || 0,
        };
      } else {
        configMes = obterConfigMes(mes.inicio, mes.fim, historicosOrdenados);
      }

      if (configMes) {
        // Cada mês conta como 1 custo fixo inteiro
        custoFixoTotal += configMes.custoFixoMensal;
        custoFixoMensalMedio += configMes.custoFixoMensal;

        detalheMeses.push({
          mes: mes.inicio.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
          custoFixo: configMes.custoFixoMensal,
        });
      }
    }

    // Calcular média do custo fixo mensal para exibição
    custoFixoMensalMedio = meses.length > 0 ? custoFixoMensalMedio / meses.length : 0;

    // Número de meses no período (inteiros)
    const mesesPeriodo = meses.length;

    // Para impostos, usar a configuração mais recente do período (último mês)
    let impostoMaterialPercent = 0;
    let impostoServicoPercent = 0;

    if (historicosOrdenados.length === 0) {
      impostoMaterialPercent = configuracoesGerais?.impostoMaterial || 0;
      impostoServicoPercent = configuracoesGerais?.impostoServico || 0;
    } else {
      const configUltimoMes = meses.length > 0
        ? obterConfigMes(meses[meses.length - 1].inicio, meses[meses.length - 1].fim, historicosOrdenados)
        : null;

      if (configUltimoMes) {
        impostoMaterialPercent = configUltimoMes.impostoMaterial;
        impostoServicoPercent = configUltimoMes.impostoServico;
      }
    }

    // Exibe se houver custo fixo OU impostos configurados
    if (
      custoFixoMensalMedio === 0 &&
      impostoMaterialPercent === 0 &&
      impostoServicoPercent === 0
    ) {
      return null;
    }

    // Valor total de orçamentos aceitos no período
    const valorTotalAceitos = orcamentosFiltrados
      .filter((o) => o.status === "aceito")
      .reduce((sum, o) => sum + o.valorTotal, 0);

    // Lucro bruto (se tiver análise de lucro com custos de itens - já inclui impostos)
    const lucroBruto = analiseLucro?.lucroTotal || 0;
    const temAnaliseLucro = analiseLucro && analiseLucro.orcamentos.length > 0;

    // Impostos totais da análise de lucro (se disponível)
    const totalImpostos = analiseLucro?.totalImpostos || 0;

    // Lucro líquido = Lucro bruto (já com impostos descontados) - Custo fixo total
    // Se não tiver análise de lucro, calcula impostos sobre o total de vendas
    let lucroLiquidoValor: number;
    let impostosCalculados = 0;

    if (temAnaliseLucro) {
      // Análise de lucro já tem os impostos descontados no lucroTotal
      lucroLiquidoValor = lucroBruto - custoFixoTotal;
      impostosCalculados = totalImpostos;
    } else {
      // Sem análise de lucro, precisamos calcular impostos aproximados
      // Usamos a média dos impostos sobre o valor total
      const taxaMediaImposto =
        (impostoMaterialPercent + impostoServicoPercent) / 2;
      impostosCalculados = valorTotalAceitos * (taxaMediaImposto / 100);
      lucroLiquidoValor =
        valorTotalAceitos - impostosCalculados - custoFixoTotal;
    }

    return {
      custoFixoMensal: custoFixoMensalMedio,
      mesesPeriodo,
      custoFixoTotal,
      valorTotalAceitos,
      lucroBruto: temAnaliseLucro ? lucroBruto : null,
      lucroLiquido: lucroLiquidoValor,
      temAnaliseLucro,
      totalImpostos: impostosCalculados,
      impostoMaterialPercent,
      impostoServicoPercent,
      detalheMeses,
    };
  }, [
    orcamentosFiltrados,
    analiseLucro,
    configuracoesGerais,
    historicoConfiguracoes,
    dataInicio,
    dataFim,
  ]);

  // Exportar para CSV com dados de lucro para todos os orçamentos
  const exportarCSV = () => {
    // Criar mapa de custos por descrição do item (fallback)
    const itensPorDescricao: Record<
      string,
      { valorCusto: number; valorMaoDeObraCusto: number }
    > = {};
    itensServico?.forEach((item) => {
      const key = item.descricao.toLowerCase().trim();
      itensPorDescricao[key] = {
        valorCusto: item.valorCusto || 0,
        valorMaoDeObraCusto: item.valorMaoDeObraCusto || 0,
      };
    });

    // Função para obter valores de custo de um item
    const obterCustosItem = (descricao: string, quantidade: number, dataEmissao: Date) => {
      const key = descricao.toLowerCase().trim();

      if (historicoItens && historicoItens.length > 0) {
        const valores = obterValoresVigentes(descricao, dataEmissao, historicoItens, itensServico || []);
        if (valores.valorCusto > 0 || valores.valorMaoDeObraCusto > 0) {
          return {
            custoMaterial: valores.valorCusto * quantidade,
            custoMaoDeObra: valores.valorMaoDeObraCusto * quantidade,
          };
        }
        // Se obterValoresVigentes retornou zeros, tenta fallback direto
      }

      const itemInfo = itensPorDescricao[key];
      if (itemInfo) {
        return {
          custoMaterial: itemInfo.valorCusto * quantidade,
          custoMaoDeObra: itemInfo.valorMaoDeObraCusto * quantidade,
        };
      }
      return { custoMaterial: 0, custoMaoDeObra: 0 };
    };

    const headers = [
      "Número",
      "Cliente",
      "Status",
      "Data Emissão",
      "Data Validade",
      "Valor Total",
      "Venda Material",
      "Venda Mão de Obra",
      "Custo Material",
      "Custo Mão de Obra",
      "Custo Total",
      "Imposto Material (%)",
      "Imposto Serviço (%)",
      "Valor Impostos",
      "Lucro Bruto",
      "Margem (%)",
    ];

    const rows = orcamentosFiltrados.map((orc) => {
      const dataEmissaoOrc = new Date(orc.dataEmissao);

      // Obter configurações vigentes na data de emissão
      const configVigente = obterConfiguracoesVigentes(
        dataEmissaoOrc,
        historicoConfiguracoes || [],
        configuracoesGerais
      );
      const impostoMaterialPercent = configVigente.impostoMaterial;
      const impostoServicoPercent = configVigente.impostoServico;

      let vendaMaterial = 0;
      let vendaMaoDeObra = 0;
      let custoMaterial = 0;
      let custoMaoDeObra = 0;

      // Calcular valores dos itens do orçamento
      if (orc.itensCompleto && orc.itensCompleto.length > 0) {
        for (const item of orc.itensCompleto) {
          vendaMaterial += item.valorTotalMaterial;
          vendaMaoDeObra += item.valorTotalMaoDeObra;
          const custos = obterCustosItem(item.descricao, item.quantidade, dataEmissaoOrc);
          custoMaterial += custos.custoMaterial;
          custoMaoDeObra += custos.custoMaoDeObra;
        }
      }

      const custoTotal = custoMaterial + custoMaoDeObra;
      const impostoMaterialValor = vendaMaterial * (impostoMaterialPercent / 100);
      const impostoServicoValor = vendaMaoDeObra * (impostoServicoPercent / 100);
      const valorImpostos = impostoMaterialValor + impostoServicoValor;
      const lucroBruto = (vendaMaterial + vendaMaoDeObra) - custoTotal - valorImpostos;
      const valorTotalVenda = vendaMaterial + vendaMaoDeObra;
      const margem = valorTotalVenda > 0 ? (lucroBruto / valorTotalVenda) * 100 : 0;

      return [
        orc.numero,
        orc.clienteNome,
        STATUS_LABELS[orc.status],
        new Date(orc.dataEmissao).toLocaleDateString("pt-BR"),
        new Date(orc.dataValidade).toLocaleDateString("pt-BR"),
        orc.valorTotal.toFixed(2).replace(".", ","),
        vendaMaterial.toFixed(2).replace(".", ","),
        vendaMaoDeObra.toFixed(2).replace(".", ","),
        custoMaterial.toFixed(2).replace(".", ","),
        custoMaoDeObra.toFixed(2).replace(".", ","),
        custoTotal.toFixed(2).replace(".", ","),
        impostoMaterialPercent.toFixed(2).replace(".", ","),
        impostoServicoPercent.toFixed(2).replace(".", ","),
        valorImpostos.toFixed(2).replace(".", ","),
        lucroBruto.toFixed(2).replace(".", ","),
        margem.toFixed(2).replace(".", ","),
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_orcamentos_${dataInicio}_${dataFim}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loadingOrcamentos) {
    return (
      <Container>
        <PageHeader>
          <h1>Relatórios</h1>
        </PageHeader>
        <Loading />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <h1>Relatórios</h1>
        <FilterContainer>
          <FilterGroup>
            <label>De:</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </FilterGroup>
          <FilterGroup>
            <label>Até:</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </FilterGroup>
          <ExportButton onClick={exportarCSV} $variant="ghost">
            Exportar CSV
          </ExportButton>
        </FilterContainer>
      </PageHeader>

      {/* KPIs */}
      <StatsGrid>
        <StatCard $color="var(--primary)">
          <div className="label">Total de Orçamentos</div>
          <div className="value">{kpis.total}</div>
          <div className="subvalue">{formatCurrency(kpis.valorTotal)}</div>
        </StatCard>
        <StatCard $color="#27ae60">
          <div className="label">Aceitos</div>
          <div className="value">{kpis.aceitos}</div>
          <div className="subvalue">{formatCurrency(kpis.valorAceitos)}</div>
        </StatCard>
        <StatCard $color="#3498db">
          <div className="label">Em Aberto</div>
          <div className="value">{kpis.abertos}</div>
        </StatCard>
        <StatCard $color="#9b59b6">
          <div className="label">Taxa de Conversão</div>
          <div className="value">{kpis.taxaConversao.toFixed(1)}%</div>
        </StatCard>
        <StatCard $color="#f39c12">
          <div className="label">Ticket Médio</div>
          <div className="value">{formatCurrency(kpis.ticketMedio)}</div>
        </StatCard>
      </StatsGrid>

      {/* Gráficos */}
      <ChartsRow>
        <ChartCard>
          <h3>Orçamentos por Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage>Nenhum orçamento no período</NoDataMessage>
          )}
        </ChartCard>

        <ChartCard>
          <h3>Valor por Status (em milhares R$)</h3>
          {valorPorStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={valorPorStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value * 1000)}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="valor"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                >
                  {valorPorStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage>Nenhum orçamento no período</NoDataMessage>
          )}
        </ChartCard>
      </ChartsRow>

      {/* Evolução diária */}
      <ChartsRow>
        <FullWidthChart>
          <h3>Evolução de Valores no Período (em milhares R$)</h3>
          {evolucaoDiariaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoDiariaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="data"
                  tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value * 1000)}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Emitido"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: "var(--primary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="aceitos"
                  name="Aceitos"
                  stroke="#27ae60"
                  strokeWidth={2}
                  dot={{ fill: "#27ae60" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage>Nenhum orçamento no período</NoDataMessage>
          )}
        </FullWidthChart>
      </ChartsRow>

      {/* Lucro Líquido (com custo fixo da empresa e impostos) */}
      {lucroLiquido && (
        <ChartsRow>
          <FullWidthChart>
            <h3>Lucro Líquido da Empresa</h3>
            <InfoText style={{ marginTop: 0, marginBottom: 16 }}>
              Período de {lucroLiquido.mesesPeriodo} {lucroLiquido.mesesPeriodo === 1 ? "mês" : "meses"}
            </InfoText>

            <div
              style={{
                background: "var(--background-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16,
                marginBottom: 20,
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ display: "block", marginBottom: 8 }}>
                Como o cálculo é feito:
              </strong>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  <strong>Período:</strong> O custo fixo é contabilizado por mês
                  inteiro. Qualquer período dentro de um mês conta como 1 mês
                  completo ({lucroLiquido.mesesPeriodo} {lucroLiquido.mesesPeriodo === 1 ? "mês" : "meses"})
                </li>
                {lucroLiquido.custoFixoMensal > 0 && (
                  <li>
                    <strong>Custo Fixo:</strong> Soma do custo fixo de cada mês
                    no período (valor pode variar entre meses se houve alteração)
                  </li>
                )}
                {lucroLiquido.totalImpostos > 0 && (
                  <li>
                    <strong>Impostos:</strong> Calculados sobre as vendas de
                    material e serviço
                  </li>
                )}
                {lucroLiquido.temAnaliseLucro ? (
                  <li>
                    <strong>Lucro Líquido:</strong> O lucro bruto (vendas -
                    custos - impostos) menos o custo fixo do período
                  </li>
                ) : (
                  <li>
                    <strong>Lucro Líquido:</strong> A receita total menos
                    impostos e custo fixo (
                    {formatCurrency(lucroLiquido.valorTotalAceitos)}
                    {lucroLiquido.totalImpostos > 0 &&
                      ` - ${formatCurrency(lucroLiquido.totalImpostos)}`}
                    {lucroLiquido.custoFixoTotal > 0 &&
                      ` - ${formatCurrency(
                        lucroLiquido.custoFixoTotal
                      )}`}
                    {" = "}
                    {formatCurrency(lucroLiquido.lucroLiquido)})
                  </li>
                )}
              </ol>
            </div>

            <LucroStatsGrid>
              <StatCard $color="#27ae60">
                <div className="label">Receita (Aceitos)</div>
                <div className="value">
                  {formatCurrency(lucroLiquido.valorTotalAceitos)}
                </div>
              </StatCard>

              {lucroLiquido.lucroBruto !== null && (
                <StatCard $color="#3498db">
                  <div className="label">Lucro Bruto</div>
                  <div className="value">
                    {lucroLiquido.lucroBruto >= 0 ? (
                      <LucroPositivo>
                        {formatCurrency(lucroLiquido.lucroBruto)}
                      </LucroPositivo>
                    ) : (
                      <LucroNegativo>
                        {formatCurrency(lucroLiquido.lucroBruto)}
                      </LucroNegativo>
                    )}
                  </div>
                  <div className="subvalue">Vendas - Custos - Impostos</div>
                </StatCard>
              )}

              {lucroLiquido.totalImpostos > 0 &&
                !lucroLiquido.temAnaliseLucro && (
                  <StatCard $color="#f39c12">
                    <div className="label">Impostos</div>
                    <div className="value">
                      {formatCurrency(lucroLiquido.totalImpostos)}
                    </div>
                    <div className="subvalue">
                      Média dos impostos configurados
                    </div>
                  </StatCard>
                )}

              {lucroLiquido.custoFixoTotal > 0 && (
                <StatCard $color="#e74c3c">
                  <div className="label">Custo Fixo (Período)</div>
                  <div className="value">
                    {formatCurrency(lucroLiquido.custoFixoTotal)}
                  </div>
                  <div className="subvalue">
                    {lucroLiquido.detalheMeses.length === 1 ? (
                      // Apenas 1 mês: exibir simples
                      <>
                        {lucroLiquido.mesesPeriodo} mês ×{" "}
                        {formatCurrency(lucroLiquido.custoFixoMensal)}
                      </>
                    ) : (
                      // Múltiplos meses: verificar se custos são diferentes
                      (() => {
                        const custosUnicos = [...new Set(lucroLiquido.detalheMeses.map(m => m.custoFixo))];
                        if (custosUnicos.length === 1) {
                          // Todos os meses têm o mesmo custo
                          return (
                            <>
                              {lucroLiquido.mesesPeriodo} meses ×{" "}
                              {formatCurrency(lucroLiquido.custoFixoMensal)}
                            </>
                          );
                        } else {
                          // Meses com custos diferentes: mostrar detalhamento
                          return (
                            <span title={lucroLiquido.detalheMeses.map(m =>
                              `${m.mes}: ${formatCurrency(m.custoFixo)}`
                            ).join('\n')}>
                              {lucroLiquido.detalheMeses.map((m, i) => (
                                <span key={i}>
                                  {i > 0 && " + "}
                                  {formatCurrency(m.custoFixo)}
                                </span>
                              ))}
                              {" (ver detalhes)"}
                            </span>
                          );
                        }
                      })()
                    )}
                  </div>
                </StatCard>
              )}

              <StatCard
                $color={lucroLiquido.lucroLiquido >= 0 ? "#27ae60" : "#e74c3c"}
              >
                <div className="label">Lucro Líquido</div>
                <div className="value">
                  {lucroLiquido.lucroLiquido >= 0 ? (
                    <LucroPositivo>
                      {formatCurrency(lucroLiquido.lucroLiquido)}
                    </LucroPositivo>
                  ) : (
                    <LucroNegativo>
                      {formatCurrency(lucroLiquido.lucroLiquido)}
                    </LucroNegativo>
                  )}
                </div>
                <div className="subvalue">
                  {lucroLiquido.temAnaliseLucro
                    ? `Lucro bruto${
                        lucroLiquido.custoFixoTotal > 0
                          ? " - Custo fixo"
                          : ""
                      }`
                    : `Receita${
                        lucroLiquido.totalImpostos > 0 ? " - Impostos" : ""
                      }${
                        lucroLiquido.custoFixoTotal > 0
                          ? " - Custo fixo"
                          : ""
                      }`}
                </div>
              </StatCard>
            </LucroStatsGrid>

            {!lucroLiquido.temAnaliseLucro && (
              <InfoText>
                * Para um cálculo mais preciso dos impostos por categoria,
                cadastre os custos dos itens de serviço.
              </InfoText>
            )}
          </FullWidthChart>
        </ChartsRow>
      )}

      {/* Análise de Lucro por Orçamento */}
      {analiseLucro && (
        <ChartsRow>
          <FullWidthChart>
            <h3>
              Análise de Lucro ({analiseLucro.orcamentos.length}/
              {analiseLucro.totalOrcamentosAceitos} aceitos)
            </h3>

            {/* Cards de resumo - Material */}
            <SectionTitle>Material </SectionTitle>
            <LucroStatsGrid>
              <StatCard $color="#3498db">
                <div className="label">Venda</div>
                <div className="value">
                  {formatCurrency(analiseLucro.totalVendaMaterial)}
                </div>
              </StatCard>
              <StatCard $color="#e74c3c">
                <div className="label">Custo</div>
                <div className="value">
                  {formatCurrency(analiseLucro.totalCustoMaterial)}
                </div>
              </StatCard>
              {analiseLucro.impostoMaterialPercent > 0 && (
                <StatCard $color="#f39c12">
                  <div className="label">Imposto</div>
                  <div className="value">
                    {formatCurrency(analiseLucro.totalImpostoMaterial)}
                  </div>
                  <div className="subvalue">Sobre venda</div>
                </StatCard>
              )}
              <StatCard
                $color={
                  analiseLucro.totalLucroMaterial >= 0 ? "#27ae60" : "#e74c3c"
                }
              >
                <div className="label">Lucro</div>
                <div className="value">
                  {analiseLucro.totalLucroMaterial >= 0 ? (
                    <LucroPositivo>
                      {formatCurrency(analiseLucro.totalLucroMaterial)}
                    </LucroPositivo>
                  ) : (
                    <LucroNegativo>
                      {formatCurrency(analiseLucro.totalLucroMaterial)}
                    </LucroNegativo>
                  )}
                </div>
                <div className="subvalue">
                  Venda - Custo
                  {analiseLucro.impostoMaterialPercent > 0 && " - Imposto"}
                </div>
              </StatCard>
              <StatCard $color="#9b59b6">
                <div className="label">Margem</div>
                <div className="value">
                  <MargemBadge
                    $positiva={
                      analiseLucro.totalVendaMaterial > 0 &&
                      analiseLucro.totalLucroMaterial >= 0
                    }
                  >
                    {analiseLucro.totalVendaMaterial > 0
                      ? (
                          (analiseLucro.totalLucroMaterial /
                            analiseLucro.totalVendaMaterial) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </MargemBadge>
                </div>
              </StatCard>
            </LucroStatsGrid>

            {/* Cards de resumo - Mão de Obra */}
            <SectionTitle $marginTop>Mão de Obra </SectionTitle>
            <LucroStatsGrid>
              <StatCard $color="#3498db">
                <div className="label">Venda</div>
                <div className="value">
                  {formatCurrency(analiseLucro.totalVendaMaoDeObra)}
                </div>
              </StatCard>
              <StatCard $color="#e74c3c">
                <div className="label">Custo</div>
                <div className="value">
                  {formatCurrency(analiseLucro.totalCustoMaoDeObra)}
                </div>
              </StatCard>
              {analiseLucro.impostoServicoPercent > 0 && (
                <StatCard $color="#f39c12">
                  <div className="label">Imposto</div>
                  <div className="value">
                    {formatCurrency(analiseLucro.totalImpostoServico)}
                  </div>
                  <div className="subvalue">Sobre venda</div>
                </StatCard>
              )}
              <StatCard
                $color={
                  analiseLucro.totalLucroMaoDeObra >= 0 ? "#27ae60" : "#e74c3c"
                }
              >
                <div className="label">Lucro</div>
                <div className="value">
                  {analiseLucro.totalLucroMaoDeObra >= 0 ? (
                    <LucroPositivo>
                      {formatCurrency(analiseLucro.totalLucroMaoDeObra)}
                    </LucroPositivo>
                  ) : (
                    <LucroNegativo>
                      {formatCurrency(analiseLucro.totalLucroMaoDeObra)}
                    </LucroNegativo>
                  )}
                </div>
                <div className="subvalue">
                  Venda - Custo
                  {analiseLucro.impostoServicoPercent > 0 && " - Imposto"}
                </div>
              </StatCard>
              <StatCard $color="#9b59b6">
                <div className="label">Margem</div>
                <div className="value">
                  <MargemBadge
                    $positiva={
                      analiseLucro.totalVendaMaoDeObra > 0 &&
                      analiseLucro.totalLucroMaoDeObra >= 0
                    }
                  >
                    {analiseLucro.totalVendaMaoDeObra > 0
                      ? (
                          (analiseLucro.totalLucroMaoDeObra /
                            analiseLucro.totalVendaMaoDeObra) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </MargemBadge>
                </div>
              </StatCard>
            </LucroStatsGrid>

            {/* Cards de resumo - Total */}
            <SectionTitle $marginTop>Total Geral</SectionTitle>
            <LucroStatsGrid>
              <StatCard $color="#27ae60">
                <div className="label">Venda</div>
                <div className="value">
                  {formatCurrency(
                    analiseLucro.totalVendaMaterial +
                      analiseLucro.totalVendaMaoDeObra
                  )}
                </div>
              </StatCard>
              <StatCard $color="#e74c3c">
                <div className="label">Custo</div>
                <div className="value">
                  {formatCurrency(
                    analiseLucro.totalCustoMaterial +
                      analiseLucro.totalCustoMaoDeObra
                  )}
                </div>
              </StatCard>
              {analiseLucro.totalImpostos > 0 && (
                <StatCard $color="#f39c12">
                  <div className="label">Impostos</div>
                  <div className="value">
                    {formatCurrency(analiseLucro.totalImpostos)}
                  </div>
                  <div className="subvalue">Material + Serviço</div>
                </StatCard>
              )}
              <StatCard
                $color={analiseLucro.lucroTotal >= 0 ? "#27ae60" : "#e74c3c"}
              >
                <div className="label">Lucro</div>
                <div className="value">
                  {analiseLucro.lucroTotal >= 0 ? (
                    <LucroPositivo>
                      {formatCurrency(analiseLucro.lucroTotal)}
                    </LucroPositivo>
                  ) : (
                    <LucroNegativo>
                      {formatCurrency(analiseLucro.lucroTotal)}
                    </LucroNegativo>
                  )}
                </div>
                <div className="subvalue">
                  Venda - Custo{analiseLucro.totalImpostos > 0 && " - Impostos"}
                </div>
              </StatCard>
              <StatCard $color="#9b59b6">
                <div className="label">Margem</div>
                <div className="value">
                  <MargemBadge $positiva={analiseLucro.margemLucro >= 0}>
                    {analiseLucro.margemLucro.toFixed(1)}%
                  </MargemBadge>
                </div>
              </StatCard>
            </LucroStatsGrid>

            {/* Detalhamento por Orçamento */}
            <SectionTitle
              $marginTop
              style={{ marginTop: "24px", color: "var(--text-primary)" }}
            >
              Detalhamento por Orçamento
            </SectionTitle>

            {analiseLucro.orcamentos.length > 0 ? (
              (() => {
                const totalOrcamentos = analiseLucro.orcamentos.length;
                const totalPaginas = Math.ceil(totalOrcamentos / itensPorPagina);
                const indiceInicio = (paginaAtual - 1) * itensPorPagina;
                const indiceFim = Math.min(indiceInicio + itensPorPagina, totalOrcamentos);
                const orcamentosPaginados = analiseLucro.orcamentos.slice(indiceInicio, indiceFim);

                return (
                  <>
                    {/* Tabela Desktop */}
                    <DesktopTableWrapper>
                      <LucroTableWrapper>
                        <LucroTable>
                          <thead>
                            <tr>
                              <th>Nº</th>
                              <th>Cliente</th>
                              <th className="value">Venda Mat.</th>
                              <th className="value">Custo Mat.</th>
                              <th className="value">Venda M.O.</th>
                              <th className="value">Custo M.O.</th>
                              <th className="value">Lucro</th>
                              <th className="value">Margem</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orcamentosPaginados.map((orc, index) => (
                              <ClickableTableRow
                                key={index}
                                onClick={() => handleOrcamentoClick(orc)}
                                title="Clique para ver detalhes"
                              >
                                <td className="rank">
                                  {formatOrcamentoNumeroSimples(
                                    orc.numero,
                                    orc.dataEmissao
                                  )}
                                </td>
                                <td className="cliente">{orc.clienteNome}</td>
                                <td className="value">
                                  {formatCurrency(orc.vendaMaterial)}
                                </td>
                                <td className="value">
                                  {formatCurrency(orc.custoMaterial)}
                                </td>
                                <td className="value">
                                  {formatCurrency(orc.vendaMaoDeObra)}
                                </td>
                                <td className="value">
                                  {formatCurrency(orc.custoMaoDeObra)}
                                </td>
                                <td className="value">
                                  {orc.lucroTotal >= 0 ? (
                                    <LucroPositivo>
                                      {formatCurrency(orc.lucroTotal)}
                                    </LucroPositivo>
                                  ) : (
                                    <LucroNegativo>
                                      {formatCurrency(orc.lucroTotal)}
                                    </LucroNegativo>
                                  )}
                                </td>
                                <td className="value">
                                  <MargemBadge $positiva={orc.margem >= 0}>
                                    {orc.margem.toFixed(1)}%
                                  </MargemBadge>
                                </td>
                              </ClickableTableRow>
                            ))}
                          </tbody>
                        </LucroTable>
                      </LucroTableWrapper>
                    </DesktopTableWrapper>

                    {/* Cards Mobile */}
                    <MobileCardList>
                      {orcamentosPaginados.map((orc, index) => (
                        <ClickableMobileCard
                          key={index}
                          onClick={() => handleOrcamentoClick(orc)}
                        >
                          <div className="header">
                            <span className="numero">
                              {formatOrcamentoNumeroSimples(
                                orc.numero,
                                orc.dataEmissao
                              )}
                            </span>
                            <span className="cliente">{orc.clienteNome}</span>
                            <span className="margem">
                              <MargemBadge $positiva={orc.margem >= 0}>
                                {orc.margem.toFixed(1)}%
                              </MargemBadge>
                            </span>
                          </div>
                          <div className="values-list">
                            <div className="value-row">
                              <span className="label">Venda Material</span>
                              <span className="value">
                                {formatCurrency(orc.vendaMaterial)}
                              </span>
                            </div>
                            <div className="value-row">
                              <span className="label">Custo Material</span>
                              <span className="value">
                                {formatCurrency(orc.custoMaterial)}
                              </span>
                            </div>
                            <div className="value-row">
                              <span className="label">Venda M.O.</span>
                              <span className="value">
                                {formatCurrency(orc.vendaMaoDeObra)}
                              </span>
                            </div>
                            <div className="value-row">
                              <span className="label">Custo M.O.</span>
                              <span className="value">
                                {formatCurrency(orc.custoMaoDeObra)}
                              </span>
                            </div>
                          </div>
                          <div className="lucro-row">
                            <span className="lucro-label">Lucro Total</span>
                            <span className="lucro-value">
                              {orc.lucroTotal >= 0 ? (
                                <LucroPositivo>
                                  {formatCurrency(orc.lucroTotal)}
                                </LucroPositivo>
                              ) : (
                                <LucroNegativo>
                                  {formatCurrency(orc.lucroTotal)}
                                </LucroNegativo>
                              )}
                            </span>
                          </div>
                        </ClickableMobileCard>
                      ))}
                    </MobileCardList>

                    {/* Paginação */}
                    {totalPaginas > 1 && (
                      <PaginationContainer>
                        <PaginationInfo>
                          Mostrando {indiceInicio + 1} - {indiceFim} de {totalOrcamentos} orçamentos
                        </PaginationInfo>
                        <PaginationButtons>
                          <PaginationButton
                            $disabled={paginaAtual === 1}
                            disabled={paginaAtual === 1}
                            onClick={() => setPaginaAtual(paginaAtual - 1)}
                          >
                            Anterior
                          </PaginationButton>
                          <PaginationButton
                            $disabled={paginaAtual === totalPaginas}
                            disabled={paginaAtual === totalPaginas}
                            onClick={() => setPaginaAtual(paginaAtual + 1)}
                          >
                            Próximo
                          </PaginationButton>
                        </PaginationButtons>
                      </PaginationContainer>
                    )}
                  </>
                );
              })()
            ) : (
              <NoDataMessage>
                Nenhum orçamento aceito com todos os itens com custo cadastrado
              </NoDataMessage>
            )}

            {analiseLucro.orcamentosSemCustoCompleto > 0 && (
              <InfoText>
                * {analiseLucro.orcamentosSemCustoCompleto} orçamento(s) não
                incluídos (itens sem custo).
              </InfoText>
            )}
          </FullWidthChart>
        </ChartsRow>
      )}

      {/* Rankings */}
      <ChartsRow>
        <TableCard>
          <h3>Top 10 Clientes (por valor aceito)</h3>
          {rankingClientes.length > 0 ? (
            <RankingTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th className="count">Qtd</th>
                  <th className="value">Valor</th>
                </tr>
              </thead>
              <tbody>
                {rankingClientes.map((cliente, index) => (
                  <tr key={index}>
                    <td className="rank">{index + 1}</td>
                    <td>{cliente.nome}</td>
                    <td className="count">{cliente.quantidade}</td>
                    <td className="value">{formatCurrency(cliente.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </RankingTable>
          ) : (
            <NoDataMessage>Nenhum orçamento aceito no período</NoDataMessage>
          )}
        </TableCard>

        <TableCard>
          <h3>Top 10 Produtos/Serviços (por valor)</h3>
          {produtosMaisVendidos.length > 0 ? (
            <RankingTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Descrição</th>
                  <th className="count">Qtd</th>
                  <th className="value">Valor</th>
                </tr>
              </thead>
              <tbody>
                {produtosMaisVendidos.map((produto, index) => (
                  <tr key={index}>
                    <td className="rank">{index + 1}</td>
                    <td>{produto.descricao}</td>
                    <td className="count">{produto.quantidade}</td>
                    <td className="value">{formatCurrency(produto.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </RankingTable>
          ) : (
            <NoDataMessage>Nenhum orçamento aceito no período</NoDataMessage>
          )}
        </TableCard>
      </ChartsRow>

      {/* Modal de Análise Individual do Orçamento */}
      <Modal
        isOpen={modalOrcamentoOpen}
        onClose={handleCloseModal}
        title={`Análise de Lucro - Orçamento ${
          orcamentoSelecionado
            ? formatOrcamentoNumeroSimples(
                orcamentoSelecionado.numero,
                orcamentoSelecionado.dataEmissao
              )
            : ""
        }`}
        size="large"
      >
        {orcamentoSelecionado && (
          <ModalContent>
            <ModalHeader>
              <div className="orcamento-info">
                <div className="numero">
                  Orçamento{" "}
                  {formatOrcamentoNumeroSimples(
                    orcamentoSelecionado.numero,
                    orcamentoSelecionado.dataEmissao
                  )}
                </div>
                <div className="cliente">
                  {orcamentoSelecionado.clienteNome}
                </div>
              </div>
              <div className="margem-geral">
                <div className="label">Margem Geral</div>
                <div className="value">
                  <MargemBadge $positiva={orcamentoSelecionado.margem >= 0}>
                    {orcamentoSelecionado.margem.toFixed(1)}%
                  </MargemBadge>
                </div>
              </div>
            </ModalHeader>

            {/* Seção Material */}
            <ModalSection>
              <ModalSectionTitle>Material</ModalSectionTitle>
              <ModalStatsGrid>
                <ModalStatCard $color="#3498db">
                  <div className="label">Venda</div>
                  <div className="value">
                    {formatCurrency(orcamentoSelecionado.vendaMaterial)}
                  </div>
                </ModalStatCard>
                <ModalStatCard $color="#e74c3c">
                  <div className="label">Custo</div>
                  <div className="value">
                    {formatCurrency(orcamentoSelecionado.custoMaterial)}
                  </div>
                </ModalStatCard>
                {orcamentoSelecionado.impostoMaterial > 0 && (
                  <ModalStatCard $color="#f39c12">
                    <div className="label">Imposto</div>
                    <div className="value">
                      {formatCurrency(orcamentoSelecionado.impostoMaterial)}
                    </div>
                  </ModalStatCard>
                )}
                <ModalStatCard
                  $color={
                    orcamentoSelecionado.lucroMaterial >= 0
                      ? "#27ae60"
                      : "#e74c3c"
                  }
                >
                  <div className="label">Lucro</div>
                  <div className="value">
                    {orcamentoSelecionado.lucroMaterial >= 0 ? (
                      <LucroPositivo>
                        {formatCurrency(orcamentoSelecionado.lucroMaterial)}
                      </LucroPositivo>
                    ) : (
                      <LucroNegativo>
                        {formatCurrency(orcamentoSelecionado.lucroMaterial)}
                      </LucroNegativo>
                    )}
                  </div>
                </ModalStatCard>
                <ModalStatCard $color="#9b59b6">
                  <div className="label">Margem</div>
                  <div className="value">
                    <MargemBadge
                      $positiva={
                        orcamentoSelecionado.vendaMaterial > 0 &&
                        orcamentoSelecionado.lucroMaterial >= 0
                      }
                    >
                      {orcamentoSelecionado.vendaMaterial > 0
                        ? (
                            (orcamentoSelecionado.lucroMaterial /
                              orcamentoSelecionado.vendaMaterial) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </MargemBadge>
                  </div>
                </ModalStatCard>
              </ModalStatsGrid>
            </ModalSection>

            {/* Seção Mão de Obra */}
            <ModalSection>
              <ModalSectionTitle>Mão de Obra</ModalSectionTitle>
              <ModalStatsGrid>
                <ModalStatCard $color="#3498db">
                  <div className="label">Venda</div>
                  <div className="value">
                    {formatCurrency(orcamentoSelecionado.vendaMaoDeObra)}
                  </div>
                </ModalStatCard>
                <ModalStatCard $color="#e74c3c">
                  <div className="label">Custo</div>
                  <div className="value">
                    {formatCurrency(orcamentoSelecionado.custoMaoDeObra)}
                  </div>
                </ModalStatCard>
                {orcamentoSelecionado.impostoMaoDeObra > 0 && (
                  <ModalStatCard $color="#f39c12">
                    <div className="label">Imposto</div>
                    <div className="value">
                      {formatCurrency(orcamentoSelecionado.impostoMaoDeObra)}
                    </div>
                  </ModalStatCard>
                )}
                <ModalStatCard
                  $color={
                    orcamentoSelecionado.lucroMaoDeObra >= 0
                      ? "#27ae60"
                      : "#e74c3c"
                  }
                >
                  <div className="label">Lucro</div>
                  <div className="value">
                    {orcamentoSelecionado.lucroMaoDeObra >= 0 ? (
                      <LucroPositivo>
                        {formatCurrency(orcamentoSelecionado.lucroMaoDeObra)}
                      </LucroPositivo>
                    ) : (
                      <LucroNegativo>
                        {formatCurrency(orcamentoSelecionado.lucroMaoDeObra)}
                      </LucroNegativo>
                    )}
                  </div>
                </ModalStatCard>
                <ModalStatCard $color="#9b59b6">
                  <div className="label">Margem</div>
                  <div className="value">
                    <MargemBadge
                      $positiva={
                        orcamentoSelecionado.vendaMaoDeObra > 0 &&
                        orcamentoSelecionado.lucroMaoDeObra >= 0
                      }
                    >
                      {orcamentoSelecionado.vendaMaoDeObra > 0
                        ? (
                            (orcamentoSelecionado.lucroMaoDeObra /
                              orcamentoSelecionado.vendaMaoDeObra) *
                            100
                          ).toFixed(1)
                        : "0.0"}
                      %
                    </MargemBadge>
                  </div>
                </ModalStatCard>
              </ModalStatsGrid>
            </ModalSection>

            {/* Seção Total Geral */}
            <ModalSection>
              <ModalSectionTitle>Total Geral</ModalSectionTitle>
              <ModalStatsGrid>
                <ModalStatCard $color="#27ae60">
                  <div className="label">Venda</div>
                  <div className="value">
                    {formatCurrency(
                      orcamentoSelecionado.vendaMaterial +
                        orcamentoSelecionado.vendaMaoDeObra
                    )}
                  </div>
                </ModalStatCard>
                <ModalStatCard $color="#e74c3c">
                  <div className="label">Custo</div>
                  <div className="value">
                    {formatCurrency(
                      orcamentoSelecionado.custoMaterial +
                        orcamentoSelecionado.custoMaoDeObra
                    )}
                  </div>
                </ModalStatCard>
                {(orcamentoSelecionado.impostoMaterial > 0 ||
                  orcamentoSelecionado.impostoMaoDeObra > 0) && (
                  <ModalStatCard $color="#f39c12">
                    <div className="label">Impostos</div>
                    <div className="value">
                      {formatCurrency(
                        orcamentoSelecionado.impostoMaterial +
                          orcamentoSelecionado.impostoMaoDeObra
                      )}
                    </div>
                  </ModalStatCard>
                )}
                <ModalStatCard
                  $color={
                    orcamentoSelecionado.lucroTotal >= 0 ? "#27ae60" : "#e74c3c"
                  }
                >
                  <div className="label">Lucro</div>
                  <div className="value">
                    {orcamentoSelecionado.lucroTotal >= 0 ? (
                      <LucroPositivo>
                        {formatCurrency(orcamentoSelecionado.lucroTotal)}
                      </LucroPositivo>
                    ) : (
                      <LucroNegativo>
                        {formatCurrency(orcamentoSelecionado.lucroTotal)}
                      </LucroNegativo>
                    )}
                  </div>
                </ModalStatCard>
                <ModalStatCard $color="#9b59b6">
                  <div className="label">Margem</div>
                  <div className="value">
                    <MargemBadge $positiva={orcamentoSelecionado.margem >= 0}>
                      {orcamentoSelecionado.margem.toFixed(1)}%
                    </MargemBadge>
                  </div>
                </ModalStatCard>
              </ModalStatsGrid>
            </ModalSection>
          </ModalContent>
        )}
      </Modal>

      {/* Footer */}
      <Footer />
    </Container>
  );
}
