import { useState } from "react";
import { BrasilAPICNPJ, Cliente } from "../../../types";
import {
  useCriarCliente,
  useBuscarCnpjBrasilAPI,
} from "../../../hooks/useClientes";
import { Button, Input, InputGroup, Label, InputRow } from "../../ui";
import {
  NovoClienteSection,
  NovoClienteHeader,
  DocumentRow,
  CheckboxRow,
  StatusMessage,
} from "./styles";

interface NovoClienteFormProps {
  onClienteCriado: (cliente: Cliente) => void;
  onCancelar: () => void;
}

const initialClienteForm = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  tipoPessoa: "juridica" as "fisica" | "juridica",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  telefone: "",
  email: "",
};

export function NovoClienteForm({ onClienteCriado }: NovoClienteFormProps) {
  const criarCliente = useCriarCliente();
  const buscarCnpj = useBuscarCnpjBrasilAPI();

  const [clienteForm, setClienteForm] = useState(initialClienteForm);
  const [clienteMessage, setClienteMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [salvandoCliente, setSalvandoCliente] = useState(false);

  const isPessoaFisica = clienteForm.tipoPessoa === "fisica";
  const maxDocLength = isPessoaFisica ? 14 : 18;

  const handleClienteFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Converter para maiúsculas todos os campos exceto email
    const finalValue = name === "email" ? value : value.toUpperCase();
    setClienteForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= maxDocLength) {
      setClienteForm((prev) => ({ ...prev, cnpj: value }));
    }
  };

  const handleTipoPessoaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tipoPessoa = e.target.checked ? "fisica" : "juridica";
    setClienteForm((prev) => ({
      ...prev,
      tipoPessoa,
      cnpj: "",
      nomeFantasia: "",
    }));
  };

  const handleBuscarCnpj = async () => {
    const cnpjLimpo = clienteForm.cnpj.replace(/\D/g, "");

    if (cnpjLimpo.length !== 14) {
      setClienteMessage({ type: "error", text: "CNPJ deve ter 14 dígitos" });
      return;
    }

    setClienteMessage({ type: "info", text: "Buscando dados do CNPJ..." });

    try {
      const dados = await buscarCnpj.mutateAsync(cnpjLimpo);

      if (dados) {
        preencherComDadosBrasilAPI(dados);
        setClienteMessage({
          type: "success",
          text: "Dados preenchidos automaticamente!",
        });
      } else {
        setClienteMessage({
          type: "error",
          text: "CNPJ não encontrado na base da Receita Federal",
        });
      }
    } catch {
      setClienteMessage({ type: "error", text: "Erro ao buscar CNPJ" });
    }
  };

  const preencherComDadosBrasilAPI = (dados: BrasilAPICNPJ) => {
    setClienteForm((prev) => {
      const endereco = dados.logradouro
        ? `${dados.logradouro}, ${dados.numero}${
            dados.complemento ? `, ${dados.complemento}` : ""
          }, ${dados.bairro}`
        : prev.endereco;

      return {
        ...prev,
        razaoSocial: (dados.razao_social || prev.razaoSocial).toUpperCase(),
        nomeFantasia: (dados.nome_fantasia || prev.nomeFantasia).toUpperCase(),
        endereco: endereco.toUpperCase(),
        cidade: (dados.municipio || prev.cidade).toUpperCase(),
        estado: (dados.uf || prev.estado).toUpperCase(),
        cep: dados.cep?.replace(/\D/g, "") || prev.cep,
        telefone:
          dados.telefone?.replace(/\D/g, "").slice(0, 11) || prev.telefone,
        email: dados.email || prev.email,
      };
    });
  };

  const handleSalvarCliente = async () => {
    // Validação do documento
    const docLimpo = clienteForm.cnpj.replace(/\D/g, "");

    if (isPessoaFisica) {
      // CPF é opcional, mas se foi digitado algo, deve ter 11 dígitos
      if (docLimpo && docLimpo.length !== 11) {
        setClienteMessage({
          type: "error",
          text: "CPF deve ter 11 dígitos",
        });
        return;
      }
    } else {
      // CNPJ é obrigatório e deve ter 14 dígitos
      if (!docLimpo || docLimpo.length !== 14) {
        setClienteMessage({
          type: "error",
          text: "CNPJ deve ter 14 dígitos",
        });
        return;
      }
    }

    if (!clienteForm.razaoSocial.trim()) {
      setClienteMessage({
        type: "error",
        text: isPessoaFisica
          ? "Nome é obrigatório"
          : "Razão Social é obrigatória",
      });
      return;
    }

    setSalvandoCliente(true);
    setClienteMessage({ type: "info", text: "Salvando cliente..." });

    try {
      const novoCliente = await criarCliente.mutateAsync(clienteForm);

      if (novoCliente.id) {
        onClienteCriado(novoCliente);
      } else {
        setClienteMessage({
          type: "error",
          text: "Erro ao obter ID do cliente criado",
        });
      }
    } catch (err: unknown) {
      // Extrair mensagem de erro do Axios ou Error genérico
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Erro ao salvar cliente";
      setClienteMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSalvandoCliente(false);
    }
  };

  return (
    <NovoClienteSection>
      <NovoClienteHeader>
        <h4>Cadastrar Novo Cliente</h4>
      </NovoClienteHeader>

      {clienteMessage && (
        <StatusMessage $type={clienteMessage.type}>
          {clienteMessage.text}
        </StatusMessage>
      )}

      <CheckboxRow>
        <input
          type="checkbox"
          checked={isPessoaFisica}
          onChange={handleTipoPessoaChange}
        />
        <span>Pessoa Física (CPF)</span>
      </CheckboxRow>

      <DocumentRow>
        <InputGroup>
          <Label htmlFor="cnpjInline">
            {isPessoaFisica ? "CPF" : "CNPJ *"}
          </Label>
          <Input
            id="cnpjInline"
            name="cnpj"
            value={clienteForm.cnpj}
            onChange={handleDocumentoChange}
            placeholder={
              isPessoaFisica ? "000.000.000-00" : "00.000.000/0000-00"
            }
            maxLength={maxDocLength}
          />
        </InputGroup>
        {!isPessoaFisica && (
          <Button
            type="button"
            $variant="secondary"
            onClick={handleBuscarCnpj}
            disabled={buscarCnpj.isLoading}
          >
            {buscarCnpj.isLoading ? "Buscando..." : "Buscar CNPJ"}
          </Button>
        )}
      </DocumentRow>

      <InputGroup>
        <Label htmlFor="razaoSocialInline">
          {isPessoaFisica ? "Nome *" : "Razão Social *"}
        </Label>
        <Input
          id="razaoSocialInline"
          name="razaoSocial"
          value={clienteForm.razaoSocial}
          onChange={handleClienteFormChange}
          placeholder={
            isPessoaFisica ? "Nome completo" : "Razão Social da Empresa"
          }
        />
      </InputGroup>

      {!isPessoaFisica && (
        <InputGroup>
          <Label htmlFor="nomeFantasiaInline">Nome Fantasia</Label>
          <Input
            id="nomeFantasiaInline"
            name="nomeFantasia"
            value={clienteForm.nomeFantasia}
            onChange={handleClienteFormChange}
            placeholder="Nome Fantasia"
          />
        </InputGroup>
      )}

      <InputGroup>
        <Label htmlFor="enderecoInline">Endereço</Label>
        <Input
          id="enderecoInline"
          name="endereco"
          value={clienteForm.endereco}
          onChange={handleClienteFormChange}
          placeholder="Rua, número, bairro"
        />
      </InputGroup>

      <InputRow>
        <InputGroup>
          <Label htmlFor="cidadeInline">Cidade</Label>
          <Input
            id="cidadeInline"
            name="cidade"
            value={clienteForm.cidade}
            onChange={handleClienteFormChange}
            placeholder="Cidade"
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="estadoInline">Estado</Label>
          <Input
            id="estadoInline"
            name="estado"
            value={clienteForm.estado}
            onChange={handleClienteFormChange}
            placeholder="UF"
            maxLength={2}
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="cepInline">CEP</Label>
          <Input
            id="cepInline"
            name="cep"
            value={clienteForm.cep}
            onChange={handleClienteFormChange}
            placeholder="00000-000"
          />
        </InputGroup>
      </InputRow>

      <InputRow>
        <InputGroup>
          <Label htmlFor="telefoneInline">Telefone</Label>
          <Input
            id="telefoneInline"
            name="telefone"
            value={clienteForm.telefone}
            onChange={handleClienteFormChange}
            placeholder="(00) 00000-0000"
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="emailInline">Email</Label>
          <Input
            id="emailInline"
            name="email"
            type="email"
            value={clienteForm.email}
            onChange={handleClienteFormChange}
            placeholder="email@exemplo.com"
          />
        </InputGroup>
      </InputRow>

      <div style={{ marginTop: "16px" }}>
        <Button
          type="button"
          onClick={handleSalvarCliente}
          disabled={salvandoCliente}
        >
          {salvandoCliente ? "Salvando..." : "Salvar Cliente e Continuar"}
        </Button>
      </div>
    </NovoClienteSection>
  );
}
