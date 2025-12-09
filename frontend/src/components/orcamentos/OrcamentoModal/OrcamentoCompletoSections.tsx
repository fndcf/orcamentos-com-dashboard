import { Limitacao, Servico } from '../../../types';
import {
  Input,
  InputGroup,
  Label,
  Select,
  TextArea,
  ErrorText,
  InputRow,
} from '../../ui';
import {
  CompletoSection,
  LimitacoesGrid,
  LimitacaoCheckbox,
  CondicaoPagamentoSection,
  CondicaoOption,
} from './styles';

// Função para truncar texto longo em selects
const truncateText = (text: string, maxLength: number = 80): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface ServicoSectionProps {
  servicoId: string;
  servicos: Servico[] | undefined;
  error?: string;
  onServicoChange: (id: string) => void;
}

export function ServicoSection({
  servicoId,
  servicos,
  error,
  onServicoChange,
}: ServicoSectionProps) {
  return (
    <CompletoSection id="servicoSelect">
      <h4>📋 Serviço</h4>
      <InputGroup>
        <Label>Selecione o Serviço *</Label>
        <Select
          value={servicoId}
          onChange={(e) => onServicoChange(e.target.value)}
          title={servicos?.find(s => s.id === servicoId)?.descricao || ''}
        >
          <option value="">Selecione um serviço</option>
          {servicos?.map((servico) => (
            <option key={servico.id} value={servico.id} title={servico.descricao}>
              {truncateText(servico.descricao)}
            </option>
          ))}
        </Select>
        {error && <ErrorText>{error}</ErrorText>}
      </InputGroup>
    </CompletoSection>
  );
}

interface LimitacoesSectionProps {
  limitacoes: Limitacao[] | undefined;
  selecionadas: string[];
  onToggle: (id: string) => void;
}

export function LimitacoesSection({
  limitacoes,
  selecionadas,
  onToggle,
}: LimitacoesSectionProps) {
  return (
    <CompletoSection>
      <h4>📝 Limitações do Escopo e Observações</h4>
      {limitacoes && limitacoes.length > 0 ? (
        <LimitacoesGrid>
          {limitacoes.map((limitacao) => (
            <LimitacaoCheckbox key={limitacao.id}>
              <input
                type="checkbox"
                checked={selecionadas.includes(limitacao.id!)}
                onChange={() => onToggle(limitacao.id!)}
              />
              <span>{limitacao.texto}</span>
            </LimitacaoCheckbox>
          ))}
        </LimitacoesGrid>
      ) : (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Nenhuma limitação cadastrada. Configure em Configurações &gt; Limitações.
        </p>
      )}
    </CompletoSection>
  );
}

interface PrazosSectionProps {
  prazoExecucao: number;
  prazoVistoria: number;
  onPrazoExecucaoChange: (valor: number) => void;
  onPrazoVistoriaChange: (valor: number) => void;
}

export function PrazosSection({
  prazoExecucao,
  prazoVistoria,
  onPrazoExecucaoChange,
  onPrazoVistoriaChange,
}: PrazosSectionProps) {
  return (
    <CompletoSection>
      <h4>⏱️ Prazos</h4>
      <InputRow>
        <InputGroup>
          <Label>Prazo de Execução dos Serviços (dias úteis)</Label>
          <Input
            type="number"
            min="1"
            value={prazoExecucao}
            onChange={(e) => onPrazoExecucaoChange(parseInt(e.target.value) || 1)}
            style={{ maxWidth: '150px' }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
            Podendo ser intercalados
          </p>
        </InputGroup>
        <InputGroup>
          <Label>Prazo para Vistoria do Corpo de Bombeiros (dias)</Label>
          <Input
            type="number"
            min="1"
            value={prazoVistoria}
            onChange={(e) => onPrazoVistoriaChange(parseInt(e.target.value) || 1)}
            style={{ maxWidth: '150px' }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
            Após gerado o protocolo
          </p>
        </InputGroup>
      </InputRow>
    </CompletoSection>
  );
}

interface CondicaoPagamentoSectionProps {
  condicao: 'a_combinar' | 'parcelado';
  parcelamentoTexto: string;
  onCondicaoChange: (condicao: 'a_combinar' | 'parcelado') => void;
  onParcelamentoTextoChange: (texto: string) => void;
}

export function CondicaoPagamentoFormSection({
  condicao,
  parcelamentoTexto,
  onCondicaoChange,
  onParcelamentoTextoChange,
}: CondicaoPagamentoSectionProps) {
  return (
    <CompletoSection>
      <h4>💰 Preços e Condições de Pagamento</h4>
      <CondicaoPagamentoSection>
        <CondicaoOption $selected={condicao === 'a_combinar'}>
          <input
            type="radio"
            name="condicaoPagamento"
            checked={condicao === 'a_combinar'}
            onChange={() => onCondicaoChange('a_combinar')}
          />
          <span>A combinar</span>
        </CondicaoOption>
        <CondicaoOption $selected={condicao === 'parcelado'}>
          <input
            type="radio"
            name="condicaoPagamento"
            checked={condicao === 'parcelado'}
            onChange={() => onCondicaoChange('parcelado')}
          />
          <span>Parcelado</span>
        </CondicaoOption>
        {condicao === 'parcelado' && (
          <InputGroup style={{ marginTop: '8px' }}>
            <Label>Detalhe as condições de parcelamento</Label>
            <TextArea
              placeholder="Ex: 30% na assinatura, 40% na entrega, 30% após conclusão"
              value={parcelamentoTexto}
              onChange={(e) => onParcelamentoTextoChange(e.target.value)}
              rows={2}
            />
          </InputGroup>
        )}
      </CondicaoPagamentoSection>
    </CompletoSection>
  );
}
