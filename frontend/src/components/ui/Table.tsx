import styled from 'styled-components';

export const TableContainer = styled.div`
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 8px;
    overflow-x: auto;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  @media (max-width: 768px) {
    min-width: 600px;
  }
`;

export const Thead = styled.thead`
  background: var(--background);

  th {
    padding: 14px 16px;
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    th {
      padding: 10px 12px;
      font-size: 0.75rem;
    }
  }
`;

export const Tbody = styled.tbody`
  tr {
    transition: background 0.2s;

    &:hover {
      background: var(--background);
    }

    &:not(:last-child) td {
      border-bottom: 1px solid var(--border);
    }
  }

  td {
    padding: 14px 16px;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  @media (max-width: 768px) {
    td {
      padding: 10px 12px;
      font-size: 0.85rem;
    }
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 4px;
  }
`;

export const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'view' | 'pdf' | 'status' | 'duplicate' | 'execucao' }>`
  background: none;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  white-space: nowrap;

  ${({ $variant }) => {
    switch ($variant) {
      case 'edit':
        return `
          color: var(--info);
          &:hover { background: rgba(33, 150, 243, 0.1); }
        `;
      case 'delete':
        return `
          color: var(--error);
          &:hover { background: rgba(244, 67, 54, 0.1); }
        `;
      case 'view':
        return `
          color: var(--primary);
          &:hover { background: rgba(204, 0, 0, 0.1); }
        `;
      case 'pdf':
        return `
          color: #9333ea;
          &:hover { background: rgba(147, 51, 234, 0.1); }
        `;
      case 'status':
        return `
          color: #0891b2;
          &:hover { background: rgba(8, 145, 178, 0.1); }
        `;
      case 'duplicate':
        return `
          color: #059669;
          &:hover { background: rgba(5, 150, 105, 0.1); }
        `;
      case 'execucao':
        return `
          color: #ea580c;
          &:hover { background: rgba(234, 88, 12, 0.1); }
        `;
      default:
        return `
          color: var(--text-secondary);
          &:hover { background: var(--background); }
        `;
    }
  }}

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
`;

export const EmptyState = styled.div`
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);

  h3 {
    font-size: 1.1rem;
  }

  p {
    margin-top: 8px;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    padding: 32px 16px;

    h3 {
      font-size: 1rem;
    }

    p {
      font-size: 0.85rem;
    }
  }
`;

export const DesktopOnly = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const MobileOnly = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const MobileCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MobileCard = styled.div`
  background: var(--surface);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow);
`;

export const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

export const MobileCardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .primary {
    font-weight: 600;
    color: var(--primary);
    font-size: 1rem;
  }

  .secondary {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
`;

export const MobileCardBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

export const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 0.9rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  &.full-width {
    grid-column: 1 / -1;
  }
`;

export const MobileCardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
`;
