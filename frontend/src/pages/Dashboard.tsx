import { useMemo, useState } from "react";
import styled from "styled-components";
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
import { useOrcamentos } from "../hooks/useOrcamentos";
import { useClientes } from "../hooks/useClientes";
import { Loading } from "../components/ui";
import { formatCurrency } from "../utils/constants";
import { Orcamento, OrcamentoStatus } from "../types";
import { OrcamentoViewModal } from "../components/orcamentos/OrcamentoViewModal";
import Footer from "@/components/layout/Footer";

const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Title = styled.h1`
  color: var(--text-primary);
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 16px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const StatCard = styled.div<{ $color?: string }>`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  border-left: 4px solid ${({ $color }) => $color || "var(--primary)"};

  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .subvalue {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;

    .value {
      font-size: 1.5rem;
    }

    .label {
      font-size: 0.8rem;
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 16px;
  }
`;

const ChartCard = styled.div`
  background: var(--surface);
  padding: 20px;
  border-radius: 12px;
  box-shadow: var(--shadow);

  h3 {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 16px;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;

    h3 {
      font-size: 0.95rem;
      margin-bottom: 12px;
    }
  }
`;

const FullWidthChartCard = styled(ChartCard)`
  grid-column: 1 / -1;
`;

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  margin-right: -4px;
`;

const RecentItem = styled.div<{ $clickable?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--background);
  border-radius: 8px;
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: all 0.2s;

  ${({ $clickable }) =>
    $clickable &&
    `
    &:hover {
      background: rgba(204, 0, 0, 0.05);
      transform: translateX(4px);
    }
  `}

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .numero {
      font-weight: 600;
      color: var(--primary);
      font-size: 0.9rem;
    }

    .cliente {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
  }

  .valor {
    font-weight: 600;
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    padding: 10px;

    .info .numero {
      font-size: 0.85rem;
    }

    .info .cliente {
      font-size: 0.8rem;
    }

    .valor {
      font-size: 0.9rem;
    }
  }
`;

const StatusBadge = styled.span<{ $status: OrcamentoStatus }>`
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 8px;

  ${({ $status }) => {
    switch ($status) {
      case "aberto":
        return `
          background: rgba(33, 150, 243, 0.1);
          color: #1976d2;
        `;
      case "aceito":
        return `
          background: rgba(76, 175, 80, 0.1);
          color: #388e3c;
        `;
      case "recusado":
        return `
          background: rgba(244, 67, 54, 0.1);
          color: #d32f2f;
        `;
      case "expirado":
        return `
          background: rgba(158, 158, 158, 0.1);
          color: #616161;
        `;
    }
  }}
`;

const COLORS = {
  aberto: "#2196f3",
  aceito: "#4caf50",
  recusado: "#f44336",
  expirado: "#9e9e9e",
};

const STATUS_LABELS: Record<OrcamentoStatus, string> = {
  aberto: "Abertos",
  aceito: "Aceitos",
  recusado: "Recusados",
  expirado: "Expirados",
};

const MONTH_NAMES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function Dashboard() {
  const { data: orcamentos, isLoading: loadingOrcamentos } = useOrcamentos();
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(
    null
  );

  const stats = useMemo(() => {
    if (!orcamentos) return null;

    const total = orcamentos.length;
    const abertos = orcamentos.filter((o) => o.status === "aberto").length;
    const aceitos = orcamentos.filter((o) => o.status === "aceito").length;
    const recusados = orcamentos.filter((o) => o.status === "recusado").length;

    const valorTotal = orcamentos.reduce(
      (acc, o) => acc + (o.valorTotal || 0),
      0
    );
    const valorAceitos = orcamentos
      .filter((o) => o.status === "aceito")
      .reduce((acc, o) => acc + (o.valorTotal || 0), 0);

    const taxaConversao =
      total > 0 ? ((aceitos / total) * 100).toFixed(1) : "0";

    return {
      total,
      abertos,
      aceitos,
      recusados,
      valorTotal,
      valorAceitos,
      taxaConversao,
      totalClientes: clientes?.length || 0,
    };
  }, [orcamentos, clientes]);

  const statusData = useMemo(() => {
    if (!orcamentos) return [];

    const counts: Record<OrcamentoStatus, number> = {
      aberto: 0,
      aceito: 0,
      recusado: 0,
      expirado: 0,
    };

    orcamentos.forEach((o) => {
      counts[o.status]++;
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: STATUS_LABELS[status as OrcamentoStatus],
        value,
        color: COLORS[status as OrcamentoStatus],
      }));
  }, [orcamentos]);

  const monthlyData = useMemo(() => {
    if (!orcamentos) return [];

    const now = new Date();
    const last6Months: { month: string; year: number; monthIndex: number }[] =
      [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: MONTH_NAMES[date.getMonth()],
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }

    return last6Months.map(({ month, year, monthIndex }) => {
      const monthOrcamentos = orcamentos.filter((o) => {
        const date = new Date(o.dataEmissao);
        return date.getMonth() === monthIndex && date.getFullYear() === year;
      });

      const total = monthOrcamentos.length;
      const aceitos = monthOrcamentos.filter(
        (o) => o.status === "aceito"
      ).length;
      const valor = monthOrcamentos.reduce(
        (acc, o) => acc + (o.valorTotal || 0),
        0
      );

      return {
        name: `${month}/${year.toString().slice(-2)}`,
        total,
        aceitos,
        valor: valor / 1000, // Em milhares para visualização
      };
    });
  }, [orcamentos]);

  const recentOrcamentos = useMemo(() => {
    if (!orcamentos) return [];

    return [...orcamentos]
      .sort(
        (a, b) =>
          new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()
      )
      .slice(0, 5);
  }, [orcamentos]);

  if (loadingOrcamentos || loadingClientes) {
    return (
      <Container>
        <Title>Painel</Title>
        <Loading />
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container>
        <Title>Painel</Title>
        <ChartCard>
          <p>Nenhum dado disponível</p>
        </ChartCard>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Painel</Title>

      <StatsGrid>
        <StatCard $color="var(--primary)">
          <div className="label">Total de Orçamentos</div>
          <div className="value">{stats.total}</div>
          <div className="subvalue">{formatCurrency(stats.valorTotal)}</div>
        </StatCard>

        <StatCard $color="#4caf50">
          <div className="label">Orçamentos Aceitos</div>
          <div className="value">{stats.aceitos}</div>
          <div className="subvalue">{formatCurrency(stats.valorAceitos)}</div>
        </StatCard>

        <StatCard $color="#2196f3">
          <div className="label">Taxa de Conversão</div>
          <div className="value">{stats.taxaConversao}%</div>
          <div className="subvalue">{stats.abertos} em aberto</div>
        </StatCard>

        <StatCard $color="#ff9800">
          <div className="label">Clientes Cadastrados</div>
          <div className="value">{stats.totalClientes}</div>
          <div className="subvalue">ativos no sistema</div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <h3>Orçamentos por Mês (Últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "valor")
                    return [
                      `R$ ${(value * 1000).toLocaleString("pt-BR")}`,
                      "Valor",
                    ];
                  return [value, name === "total" ? "Total" : "Aceitos"];
                }}
              />
              <Legend />
              <Bar
                dataKey="total"
                name="Total"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="aceitos"
                name="Aceitos"
                fill="#4caf50"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <h3>Status dos Orçamentos</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                padding: "40px",
              }}
            >
              Nenhum orçamento cadastrado
            </p>
          )}
        </ChartCard>
      </ChartsGrid>

      <ChartsGrid>
        <FullWidthChartCard>
          <h3>Evolução de Valores (em milhares R$)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `R$ ${(value * 1000).toLocaleString("pt-BR")}`,
                  "Valor",
                ]}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ fill: "var(--primary)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </FullWidthChartCard>
      </ChartsGrid>

      <ChartCard>
        <h3>Orçamentos Recentes</h3>
        {recentOrcamentos.length > 0 ? (
          <RecentList>
            {recentOrcamentos.map((orcamento) => (
              <RecentItem
                key={orcamento.id}
                $clickable
                onClick={() => setSelectedOrcamento(orcamento)}
                title="Clique para ver detalhes"
              >
                <div className="info">
                  <span className="numero">
                    #{orcamento.numero}
                    <StatusBadge $status={orcamento.status}>
                      {STATUS_LABELS[orcamento.status]}
                    </StatusBadge>
                  </span>
                  <span className="cliente">{orcamento.clienteNome}</span>
                </div>
                <span className="valor">
                  {formatCurrency(orcamento.valorTotal)}
                </span>
              </RecentItem>
            ))}
          </RecentList>
        ) : (
          <p
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              padding: "20px",
            }}
          >
            Nenhum orçamento cadastrado
          </p>
        )}
      </ChartCard>

      <OrcamentoViewModal
        isOpen={!!selectedOrcamento}
        onClose={() => setSelectedOrcamento(null)}
        orcamento={selectedOrcamento}
      />
      {/* Footer */}
      <Footer />
    </Container>
  );
}
