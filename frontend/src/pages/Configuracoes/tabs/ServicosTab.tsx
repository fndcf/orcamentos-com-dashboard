import { useState } from 'react';
import {
  useServicos,
  useCriarServico,
  useAtualizarServico,
  useToggleServico,
  useExcluirServico,
} from '../../../hooks/useServicos';
import { Modal, Button } from '../../../components/ui';
import { Servico } from '../../../types';
import { logger } from '../../../utils/logger';
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

export function ServicosTab() {
  const { data: servicos } = useServicos();
  const criarServico = useCriarServico();
  const atualizarServico = useAtualizarServico();
  const toggleServico = useToggleServico();
  const excluirServico = useExcluirServico();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Servico | null>(null);

  const [descricao, setDescricao] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const resetForm = () => {
    setDescricao('');
    setEditando(null);
    setModalError(null);
  };

  const handleNovoClick = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEditarClick = (item: Servico) => {
    setEditando(item);
    setDescricao(item.descricao);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSalvar = async () => {
    setModalError(null);

    if (!descricao.trim() || descricao.trim().length < 10) return;

    try {
      if (editando) {
        await atualizarServico.mutateAsync({
          id: editando.id!,
          data: { descricao: descricao.trim() },
        });
      } else {
        await criarServico.mutateAsync({ descricao: descricao.trim() });
      }
      handleCloseModal();
    } catch (error: any) {
      logger.error('Erro ao salvar serviço', { error });
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao salvar. Tente novamente.';
      setModalError(errorMessage);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleServico.mutateAsync(id);
    } catch (error) {
      logger.error('Erro ao alterar status do serviço', { error });
    }
  };

  const handleExcluir = async () => {
    if (!confirmDelete) return;

    try {
      await excluirServico.mutateAsync(confirmDelete.id!);
      setConfirmDelete(null);
    } catch (error) {
      logger.error('Erro ao excluir serviço', { error });
    }
  };

  const isSaving = criarServico.isLoading || atualizarServico.isLoading;
  const isSaveDisabled = !descricao.trim() || descricao.trim().length < 10 || isSaving;

  return (
    <>
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Serviços para Orçamento Completo</h2>
            <p className="description">
              Cadastre os tipos de serviço que aparecerão no cabeçalho do orçamento completo.
              Ex: "Assessoria, fornecimento, manutenção e instalação de equipamentos..."
            </p>
          </div>
          <Button onClick={handleNovoClick}>+ Novo Serviço</Button>
        </div>

        {servicos && servicos.length > 0 ? (
          <ItemsList>
            {servicos.map((s, index) => (
              <Item key={s.id} $ativo={s.ativo}>
                <ItemInfo>
                  <div className="titulo">
                    Serviço #{index + 1}
                    <StatusBadge $ativo={s.ativo}>{s.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
                  </div>
                  <div className="descricao">{s.descricao}</div>
                </ItemInfo>
                <ItemActions>
                  <ActionButton $variant="edit" onClick={() => handleEditarClick(s)}>
                    Editar
                  </ActionButton>
                  <ActionButton $variant="toggle" onClick={() => handleToggle(s.id!)}>
                    {s.ativo ? 'Desativar' : 'Ativar'}
                  </ActionButton>
                  <ActionButton $variant="delete" onClick={() => setConfirmDelete(s)}>
                    Excluir
                  </ActionButton>
                </ItemActions>
              </Item>
            ))}
          </ItemsList>
        ) : (
          <EmptyState>
            <p>Nenhum serviço cadastrado</p>
            <Button onClick={handleNovoClick}>Cadastrar Primeiro Serviço</Button>
          </EmptyState>
        )}
      </Section>

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editando ? 'Editar Serviço' : 'Novo(a) Serviço'}
        width="600px"
      >
        {modalError && <ErrorAlert>{modalError}</ErrorAlert>}

        <FormGroup>
          <Label>Descrição do Serviço</Label>
          <TextArea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Assessoria, fornecimento, manutenção e instalação de equipamentos e protocolo do pedido de vistoria junto ao Corpo de Bombeiros para fins de obtenção do AVCB, conforme parâmetros do Decreto Estadual nº 69.118/24."
            rows={4}
          />
          <HelpText>Mínimo de 10 caracteres. Este texto aparecerá no cabeçalho do orçamento.</HelpText>
        </FormGroup>

        <ModalButtons>
          <Button $variant="ghost" onClick={handleCloseModal} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={isSaveDisabled}>
            {isSaving ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </ModalButtons>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleExcluir}
        itemDescription={`o serviço "${confirmDelete?.descricao.substring(0, 50)}..."`}
      />
    </>
  );
}
