import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Card } from "../components/ui";
import {
  useNotificacoesPaginadas,
  useNotificacoesVencidasPaginadas,
  useNotificacoesProximasPaginadas,
  useMarcarNotificacaoComoLida,
  useMarcarTodasNotificacoesComoLidas,
  useExcluirNotificacao,
  useNotificacaoResumo,
} from "../hooks/useNotificacoes";
import { Notificacao } from "../types";
import { formatOrcamentoNumeroSimples } from "../utils/constants";
import Footer from "@/components/layout/Footer";

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  color: var(--text-primary);
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled(Card)<{ $color?: string }>`
  text-align: center;
  padding: 20px;
  border-left: 4px solid ${(props) => props.$color || "var(--primary)"};
`;

const StatValue = styled.div<{ $color?: string }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => props.$color || "var(--primary)"};
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 4px;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
  overflow-x: auto;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: ${(props) => (props.$active ? "var(--primary)" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "var(--text-secondary)")};
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${(props) =>
      props.$active ? "var(--primary)" : "var(--background)"};
  }
`;

const NotificacaoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificacaoCard = styled(Card)<{ $lida: boolean; $vencida: boolean }>`
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid
    ${(props) => {
      if (props.$vencida) return "var(--error)";
      if (!props.$lida) return "var(--primary)";
      return "var(--border)";
    }};
  background: ${(props) =>
    props.$lida ? "white" : "rgba(255, 107, 53, 0.03)"};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const NotificacaoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const NotificacaoInfo = styled.div`
  flex: 1;
`;

const NotificacaoCliente = styled.h3`
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 1rem;
`;

const NotificacaoOrcamento = styled.span`
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

const NotificacaoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const NotificacaoData = styled.span<{ $vencida?: boolean }>`
  font-size: 0.85rem;
  color: ${(props) =>
    props.$vencida ? "var(--error)" : "var(--text-secondary)"};
  font-weight: ${(props) => (props.$vencida ? "600" : "400")};
  background: ${(props) =>
    props.$vencida ? "rgba(239, 68, 68, 0.1)" : "transparent"};
  padding: ${(props) => (props.$vencida ? "4px 8px" : "0")};
  border-radius: 4px;
`;

const NotificacaoDescricao = styled.p`
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
`;

const NotificacaoFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const PalavraChaveTag = styled.span`
  display: inline-block;
  background: var(--primary);
  color: white;
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button<{
  $variant?: "primary" | "danger" | "ghost";
}>`
  background: ${(props) => {
    if (props.$variant === "danger") return "var(--error)";
    if (props.$variant === "primary") return "var(--primary)";
    return "transparent";
  }};
  color: ${(props) => {
    if (props.$variant === "ghost") return "var(--text-secondary)";
    return "white";
  }};
  border: ${(props) =>
    props.$variant === "ghost" ? "1px solid var(--border)" : "none"};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    ${(props) => props.$variant === "ghost" && "background: var(--background);"}
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: var(--text-light);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const LoadMoreButton = styled.button`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-dark);
  }

  &:disabled {
    background: var(--border);
    cursor: not-allowed;
  }
`;

const LoadingMore = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
`;

type TabType = "todas" | "vencidas" | "proximas";

function formatarData(data: Date | string): string {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isVencida(data: Date | string): boolean {
  const d = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return d < hoje;
}

function diasParaVencimento(data: Date | string): string {
  const d = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const diffMs = d.getTime() - hoje.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0)
    return `Vencido há ${Math.abs(diffDias)} dia${
      Math.abs(diffDias) !== 1 ? "s" : ""
    }`;
  if (diffDias === 0) return "Vence hoje";
  if (diffDias === 1) return "Vence amanhã";
  return `Vence em ${diffDias} dias`;
}

