import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  useNotificacaoResumo,
  useNotificacoesAtivasPaginadas,
  useMarcarNotificacaoComoLida,
  useMarcarTodasNotificacoesComoLidas,
} from "../../hooks/useNotificacoes";
import { Notificacao } from "../../types";
import { formatOrcamentoNumeroSimples } from "../../utils/constants";

const Container = styled.div`
  position: relative;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 6px;
  }
`;

const Badge = styled.span<{ $hasVencidas?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  background: ${(props) =>
    props.$hasVencidas ? "var(--error)" : "var(--primary)"};
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  min-width: 18px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.6rem;
    padding: 1px 4px;
    min-width: 14px;
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 380px;
  max-height: 480px;
  overflow: hidden;
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  flex-direction: column;
  z-index: 1000;

  @media (max-width: 768px) {
    width: 320px;
    right: -50px;
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
`;

const DropdownTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
`;

const MarkAllButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 107, 53, 0.1);
  }

  &:disabled {
    color: var(--text-light);
    cursor: not-allowed;
  }
`;

const NotificacaoList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
`;

const NotificacaoItem = styled.div<{ $lida: boolean; $vencida: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.2s;
  background: ${(props) =>
    props.$lida ? "white" : "rgba(255, 107, 53, 0.05)"};
  border-left: 3px solid
    ${(props) => {
      if (props.$vencida) return "var(--error)";
      if (!props.$lida) return "var(--primary)";
      return "transparent";
    }};

  &:hover {
    background: var(--background);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificacaoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

const NotificacaoCliente = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

const NotificacaoData = styled.span<{ $vencida?: boolean }>`
  font-size: 0.75rem;
  color: ${(props) => (props.$vencida ? "var(--error)" : "var(--text-light)")};
  font-weight: ${(props) => (props.$vencida ? "600" : "400")};
`;

const NotificacaoDescricao = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.4;
`;

const NotificacaoPalavraChave = styled.span`
  display: inline-block;
  background: var(--primary);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 6px;
`;

const EmptyState = styled.div`
  padding: 32px 16px;
  text-align: center;
  color: var(--text-light);
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 12px;
  background: var(--background);
  border: none;
  color: var(--primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 107, 53, 0.1);
  }

  &:disabled {
    color: var(--text-light);
    cursor: not-allowed;
  }
`;

const LoadingMore = styled.div`
  padding: 12px;
  text-align: center;
  color: var(--text-light);
  font-size: 0.85rem;
`;

const DropdownFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  text-align: center;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

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
    return `Venceu há ${Math.abs(diffDias)} dia${
      Math.abs(diffDias) !== 1 ? "s" : ""
    }`;
  if (diffDias === 0) return "Renovação hoje";
  if (diffDias === 1) return "Renovação amanhã";
  if (diffDias <= 30) return `Renovação em ${diffDias} dias`;
  return `Renovação em ${diffDias} dias`;
}

export function NotificacaoDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: resumo } = useNotificacaoResumo();
  // Usar notificações ativas paginadas (10 por página)
  const {
    data: paginatedData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificacoesAtivasPaginadas(10, 10);
  const marcarLida = useMarcarNotificacaoComoLida();
  const marcarTodasLidas = useMarcarTodasNotificacoesComoLidas();

  // Flatten das páginas para obter todas as notificações carregadas
  const notificacoes = paginatedData?.pages.flatMap((page) => page.items) || [];

  // Refetch quando o dropdown é aberto
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Infinite scroll - carregar mais quando chegar no final da lista
  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasNextPage || isFetchingNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    // Carregar mais quando estiver a 50px do final
    if (scrollHeight - scrollTop - clientHeight < 50) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificacaoClick = (notificacao: Notificacao) => {
    if (!notificacao.lida) {
      marcarLida.mutate(notificacao.id!);
    }
    setIsOpen(false);
    navigate(`/orcamentos?id=${notificacao.orcamentoId}`);
  };

  const handleMarcarTodasLidas = () => {
    marcarTodasLidas.mutate();
  };

  const handleVerTodas = () => {
    setIsOpen(false);
    navigate("/notificacoes");
  };

  // Usar contagem de ativas (vencidas + próximas) em vez de todas não lidas
  const ativas = resumo?.ativas || 0;
  const hasVencidas = (resumo?.vencidas || 0) > 0;

  return (
    <Container ref={dropdownRef}>
      <IconButton onClick={() => setIsOpen(!isOpen)} title="Notificações">
        🔔
        {ativas > 0 && (
          <Badge $hasVencidas={hasVencidas}>
            {ativas > 99 ? "99+" : ativas}
          </Badge>
        )}
      </IconButton>

      <Dropdown $isOpen={isOpen}>
        <DropdownHeader>
          <DropdownTitle>Notificações</DropdownTitle>
          <MarkAllButton
            onClick={handleMarcarTodasLidas}
            disabled={ativas === 0 || marcarTodasLidas.isLoading}
          >
            Marcar todas como lidas
          </MarkAllButton>
        </DropdownHeader>

        <NotificacaoList ref={listRef} onScroll={handleScroll}>
          {isLoading ? (
            <EmptyState>Carregando...</EmptyState>
          ) : isError ? (
            <EmptyState>Erro ao carregar notificações</EmptyState>
          ) : notificacoes && notificacoes.length > 0 ? (
            <>
              {notificacoes.map((notificacao) => {
                const vencida = isVencida(notificacao.dataVencimento);
                return (
                  <NotificacaoItem
                    key={notificacao.id}
                    $lida={notificacao.lida}
                    $vencida={vencida}
                    onClick={() => handleNotificacaoClick(notificacao)}
                  >
                    <NotificacaoHeader>
                      <NotificacaoCliente>
                        {notificacao.clienteNome} - Orç.{" "}
                        {formatOrcamentoNumeroSimples(
                          notificacao.orcamentoNumero,
                          notificacao.orcamentoDataEmissao
                        )}
                      </NotificacaoCliente>
                      <NotificacaoData $vencida={vencida}>
                        {diasParaVencimento(notificacao.dataVencimento)}
                      </NotificacaoData>
                    </NotificacaoHeader>
                    <NotificacaoDescricao>
                      {notificacao.itemDescricao.length > 80
                        ? `${notificacao.itemDescricao.substring(0, 80)}...`
                        : notificacao.itemDescricao}
                    </NotificacaoDescricao>
                    <NotificacaoPalavraChave>
                      {notificacao.palavraChave}
                    </NotificacaoPalavraChave>
                  </NotificacaoItem>
                );
              })}
              {isFetchingNextPage && (
                <LoadingMore>Carregando mais...</LoadingMore>
              )}
              {hasNextPage && !isFetchingNextPage && (
                <LoadMoreButton onClick={() => fetchNextPage()}>
                  Carregar mais notificações
                </LoadMoreButton>
              )}
            </>
          ) : (
            <EmptyState>Nenhuma notificação pendente</EmptyState>
          )}
        </NotificacaoList>

        <DropdownFooter>
          <ViewAllButton onClick={handleVerTodas}>
            Ver todas as notificações
          </ViewAllButton>
        </DropdownFooter>
      </Dropdown>
    </Container>
  );
}
