import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { Modal, Button } from "../ui";
import { NotificacaoDropdown } from "../notificacoes/NotificacaoDropdown";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: var(--secondary);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    padding: 0 12px;
    height: auto;
    min-height: 56px;
    flex-wrap: wrap;
    gap: 8px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
`;

const Logo = styled.div`
  color: var(--primary);
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 4px;
  }
`;

const NavButton = styled.button<{ $active?: boolean }>`
  background: ${(props) => (props.$active ? "var(--primary)" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.8)")};
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.$active ? "var(--primary)" : "rgba(255, 255, 255, 0.1)"};
    color: white;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
    flex: 1;
    text-align: center;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 6px;
  }
`;

const UserInfo = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;

    span {
      display: none;
    }
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
  }

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
`;

const Main = styled.main`
  flex: 1;
  background: var(--background);
  overflow-x: hidden;
`;

const LogoutModalContent = styled.div`
  text-align: center;

  p {
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
`;

const LogoutModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Container>
      <Header>
        <Logo onClick={() => navigate("/")}>FLAMA</Logo>

        <Nav>
          <NavButton $active={isActive("/")} onClick={() => navigate("/")}>
            Painel
          </NavButton>
          <NavButton
            $active={isActive("/clientes")}
            onClick={() => navigate("/clientes")}
          >
            Clientes
          </NavButton>
          <NavButton
            $active={isActive("/orcamentos")}
            onClick={() => navigate("/orcamentos")}
          >
            Orçamentos
          </NavButton>
          <NavButton
            $active={isActive("/relatorios")}
            onClick={() => navigate("/relatorios")}
          >
            Relatórios
          </NavButton>
        </Nav>

        <RightSection>
          <NotificacaoDropdown />

          <IconButton
            onClick={() => navigate("/configuracoes")}
            title="Configurações"
          >
            ⚙️
          </IconButton>

          <UserInfo>
            <span>{user?.email}</span>
            <LogoutButton onClick={() => setShowLogoutModal(true)}>
              Sair
            </LogoutButton>
          </UserInfo>
        </RightSection>
      </Header>

      <Main>
        <Outlet />
      </Main>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sair do Sistema"
        width="400px"
      >
        <LogoutModalContent>
          <p>Tem certeza que deseja sair do sistema?</p>
          <LogoutModalButtons>
            <Button $variant="ghost" onClick={() => setShowLogoutModal(false)}>
              Cancelar
            </Button>
            <Button $variant="danger" onClick={handleLogout}>
              Sair
            </Button>
          </LogoutModalButtons>
        </LogoutModalContent>
      </Modal>
    </Container>
  );
}
