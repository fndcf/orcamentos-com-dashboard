import styled from 'styled-components';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ClienteSelect = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ClienteInfo = styled.div`
  padding: 12px;
  background: var(--background);
  border-radius: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);

  strong {
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 10px;
  }
`;

export const NovoClienteSection = styled.div`
  border: 2px solid var(--primary);
  border-radius: 8px;
  padding: 16px;
  background: rgba(255, 107, 53, 0.05);

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const NovoClienteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);

  h4 {
    margin: 0;
    color: var(--primary);
    font-size: 1rem;
  }
`;

export const DocumentRow = styled.div`
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

export const CheckboxRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  background: var(--background);

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-top: 1px;
    accent-color: var(--primary);
    flex-shrink: 0;
    cursor: pointer;
  }

  span {
    font-size: 0.9rem;
    color: var(--text-primary);
    line-height: 1.4;
  }
`;

export const StatusMessage = styled.p<{ $type: 'success' | 'error' | 'info' }>`
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: 6px;
  margin: 0;

  ${({ $type }) => {
    switch ($type) {
      case 'success':
        return 'background: rgba(76, 175, 80, 0.1); color: var(--success);';
      case 'error':
        return 'background: rgba(244, 67, 54, 0.1); color: var(--error);';
      case 'info':
        return 'background: rgba(33, 150, 243, 0.1); color: var(--info);';
    }
  }}
`;

export const ItensSection = styled.div`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: var(--text-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    button {
      width: 100%;
    }
  }
`;

export const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 70px 80px 100px 100px 40px;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }
`;

export const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--error);
  cursor: pointer;
  padding: 8px;
  font-size: 1.2rem;

  &:hover {
    background: rgba(244, 67, 54, 0.1);
    border-radius: 4px;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    background: rgba(244, 67, 54, 0.1);
    border-radius: 6px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &::after {
      content: 'Remover Item';
      font-size: 0.9rem;
    }
  }
`;

export const TotalSection = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
  border-top: 2px solid var(--border);
  margin-top: 16px;

  .total-label {
    font-weight: 500;
    margin-right: 16px;
  }

  .total-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
  }

  @media (max-width: 768px) {
    justify-content: space-between;
    padding: 12px 0;

    .total-label {
      margin-right: 0;
    }

    .total-value {
      font-size: 1.1rem;
    }
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border);

  @media (max-width: 768px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

export const ToggleButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => $active ? 'var(--primary)' : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : 'var(--primary)'};
  border: 2px solid var(--primary);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${({ $active }) => $active ? 'var(--primary-dark)' : 'rgba(255, 107, 53, 0.1)'};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 16px;
  }
`;

export const TipoOrcamentoSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const TipoOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border: 2px solid ${({ $selected }) => $selected ? 'var(--primary)' : 'var(--border)'};
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;
  background: ${({ $selected }) => $selected ? 'rgba(255, 107, 53, 0.05)' : 'transparent'};

  &:hover {
    border-color: var(--primary);
  }

  input {
    width: 18px;
    height: 18px;
    accent-color: var(--primary);
  }

  .tipo-info {
    flex: 1;

    .tipo-titulo {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .tipo-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
  }
`;

export const TipoLocked = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--background);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;

  strong {
    color: var(--text-primary);
  }
`;

export const CompletoSection = styled.div`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  overflow: hidden;

  h4 {
    margin: 0 0 12px 0;
    color: var(--text-primary);
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const LimitacoesGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--background);
  border-radius: 6px;
`;

export const LimitacaoCheckbox = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: var(--primary);
    flex-shrink: 0;
  }

  span {
    font-size: 0.9rem;
    color: var(--text-primary);
    line-height: 1.4;
  }
`;

export const ItemCompletoContainer = styled.div`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: var(--background);
  position: relative;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
`;

export const ItemCompletoRow1 = styled.div`
  display: grid;
  grid-template-columns: 120px 160px 1fr;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 8px;
  max-width: 100%;

  > div {
    min-width: 0;
    max-width: 100%;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;

    > div:nth-child(1) { grid-column: 1 / 2; } /* Etapa */
    > div:nth-child(2) { grid-column: 2 / 3; } /* Categoria */
    > div:nth-child(3) { grid-column: 1 / 3; } /* Descrição */
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr !important;

    > div {
      grid-column: 1 / -1 !important;
    }
  }
`;

export const DescricaoAutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
`;

export const DescricaoInputWrapper = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  max-width: 100%;
  min-width: 0;

  input {
    min-width: 0;
    flex: 1;
  }
`;

