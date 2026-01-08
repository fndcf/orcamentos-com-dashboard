import styled from 'styled-components';
import { Cliente, OrcamentoStatus } from '../../types';
import { useHistoricoCliente } from '../../hooks/useOrcamentos';
import { Modal, Loading, EmptyState } from '../ui';
import { formatCurrency, formatDate, formatOrcamentoNumero } from '../../utils/constants';
import { gerarPDFOrcamento } from '../orcamentos/OrcamentoPDF';

const ClienteHeader = styled.div`
  background: var(--background);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 4px 0;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 16px;

    h3 {
      font-size: 1rem;
    }

    p {
      font-size: 0.8rem;
    }
  }
`;

const OrcamentosList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;

  @media (max-width: 768px) {
    gap: 10px;
    max-height: 350px;
  }
`;

const OrcamentoCard = styled.div`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    background: rgba(204, 0, 0, 0.02);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }
`;

const OrcamentoInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .numero {
    font-weight: 600;
    color: var(--primary);
    font-size: 1rem;
  }

  .data {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .itens {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    .numero {
      font-size: 0.95rem;
    }

    .data {
      font-size: 0.8rem;
    }

    .itens {
      font-size: 0.8rem;
    }
  }
`;

const OrcamentoRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px dashed var(--border);
  }
`;

const ValorTotal = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatusBadge = styled.span<{ $status: OrcamentoStatus }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;

  ${({ $status }) => {
    switch ($status) {
      case 'aberto':
        return `
          background: rgba(33, 150, 243, 0.1);
          color: #1976d2;
        `;
      case 'aceito':
        return `
          background: rgba(76, 175, 80, 0.1);
          color: #388e3c;
        `;
      case 'recusado':
        return `
          background: rgba(244, 67, 54, 0.1);
          color: #d32f2f;
        `;
      case 'expirado':
        return `
          background: rgba(158, 158, 158, 0.1);
          color: #616161;
        `;
    }
  }}
`;

const PDFButton = styled.button`
  background: none;
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(204, 0, 0, 0.05);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    flex: 1;
    text-align: center;
  }
`;

const ResumoSection = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);

  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 16px;
    padding-top: 12px;
  }
`;

const ResumoCard = styled.div<{ $variant?: 'primary' | 'success' | 'default' }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  text-align: center;

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `background: rgba(204, 0, 0, 0.1);`;
      case 'success':
        return `background: rgba(76, 175, 80, 0.1);`;
      default:
        return `background: var(--background);`;
    }
  }}

  .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    padding: 10px 8px;

    .label {
      font-size: 0.65rem;
    }

    .value {
      font-size: 0.9rem;
    }
  }
`;

const ListaLimitadaInfo = styled.div`
  text-align: center;
  padding: 12px;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  background: var(--background);
  border-radius: 6px;
`;

const statusLabels: Record<OrcamentoStatus, string> = {
  aberto: 'Aberto',
  aceito: 'Aceito',
  recusado: 'Recusado',
  expirado: 'Expirado',
};

interface HistoricoOrcamentosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

const LIMITE_ORCAMENTOS = 5;

export function HistoricoOrcamentosModal({
  isOpen,
  onClose,
  cliente,
}: HistoricoOrcamentosModalProps) {
  const { data: historico, isLoading } = useHistoricoCliente(cliente?.id || '', LIMITE_ORCAMENTOS);

  const orcamentos = historico?.orcamentos || [];
  const resumo = historico?.resumo || { total: 0, aceitos: 0, valorTotalAceitos: 0 };

  if (!cliente) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Histórico de Orçamentos"
      size="large"
    >
      <ClienteHeader>
        <h3>{cliente.razaoSocial}</h3>
        {cliente.nomeFantasia && <p>{cliente.nomeFantasia}</p>}
        <p>CNPJ/CPF: {cliente.cnpj}</p>
      </ClienteHeader>

      {isLoading ? (
        <Loading />
      ) : orcamentos.length > 0 ? (
        <>
          <OrcamentosList>
            {orcamentos.map((orcamento) => (
              <OrcamentoCard key={orcamento.id}>
                <OrcamentoInfo>
                  <span className="numero">
                    Orçamento {formatOrcamentoNumero(orcamento.numero, orcamento.dataEmissao, orcamento.versao)}
                  </span>
                  <span className="data">
                    Emissão: {formatDate(orcamento.dataEmissao)} |
                    Validade: {formatDate(orcamento.dataValidade)}
                  </span>
                  <span className="itens">
                    {(orcamento.itensCompleto?.length || 0)} {(orcamento.itensCompleto?.length || 0) === 1 ? 'item' : 'itens'}
                  </span>
                </OrcamentoInfo>
                <OrcamentoRight>
                  <ValorTotal>{formatCurrency(orcamento.valorTotal)}</ValorTotal>
                  <StatusBadge $status={orcamento.status}>
                    {statusLabels[orcamento.status]}
                  </StatusBadge>
                  <PDFButton onClick={() => gerarPDFOrcamento(orcamento)}>
                    Baixar PDF
                  </PDFButton>
                </OrcamentoRight>
              </OrcamentoCard>
            ))}
          </OrcamentosList>

          {resumo.total > LIMITE_ORCAMENTOS && (
            <ListaLimitadaInfo>
              Exibindo os {LIMITE_ORCAMENTOS} últimos orçamentos de {resumo.total} no total
            </ListaLimitadaInfo>
          )}

          <ResumoSection>
            <ResumoCard $variant="primary">
              <div className="label">Total de Orçamentos</div>
              <div className="value">{resumo.total}</div>
            </ResumoCard>
            <ResumoCard $variant="success">
              <div className="label">Aceitos</div>
              <div className="value">{resumo.aceitos}</div>
            </ResumoCard>
            <ResumoCard>
              <div className="label">Valor Total Aceitos</div>
              <div className="value">{formatCurrency(resumo.valorTotalAceitos)}</div>
            </ResumoCard>
          </ResumoSection>
        </>
      ) : (
        <EmptyState>
          <h3>Nenhum orçamento encontrado</h3>
          <p>Este cliente ainda não possui orçamentos cadastrados.</p>
        </EmptyState>
      )}
    </Modal>
  );
}
