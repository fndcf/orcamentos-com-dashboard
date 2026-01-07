import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Orcamento, OrcamentoStatus } from "../../types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import {
  formatCurrency,
  formatDate,
  formatDocument,
  formatPhone,
  formatOrcamentoNumero,
} from "../../utils/constants";
import { gerarPDFOrcamento, gerarPDFExecucao } from "./OrcamentoPDF";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const OrcamentoNumero = styled.div`
  .numero {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
  }

  .data {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-top: 4px;
  }

  @media (max-width: 768px) {
    .numero {
      font-size: 1.25rem;
    }
  }
`;

const StatusBadge = styled.span<{ $status: OrcamentoStatus }>`
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;

  ${({ $status }) => {
    switch ($status) {
      case "aberto":
        return `
          background: rgba(33, 150, 243, 0.1);
          color: #1976d2;
        `;
      case "aceito":
        return `
          background: rgba(76, 175, 80, 0.1);
          color: #388e3c;
        `;
      case "recusado":
        return `
          background: rgba(244, 67, 54, 0.1);
          color: #d32f2f;
        `;
      case "expirado":
        return `
          background: rgba(158, 158, 158, 0.1);
          color: #616161;
        `;
    }
  }}
`;

const Section = styled.div`
  margin-bottom: 20px;

  h4 {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const ClienteInfo = styled.div`
  background: var(--background);
  padding: 16px;
  border-radius: 8px;

  .nome {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 1.05rem;
    margin-bottom: 8px;
  }

  .details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);

    span {
      display: flex;
      flex-direction: column;
      gap: 2px;

      strong {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-secondary);
        font-weight: 500;
      }

      span {
        color: var(--text-primary);
      }
    }
  }

  @media (max-width: 768px) {
    padding: 12px;

    .details {
      grid-template-columns: 1fr;
    }
  }
`;

const ItensTable = styled.div`
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
`;

const ItemHeaderCompleto = styled.div`
  display: grid;
  grid-template-columns: 100px 120px 2fr 60px 60px 90px 90px 90px 90px;
  gap: 8px;
  padding: 12px 16px;
  background: var(--background);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ItemRowCompleto = styled.div`
  display: grid;
  grid-template-columns: 100px 120px 2fr 60px 60px 90px 90px 90px 90px;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;

  &:first-child {
    border-top: none;
  }

  .etapa {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }

  .categoria {
    color: var(--primary);
    font-weight: 500;
    font-size: 0.8rem;
  }

  .descricao {
    color: var(--text-primary);
  }

  .number {
    text-align: right;
    color: var(--text-secondary);
  }

  .valor {
    text-align: right;
    color: var(--text-primary);
    font-weight: 500;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px;
    background: var(--background);
    border-radius: 8px;
    margin: 8px 0;
    border: 1px solid var(--border);

    .descricao {
      font-weight: 500;
      font-size: 0.95rem;
    }
  }
`;

const MobileItemField = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;

    .label {
      color: var(--text-secondary);
    }
  }