export const DescricaoDropdownButton = styled.button`
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: var(--surface);
    border-color: var(--primary);
  }

  svg {
    width: 16px;
    height: 16px;
    color: var(--text-secondary);
  }
`;

export const DescricaoDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  min-width: 400px;
  max-height: 300px;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;

  @media (max-width: 768px) {
    min-width: 100%;
    max-height: 250px;
  }
`;

export const DescricaoOption = styled.div`
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(204, 0, 0, 0.05);
  }

  .descricao {
    font-size: 0.95rem;
    color: var(--text-primary);
    margin-bottom: 4px;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: normal;
  }

  .unidade {
    font-size: 0.8rem;
    color: var(--text-secondary);
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
`;

export const DescricaoEmptyMessage = styled.div`
  padding: 12px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
`;

export const DescricaoSearchInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  background: var(--background);
  color: var(--text-primary);

  &:focus {
    outline: none;
    background: var(--surface);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const DescricaoLoadingMore = styled.div`
  padding: 10px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
`;

export const DescricaoTotal = styled.div`
  padding: 8px 12px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
  background: var(--background);
  border-top: 1px solid var(--border);
`;

export const ItemCompletoRow2 = styled.div`
  display: grid;
  grid-template-columns: 70px 80px 1fr 1fr 1fr 1fr;
  gap: 8px;
  align-items: flex-end;

  > div {
    min-width: 0;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;

    > div:nth-child(1) { grid-column: 1 / 2; } /* Qtd */
    > div:nth-child(2) { grid-column: 2 / 3; } /* Unidade */
    > div:nth-child(3) { grid-column: 1 / 2; } /* M.O. Unit */
    > div:nth-child(4) { grid-column: 2 / 3; } /* Mat. Unit */
    > div:nth-child(5) { grid-column: 1 / 2; } /* Total M.O. */
    > div:nth-child(6) { grid-column: 2 / 3; } /* Total Mat. */
  }
`;

export const RemoveItemButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--error);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1.2rem;
  border-radius: 4px;

  &:hover {
    background: rgba(244, 67, 54, 0.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const TotaisCompleto = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
  background: var(--background);
  border-radius: 8px;
  margin-top: 16px;

  .total-item {
    text-align: center;

    .label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);

      &.destaque {
        font-size: 1.25rem;
        color: var(--primary);
      }
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const CondicaoPagamentoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CondicaoOption = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ $selected }) => $selected ? 'var(--primary)' : 'var(--border)'};
  border-radius: 6px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? 'rgba(255, 107, 53, 0.05)' : 'transparent'};

  input {
    accent-color: var(--primary);
  }
`;

export const ParcelamentoContainer = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: var(--background);
  border-radius: 8px;
  border: 1px solid var(--border);
`;

export const DescontoContainer = styled.div`
  margin-top: 12px;
  padding: 16px;
  background: var(--background);
  border-radius: 8px;
  border: 1px solid var(--border);

  .label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    input {
      width: 100px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 0.9rem;
      text-align: center;

      &:focus {
        outline: none;
        border-color: var(--primary);
      }
    }

    span {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  }

  .desconto-resumo {
    padding: 12px;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 6px;
    border: 1px solid var(--success);

    .desconto-detalhe {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
        padding-top: 8px;
        border-top: 1px solid rgba(76, 175, 80, 0.3);
        font-weight: 600;
        font-size: 1rem;
      }

      .label {
        color: var(--text-secondary);
        margin-bottom: 0;
      }

      .valor {
        font-weight: 500;
        color: var(--success);
      }
    }
  }
`;

export const EntradaSelector = styled.div`
  margin-bottom: 16px;

  .label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export const EntradaOption = styled.button<{ $selected: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ $selected }) => $selected ? 'var(--primary)' : 'var(--border)'};
  border-radius: 6px;
  background: ${({ $selected }) => $selected ? 'var(--primary)' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'var(--text-primary)'};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    background: ${({ $selected }) => $selected ? 'var(--primary)' : 'rgba(204, 0, 0, 0.05)'};
  }
`;

export const ParcelasSelector = styled.div`
  margin-bottom: 16px;

  .label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

