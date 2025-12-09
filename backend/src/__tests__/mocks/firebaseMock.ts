// Mock de documento do Firestore
export const createMockDoc = (id: string, data: Record<string, unknown>) => ({
  id,
  exists: true,
  data: () => data,
});

// Mock de snapshot vazio
export const createEmptySnapshot = () => ({
  empty: true,
  docs: [],
});

// Mock de snapshot com documentos
export const createSnapshot = (docs: Array<{ id: string; data: Record<string, unknown> }>) => ({
  empty: docs.length === 0,
  docs: docs.map((doc) => createMockDoc(doc.id, doc.data)),
});

// Mock de referência de documento
export const createMockDocRef = (id: string) => ({
  id,
});

// Mock de coleção do Firestore
export const createMockCollection = () => {
  const mockGet = jest.fn();
  const mockAdd = jest.fn();
  const mockDoc = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();
  const mockStartAt = jest.fn();
  const mockEndAt = jest.fn();
  const mockUpdate = jest.fn();
  const mockDelete = jest.fn();

  const chainableMock = {
    get: mockGet,
    add: mockAdd,
    doc: mockDoc,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    startAt: mockStartAt,
    endAt: mockEndAt,
    update: mockUpdate,
    delete: mockDelete,
  };

  // Configurar encadeamento
  mockWhere.mockReturnValue(chainableMock);
  mockOrderBy.mockReturnValue(chainableMock);
  mockLimit.mockReturnValue(chainableMock);
  mockStartAt.mockReturnValue(chainableMock);
  mockEndAt.mockReturnValue(chainableMock);
  mockDoc.mockReturnValue({
    get: mockGet,
    update: mockUpdate,
    delete: mockDelete,
  });

  return {
    ...chainableMock,
    mocks: {
      mockGet,
      mockAdd,
      mockDoc,
      mockWhere,
      mockOrderBy,
      mockLimit,
      mockUpdate,
      mockDelete,
    },
  };
};