`;

const DesktopOnly = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const TotaisCompletoSection = styled.div`
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
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);

      &.destaque {
        font-size: 1.3rem;
        color: var(--primary);
      }
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const InfoSection = styled.div`
  background: var(--background);
  padding: 16px;
  border-radius: 8px;

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: var(--text-secondary);
    }

    .value {
      color: var(--text-primary);
      font-weight: 500;
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const LimitacoesSection = styled.div`
  background: var(--background);
  padding: 16px;
  border-radius: 8px;

  ul {
    margin: 0;
    padding-left: 20px;
    color: var(--text-primary);

    li {
      margin-bottom: 8px;
      font-size: 0.9rem;
      line-height: 1.4;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;

    button {
      width: 100%;
    }
  }
`;

const ConsultorInfo = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
  font-size: 0.9rem;

  span {
    color: var(--text-secondary);

    strong {
      color: var(--text-primary);
      font-weight: 500;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const statusLabels: Record<OrcamentoStatus, string> = {
  aberto: "Aberto",
  aceito: "Aceito",
  recusado: "Recusado",
  expirado: "Expirado",
};

interface OrcamentoViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orcamento: Orcamento | null;
  onEdit?: (orcamento: Orcamento) => void;
  onDuplicate?: (orcamento: Orcamento) => void;
}

export function OrcamentoViewModal({
  isOpen,
  onClose,
  orcamento,
  onEdit,
  onDuplicate,
}: OrcamentoViewModalProps) {
  const navigate = useNavigate();

  if (!orcamento) return null;

  const handleGoToOrcamentos = () => {
    onClose();
    navigate("/orcamentos");
  };

  const handleEdit = () => {
    if (orcamento.status !== "aberto") {
      alert('Só é possível editar orçamentos com status "Aberto"');
      return;
    }
    if (onEdit) {
      onEdit(orcamento);
    } else {
      onClose();
      navigate(`/orcamentos?action=edit&id=${orcamento.id}`);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(orcamento);
    } else {
      onClose();
      navigate(`/orcamentos?action=duplicate&id=${orcamento.id}`);
    }
  };

  const handlePDF = () => {
    gerarPDFOrcamento(orcamento);
  };

  const handlePDFExecucao = () => {
    gerarPDFExecucao(orcamento);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Orçamento"
      size="xlarge"
    >
      <Header>
        <OrcamentoNumero>
          <div className="numero">Orçamento {formatOrcamentoNumero(orcamento.numero, orcamento.dataEmissao, orcamento.versao)}</div>
          <div className="data">
            Emitido em {formatDate(orcamento.dataEmissao)} | Válido até{" "}
            {formatDate(orcamento.dataValidade)}
          </div>
        </OrcamentoNumero>
        <StatusBadge $status={orcamento.status}>
          {statusLabels[orcamento.status]}
        </StatusBadge>
      </Header>

      <Section>
        <h4>Cliente</h4>
        <ClienteInfo>
          <div className="nome">{orcamento.clienteNome}</div>
          <div className="details">
            <span>
              <strong>CNPJ/CPF</strong>
              <span>{formatDocument(orcamento.clienteCnpj)}</span>
            </span>
            {orcamento.clienteEndereco && (
              <span>
                <strong>Endereço</strong>
                <span>
                  {orcamento.clienteEndereco}
                  {orcamento.clienteCidade && `, ${orcamento.clienteCidade}`}
                  {orcamento.clienteEstado && `/${orcamento.clienteEstado}`}
                </span>
              </span>
            )}
            {orcamento.clienteTelefone && (
              <span>
                <strong>Telefone</strong>
                <span>{formatPhone(orcamento.clienteTelefone)}</span>
              </span>
            )}
            {orcamento.clienteEmail && (
              <span>
                <strong>Email</strong>
                <span>{orcamento.clienteEmail}</span>
              </span>
            )}
          </div>
          {(orcamento.consultor || orcamento.contato) && (
            <ConsultorInfo>
              {orcamento.consultor && (
                <span>
                  Consultor: <strong>{orcamento.consultor}</strong>
                </span>
              )}
              {orcamento.contato && (
                <span>
                  Contato: <strong>{orcamento.contato}</strong>
                </span>
              )}
            </ConsultorInfo>
          )}
          {orcamento.enderecoServico && (
            <ConsultorInfo>
              <span>
                Endereço do Serviço: <strong>{orcamento.enderecoServico}</strong>
              </span>
            </ConsultorInfo>
          )}
        </ClienteInfo>
      </Section>

      {/* Seção de Serviço */}
      {orcamento.servicoDescricao && (
        <Section>
          <h4>Serviço</h4>
          <InfoSection>
            <div className="info-row">
              <span className="label">Tipo de Serviço</span>
              <span className="value">{orcamento.servicoDescricao}</span>
            </div>
          </InfoSection>
        </Section>
      )}

      {/* Itens do orçamento */}
      {orcamento.itensCompleto && (
        <Section>
          <h4>Itens do Orçamento (Mão de Obra e Material)</h4>
          <ItensTable>
            <ItemHeaderCompleto>
              <span>Etapa</span>
              <span>Categoria</span>
              <span>Descrição</span>
              <span style={{ textAlign: "right" }}>Qtd</span>
              <span style={{ textAlign: "right" }}>Unid</span>
              <span style={{ textAlign: "right" }}>M.O. Unit.</span>
              <span style={{ textAlign: "right" }}>Mat. Unit.</span>
              <span style={{ textAlign: "right" }}>Total M.O.</span>
              <span style={{ textAlign: "right" }}>Total Mat.</span>
            </ItemHeaderCompleto>
            {orcamento.itensCompleto.map((item, index) => (
              <ItemRowCompleto key={index}>
                <DesktopOnly className="etapa">
                  {item.etapa === "comercial" ? "Comercial" : "Residencial"}
                </DesktopOnly>
                <DesktopOnly className="categoria">
                  {item.categoriaNome}
                </DesktopOnly>
                <span className="descricao">{item.descricao}</span>
                <DesktopOnly className="number">{item.quantidade}</DesktopOnly>
                <DesktopOnly className="number">{item.unidade}</DesktopOnly>
                <DesktopOnly className="valor">
                  {formatCurrency(item.valorUnitarioMaoDeObra)}
                </DesktopOnly>
                <DesktopOnly className="valor">
                  {formatCurrency(item.valorUnitarioMaterial)}
                </DesktopOnly>
                <DesktopOnly className="valor">
                  {formatCurrency(item.valorTotalMaoDeObra)}
                </DesktopOnly>
                <DesktopOnly className="valor">
                  {formatCurrency(item.valorTotalMaterial)}
                </DesktopOnly>
                <MobileItemField>
                  <span className="label">Etapa:</span>
                  <span>
                    {item.etapa === "comercial" ? "Comercial" : "Residencial"}
                  </span>
                </MobileItemField>
                <MobileItemField>
                  <span className="label">Categoria:</span>
                  <span>{item.categoriaNome}</span>
                </MobileItemField>
                <MobileItemField>
                  <span className="label">Quantidade:</span>
                  <span>
                    {item.quantidade} {item.unidade}
                  </span>
                </MobileItemField>
                <MobileItemField>
                  <span className="label">M.O. Unitário:</span>
                  <span>{formatCurrency(item.valorUnitarioMaoDeObra)}</span>
                </MobileItemField>
                <MobileItemField>
                  <span className="label">Mat. Unitário:</span>
                  <span>{formatCurrency(item.valorUnitarioMaterial)}</span>
                </MobileItemField>
                <MobileItemField>
                  <span className="label">Total M.O.:</span>
                  <span>{formatCurrency(item.valorTotalMaoDeObra)}</span>
                </MobileItemField>
                <MobileItemField>
                  <span className="label">Total Material:</span>
                  <strong>{formatCurrency(item.valorTotalMaterial)}</strong>
                </MobileItemField>
              </ItemRowCompleto>
            ))}
          </ItensTable>
          <TotaisCompletoSection>
            <div className="total-item">
              <div className="label">Total Mão de Obra</div>
              <div className="value">
                {formatCurrency(orcamento.valorTotalMaoDeObra || 0)}
              </div>
            </div>
            <div className="total-item">
              <div className="label">Total Material</div>
              <div className="value">
                {formatCurrency(orcamento.valorTotalMaterial || 0)}
              </div>
            </div>
            <div className="total-item">
              <div className="label">Total Geral</div>
              <div className="value destaque">
                {formatCurrency(orcamento.valorTotal)}
              </div>
            </div>
          </TotaisCompletoSection>
        </Section>
      )}

      {/* Limitações */}
      {orcamento.limitacoesSelecionadas &&
        orcamento.limitacoesSelecionadas.length > 0 && (
          <Section>
            <h4>Limitações do Escopo</h4>
            <LimitacoesSection>
              <ul>
                {orcamento.limitacoesSelecionadas.map((limitacao, index) => (
                  <li key={index}>{limitacao}</li>
                ))}
              </ul>
            </LimitacoesSection>
          </Section>
        )}

      {/* Prazos e Condições */}
      <Section>
        <h4>Prazos e Condições</h4>
        <InfoSection>
          {orcamento.prazoExecucaoServicos && (
            <div className="info-row">
              <span className="label">Prazo de Execução dos Serviços</span>
              <span className="value">
                {orcamento.prazoExecucaoServicos} dias úteis (podendo ser
                intercalados)
              </span>
            </div>
          )}
          {orcamento.prazoVistoriaBombeiros && (
            <div className="info-row">
              <span className="label">
                Prazo para Vistoria do Corpo de Bombeiros
              </span>
              <span className="value">
                {orcamento.prazoVistoriaBombeiros} dias (após gerado o
                protocolo)
              </span>
            </div>
          )}
          <div className="info-row">
            <span className="label">Condição de Pagamento</span>
            <span className="value">
              {orcamento.condicaoPagamento === "parcelado"
                ? orcamento.parcelamentoTexto || "Parcelado"
                : "A combinar"}
            </span>
          </div>
        </InfoSection>
      </Section>

      <ActionButtons>
        <Button $variant="ghost" onClick={handleGoToOrcamentos}>
          Ir para Orçamentos
        </Button>
        <Button
          $variant="primary"
          onClick={handlePDF}
          style={{ background: "#9333ea" }}
        >
          Gerar PDF
        </Button>
        {orcamento.status === "aceito" && (
          <Button
            $variant="primary"
            onClick={handlePDFExecucao}
            style={{ background: "#ea580c", color: "white" }}
          >
            PDF Execução
          </Button>
        )}
        {orcamento.status === "aberto" && (
          <Button $variant="primary" onClick={handleEdit}>
            Editar
          </Button>
        )}
        <Button
          $variant="secondary"
          onClick={handleDuplicate}
          style={{ background: "#059669", color: "white" }}
        >
          Duplicar
        </Button>
      </ActionButtons>
    </Modal>
  );
}