export const ParcelaOption = styled.button<{ $selected: boolean; $disabled?: boolean }>`
  padding: 10px 16px;
  border: 1px solid ${({ $selected, $disabled }) =>
    $disabled ? 'var(--border)' :
    $selected ? 'var(--primary)' : 'var(--border)'};
  border-radius: 6px;
  background: ${({ $selected, $disabled }) =>
    $disabled ? 'var(--background)' :
    $selected ? 'var(--primary)' : 'transparent'};
  color: ${({ $selected, $disabled }) =>
    $disabled ? 'var(--text-secondary)' :
    $selected ? 'white' : 'var(--text-primary)'};
  font-size: 0.85rem;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  transition: all 0.2s;
  min-width: 100px;
  text-align: center;

  &:hover {
    ${({ $disabled }) => !$disabled && `
      border-color: var(--primary);
    `}
  }

  .parcela-numero {
    font-weight: 600;
    display: block;
  }

  .parcela-valor {
    font-size: 0.75rem;
    opacity: 0.9;
    display: block;
    margin-top: 2px;
  }

  .parcela-juros {
    font-size: 0.7rem;
    color: ${({ $selected }) => $selected ? 'rgba(255,255,255,0.8)' : 'var(--warning)'};
    display: block;
    margin-top: 2px;
  }
`;

export const ParcelamentoResumo = styled.div`
  padding: 16px;
  background: rgba(204, 0, 0, 0.05);
  border-radius: 8px;
  border: 1px solid var(--primary);

  .titulo {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 12px;
  }

  .detalhes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export const ParcelasCheckboxSection = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: var(--background);
  border-radius: 8px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .section-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .section-hint {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-style: italic;
  }
`;

export const ParcelasCheckboxGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
`;

export const ParcelaCheckboxItem = styled.label<{ $disabled?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};

  &:hover {
    background: ${({ $disabled }) => $disabled ? 'transparent' : 'rgba(0, 0, 0, 0.03)'};
  }

  input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: var(--primary);
    flex-shrink: 0;
    cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  }

  .parcela-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: var(--text-primary);
    line-height: 1.4;

    .parcela-detalhe {
      display: flex;
      align-items: center;
      gap: 8px;

      .juros-tag {
        color: var(--warning);
        font-size: 0.8rem;
      }

      .disabled-tag {
        color: var(--error);
        font-size: 0.75rem;
      }
    }

    .parcela-total {
      font-weight: 500;
      color: var(--text-secondary);
    }
  }
`;

export const ParcelamentoDetalhe = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-primary);
  padding: 4px 0;

  &.total {
    border-top: 1px solid var(--border);
    margin-top: 8px;
    padding-top: 12px;
    font-weight: 600;
    font-size: 1rem;
  }

  &.juros {
    color: var(--warning);
    font-size: 0.85rem;
  }

  .label {
    color: var(--text-secondary);
  }

  .valor {
    font-weight: 500;
  }
`;

export const CheckboxOption = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  background: var(--background);

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  input {
    width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: var(--primary);
    flex-shrink: 0;
    cursor: pointer;
  }

  span {
    font-size: 0.9rem;
    color: var(--text-primary);
    line-height: 1.4;
  }
`;

// Componente de Select com busca para clientes
export const ClienteSearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

export const ClienteSearchInput = styled.input<{ $hasValue?: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.95rem;
  background: ${({ $disabled }) => $disabled ? 'var(--background)' : 'var(--surface)'};
  color: var(--text-primary);
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'text'};
  opacity: ${({ $disabled }) => $disabled ? 0.7 : 1};

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

export const ClienteSearchDropdownButton = styled.button<{ $disabled?: boolean }>`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};

  svg {
    width: 18px;
    height: 18px;
    color: var(--text-secondary);
    transition: transform 0.2s;
  }

  &:hover:not(:disabled) svg {
    color: var(--primary);
  }
`;

export const ClienteSearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
`;

export const ClienteSearchOption = styled.div<{ $highlighted?: boolean }>`
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  background: ${({ $highlighted }) => $highlighted ? 'rgba(255, 107, 53, 0.1)' : 'transparent'};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 107, 53, 0.1);
  }

  .nome {
    font-size: 0.95rem;
    color: var(--text-primary);
    font-weight: 500;
  }

  .info {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 2px;
  }
`;

export const ClienteSearchEmpty = styled.div`
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

export const ClienteSearchLoading = styled.div<{ $initial?: boolean }>`
  padding: 12px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  border-top: ${({ $initial }) => $initial ? 'none' : '1px solid var(--border)'};
`;

export const ClienteSearchTotal = styled.div`
  padding: 8px 14px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
  background: var(--background);
  border-top: 1px solid var(--border);
`;

export const AddItemButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
`;
