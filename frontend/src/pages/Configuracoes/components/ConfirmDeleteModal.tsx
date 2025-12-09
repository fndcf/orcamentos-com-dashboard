import { Modal, Button } from '../../../components/ui';
import { ConfirmDialog, DialogButtons } from '../styles';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemDescription: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemDescription,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Exclusão"
      width="400px"
    >
      <ConfirmDialog>
        <p>
          Tem certeza que deseja excluir {itemDescription}?
        </p>
        <p>Esta ação não pode ser desfeita.</p>
        <DialogButtons>
          <Button $variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button $variant="danger" onClick={onConfirm}>
            Excluir
          </Button>
        </DialogButtons>
      </ConfirmDialog>
    </Modal>
  );
}
