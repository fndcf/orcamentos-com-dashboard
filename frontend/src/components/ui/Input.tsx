import styled from 'styled-components';

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
`;

export const Input = styled.input`
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  &:disabled {
    background: var(--background);
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--text-light);
  }
`;

export const TextArea = styled.textarea`
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  &::placeholder {
    color: var(--text-light);
  }
`;

export const Select = styled.select`
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  width: 100%;
  max-width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

export const InputRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const ErrorText = styled.span`
  color: var(--error);
  font-size: 0.8rem;
`;
