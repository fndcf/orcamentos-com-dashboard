import styled from 'styled-components';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 1px solid var(--border);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PaginationInfo = styled.span`
  font-size: 0.9rem;
  color: var(--text-secondary);

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid ${({ $active }) => $active ? 'var(--primary)' : 'var(--border)'};
  background: ${({ $active }) => $active ? 'var(--primary)' : 'var(--surface)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-primary)'};
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${({ $active }) => $active ? 'var(--primary-dark)' : 'var(--background)'};
    border-color: var(--primary);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    min-width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }
`;

const Ellipsis = styled.span`
  padding: 0 4px;
  color: var(--text-secondary);
`;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <PaginationContainer>
      <PaginationInfo>
        Exibindo {startItem}-{endItem} de {totalItems} registros
      </PaginationInfo>

      <PaginationButtons>
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </PageButton>

        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <PageButton
              key={index}
              $active={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PageButton>
          ) : (
            <Ellipsis key={index}>{page}</Ellipsis>
          )
        )}

        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </PageButton>
      </PaginationButtons>
    </PaginationContainer>
  );
}