export function NotificacoesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const { data: resumo } = useNotificacaoResumo();

  // Hook paginado para todas as notificações
  const {
    data: todasPaginado,
    isLoading: loadingTodas,
    fetchNextPage: fetchNextTodas,
    hasNextPage: hasNextTodas,
    isFetchingNextPage: isFetchingTodas,
  } = useNotificacoesPaginadas(20);

  // Hook paginado para vencidas
  const {
    data: vencidasPaginado,
    isLoading: loadingVencidas,
    fetchNextPage: fetchNextVencidas,
    hasNextPage: hasNextVencidas,
    isFetchingNextPage: isFetchingVencidas,
  } = useNotificacoesVencidasPaginadas(20);

  // Hook paginado para próximas
  const {
    data: proximasPaginado,
    isLoading: loadingProximas,
    fetchNextPage: fetchNextProximas,
    hasNextPage: hasNextProximas,
    isFetchingNextPage: isFetchingProximas,
  } = useNotificacoesProximasPaginadas(30, 20);

  const marcarLida = useMarcarNotificacaoComoLida();
  const marcarTodasLidas = useMarcarTodasNotificacoesComoLidas();
  const excluir = useExcluirNotificacao();

  // Flatten das páginas
  const todas = todasPaginado?.pages.flatMap((page) => page.items) || [];
  const vencidas = vencidasPaginado?.pages.flatMap((page) => page.items) || [];
  const proximas = proximasPaginado?.pages.flatMap((page) => page.items) || [];

  const getNotificacoes = (): Notificacao[] => {
    switch (activeTab) {
      case "vencidas":
        return vencidas;
      case "proximas":
        return proximas;
      default:
        return todas;
    }
  };

  const getHasNextPage = (): boolean => {
    switch (activeTab) {
      case "vencidas":
        return hasNextVencidas || false;
      case "proximas":
        return hasNextProximas || false;
      default:
        return hasNextTodas || false;
    }
  };

  const getIsFetchingNext = (): boolean => {
    switch (activeTab) {
      case "vencidas":
        return isFetchingVencidas;
      case "proximas":
        return isFetchingProximas;
      default:
        return isFetchingTodas;
    }
  };

  const handleFetchNextPage = () => {
    switch (activeTab) {
      case "vencidas":
        fetchNextVencidas();
        break;
      case "proximas":
        fetchNextProximas();
        break;
      default:
        fetchNextTodas();
    }
  };

  // Infinite scroll - carregar mais quando chegar no final da lista
  const handleScroll = useCallback(() => {
    if (!listRef.current || !getHasNextPage() || getIsFetchingNext()) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      handleFetchNextPage();
    }
  }, [activeTab, hasNextTodas, hasNextVencidas, hasNextProximas, isFetchingTodas, isFetchingVencidas, isFetchingProximas]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll);
      return () => listElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const isLoading = loadingTodas || loadingVencidas || loadingProximas;
  const notificacoes = getNotificacoes();
  const hasNextPage = getHasNextPage();
  const isFetchingNext = getIsFetchingNext();

  const handleNotificacaoClick = (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      marcarLida.mutate(notificacao.id!);
    }
    navigate(`/orcamentos?id=${notificacao.orcamentoId}`);
  };

  const handleMarcarLida = (e: React.MouseEvent, notificacao: Notificacao) => {
    e.stopPropagation();
    marcarLida.mutate(notificacao.id!);
  };

  const handleExcluir = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Deseja realmente excluir esta notificacao?")) {
      excluir.mutate(id);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Notificações</Title>
        <HeaderActions>
          <Button
            $variant="ghost"
            onClick={() => marcarTodasLidas.mutate()}
            disabled={!resumo?.naoLidas || marcarTodasLidas.isLoading}
          >
            Marcar todas como lidas
          </Button>
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard $color="var(--text-secondary)">
          <StatValue $color="var(--text-primary)">
            {resumo?.total || 0}
          </StatValue>
          <StatLabel>Total</StatLabel>
        </StatCard>
        <StatCard $color="var(--primary)">
          <StatValue $color="var(--primary)">{resumo?.naoLidas || 0}</StatValue>
          <StatLabel>Não Lidas</StatLabel>
        </StatCard>
        <StatCard $color="var(--error)">
          <StatValue $color="var(--error)">{resumo?.vencidas || 0}</StatValue>
          <StatLabel>Vencidas</StatLabel>
        </StatCard>
        <StatCard $color="var(--warning)">
          <StatValue $color="var(--warning)">
            {resumo?.proximasVencer || 0}
          </StatValue>
          <StatLabel>Próximas a Vencer (30 dias)</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <Tab
          $active={activeTab === "todas"}
          onClick={() => setActiveTab("todas")}
        >
          Todas ({todasPaginado?.pages[0]?.total || todas.length})
        </Tab>
        <Tab
          $active={activeTab === "vencidas"}
          onClick={() => setActiveTab("vencidas")}
        >
          Vencidas ({vencidasPaginado?.pages[0]?.total || vencidas.length})
        </Tab>
        <Tab
          $active={activeTab === "proximas"}
          onClick={() => setActiveTab("proximas")}
        >
          Próximas a Vencer ({proximasPaginado?.pages[0]?.total || proximas.length})
        </Tab>
      </TabsContainer>

      {isLoading ? (
        <EmptyState>Carregando...</EmptyState>
      ) : notificacoes.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔔</EmptyIcon>
          <p>Nenhuma notificação encontrada</p>
        </EmptyState>
      ) : (
        <>
          <NotificacaoList ref={listRef}>
            {notificacoes.map((notificacao) => {
              const vencida = isVencida(notificacao.dataVencimento);
              return (
                <NotificacaoCard
                  key={notificacao.id}
                  $lida={notificacao.lida}
                  $vencida={vencida}
                  onClick={() => handleNotificacaoClick(notificacao)}
                >
                  <NotificacaoHeader>
                    <NotificacaoInfo>
                      <NotificacaoCliente>
                        {notificacao.clienteNome}
                      </NotificacaoCliente>
                      <NotificacaoOrcamento>
                        Orçamento{" "}
                        {formatOrcamentoNumeroSimples(
                          notificacao.orcamentoNumero,
                          notificacao.orcamentoDataEmissao
                        )}
                      </NotificacaoOrcamento>
                    </NotificacaoInfo>
                    <NotificacaoMeta>
                      <NotificacaoData $vencida={vencida}>
                        {diasParaVencimento(notificacao.dataVencimento)}
                      </NotificacaoData>
                      <NotificacaoData>
                        {formatarData(notificacao.dataVencimento)}
                      </NotificacaoData>
                    </NotificacaoMeta>
                  </NotificacaoHeader>

                  <NotificacaoDescricao>
                    {notificacao.itemDescricao}
                  </NotificacaoDescricao>

                  <NotificacaoFooter>
                    <PalavraChaveTag>{notificacao.palavraChave}</PalavraChaveTag>
                    <ActionButtons>
                      {!notificacao.lida && (
                        <SmallButton
                          $variant="ghost"
                          onClick={(e) => handleMarcarLida(e, notificacao)}
                        >
                          Marcar como lida
                        </SmallButton>
                      )}
                      <SmallButton
                        $variant="danger"
                        onClick={(e) => handleExcluir(e, notificacao.id!)}
                      >
                        Excluir
                      </SmallButton>
                    </ActionButtons>
                  </NotificacaoFooter>
                </NotificacaoCard>
              );
            })}
          </NotificacaoList>

          {isFetchingNext && (
            <LoadingMore>Carregando mais notificações...</LoadingMore>
          )}

          {hasNextPage && !isFetchingNext && (
            <LoadMoreContainer>
              <LoadMoreButton onClick={handleFetchNextPage}>
                Carregar mais notificações
              </LoadMoreButton>
            </LoadMoreContainer>
          )}
        </>
      )}
      {/* Footer */}
      <Footer />
    </Container>
  );
}
