import styled from 'styled-components';

export const Card = styled.div`
  background: var(--surface);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    h2 {
      font-size: 1.1rem;
    }
  }
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;

    h1 {
      font-size: 1.25rem;
    }

    button {
      width: 100%;
    }
  }
`;

export const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  input {
    flex: 1;
    max-width: 400px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    input {
      max-width: none;
    }
  }
`;
