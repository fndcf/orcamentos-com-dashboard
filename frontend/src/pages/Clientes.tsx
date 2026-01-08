import { useState, useEffect } from "react";
import styled from "styled-components";
import { Cliente } from "../types";
import {
  useClientesPaginados,
  useCriarCliente,
  useAtualizarCliente,
  useExcluirCliente,
} from "../hooks/useClientes";
import { useOrcamentos } from "../hooks/useOrcamentos";
import {
  Button,
  Input,
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
import { ClienteModal } from "../components/clientes/ClienteModal";
import { HistoricoOrcamentosModal } from "../components/clientes/HistoricoOrcamentosModal";
import { formatDocument, formatPhone } from "../utils/constants";
import Footer from "@/components/layout/Footer";

const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ClienteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;

  &:hover .nome {
    color: var(--primary);
  }

  .nome {
    font-weight: 500;
    transition: color 0.2s;
  }

  .fantasia {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    .nome {
      font-size: 0.9rem;
    }

    .fantasia {
      font-size: 0.75rem;
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

const ITEMS_PER_PAGE = 10;

export function Clientes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  const [clienteDelete, setClienteDelete] = useState<Cliente | null>(null);
  const [clienteHistorico, setClienteHistorico] = useState<Cliente | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce da busca para não fazer muitas requisições
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Usa paginação do backend
  const { data: paginatedData, isLoading, isFetching } = useClientesPaginados(
    currentPage,
    ITEMS_PER_PAGE,
    {
      busca: debouncedSearchTerm || undefined,
    }
  );

  const clientes = paginatedData?.items;
  const { data: orcamentos } = useOrcamentos();
  const criarCliente = useCriarCliente();
  const atualizarCliente = useAtualizarCliente();
  const excluirCliente = useExcluirCliente();

  // Função para verificar se cliente tem orçamentos
  const clienteTemOrcamentos = (clienteId: string) => {
    return orcamentos?.some((o) => o.clienteId === clienteId) || false;
  };

  // Função para contar orçamentos do cliente
  const contarOrcamentosCliente = (clienteId: string) => {
    return orcamentos?.filter((o) => o.clienteId === clienteId).length || 0;
  };

  const handleNovoCliente = () => {
    setClienteEdit(null);
    setModalOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setClienteEdit(cliente);
    setModalOpen(true);
  };

  const handleSaveCliente = async (data: Omit<Cliente, "id" | "createdAt">) => {
    if (clienteEdit?.id) {
      await atualizarCliente.mutateAsync({ id: clienteEdit.id, data });
    } else {
      await criarCliente.mutateAsync(data);
    }
  };

  const handleDeleteCliente = async () => {
    if (clienteDelete?.id) {
      await excluirCliente.mutateAsync(clienteDelete.id);
      setClienteDelete(null);
    }
  };

  // Reset para página 1 quando busca muda
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Paginação - agora vem do backend
  const totalItems = paginatedData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const clientesPaginados = clientes;

  return (
    <Container>
      <PageHeader>
        <h1>Clientes</h1>
        <Button onClick={handleNovoCliente}>+ Novo Cliente</Button>
      </PageHeader>

      <SearchBar>
        <Input
          placeholder="Buscar por nome, CPF/CNPJ ou nome fantasia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {isLoading || isFetching ? (
        <Loading />
      ) : clientesPaginados && clientesPaginados.length > 0 ? (
        <>
          {/* Versão Desktop - Tabela */}
          <DesktopOnly>
            <TableContainer>
              <Table>
                <Thead>
                  <tr>
                    <th>Cliente</th>
                    <th>CPF/CNPJ</th>
                    <th>Cidade/UF</th>
                    <th>Telefone</th>
                    <th>Ações</th>
                  </tr>
                </Thead>
                <Tbody>
                  {clientesPaginados.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <ClienteInfo
                          onClick={() => setClienteHistorico(cliente)}
                          title="Ver histórico de orçamentos"
                        >
                          <span className="nome">{cliente.razaoSocial}</span>
                          {cliente.nomeFantasia && (
                            <span className="fantasia">
                              {cliente.nomeFantasia}
                            </span>
                          )}
                        </ClienteInfo>
                      </td>
                      <td>{formatDocument(cliente.cnpj)}</td>
                      <td>
                        {cliente.cidade}
                        {cliente.estado && `/${cliente.estado}`}
                      </td>
                      <td>
                        {cliente.telefone ? formatPhone(cliente.telefone) : "-"}
                      </td>
                      <td>
                        <ActionButtons>
                          <ActionButton
                            $variant="view"
                            onClick={() => setClienteHistorico(cliente)}
                            title="Ver Histórico"
                          >
                            Histórico
                          </ActionButton>
                          <ActionButton
                            $variant="edit"
                            onClick={() => handleEditCliente(cliente)}
                            title="Editar"
                          >
                            Editar
                          </ActionButton>
                          <ActionButton
                            $variant="delete"
                            onClick={() => setClienteDelete(cliente)}
                            title={
                              clienteTemOrcamentos(cliente.id!)
                                ? `Não é possível excluir - ${contarOrcamentosCliente(
                                    cliente.id!
                                  )} orçamento(s) vinculado(s)`
                                : "Excluir"
                            }
                            disabled={clienteTemOrcamentos(cliente.id!)}
                            style={
                              clienteTemOrcamentos(cliente.id!)
                                ? { opacity: 0.4, cursor: "not-allowed" }
                                : {}
                            }
                          >
                            Excluir
                          </ActionButton>
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
              {clientesPaginados.map((cliente) => (
                <MobileCard key={cliente.id}>
                  <MobileCardHeader>
                    <MobileCardTitle
                      onClick={() => setClienteHistorico(cliente)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="primary">{cliente.razaoSocial}</span>
                      {cliente.nomeFantasia && (
                        <span className="secondary">
                          {cliente.nomeFantasia}
                        </span>
                      )}
                    </MobileCardTitle>
                  </MobileCardHeader>
                  <MobileCardBody>
                    <MobileCardField>
                      <span className="label">CPF/CNPJ</span>
                      <span className="value">
                        {formatDocument(cliente.cnpj)}
                      </span>
                    </MobileCardField>
                    <MobileCardField>
                      <span className="label">Cidade/UF</span>
                      <span className="value">
                        {cliente.cidade}
                        {cliente.estado && `/${cliente.estado}`}
                      </span>
                    </MobileCardField>
                    <MobileCardField className="full-width">
                      <span className="label">Telefone</span>
                      <span className="value">
                        {cliente.telefone ? formatPhone(cliente.telefone) : "-"}
                      </span>
                    </MobileCardField>
                  </MobileCardBody>
                  <MobileCardActions>
                    <ActionButton
                      $variant="view"
                      onClick={() => setClienteHistorico(cliente)}
                    >
                      Histórico
                    </ActionButton>
                    <ActionButton
                      $variant="edit"
                      onClick={() => handleEditCliente(cliente)}
                    >
                      Editar
                    </ActionButton>
                    <ActionButton
                      $variant="delete"
                      onClick={() => setClienteDelete(cliente)}
                      disabled={clienteTemOrcamentos(cliente.id!)}
                      style={
                        clienteTemOrcamentos(cliente.id!)
                          ? { opacity: 0.4, cursor: "not-allowed" }
                          : {}
                      }
                    >
                      Excluir
                    </ActionButton>
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
          <h3>Nenhum cliente encontrado</h3>
          <p>
            {searchTerm
              ? "Tente buscar por outro termo"
              : "Cadastre seu primeiro cliente clicando no botão acima"}
          </p>
        </EmptyState>
      )}

      <ClienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCliente}
        cliente={clienteEdit}
        loading={criarCliente.isLoading || atualizarCliente.isLoading}
      />

      <HistoricoOrcamentosModal
        isOpen={!!clienteHistorico}
        onClose={() => setClienteHistorico(null)}
        cliente={clienteHistorico}
      />

      {/* Modal de confirmação de exclusão */}
      {clienteDelete && (
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
          onClick={() => setClienteDelete(null)}
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
                Tem certeza que deseja excluir o cliente{" "}
                <strong>{clienteDelete.razaoSocial}</strong>?
              </p>
              <DialogButtons>
                <Button $variant="ghost" onClick={() => setClienteDelete(null)}>
                  Cancelar
                </Button>
                <Button
                  $variant="danger"
                  onClick={handleDeleteCliente}
                  disabled={excluirCliente.isLoading}
                >
                  {excluirCliente.isLoading ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogButtons>
            </ConfirmDialog>
          </div>
        </div>
      )}
      {/* Footer */}
      <Footer />
    </Container>
  );
}
