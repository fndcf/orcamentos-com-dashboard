// Setup global para os testes
// Mock do Firebase Admin
jest.mock('../config/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});
