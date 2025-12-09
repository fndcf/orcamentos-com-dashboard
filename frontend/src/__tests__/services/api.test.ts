import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Mock do firebase antes de importar api
const mockSignOut = vi.fn();
const mockGetIdToken = vi.fn();

vi.mock('../../services/firebase', () => ({
  auth: {
    currentUser: null,
    signOut: mockSignOut,
  },
}));

// Capturar os interceptors
let requestInterceptor: ((config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>) | null = null;
let responseSuccessInterceptor: ((response: AxiosResponse) => AxiosResponse) | null = null;
let responseErrorInterceptor: ((error: any) => Promise<any>) | null = null;

// Mock do axios que captura os interceptors
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn((callback) => {
          requestInterceptor = callback;
          return 0;
        }),
      },
      response: {
        use: vi.fn((success, error) => {
          responseSuccessInterceptor = success;
          responseErrorInterceptor = error;
          return 0;
        }),
      },
    },
    defaults: {
      headers: {
        common: {},
      },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('api service', () => {
  let originalLocation: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    requestInterceptor = null;
    responseSuccessInterceptor = null;
    responseErrorInterceptor = null;

    // Mock do window.location
    originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    // Reset dos módulos para re-importar api
    vi.resetModules();
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  it('deve criar instância do axios com baseURL correta', async () => {
    await import('../../services/api');

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: expect.any(String),
    });
  });

  it('deve configurar interceptors de request e response', async () => {
    await import('../../services/api');

    expect(requestInterceptor).toBeDefined();
    expect(responseSuccessInterceptor).toBeDefined();
    expect(responseErrorInterceptor).toBeDefined();
  });
});

describe('api request interceptor', () => {
  let originalLocation: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    requestInterceptor = null;
    responseSuccessInterceptor = null;
    responseErrorInterceptor = null;

    originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    vi.resetModules();
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  it('não deve adicionar header Authorization quando não há usuário logado', async () => {
    // Mock sem usuário
    vi.doMock('../../services/firebase', () => ({
      auth: {
        currentUser: null,
        signOut: mockSignOut,
      },
    }));

    await import('../../services/api');

    const mockConfig: InternalAxiosRequestConfig = {
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    if (requestInterceptor) {
      const result = await requestInterceptor(mockConfig);
      expect(result.headers.Authorization).toBeUndefined();
    }
  });

  it('deve adicionar token de autorização quando usuário está logado', async () => {
    mockGetIdToken.mockResolvedValue('test-token-123');

    // Mock com usuário logado
    vi.doMock('../../services/firebase', () => ({
      auth: {
        currentUser: {
          getIdToken: mockGetIdToken,
        },
        signOut: mockSignOut,
      },
    }));

    await import('../../services/api');

    const mockConfig: InternalAxiosRequestConfig = {
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    if (requestInterceptor) {
      const result = await requestInterceptor(mockConfig);
      expect(result.headers.Authorization).toBe('Bearer test-token-123');
    }
  });
});

describe('api response interceptor', () => {
  let originalLocation: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    requestInterceptor = null;
    responseSuccessInterceptor = null;
    responseErrorInterceptor = null;

    originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    vi.resetModules();

    vi.doMock('../../services/firebase', () => ({
      auth: {
        currentUser: null,
        signOut: mockSignOut,
      },
    }));

    await import('../../services/api');
  });

  afterEach(() => {
    (window as any).location = originalLocation;
  });

  it('deve retornar response diretamente no caso de sucesso', () => {
    const mockResponse = { data: 'test', status: 200 } as AxiosResponse;

    if (responseSuccessInterceptor) {
      const result = responseSuccessInterceptor(mockResponse);
      expect(result).toBe(mockResponse);
    }
  });

  it('deve redirecionar para login em caso de erro 401', async () => {
    const mockError = { response: { status: 401 } };

    if (responseErrorInterceptor) {
      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(mockSignOut).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    }
  });

  it('deve rejeitar erros que não são 401 sem redirecionar', async () => {
    const mockError = { response: { status: 500 } };

    if (responseErrorInterceptor) {
      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(mockSignOut).not.toHaveBeenCalled();
      expect(window.location.href).not.toBe('/login');
    }
  });

  it('deve rejeitar erros de rede sem response', async () => {
    const mockError = { message: 'Network Error' };

    if (responseErrorInterceptor) {
      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(mockSignOut).not.toHaveBeenCalled();
    }
  });

  it('deve tratar erro 403 sem redirecionar', async () => {
    const mockError = { response: { status: 403 } };

    if (responseErrorInterceptor) {
      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(mockSignOut).not.toHaveBeenCalled();
    }
  });

  it('deve tratar erro 404 sem redirecionar', async () => {
    const mockError = { response: { status: 404 } };

    if (responseErrorInterceptor) {
      await expect(responseErrorInterceptor(mockError)).rejects.toEqual(mockError);
      expect(mockSignOut).not.toHaveBeenCalled();
    }
  });
});
