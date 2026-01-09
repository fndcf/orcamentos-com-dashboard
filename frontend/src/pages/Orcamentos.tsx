import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Orcamento, OrcamentoStatus, OrcamentoSaveData } from "../types";
import {
  useOrcamentosPaginados,
  useCriarOrcamento,
  useAtualizarOrcamento,
  useAtualizarStatusOrcamento,
  useExcluirOrcamento,
  useVerificarExpirados,
} from "../hooks/useOrcamentos";
import {
  Button,
  Input,
  Select,
  Table,
  TableContainer,
  Thead,
  Tbody,
  ActionButtons,
  ActionButton,
  EmptyState,
  PageHeader,
  SearchBar,
  Loading,
  DesktopOnly,
  MobileOnly,
  MobileCardList,
  MobileCard,
  MobileCardHeader,
  MobileCardTitle,
  MobileCardBody,
  MobileCardField,
  MobileCardActions,
  Pagination,
} from "../components/ui";
import { OrcamentoModal } from "../components/orcamentos/OrcamentoModal";
import { OrcamentoViewModal } from "../components/orcamentos/OrcamentoViewModal";
import {
  gerarPDFOrcamento,
  gerarPDFExecucao,
} from "../components/orcamentos/OrcamentoPDF";
import {
  formatCurrency,
  formatDate,
  formatOrcamentoNumero,
} from "../utils/constants";
import Footer from "@/components/layout/Footer";

const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const StatusBadge = styled.span<{ $status: OrcamentoStatus }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 768px) {
    padding: 3px 8px;
    font-size: 0.75rem;
  }

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

const OrcamentoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:hover .numero {
    text-decoration: underline;
  }

  .numero {
    font-weight: 600;
    color: var(--primary);
  }

  .cliente {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .numero {
      font-size: 0.9rem;
    }

    .cliente {
      font-size: 0.8rem;
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  select {
    min-width: 150px;
  }

  @media (max-width: 768px) {
    width: 100%;

    select {
      flex: 1;
      min-width: unset;
    }
  }
`;

const ConfirmDialog = styled.div`
  text-align: center;

  p {
    margin-bottom: 20px;
    color: var(--text-secondary);
  }

  strong {
    color: var(--text-primary);
  }
`;

const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

const StatusDialog = styled.div`
  p {
    margin-bottom: 16px;
    color: var(--text-secondary);
  }

  .status-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 768px) {
    p {
      font-size: 0.9rem;
    }
  }
`;

const statusLabels: Record<OrcamentoStatus, string> = {
  aberto: "Aberto",
  aceito: "Aceito",
  recusado: "Recusado",
  expirado: "Expirado",
};

const ITEMS_PER_PAGE = 10;

export function Orcamentos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [orcamentoEdit, setOrcamentoEdit] = useState<Orcamento | null>(null);
  const [orcamentoDuplicar, setOrcamentoDuplicar] = useState<Orcamento | null>(
    null
  );
  const [orcamentoDelete, setOrcamentoDelete] = useState<Orcamento | null>(
    null
  );
  const [orcamentoStatus, setOrcamentoStatus] = useState<Orcamento | null>(
    null
  );
  const [orcamentoView, setOrcamentoView] = useState<Orcamento | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrcamentoStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce da busca para não fazer muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Usa paginação do backend
  const {
    data: paginatedData,
    isLoading,
    isFetching,
  } = useOrcamentosPaginados(currentPage, ITEMS_PER_PAGE, {
    status: statusFilter || undefined,
    busca: debouncedSearchTerm || undefined,
  });

  const orcamentos = paginatedData?.items;
  const criarOrcamento = useCriarOrcamento();
  const atualizarOrcamento = useAtualizarOrcamento();
  const atualizarStatus = useAtualizarStatusOrcamento();
  const excluirOrcamento = useExcluirOrcamento();
  const verificarExpirados = useVerificarExpirados();

  // Verificar orçamentos expirados ao carregar a página
  useEffect(() => {
    verificarExpirados.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efeito para processar parâmetros da URL (vindo do Dashboard)
  useEffect(() => {
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action && id && orcamentos) {
      const orcamento = orcamentos.find((o) => o.id === id);
      if (orcamento) {
        if (action === "edit") {
          if (orcamento.status === "aberto") {
            setOrcamentoEdit(orcamento);
            setOrcamentoDuplicar(null);
            setModalOpen(true);
          } else {
            alert('Só é possível editar orçamentos com status "Aberto"');
          }
        } else if (action === "duplicate") {
          setOrcamentoEdit(null);
          setOrcamentoDuplicar(orcamento);
          setModalOpen(true);
        }
        // Limpar parâmetros da URL após processar
        setSearchParams({});
      }
    }
  }, [searchParams, orcamentos, setSearchParams]);

  const handleCloseModal = () => {
    setModalOpen(false);
    setOrcamentoEdit(null);
    setOrcamentoDuplicar(null);
  };

  const handleNovoOrcamento = () => {
    setOrcamentoEdit(null);
    setOrcamentoDuplicar(null);
    setModalOpen(true);
  };

  const handleEditOrcamento = (orcamento: Orcamento) => {
    if (orcamento.status !== "aberto") {
      alert('Só é possível editar orçamentos com status "Aberto"');
      return;
    }
    setOrcamentoEdit(orcamento);
    setOrcamentoDuplicar(null);
    setModalOpen(true);
  };

  const handleSaveOrcamento = async (data: OrcamentoSaveData) => {
    if (orcamentoEdit?.id) {
      // Editando orçamento existente
      await atualizarOrcamento.mutateAsync({
        id: orcamentoEdit.id,
        data: {
          // Campos do orçamento completo
          servicoId: data.servicoId,
          servicoDescricao: data.servicoDescricao,
          itensCompleto: data.itensCompleto,
          limitacoesSelecionadas: data.limitacoesSelecionadas,
          prazoExecucaoServicos: data.prazoExecucaoServicos,
          prazoVistoriaBombeiros: data.prazoVistoriaBombeiros,
          condicaoPagamento: data.condicaoPagamento,
          parcelamentoTexto: data.parcelamentoTexto,
          parcelamentoDados: data.parcelamentoDados,
          descontoAVista: data.descontoAVista,
          mostrarValoresDetalhados: data.mostrarValoresDetalhados,
          // Campos comuns
          observacoes: data.observacoes,
          consultor: data.consultor,
          contato: data.contato,
          email: data.email,
          telefone: data.telefone,
          enderecoServico: data.enderecoServico,
        },
      });
    } else {
      // Criando novo orçamento (ou duplicando)
      await criarOrcamento.mutateAsync(data);
    }
    // Limpar estados após salvar
    setOrcamentoEdit(null);
    setOrcamentoDuplicar(null);
  };

  const handleDeleteOrcamento = async () => {
    if (orcamentoDelete?.id) {
      await excluirOrcamento.mutateAsync(orcamentoDelete.id);
      setOrcamentoDelete(null);
    }
  };

  const handleChangeStatus = async (status: OrcamentoStatus) => {
    if (orcamentoStatus?.id) {
      await atualizarStatus.mutateAsync({ id: orcamentoStatus.id, status });
      setOrcamentoStatus(null);
    }
  };

  const handleDuplicar = (orcamento: Orcamento) => {
    setOrcamentoEdit(null);
    setOrcamentoDuplicar(orcamento);
    setModalOpen(true);
  };

  // Handlers para o modal de visualização
  const handleViewEdit = (orcamento: Orcamento) => {
    setOrcamentoView(null);
    setOrcamentoEdit(orcamento);
    setOrcamentoDuplicar(null);
    setModalOpen(true);
  };

  const handleViewDuplicate = (orcamento: Orcamento) => {
    setOrcamentoView(null);
    setOrcamentoEdit(null);
    setOrcamentoDuplicar(orcamento);
    setModalOpen(true);
  };

  // Reset para página 1 quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  // Paginação - agora vem do backend
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const orcamentosPaginados = orcamentos;

  const getStatusActions = (orcamento: Orcamento): OrcamentoStatus[] => {
    switch (orcamento.status) {
      case "aberto":
        return ["aceito", "recusado"];
      case "aceito":
        return ["aberto"];
      case "recusado":
      case "expirado":
        return ["aberto"];
      default:
        return [];
    }
  };

  return (
    <Container>
      <PageHeader>
        <h1>Orçamentos</h1>
        <Button onClick={handleNovoOrcamento}>+ Novo Orçamento</Button>
      </PageHeader>

      <SearchBar>
        <Input
          placeholder="Buscar por número ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterGroup>
          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrcamentoStatus | "")
            }
          >
            <option value="">Todos os status</option>
            <option value="aberto">Abertos</option>
            <option value="aceito">Aceitos</option>
            <option value="recusado">Recusados</option>
            <option value="expirado">Expirados</option>
          </Select>
        </FilterGroup>
      </SearchBar>

      {isLoading || isFetching ? (
        <Loading />
      ) : orcamentosPaginados && orcamentosPaginados.length > 0 ? (
        <>
          {/* Versão Desktop - Tabela */}
          <DesktopOnly>
            <TableContainer>
              <Table>
                <Thead>
                  <tr>
                    <th>Orçamento</th>
                    <th>Data</th>
                    <th>Validade</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </Thead>
                <Tbody>
                  {orcamentosPaginados.map((orcamento) => (
                    <tr key={orcamento.id}>
                      <td>
                        <OrcamentoInfo
                          onClick={() => setOrcamentoView(orcamento)}
                          title="Clique para ver detalhes"
                        >
                          <span className="numero">
                            {formatOrcamentoNumero(
                              orcamento.numero,
                              orcamento.dataEmissao,
                              orcamento.versao
                            )}
                          </span>
                          <span className="cliente">
                            {orcamento.clienteNome}
                          </span>
                        </OrcamentoInfo>
                      </td>
                      <td>{formatDate(orcamento.dataEmissao)}</td>
                      <td>{formatDate(orcamento.dataValidade)}</td>
                      <td>{formatCurrency(orcamento.valorTotal)}</td>
                      <td>
                        <StatusBadge $status={orcamento.status}>
                          {statusLabels[orcamento.status]}
                        </StatusBadge>
                      </td>
                      <td>
                        <ActionButtons>
                          <ActionButton
                            $variant="pdf"
                            onClick={() => gerarPDFOrcamento(orcamento)}
                            title="Gerar PDF"
                          >
                            PDF
                          </ActionButton>
                          {orcamento.status === "aceito" && (
                            <ActionButton
                              $variant="execucao"
                              onClick={() => gerarPDFExecucao(orcamento)}
                              title="PDF para Execução"
                            >
                              Execução
                            </ActionButton>
                          )}
                          {orcamento.status === "aberto" && (
                            <ActionButton
                              $variant="edit"
                              onClick={() => handleEditOrcamento(orcamento)}
                              title="Editar"
                            >
                              Editar
                            </ActionButton>
                          )}
                          {getStatusActions(orcamento).length > 0 && (
                            <ActionButton
                              $variant="status"
                              onClick={() => setOrcamentoStatus(orcamento)}
                              title="Alterar Status"
                            >
                              Status
                            </ActionButton>
                          )}
                          <ActionButton
                            $variant="duplicate"
                            onClick={() => handleDuplicar(orcamento)}
                            title="Duplicar"
                          >
                            Duplicar
                          </ActionButton>
                          {orcamento.status !== "aceito" && (
                            <ActionButton
                              $variant="delete"
                              onClick={() => setOrcamentoDelete(orcamento)}
                              title="Excluir"
                            >
                              Excluir
                            </ActionButton>
                          )}
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </DesktopOnly>

          {/* Versão Mobile - Cards */}
          <MobileOnly>
            <MobileCardList>
              {orcamentosPaginados.map((orcamento) => (
                <MobileCard key={orcamento.id}>
                  <MobileCardHeader>
                    <MobileCardTitle
                      onClick={() => setOrcamentoView(orcamento)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="primary">
                        {formatOrcamentoNumero(
                          orcamento.numero,
                          orcamento.dataEmissao,
                          orcamento.versao
                        )}
                      </span>
                      <span className="secondary">{orcamento.clienteNome}</span>
                    </MobileCardTitle>
                    <StatusBadge $status={orcamento.status}>
                      {statusLabels[orcamento.status]}
                    </StatusBadge>
                  </MobileCardHeader>
                  <MobileCardBody>
                    <MobileCardField>
                      <span className="label">Data</span>
                      <span className="value">
                        {formatDate(orcamento.dataEmissao)}
                      </span>
                    </MobileCardField>
                    <MobileCardField>
                      <span className="label">Validade</span>
                      <span className="value">
                        {formatDate(orcamento.dataValidade)}
                      </span>
                    </MobileCardField>
                    <MobileCardField className="full-width">
                      <span className="label">Valor Total</span>
                      <span
                        className="value"
                        style={{ fontSize: "1.1rem", color: "var(--primary)" }}
                      >
                        {formatCurrency(orcamento.valorTotal)}
                      </span>
                    </MobileCardField>
                  </MobileCardBody>
                  <MobileCardActions>
                    <ActionButton
                      $variant="pdf"
                      onClick={() => gerarPDFOrcamento(orcamento)}
                    >
                      PDF
                    </ActionButton>
                    {orcamento.status === "aceito" && (
                      <ActionButton
                        $variant="execucao"
                        onClick={() => gerarPDFExecucao(orcamento)}
                      >
                        Execução
                      </ActionButton>
                    )}
                    {orcamento.status === "aberto" && (
                      <ActionButton
                        $variant="edit"
                        onClick={() => handleEditOrcamento(orcamento)}
                      >
                        Editar
                      </ActionButton>
                    )}
                    {getStatusActions(orcamento).length > 0 && (
                      <ActionButton
                        $variant="status"
                        onClick={() => setOrcamentoStatus(orcamento)}
                      >
                        Status
                      </ActionButton>
                    )}
                    <ActionButton
                      $variant="duplicate"
                      onClick={() => handleDuplicar(orcamento)}
                    >
                      Duplicar
                    </ActionButton>
                    {orcamento.status !== "aceito" && (
                      <ActionButton
                        $variant="delete"
                        onClick={() => setOrcamentoDelete(orcamento)}
                      >
                        Excluir
                      </ActionButton>
                    )}
                  </MobileCardActions>
                </MobileCard>
              ))}
            </MobileCardList>
          </MobileOnly>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <EmptyState>
          <h3>Nenhum orçamento encontrado</h3>
          <p>
            {searchTerm || statusFilter
              ? "Tente buscar por outro termo ou altere o filtro"
              : "Crie seu primeiro orçamento clicando no botão acima"}
          </p>
        </EmptyState>
      )}

      <OrcamentoModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveOrcamento}
        orcamento={orcamentoEdit}
        duplicarDe={orcamentoDuplicar}
        loading={criarOrcamento.isLoading || atualizarOrcamento.isLoading}
      />

      {/* Modal de confirmação de exclusão */}
      {orcamentoDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setOrcamentoDelete(null)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ConfirmDialog>
              <h3 style={{ marginBottom: "16px" }}>Confirmar Exclusão</h3>
              <p>
                Tem certeza que deseja excluir o orçamento{" "}
                <strong>#{orcamentoDelete.numero}</strong>?
              </p>
              <DialogButtons>
                <Button
                  $variant="ghost"
                  onClick={() => setOrcamentoDelete(null)}
                >
                  Cancelar
                </Button>
                <Button
                  $variant="danger"
                  onClick={handleDeleteOrcamento}
                  disabled={excluirOrcamento.isLoading}
                >
                  {excluirOrcamento.isLoading ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogButtons>
            </ConfirmDialog>
          </div>
        </div>
      )}

      {/* Modal de alteração de status */}
      {orcamentoStatus && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setOrcamentoStatus(null)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <StatusDialog>
              <h3 style={{ marginBottom: "16px" }}>Alterar Status</h3>
              <p>
                Orçamento <strong>{orcamentoStatus.numero}</strong> -{" "}
                {orcamentoStatus.clienteNome}
              </p>
              <p>
                Status atual:{" "}
                <StatusBadge $status={orcamentoStatus.status}>
                  {statusLabels[orcamentoStatus.status]}
                </StatusBadge>
              </p>
              <div className="status-buttons">
                {getStatusActions(orcamentoStatus).map((status) => (
                  <Button
                    key={status}
                    $variant={
                      status === "aceito"
                        ? "primary"
                        : status === "recusado"
                        ? "danger"
                        : "ghost"
                    }
                    onClick={() => handleChangeStatus(status)}
                    disabled={atualizarStatus.isLoading}
                    $fullWidth
                  >
                    Marcar como {statusLabels[status]}
                  </Button>
                ))}
              </div>
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <Button
                  $variant="ghost"
                  onClick={() => setOrcamentoStatus(null)}
                >
                  Cancelar
                </Button>
              </div>
            </StatusDialog>
          </div>
        </div>
      )}

      {/* Modal de visualização do orçamento */}
      <OrcamentoViewModal
        isOpen={!!orcamentoView}
        onClose={() => setOrcamentoView(null)}
        orcamento={orcamentoView}
        onEdit={handleViewEdit}
        onDuplicate={handleViewDuplicate}
      />
      {/* Footer */}
      <Footer />
    </Container>
  );
}
