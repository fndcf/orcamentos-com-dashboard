import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../contexts/AuthContext";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--secondary) 0%,
    var(--secondary-light) 100%
  );
  padding: 16px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const LoginCard = styled.div`
  background: var(--surface);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 8px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;

  h1 {
    color: var(--primary);
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    margin-bottom: 24px;

    h1 {
      font-size: 2rem;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 500;
    color: var(--text-primary);
  }

  input {
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--primary);
    }
  }
`;

const Button = styled.button`
  background: var(--primary);
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
  margin-top: 8px;

  &:hover {
    background: var(--primary-dark);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  text-align: center;
  background: rgba(244, 67, 54, 0.1);
  padding: 10px;
  border-radius: 8px;
`;

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError("Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Logo>
          <h1>FLAMA</h1>
          <p>Sistema de Orçamentos</p>
        </Logo>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </InputGroup>

          <InputGroup>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Form>
      </LoginCard>
    </Container>
  );
}
