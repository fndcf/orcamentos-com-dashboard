import { useState, useEffect } from 'react';
import {
  useConfiguracoesGerais,
  useAtualizarConfiguracoesGerais,
} from '../../../hooks/useConfiguracoesGerais';
import { useBuscarCnpjBrasilAPI } from '../../../hooks/useClientes';
import { Button, Input } from '../../../components/ui';
import { ConfiguracoesGerais, BrasilAPICNPJ } from '../../../types';
import { logger } from '../../../utils/logger';
import {
  Section,
  FormGroup,
  FormRow,
  Label,
  HelpText,
  CnpjRow,
  Message,
} from '../styles';

export function EmpresaTab() {
  const { data: configuracoesGerais } = useConfiguracoesGerais();
  const atualizarConfiguracoes = useAtualizarConfiguracoesGerais();
  const buscarCnpj = useBuscarCnpjBrasilAPI();

  const [empresaForm, setEmpresaForm] = useState<Partial<ConfiguracoesGerais>>({
    nomeEmpresa: '',
    cnpjEmpresa: '',
    enderecoEmpresa: '',
    telefoneEmpresa: '',
    emailEmpresa: '',
    diasValidadeOrcamento: 30,
    parcelamentoMaxParcelas: 6,
    parcelamentoValorMinimo: 1000,
    parcelamentoJurosAPartirDe: 3,
    parcelamentoTaxaJuros: 2.5,
    custoFixoMensal: 0,
    impostoMaterial: 0,
    impostoServico: 0,
  });
  const [empresaFormDirty, setEmpresaFormDirty] = useState(false);
  const [empresaSaving, setEmpresaSaving] = useState(false);
  const [empresaMessage, setEmpresaMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (configuracoesGerais) {
      setEmpresaForm({
        nomeEmpresa: configuracoesGerais.nomeEmpresa || '',
        cnpjEmpresa: configuracoesGerais.cnpjEmpresa || '',
        enderecoEmpresa: configuracoesGerais.enderecoEmpresa || '',
        telefoneEmpresa: configuracoesGerais.telefoneEmpresa || '',
        emailEmpresa: configuracoesGerais.emailEmpresa || '',
        diasValidadeOrcamento: configuracoesGerais.diasValidadeOrcamento || 30,
        parcelamentoMaxParcelas: configuracoesGerais.parcelamentoMaxParcelas ?? 6,
        parcelamentoValorMinimo: configuracoesGerais.parcelamentoValorMinimo ?? 1000,
        parcelamentoJurosAPartirDe: configuracoesGerais.parcelamentoJurosAPartirDe ?? 3,
        parcelamentoTaxaJuros: configuracoesGerais.parcelamentoTaxaJuros ?? 2.5,
        custoFixoMensal: configuracoesGerais.custoFixoMensal ?? 0,
        impostoMaterial: configuracoesGerais.impostoMaterial ?? 0,
        impostoServico: configuracoesGerais.impostoServico ?? 0,
      });
      setEmpresaFormDirty(false);
    }
  }, [configuracoesGerais]);

  const handleEmpresaFormChange = (field: keyof ConfiguracoesGerais, value: string | number) => {
    setEmpresaForm(prev => ({ ...prev, [field]: value }));
    setEmpresaFormDirty(true);
  };

  const handleSalvarEmpresa = async () => {
    try {
      setEmpresaSaving(true);
      setEmpresaMessage(null);
      await atualizarConfiguracoes.mutateAsync(empresaForm);
      setEmpresaFormDirty(false);
      setEmpresaMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      logger.error('Erro ao salvar configurações da empresa', { error });
      setEmpresaMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setEmpresaSaving(false);
    }
  };

  const formatarCNPJ = (value: string) => {
    const numeros = value.replace(/\D/g, '').slice(0, 14);
    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const formatarTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 10) {
      return numeros
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const preencherComDadosBrasilAPI = (dados: BrasilAPICNPJ) => {
    setEmpresaForm((prev) => ({
      ...prev,
      nomeEmpresa: dados.razao_social || prev.nomeEmpresa,
      enderecoEmpresa: dados.logradouro
        ? `${dados.logradouro}, ${dados.numero}${dados.complemento ? `, ${dados.complemento}` : ''}, ${dados.bairro} - ${dados.municipio}/${dados.uf} - CEP ${dados.cep}`
        : prev.enderecoEmpresa,
      telefoneEmpresa: dados.telefone ? formatarTelefone(dados.telefone.replace(/\D/g, '').slice(0, 11)) : prev.telefoneEmpresa,
      emailEmpresa: dados.email || prev.emailEmpresa,
    }));
    setEmpresaFormDirty(true);
  };

  const handleBuscarCNPJ = async () => {
    const cnpjLimpo = (empresaForm.cnpjEmpresa || '').replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      setEmpresaMessage({ type: 'error', text: 'Digite um CNPJ válido com 14 dígitos' });
      return;
    }

    setEmpresaMessage({ type: 'info', text: 'Buscando dados do CNPJ...' });

    try {
      const dados = await buscarCnpj.mutateAsync(cnpjLimpo);

      if (dados) {
        preencherComDadosBrasilAPI(dados);
        setEmpresaMessage({ type: 'success', text: 'Dados preenchidos automaticamente!' });
      } else {
        setEmpresaMessage({ type: 'error', text: 'CNPJ não encontrado na base da Receita Federal' });
      }
    } catch {
      setEmpresaMessage({ type: 'error', text: 'Erro ao buscar CNPJ' });
    }
  };

  const handleCancelar = () => {
    if (configuracoesGerais) {
      setEmpresaForm({
        nomeEmpresa: configuracoesGerais.nomeEmpresa || '',
        cnpjEmpresa: configuracoesGerais.cnpjEmpresa || '',
        enderecoEmpresa: configuracoesGerais.enderecoEmpresa || '',
        telefoneEmpresa: configuracoesGerais.telefoneEmpresa || '',
        emailEmpresa: configuracoesGerais.emailEmpresa || '',
        diasValidadeOrcamento: configuracoesGerais.diasValidadeOrcamento || 30,
        parcelamentoMaxParcelas: configuracoesGerais.parcelamentoMaxParcelas ?? 6,
        parcelamentoValorMinimo: configuracoesGerais.parcelamentoValorMinimo ?? 1000,
        parcelamentoJurosAPartirDe: configuracoesGerais.parcelamentoJurosAPartirDe ?? 3,
        parcelamentoTaxaJuros: configuracoesGerais.parcelamentoTaxaJuros ?? 2.5,
        custoFixoMensal: configuracoesGerais.custoFixoMensal ?? 0,
        impostoMaterial: configuracoesGerais.impostoMaterial ?? 0,
        impostoServico: configuracoesGerais.impostoServico ?? 0,
      });
      setEmpresaFormDirty(false);
    }
  };

  return (
    <Section>
      <div style={{ marginBottom: 16 }}>
        <h2>Dados da Empresa</h2>
        <p className="description">
          Configure os dados da sua empresa que serão utilizados nos orçamentos e documentos gerados pelo sistema.
        </p>
      </div>

      {empresaMessage && (
        <Message $type={empresaMessage.type}>{empresaMessage.text}</Message>
      )}

      <CnpjRow style={{ marginBottom: 16 }}>
        <FormGroup>
          <Label>CNPJ</Label>
          <Input
            value={empresaForm.cnpjEmpresa || ''}
            onChange={(e) => handleEmpresaFormChange('cnpjEmpresa', formatarCNPJ(e.target.value))}
            placeholder="00.000.000/0000-00"
          />
        </FormGroup>
        <Button
          type="button"
          onClick={handleBuscarCNPJ}
          disabled={buscarCnpj.isLoading || (empresaForm.cnpjEmpresa || '').replace(/\D/g, '').length !== 14}
          $variant="secondary"
        >
          {buscarCnpj.isLoading ? 'Buscando...' : 'Buscar CNPJ'}
        </Button>
      </CnpjRow>

      <FormGroup style={{ marginBottom: 16 }}>
        <Label>Nome da Empresa *</Label>
        <Input
          value={empresaForm.nomeEmpresa || ''}
          onChange={(e) => handleEmpresaFormChange('nomeEmpresa', e.target.value)}
          placeholder="Ex: FLAMA Proteção Contra Incêndio"
        />
      </FormGroup>

      <FormGroup style={{ marginBottom: 16 }}>
        <Label>Endereço Completo</Label>
        <Input
          value={empresaForm.enderecoEmpresa || ''}
          onChange={(e) => handleEmpresaFormChange('enderecoEmpresa', e.target.value)}
          placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP - CEP 01234-567"
        />
      </FormGroup>

      <FormRow style={{ marginBottom: 16 }}>
        <FormGroup>
          <Label>Email</Label>
          <Input
            type="email"
            value={empresaForm.emailEmpresa || ''}
            onChange={(e) => handleEmpresaFormChange('emailEmpresa', e.target.value)}
            placeholder="contato@empresa.com.br"
          />
        </FormGroup>
        <FormGroup>
          <Label>Telefone</Label>
          <Input
            value={empresaForm.telefoneEmpresa || ''}
            onChange={(e) => handleEmpresaFormChange('telefoneEmpresa', formatarTelefone(e.target.value))}
            placeholder="(11) 99999-9999"
          />
        </FormGroup>
      </FormRow>

      <FormGroup style={{ marginBottom: 24, maxWidth: 200 }}>
        <Label>Dias de Validade do Orçamento</Label>
        <Input
          type="number"
          value={empresaForm.diasValidadeOrcamento || 30}
          onChange={(e) => handleEmpresaFormChange('diasValidadeOrcamento', parseInt(e.target.value) || 30)}
          min="1"
          max="365"
        />
        <HelpText>Padrão de validade para novos orçamentos</HelpText>
      </FormGroup>

      {/* Configurações de Parcelamento */}
      <div style={{ marginBottom: 16, marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <h2>Configurações de Parcelamento</h2>
        <p className="description">
          Configure as regras de parcelamento que serão aplicadas nos orçamentos completos.
        </p>
      </div>

      <FormRow style={{ marginBottom: 16 }}>
        <FormGroup>
          <Label>Máximo de Parcelas</Label>
          <Input
            type="number"
            value={empresaForm.parcelamentoMaxParcelas ?? 6}
            onChange={(e) => handleEmpresaFormChange('parcelamentoMaxParcelas', parseInt(e.target.value) || 6)}
            min="1"
            max="24"
            style={{ maxWidth: 100 }}
          />
          <HelpText>Número máximo de parcelas permitidas</HelpText>
        </FormGroup>
        <FormGroup>
          <Label>Valor Mínimo por Parcela (R$)</Label>
          <Input
            type="number"
            value={empresaForm.parcelamentoValorMinimo ?? 1000}
            onChange={(e) => handleEmpresaFormChange('parcelamentoValorMinimo', parseInt(e.target.value) || 1000)}
            min="0"
            step="100"
            style={{ maxWidth: 150 }}
          />
          <HelpText>Valor mínimo de cada parcela</HelpText>
        </FormGroup>
      </FormRow>

      <FormRow style={{ marginBottom: 24 }}>
        <FormGroup>
          <Label>Juros a partir da parcela</Label>
          <Input
            type="number"
            value={empresaForm.parcelamentoJurosAPartirDe ?? 3}
            onChange={(e) => handleEmpresaFormChange('parcelamentoJurosAPartirDe', parseInt(e.target.value) || 3)}
            min="1"
            max="24"
            style={{ maxWidth: 100 }}
          />
          <HelpText>A partir de qual parcela aplicar juros</HelpText>
        </FormGroup>
        <FormGroup>
          <Label>Taxa de Juros por Parcela (%)</Label>
          <Input
            type="number"
            value={empresaForm.parcelamentoTaxaJuros ?? 2.5}
            onChange={(e) => handleEmpresaFormChange('parcelamentoTaxaJuros', parseFloat(e.target.value) || 2.5)}
            min="0"
            max="100"
            step="0.1"
            style={{ maxWidth: 100 }}
          />
          <HelpText>Percentual de juros por parcela após o limite</HelpText>
        </FormGroup>
      </FormRow>

      {/* Custo Fixo Mensal */}
      <div style={{ marginBottom: 16, marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <h2>Custo Fixo da Empresa</h2>
        <p className="description">
          Configure o custo fixo mensal da empresa para cálculo do lucro líquido nos relatórios.
        </p>
      </div>

      <FormGroup style={{ marginBottom: 24, maxWidth: 250 }}>
        <Label>Custo Fixo Mensal (R$)</Label>
        <Input
          type="number"
          value={empresaForm.custoFixoMensal ?? 0}
          onChange={(e) => handleEmpresaFormChange('custoFixoMensal', parseFloat(e.target.value) || 0)}
          min="0"
          step="100"
        />
        <HelpText>Valor usado para calcular o lucro líquido nos relatórios</HelpText>
      </FormGroup>

      {/* Impostos */}
      <div style={{ marginBottom: 16, marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <h2>Impostos</h2>
        <p className="description">
          Configure os percentuais de impostos que incidem sobre material e serviço para cálculo do lucro real.
        </p>
      </div>

      <FormRow style={{ marginBottom: 24 }}>
        <FormGroup>
          <Label>Imposto sobre Material (%)</Label>
          <Input
            type="number"
            value={empresaForm.impostoMaterial ?? 0}
            onChange={(e) => handleEmpresaFormChange('impostoMaterial', parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
            style={{ maxWidth: 120 }}
          />
          <HelpText>Percentual de imposto sobre vendas de material</HelpText>
        </FormGroup>
        <FormGroup>
          <Label>Imposto sobre Serviço (%)</Label>
          <Input
            type="number"
            value={empresaForm.impostoServico ?? 0}
            onChange={(e) => handleEmpresaFormChange('impostoServico', parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
            style={{ maxWidth: 120 }}
          />
          <HelpText>Percentual de imposto sobre mão de obra/serviços</HelpText>
        </FormGroup>
      </FormRow>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button
          onClick={handleSalvarEmpresa}
          disabled={!empresaFormDirty || empresaSaving}
        >
          {empresaSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
        {empresaFormDirty && (
          <Button $variant="ghost" onClick={handleCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </Section>
  );
}
