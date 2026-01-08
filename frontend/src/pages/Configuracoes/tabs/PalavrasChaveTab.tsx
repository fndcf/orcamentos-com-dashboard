import { useState } from 'react';
import {
  usePalavrasChave,
  useCriarPalavraChave,
  useAtualizarPalavraChave,
  useTogglePalavraChave,
  useExcluirPalavraChave,
} from '../../../hooks/usePalavrasChave';
import { Modal, Button, Input } from '../../../components/ui';
import { PalavraChave } from '../../../types';
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
  FormRow,
  Label,
  HelpText,
  ErrorAlert,
  ModalButtons,
} from '../styles';

function formatarPrazo(dias: number): string {
  const anos = Math.floor(dias / 365);
  const meses = Math.floor((dias % 365) / 30);
  const diasRestantes = dias % 30;

  const partes: string[] = [];

  if (anos > 0) {
    partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  }
  if (meses > 0) {
    partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  }
  if (diasRestantes > 0 || partes.length === 0) {
    partes.push(`${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`);
  }

  return partes.join(' e ');
}

export function PalavrasChaveTab() {
  const { data: palavrasChave } = usePalavrasChave();
  const criarPalavraChave = useCriarPalavraChave();
  const atualizarPalavraChave = useAtualizarPalavraChave();
  const togglePalavraChave = useTogglePalavraChave();
  const excluirPalavraChave = useExcluirPalavraChave();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<PalavraChave | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PalavraChave | null>(null);

  const [palavra, setPalavra] = useState('');
  const [prazoDias, setPrazoDias] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const resetForm = () => {
    setPalavra('');
    setPrazoDias('');
    setEditando(null);
    setModalError(null);
  };

  const handleNovoClick = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEditarClick = (item: PalavraChave) => {
    setEditando(item);
    setPalavra(item.palavra);
    setPrazoDias(item.prazoDias.toString());
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSalvar = async () => {
    setModalError(null);
    const prazoDiasNum = parseInt(prazoDias, 10);

    if (!palavra.trim() || !prazoDiasNum || prazoDiasNum < 1) return;

    try {
      if (editando) {
        await atualizarPalavraChave.mutateAsync({
          id: editando.id!,
          data: { palavra: palavra.trim(), prazoDias: prazoDiasNum },
        });
      } else {
        await criarPalavraChave.mutateAsync({
          palavra: palavra.trim(),
          prazoDias: prazoDiasNum,
        });
      }
      handleCloseModal();
    } catch (error: any) {
      logger.error('Erro ao salvar palavra-chave', { error });
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Erro ao salvar. Tente novamente.';
      setModalError(errorMessage);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await togglePalavraChave.mutateAsync(id);
    } catch (error) {
      logger.error('Erro ao alterar status da palavra-chave', { error });
    }
  };

  const handleExcluir = async () => {
    if (!confirmDelete) return;

    try {
      await excluirPalavraChave.mutateAsync(confirmDelete.id!);
      setConfirmDelete(null);
    } catch (error) {
      logger.error('Erro ao excluir palavra-chave', { error });
    }
  };

  const isSaving = criarPalavraChave.isLoading || atualizarPalavraChave.isLoading;
  const isSaveDisabled = !palavra.trim() || !prazoDias || parseInt(prazoDias, 10) < 1 || isSaving;

  return (
    <>
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2>Palavras-chave para Notificações</h2>
            <p className="description">
              Configure palavras-chave que serão monitoradas nos itens dos orçamentos aceitos.
              Quando o prazo estiver próximo do vencimento, você receberá uma notificação.
            </p>
          </div>
          <Button onClick={handleNovoClick}>+ Nova Palavra-chave</Button>
        </div>

        {palavrasChave && palavrasChave.length > 0 ? (
          <ItemsList>
            {palavrasChave.map((pc) => (
              <Item key={pc.id} $ativo={pc.ativo}>
                <ItemInfo>
                  <div className="titulo">
                    {pc.palavra}
                    <StatusBadge $ativo={pc.ativo}>{pc.ativo ? 'Ativa' : 'Inativa'}</StatusBadge>
                  </div>
                  <div className="descricao">
                    Prazo de validade: <strong>{formatarPrazo(pc.prazoDias)}</strong> ({pc.prazoDias} dias)
                  </div>
                </ItemInfo>
                <ItemActions>
                  <ActionButton $variant="edit" onClick={() => handleEditarClick(pc)}>
                    Editar
                  </ActionButton>
                  <ActionButton $variant="toggle" onClick={() => handleToggle(pc.id!)}>
                    {pc.ativo ? 'Desativar' : 'Ativar'}
                  </ActionButton>
                  <ActionButton $variant="delete" onClick={() => setConfirmDelete(pc)}>
                    Excluir
                  </ActionButton>
                </ItemActions>
              </Item>
            ))}
          </ItemsList>
        ) : (
          <EmptyState>
            <p>Nenhuma palavra-chave cadastrada</p>
            <Button onClick={handleNovoClick}>Cadastrar Primeira Palavra-chave</Button>
          </EmptyState>
        )}
      </Section>

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editando ? 'Editar Palavra-chave' : 'Nova Palavra-chave'}
        width="500px"
      >
        {modalError && <ErrorAlert>{modalError}</ErrorAlert>}

        <FormRow>
          <FormGroup>
            <Label>Palavra-chave</Label>
            <Input
              value={palavra}
              onChange={(e) => setPalavra(e.target.value)}
              placeholder="Ex: extintor, mangueira, alarme"
            />
            <HelpText>Termo que será buscado nos itens dos orçamentos</HelpText>
          </FormGroup>
          <FormGroup>
            <Label>Prazo (em dias)</Label>
            <Input
              type="number"
              value={prazoDias}
              onChange={(e) => setPrazoDias(e.target.value)}
              placeholder="Ex: 345"
              min="1"
              max="3650"
            />
            <HelpText>
              {prazoDias && parseInt(prazoDias, 10) > 0
                ? formatarPrazo(parseInt(prazoDias, 10))
                : 'Dias até a notificação'}
            </HelpText>
          </FormGroup>
        </FormRow>

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
        itemDescription={`a palavra-chave "${confirmDelete?.palavra}"`}
      />
    </>
  );
}
