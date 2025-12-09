import { useMemo, useState } from 'react';
import styled from 'styled-components';
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
} from 'recharts';
import { useOrcamentos } from '../hooks/useOrcamentos';
import { Loading, Button } from '../components/ui';
import { formatCurrency } from '../utils/constants';
import { OrcamentoStatus } from '../types';

const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
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
  border-left: 4px solid ${({ $color }) => $color || 'var(--primary)'};

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
`;

const FullWidthChart = styled(ChartCard)`
  grid-column: 1 / -1;
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

const COLORS = {
  aberto: '#3498db',
  aceito: '#27ae60',
  recusado: '#e74c3c',
  expirado: '#95a5a6',
};

const STATUS_LABELS: Record<OrcamentoStatus, string> = {
  aberto: 'Abertos',
  aceito: 'Aceitos',
  recusado: 'Recusados',
  expirado: 'Expirados',
};

export function Relatorios() {
  const { data: orcamentos, isLoading: loadingOrcamentos } = useOrcamentos();

  // Filtros de data
  const hoje = new Date();
  const primeiroDiaAnoAnterior = new Date(hoje.getFullYear() - 1, 0, 1); // Início do ano anterior

  const [dataInicio, setDataInicio] = useState(
    primeiroDiaAnoAnterior.toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState(
    hoje.toISOString().split('T')[0]
  );

  // Filtrar orçamentos por período
  const orcamentosFiltrados = useMemo(() => {
    if (!orcamentos) return [];

    // Usar UTC para evitar problemas de timezone
    const [anoInicio, mesInicio, diaInicio] = dataInicio.split('-').map(Number);
    const [anoFim, mesFim, diaFim] = dataFim.split('-').map(Number);

    const inicio = new Date(Date.UTC(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0));
    const fim = new Date(Date.UTC(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999));

    return orcamentos.filter((orc) => {
      const dataEmissao = new Date(orc.dataEmissao);
      return dataEmissao >= inicio && dataEmissao <= fim;
    });
  }, [orcamentos, dataInicio, dataFim]);

  // KPIs
  const kpis = useMemo(() => {
    const total = orcamentosFiltrados.length;
    const aceitos = orcamentosFiltrados.filter((o) => o.status === 'aceito');
    const abertos = orcamentosFiltrados.filter((o) => o.status === 'aberto');
    const recusados = orcamentosFiltrados.filter((o) => o.status === 'recusado');

    const valorTotal = orcamentosFiltrados.reduce((sum, o) => sum + o.valorTotal, 0);
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
      const data = new Date(orc.dataEmissao).toISOString().split('T')[0];
      if (!dailyData[data]) {
        dailyData[data] = { total: 0, aceitos: 0 };
      }
      dailyData[data].total += orc.valorTotal;
      if (orc.status === 'aceito') {
        dailyData[data].aceitos += orc.valorTotal;
      }
    });

    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, valores]) => ({
        data: new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        total: valores.total / 1000,
        aceitos: valores.aceitos / 1000,
      }));
  }, [orcamentosFiltrados]);

  // Ranking de clientes
  const rankingClientes = useMemo(() => {
    const clienteStats: Record<string, { nome: string; valor: number; quantidade: number }> = {};

    orcamentosFiltrados
      .filter((o) => o.status === 'aceito')
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
    const produtoStats: Record<string, { descricao: string; quantidade: number; valor: number }> = {};

    const orcamentosAceitos = orcamentosFiltrados.filter((o) => o.status === 'aceito');

    orcamentosAceitos.forEach((orc) => {
      // Itens do orçamento simples
      if (orc.itens && orc.itens.length > 0) {
        orc.itens.forEach((item) => {
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

  // Exportar para CSV
  const exportarCSV = () => {
    const headers = ['Número', 'Cliente', 'Status', 'Data Emissão', 'Data Validade', 'Valor Total'];
    const rows = orcamentosFiltrados.map((orc) => [
      orc.numero,
      orc.clienteNome,
      STATUS_LABELS[orc.status],
      new Date(orc.dataEmissao).toLocaleDateString('pt-BR'),
      new Date(orc.dataValidade).toLocaleDateString('pt-BR'),
      orc.valorTotal.toFixed(2).replace('.', ','),
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
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
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value * 1000)}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="valor" fill="var(--primary)" radius={[4, 4, 0, 0]}>
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
                <XAxis dataKey="data" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value * 1000)}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Total Emitido"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)' }}
                />
                <Line
                  type="monotone"
                  dataKey="aceitos"
                  name="Aceitos"
                  stroke="#27ae60"
                  strokeWidth={2}
                  dot={{ fill: '#27ae60' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage>Nenhum orçamento no período</NoDataMessage>
          )}
        </FullWidthChart>
      </ChartsRow>

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
    </Container>
  );
}
