import { useState } from "react";
import {
  useLimitacoes,
  useCriarLimitacao,
  useAtualizarLimitacao,
  useToggleLimitacao,
  useExcluirLimitacao,
} from "../../../hooks/useLimitacoes";
import { Modal, Button } from "../../../components/ui";
import { Limitacao } from "../../../types";
import { logger } from "../../../utils/logger";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import {
  Section,
  ItemsList,
  Item,
  ItemInfo,
  StatusBadge,
  ItemActions,
  ActionButton,
  EmptyState,
  FormGroup,
  Label,
  HelpText,
  ErrorAlert,
  TextArea,
  ModalButtons,
} from "../styles";

export function LimitacoesTab() {
  const { data: limitacoes } = useLimitacoes();
  const criarLimitacao = useCriarLimitacao();
  const atualizarLimitacao = useAtualizarLimitacao();
  const toggleLimitacao = useToggleLimitacao();
  const excluirLimitacao = useExcluirLimitacao();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Limitacao | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Limitacao | null>(null);

  const [texto, setTexto] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  const resetForm = () => {
    setTexto("");
    setEditando(null);
    setModalError(null);
  };

  const handleNovoClick = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEditarClick = (item: Limitacao) => {
    setEditando(item);
    setTexto(item.texto);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSalvar = async () => {
    setModalError(null);

    if (!texto.trim() || texto.trim().length < 20) return;

    try {
      if (editando) {
        await atualizarLimitacao.mutateAsync({
          id: editando.id!,
          data: { texto: texto.trim() },
        });
      } else {
        await criarLimitacao.mutateAsync({ texto: texto.trim() });
      }
      handleCloseModal();
    } catch (error: any) {
      logger.error("Erro ao salvar limitação", { error });
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao salvar. Tente novamente.";
      setModalError(errorMessage);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleLimitacao.mutateAsync(id);
    } catch (error) {
      logger.error("Erro ao alterar status da limitação", { error });
    }
  };

  const handleExcluir = async () => {
    if (!confirmDelete) return;

    try {
      await excluirLimitacao.mutateAsync(confirmDelete.id!);
      setConfirmDelete(null);
    } catch (error) {
      logger.error("Erro ao excluir limitação", { error });
    }
  };

  const MAX_CARACTERES = 1000;
  const MIN_CARACTERES = 20;
  const caracteresUsados = texto.length;
  const isSaving = criarLimitacao.isLoading || atualizarLimitacao.isLoading;
  const isSaveDisabled =
    !texto.trim() ||
    texto.trim().length < MIN_CARACTERES ||
    texto.length > MAX_CARACTERES ||
    isSaving;

  return (
    <>
      <Section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2>Observações e Limitações</h2>
            <p className="description">
              Cadastre os parágrafos de observações e limitações que podem ser
              selecionados no orçamento completo. No orçamento, você escolhe
              quais incluir.
            </p>
          </div>
          <Button onClick={handleNovoClick}>+ Nova Observação</Button>
        </div>

        {limitacoes && limitacoes.length > 0 ? (
          <ItemsList>
            {limitacoes.map((l, index) => (
              <Item key={l.id} $ativo={l.ativo}>
                <ItemInfo>
                  <div className="titulo">
                    Observação #{index + 1}
                    <StatusBadge $ativo={l.ativo}>
                      {l.ativo ? "Ativa" : "Inativa"}
                    </StatusBadge>
                  </div>
                  <div className="descricao">{l.texto}</div>
                </ItemInfo>
                <ItemActions>
                  <ActionButton
                    $variant="edit"
                    onClick={() => handleEditarClick(l)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    $variant="toggle"
                    onClick={() => handleToggle(l.id!)}
                  >
                    {l.ativo ? "Desativar" : "Ativar"}
                  </ActionButton>
                  <ActionButton
                    $variant="delete"
                    onClick={() => setConfirmDelete(l)}
                  >
                    Excluir
                  </ActionButton>
                </ItemActions>
              </Item>
            ))}
          </ItemsList>
        ) : (
          <EmptyState>
            <p>Nenhuma observação cadastrada</p>
            <Button onClick={handleNovoClick}>
              Cadastrar Primeira Observação
            </Button>
          </EmptyState>
        )}
      </Section>

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editando ? "Editar Observação" : "Nova Observação"}
        width="600px"
      >
        {modalError && <ErrorAlert>{modalError}</ErrorAlert>}

        <FormGroup>
          <Label>Texto da Observação/Limitação</Label>
          <TextArea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex: O Contratante deverá nos informar procedimentos e rotinas operacionais ligadas à saúde e segurança a serem observadas e seguidas por nossos profissionais durante a execução dos trabalhos de campo."
            rows={5}
            maxLength={MAX_CARACTERES}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <HelpText style={{ margin: 0 }}>
              Mínimo de {MIN_CARACTERES} caracteres. Este parágrafo poderá ser
              selecionado no orçamento.
            </HelpText>
            <span
              style={{
                fontSize: 12,
                color:
                  caracteresUsados > MAX_CARACTERES
                    ? "#dc3545"
                    : caracteresUsados > MAX_CARACTERES * 0.9
                      ? "#fd7e14"
                      : "#6c757d",
                fontWeight: caracteresUsados > MAX_CARACTERES * 0.9 ? 500 : 400,
              }}
            >
              {caracteresUsados}/{MAX_CARACTERES}
            </span>
          </div>
        </FormGroup>

        <ModalButtons>
          <Button $variant="ghost" onClick={handleCloseModal} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={isSaveDisabled}>
            {isSaving ? "Salvando..." : editando ? "Salvar Alterações" : "Cadastrar"}
          </Button>
        </ModalButtons>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleExcluir}
        itemDescription={`a limitação "${confirmDelete?.texto.substring(
          0,
          50
        )}..."`}
      />
    </>
  );
}
