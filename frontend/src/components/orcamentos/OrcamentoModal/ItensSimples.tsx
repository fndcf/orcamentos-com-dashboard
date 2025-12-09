import { OrcamentoItem } from '../../../types';
import { formatCurrency } from '../../../utils/constants';
import {
  Button,
  Input,
  InputGroup,
  Label,
  ErrorText,
} from '../../ui';
import {
  ItensSection,
  SectionTitle,
  ItemRow,
  RemoveButton,
  TotalSection,
} from './styles';

interface ItensSimplesProps {
  itens: OrcamentoItem[];
  errors: Record<string, string>;
  onItemChange: (index: number, field: keyof OrcamentoItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

export function ItensSimples({
  itens,
  errors,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: ItensSimplesProps) {
  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
  };

  return (
    <ItensSection id="itensSection">
      <SectionTitle>
        Itens do Orçamento
        <Button type="button" $size="small" onClick={onAddItem}>
          + Adicionar Item
        </Button>
      </SectionTitle>

      {errors.itens && <ErrorText>{errors.itens}</ErrorText>}

      {itens.map((item, index) => (
        <ItemRow key={index} data-item-index={index}>
          <InputGroup>
            <Label>Descrição</Label>
            <Input
              placeholder="Descrição do item/serviço"
              value={item.descricao}
              onChange={(e) => onItemChange(index, 'descricao', e.target.value)}
            />
            {errors[`item_${index}_descricao`] && (
              <ErrorText>{errors[`item_${index}_descricao`]}</ErrorText>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Qtd</Label>
            <Input
              type="number"
              min="1"
              value={item.quantidade}
              onChange={(e) => onItemChange(index, 'quantidade', parseFloat(e.target.value) || 0)}
            />
            {errors[`item_${index}_quantidade`] && (
              <ErrorText>{errors[`item_${index}_quantidade`]}</ErrorText>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Unidade</Label>
            <Input
              placeholder="Serv."
              value={item.unidade}
              onChange={(e) => onItemChange(index, 'unidade', e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <Label>Valor Unit.</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.valorUnitario}
              onChange={(e) => onItemChange(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
            />
            {errors[`item_${index}_valor`] && (
              <ErrorText>{errors[`item_${index}_valor`]}</ErrorText>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Total</Label>
            <Input
              value={formatCurrency(item.quantidade * item.valorUnitario)}
              disabled
            />
          </InputGroup>

          <RemoveButton
            type="button"
            onClick={() => onRemoveItem(index)}
            disabled={itens.length === 1}
            title="Remover item"
          >
            ×
          </RemoveButton>
        </ItemRow>
      ))}

      <TotalSection>
        <span className="total-label">Total do Orçamento:</span>
        <span className="total-value">{formatCurrency(calcularTotal())}</span>
      </TotalSection>
    </ItensSection>
  );
}
