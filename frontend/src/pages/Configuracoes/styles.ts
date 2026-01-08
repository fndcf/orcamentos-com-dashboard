import styled from 'styled-components';

export const Container = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    color: var(--text-primary);
    margin: 0;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.5rem;
    }
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 2px solid var(--border);
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 2px;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

export const Tab = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? 'var(--primary)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'white' : 'var(--text-secondary)')};
  border: none;
  padding: 12px 20px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${({ $active }) => ($active ? 'var(--primary)' : 'rgba(0, 0, 0, 0.05)')};
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
`;

export const Section = styled.section`
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 24px;
  margin-bottom: 24px;

  h2 {
    color: var(--text-primary);
    font-size: 1.2rem;
    margin-bottom: 8px;
  }

  p.description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Item = styled.div<{ $ativo: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: ${({ $ativo }) => ($ativo ? 'var(--background)' : 'rgba(0, 0, 0, 0.05)')};
  border-radius: 8px;
  border-left: 4px solid ${({ $ativo }) => ($ativo ? 'var(--success)' : 'var(--text-secondary)')};
  opacity: ${({ $ativo }) => ($ativo ? 1 : 0.7)};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const ItemInfo = styled.div`
  flex: 1;

  .titulo {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1rem;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .descricao {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
    max-width: 600px;
  }
`;

export const StatusBadge = styled.span<{ $ativo: boolean }>`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: ${({ $ativo }) => ($ativo ? 'rgba(39, 174, 96, 0.1)' : 'rgba(0, 0, 0, 0.1)')};
  color: ${({ $ativo }) => ($ativo ? 'var(--success)' : 'var(--text-secondary)')};
`;

export const ItemActions = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const ActionButton = styled.button<{ $variant?: 'edit' | 'toggle' | 'delete' }>`
  background: transparent;
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  color: ${({ $variant }) => {
    switch ($variant) {
      case 'delete':
        return 'var(--error)';
      case 'toggle':
        return 'var(--warning)';
      default:
        return '#3498db';
    }
  }};

  &:hover {
    background: ${({ $variant }) => {
      switch ($variant) {
        case 'delete':
          return 'rgba(231, 76, 60, 0.1)';
        case 'toggle':
          return 'rgba(241, 196, 15, 0.1)';
        default:
          return 'rgba(52, 152, 219, 0.1)';
      }
    }};
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);

  p {
    margin-bottom: 16px;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

export const HelpText = styled.span`
  display: block;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 4px;
`;

export const ErrorAlert = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '\u26A0';
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--background);
  color: var(--text-primary);
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

export const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

export const ConfirmDialog = styled.div`
  text-align: center;

  p {
    margin-bottom: 20px;
    color: var(--text-secondary);
  }

  strong {
    color: var(--text-primary);
  }
`;

export const DialogButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

export const CnpjRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;

  > div:first-child {
    flex: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;

    > div:first-child {
      flex: none;
    }

    button {
      width: 100%;
    }
  }
`;

export const Message = styled.div<{ $type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;

  background: ${({ $type }) => {
    switch ($type) {
      case 'success': return 'rgba(39, 174, 96, 0.1)';
      case 'error': return 'rgba(231, 76, 60, 0.1)';
      case 'info': return 'rgba(52, 152, 219, 0.1)';
    }
  }};

  color: ${({ $type }) => {
    switch ($type) {
      case 'success': return 'var(--success)';
      case 'error': return 'var(--error)';
      case 'info': return '#3498db';
    }
  }};

  border: 1px solid ${({ $type }) => {
    switch ($type) {
      case 'success': return 'rgba(39, 174, 96, 0.3)';
      case 'error': return 'rgba(231, 76, 60, 0.3)';
      case 'info': return 'rgba(52, 152, 219, 0.3)';
    }
  }};
`;

export const ItensServicoContainer = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid var(--border);
`;

export const ItensServicoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h4 {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-primary);
  }
`;

export const ItemServicoRow = styled.div<{ $ativo: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: ${({ $ativo }) => ($ativo ? 'var(--surface)' : 'rgba(0, 0, 0, 0.03)')};
  border-radius: 6px;
  margin-bottom: 8px;
  opacity: ${({ $ativo }) => ($ativo ? 1 : 0.6)};
  border: 1px solid var(--border);

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const ItemServicoInfo = styled.div`
  flex: 1;

  .descricao {
    font-size: 0.9rem;
    color: var(--text-primary);
  }

  .unidade {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }
`;

export const ItemServicoActions = styled.div`
  display: flex;
  gap: 6px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const SmallButton = styled.button<{ $variant?: 'edit' | 'toggle' | 'delete' }>`
  background: transparent;
  border: 1px solid var(--border);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  color: ${({ $variant }) => {
    switch ($variant) {
      case 'delete':
        return 'var(--error)';
      case 'toggle':
        return 'var(--warning)';
      default:
        return '#3498db';
    }
  }};

  &:hover {
    background: ${({ $variant }) => {
      switch ($variant) {
        case 'delete':
          return 'rgba(231, 76, 60, 0.1)';
        case 'toggle':
          return 'rgba(241, 196, 15, 0.1)';
        default:
          return 'rgba(52, 152, 219, 0.1)';
      }
    }};
  }
`;

export const ExpandButton = styled.button`
  background: transparent;
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--primary);
  transition: all 0.2s;

  &:hover {
    background: rgba(204, 0, 0, 0.05);
  }
`;

export const ItensSearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--surface);
  color: var(--text-primary);
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const ItensListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--background);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }
`;

export const ItensLoadingMore = styled.div`
  text-align: center;
  padding: 12px;
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

export const ItensTotalCount = styled.div`
  text-align: center;
  padding: 8px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  border-top: 1px solid var(--border);
  margin-top: 8px;
`;
