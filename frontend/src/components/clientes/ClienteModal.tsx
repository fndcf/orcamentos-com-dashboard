import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Cliente, BrasilAPICNPJ } from '../../types';
import { Modal, Button, Input, InputGroup, Label, InputRow } from '../ui';
import { useBuscarCnpjBrasilAPI } from '../../hooks/useClientes';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DocumentRow = styled.div`
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

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    cursor: pointer;
  }
`;

const StatusMessage = styled.p<{ $type: 'success' | 'error' | 'info' }>`
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

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Cliente, 'id' | 'createdAt'>) => Promise<void>;
  cliente?: Cliente | null;
  loading?: boolean;
}

const initialForm = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  tipoPessoa: 'juridica' as 'fisica' | 'juridica',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  telefone: '',
  email: '',
};

export function ClienteModal({ isOpen, onClose, onSave, cliente, loading }: ClienteModalProps) {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const buscarCnpj = useBuscarCnpjBrasilAPI();

  const isPessoaFisica = form.tipoPessoa === 'fisica';
  const maxDocLength = isPessoaFisica ? 11 : 14;

  useEffect(() => {
    if (cliente) {
      // Detectar se é CPF ou CNPJ baseado no tamanho
      const docLimpo = cliente.cnpj?.replace(/\D/g, '') || '';
      const tipoPessoa = docLimpo.length <= 11 ? 'fisica' : 'juridica';

      setForm({
        razaoSocial: cliente.razaoSocial || '',
        nomeFantasia: cliente.nomeFantasia || '',
        cnpj: cliente.cnpj || '',
        tipoPessoa,
        endereco: cliente.endereco || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        cep: cliente.cep || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
      });
    } else {
      setForm(initialForm);
    }
    setMessage(null);
  }, [cliente, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= maxDocLength) {
      setForm((prev) => ({ ...prev, cnpj: value }));
    }
  };

  const handleTipoPessoaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tipoPessoa = e.target.checked ? 'fisica' : 'juridica';
    // Limpar documento ao trocar tipo
    setForm((prev) => ({ ...prev, tipoPessoa, cnpj: '', nomeFantasia: '' }));
  };

  const handleBuscarCnpj = async () => {
    const cnpjLimpo = form.cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      setMessage({ type: 'error', text: 'CNPJ deve ter 14 dígitos' });
      return;
    }

    setMessage({ type: 'info', text: 'Buscando dados do CNPJ...' });

    try {
      const dados = await buscarCnpj.mutateAsync(cnpjLimpo);

      if (dados) {
        preencherComDadosBrasilAPI(dados);
        setMessage({ type: 'success', text: 'Dados preenchidos automaticamente!' });
      } else {
        setMessage({ type: 'error', text: 'CNPJ não encontrado na base da Receita Federal' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao buscar CNPJ' });
    }
  };

  const preencherComDadosBrasilAPI = (dados: BrasilAPICNPJ) => {
    setForm((prev) => ({
      ...prev,
      razaoSocial: dados.razao_social || prev.razaoSocial,
      nomeFantasia: dados.nome_fantasia || prev.nomeFantasia,
      endereco: dados.logradouro
        ? `${dados.logradouro}, ${dados.numero}${dados.complemento ? `, ${dados.complemento}` : ''}, ${dados.bairro}`
        : prev.endereco,
      cidade: dados.municipio || prev.cidade,
      estado: dados.uf || prev.estado,
      cep: dados.cep?.replace(/\D/g, '') || prev.cep,
      telefone: dados.telefone?.replace(/\D/g, '').slice(0, 11) || prev.telefone,
      email: dados.email || prev.email,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await onSave(form);
      onClose();
    } catch (err) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar cliente' });
    }
  };

  const footer = (
    <>
      <Button type="button" $variant="ghost" onClick={onClose} disabled={loading}>
        Cancelar
      </Button>
      <Button type="submit" form="cliente-form" disabled={loading}>
        {loading ? 'Salvando...' : cliente ? 'Atualizar' : 'Cadastrar'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cliente ? 'Editar Cliente' : 'Novo Cliente'}
      footer={footer}
      width="600px"
    >
      <Form id="cliente-form" onSubmit={handleSubmit}>
        {message && <StatusMessage $type={message.type}>{message.text}</StatusMessage>}

        <CheckboxRow>
          <input
            type="checkbox"
            id="tipoPessoa"
            checked={isPessoaFisica}
            onChange={handleTipoPessoaChange}
          />
          <label htmlFor="tipoPessoa">Pessoa Física (CPF)</label>
        </CheckboxRow>

        <DocumentRow>
          <InputGroup>
            <Label htmlFor="cnpj">{isPessoaFisica ? 'CPF' : 'CNPJ *'}</Label>
            <Input
              id="cnpj"
              name="cnpj"
              value={form.cnpj}
              onChange={handleDocumentoChange}
              placeholder={isPessoaFisica ? '000.000.000-00' : '00.000.000/0000-00'}
              maxLength={maxDocLength}
              required={!isPessoaFisica}
            />
          </InputGroup>
          {!isPessoaFisica && (
            <Button
              type="button"
              $variant="secondary"
              onClick={handleBuscarCnpj}
              disabled={buscarCnpj.isLoading}
            >
              {buscarCnpj.isLoading ? 'Buscando...' : 'Buscar CNPJ'}
            </Button>
          )}
        </DocumentRow>

        <InputGroup>
          <Label htmlFor="razaoSocial">{isPessoaFisica ? 'Nome *' : 'Razão Social *'}</Label>
          <Input
            id="razaoSocial"
            name="razaoSocial"
            value={form.razaoSocial}
            onChange={handleChange}
            placeholder={isPessoaFisica ? 'Nome completo' : 'Razão Social da Empresa'}
            required
          />
        </InputGroup>

        {!isPessoaFisica && (
          <InputGroup>
            <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
            <Input
              id="nomeFantasia"
              name="nomeFantasia"
              value={form.nomeFantasia}
              onChange={handleChange}
              placeholder="Nome Fantasia"
            />
          </InputGroup>
        )}

        <InputGroup>
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            placeholder="Rua, número, bairro"
          />
        </InputGroup>

        <InputRow>
          <InputGroup>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              placeholder="Cidade"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              placeholder="UF"
              maxLength={2}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              name="cep"
              value={form.cep}
              onChange={handleChange}
              placeholder="00000-000"
            />
          </InputGroup>
        </InputRow>

        <InputRow>
          <InputGroup>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
            />
          </InputGroup>
        </InputRow>
      </Form>
    </Modal>
  );
}
