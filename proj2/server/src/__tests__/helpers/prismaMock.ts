import { vi } from 'vitest';

type MockRecord = Record<string, any>;

const createMockFn = () => vi.fn();

export type PrismaMock = ReturnType<typeof createPrismaMock>;

export const createPrismaMock = () => {
  const mock: MockRecord = {};

  mock.user = {
    create: createMockFn(),
    findUnique: createMockFn(),
    findMany: createMockFn(),
  };
  mock.restaurant = {
    create: createMockFn(),
    findUnique: createMockFn(),
    findMany: createMockFn(),
  };
  mock.menuSection = {
    create: createMockFn(),
    findUnique: createMockFn(),
    update: createMockFn(),
    delete: createMockFn(),
  };
  mock.menuItem = {
    create: createMockFn(),
    findFirst: createMockFn(),
    findMany: createMockFn(),
    update: createMockFn(),
    delete: createMockFn(),
  };
  mock.menuItemChangeLog = {
    create: createMockFn(),
  };
  mock.order = {
    create: createMockFn(),
    findMany: createMockFn(),
    findUnique: createMockFn(),
    update: createMockFn(),
  };
  mock.orderItem = {
    create: createMockFn(),
  };

  const prismaMock = mock as PrismaMock;

  prismaMock.$transaction = vi.fn(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(prismaMock),
  );

  return prismaMock;
};

const resetDeepMock = (obj: MockRecord) => {
  Object.values(obj).forEach((value) => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset();
    } else if (value && typeof value === 'object') {
      resetDeepMock(value as MockRecord);
    }
  });
};

export const resetPrismaMock = (mock: PrismaMock) => {
  resetDeepMock(mock as unknown as MockRecord);
  mock.$transaction.mockImplementation(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(mock),
  );
};
