import { useState } from 'react';
import {
  useLimitacoes,
  useCriarLimitacao,
  useAtualizarLimitacao,
  useToggleLimitacao,
  useExcluirLimitacao,
} from '../../../hooks/useLimitacoes';
import { Modal, Button } from '../../../components/ui';
import { Limitacao } from '../../../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
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
} from '../styles';

export function LimitacoesTab() {
  const { data: limitacoes } = useLimitacoes();
  const criarLimitacao = useCriarLimitacao();
  const atualizarLimitacao = useAtualizarLimitacao();
  const toggleLimitacao = useToggleLimitacao();
  const excluirLimitacao = useExcluirLimitacao();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Limitacao | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Limitacao | null>(null);

  const [texto, setTexto] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const resetForm = () => {
    setTexto('');
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
      console.error('Erro ao salvar:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao salvar. Tente novamente.';
      setModalError(errorMessage);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleLimitacao.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleExcluir = async () => {
    if (!confirmDelete) return;

    try {
      await excluirLimitacao.mutateAsync(confirmDelete.id!);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const isSaveDisabled = !texto.trim() || texto.trim().length < 20;

  return (
    <>
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Limitações e Observações</h2>
            <p className="description">
              Cadastre os parágrafos de limitações e observações que podem ser selecionados
              no orçamento completo. No orçamento, você escolhe quais incluir.
            </p>
          </div>
          <Button onClick={handleNovoClick}>+ Nova Limitação</Button>
        </div>

        {limitacoes && limitacoes.length > 0 ? (
          <ItemsList>
            {limitacoes.map((l) => (
              <Item key={l.id} $ativo={l.ativo}>
                <ItemInfo>
                  <div className="titulo">
                    Limitação #{l.ordem}
                    <StatusBadge $ativo={l.ativo}>{l.ativo ? 'Ativa' : 'Inativa'}</StatusBadge>
                  </div>
                  <div className="descricao">{l.texto}</div>
                </ItemInfo>
                <ItemActions>
                  <ActionButton $variant="edit" onClick={() => handleEditarClick(l)}>
                    Editar
                  </ActionButton>
                  <ActionButton $variant="toggle" onClick={() => handleToggle(l.id!)}>
                    {l.ativo ? 'Desativar' : 'Ativar'}
                  </ActionButton>
                  <ActionButton $variant="delete" onClick={() => setConfirmDelete(l)}>
                    Excluir
                  </ActionButton>
                </ItemActions>
              </Item>
            ))}
          </ItemsList>
        ) : (
          <EmptyState>
            <p>Nenhuma limitação cadastrada</p>
            <Button onClick={handleNovoClick}>Cadastrar Primeira Limitação</Button>
          </EmptyState>
        )}
      </Section>

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editando ? 'Editar Limitação' : 'Nova Limitação'}
        width="600px"
      >
        {modalError && <ErrorAlert>{modalError}</ErrorAlert>}

        <FormGroup>
          <Label>Texto da Limitação/Observação</Label>
          <TextArea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ex: O Contratante deverá nos informar procedimentos e rotinas operacionais ligadas à saúde e segurança a serem observadas e seguidas por nossos profissionais durante a execução dos trabalhos de campo."
            rows={5}
          />
          <HelpText>Mínimo de 20 caracteres. Este parágrafo poderá ser selecionado no orçamento.</HelpText>
        </FormGroup>

        <ModalButtons>
          <Button $variant="ghost" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={isSaveDisabled}>
            {editando ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </ModalButtons>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleExcluir}
        itemDescription={`a limitação "${confirmDelete?.texto.substring(0, 50)}..."`}
      />
    </>
  );
}
