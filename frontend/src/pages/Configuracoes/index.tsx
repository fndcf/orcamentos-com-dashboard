import { useState } from "react";
import { usePalavrasChave } from "../../hooks/usePalavrasChave";
import { useServicos } from "../../hooks/useServicos";
import { useCategoriasItem } from "../../hooks/useCategoriasItem";
import { useLimitacoes } from "../../hooks/useLimitacoes";
import { useConfiguracoesGerais } from "../../hooks/useConfiguracoesGerais";
import { Loading } from "../../components/ui";
import {
  EmpresaTab,
  PalavrasChaveTab,
  ServicosTab,
  CategoriasTab,
  LimitacoesTab,
} from "./tabs";
import { Container, PageHeader, TabsContainer, Tab } from "./styles";
import Footer from "@/components/layout/Footer";

type TabType =
  | "empresa"
  | "palavras"
  | "servicos"
  | "categorias"
  | "limitacoes";

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState<TabType>("empresa");

  // Verificação de loading para todas as queries
  const { isLoading: loadingPalavras } = usePalavrasChave();
  const { isLoading: loadingServicos } = useServicos();
  const { isLoading: loadingCategorias } = useCategoriasItem();
  const { isLoading: loadingLimitacoes } = useLimitacoes();
  const { isLoading: loadingConfiguracoes } = useConfiguracoesGerais();

  const isLoading =
    loadingPalavras ||
    loadingServicos ||
    loadingCategorias ||
    loadingLimitacoes ||
    loadingConfiguracoes;

  if (isLoading) {
    return (
      <Container>
        <PageHeader>
          <h1>Configurações</h1>
        </PageHeader>
        <Loading />
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader>
        <h1>Configurações</h1>
      </PageHeader>

      <TabsContainer>
        <Tab
          $active={activeTab === "empresa"}
          onClick={() => setActiveTab("empresa")}
        >
          Empresa
        </Tab>
        <Tab
          $active={activeTab === "palavras"}
          onClick={() => setActiveTab("palavras")}
        >
          Palavras-chave
        </Tab>
        <Tab
          $active={activeTab === "servicos"}
          onClick={() => setActiveTab("servicos")}
        >
          Serviços
        </Tab>
        <Tab
          $active={activeTab === "categorias"}
          onClick={() => setActiveTab("categorias")}
        >
          Categorias
        </Tab>
        <Tab
          $active={activeTab === "limitacoes"}
          onClick={() => setActiveTab("limitacoes")}
        >
          Observações
        </Tab>
      </TabsContainer>

      {activeTab === "empresa" && <EmpresaTab />}
      {activeTab === "palavras" && <PalavrasChaveTab />}
      {activeTab === "servicos" && <ServicosTab />}
      {activeTab === "categorias" && <CategoriasTab />}
      {activeTab === "limitacoes" && <LimitacoesTab />}
      {/* Footer */}
      <Footer />
    </Container>
  );
}
