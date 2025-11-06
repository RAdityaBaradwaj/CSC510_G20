import { OrderStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '../errors/HttpError';
import {
  createOrder,
  getOrderForCustomer,
  listOrdersForRestaurant,
  listOrdersForUser,
  updateOrderStatusForRestaurant,
} from '../services/orderService';

type PrismaMock = ReturnType<typeof createPrismaMock>;

function createPrismaMock(): PrismaMock {
  const mock: Record<string, any> = {};
  mock.user = { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() };
  mock.restaurant = { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() };
  mock.menuSection = {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  mock.menuItem = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  mock.menuItemChangeLog = { create: vi.fn() };
  mock.order = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  const prismaMock = mock as PrismaMock;
  prismaMock.$transaction = vi.fn(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(prismaMock),
  );
  return prismaMock;
}

function resetDeepMocks(obj: Record<string, any>) {
  Object.values(obj).forEach((value) => {
    if (typeof value === 'function' && 'mockReset' in value) {
      value.mockReset();
    } else if (value && typeof value === 'object') {
      resetDeepMocks(value as Record<string, any>);
    }
  });
}

function resetPrismaMock(mock: PrismaMock) {
  resetDeepMocks(mock as Record<string, any>);
  mock.$transaction.mockImplementation(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(mock),
  );
}

const prisma: PrismaMock = vi.hoisted(() => createPrismaMock());

vi.mock('../lib/prisma', () => ({
  prisma,
}));

describe('services/orderService', () => {
  beforeEach(() => {
    resetPrismaMock(prisma);
  });

  const restaurant = {
    id: 'rest-1',
    isActive: true,
  };

  const menuItems = [
    { id: 'item-1', restaurantId: 'rest-1', priceCents: 700, isAvailable: true },
    { id: 'item-2', restaurantId: 'rest-1', priceCents: 500, isAvailable: true },
  ];

  it('creates an order for available items', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(restaurant as any);
    prisma.menuItem.findMany.mockResolvedValue(menuItems as any);
    prisma.order.create.mockResolvedValue({ id: 'order-1', totalCents: 1900 } as any);

    const order = await createOrder('user-1', {
      restaurantId: 'rest-1',
      items: [
        { menuItemId: 'item-1', quantity: 2 },
        { menuItemId: 'item-2', quantity: 1 },
      ],
      pickupEtaMin: 15,
      routeOrigin: 'Campus',
      routeDestination: 'Downtown',
    });

    expect(order.id).toBe('order-1');
    expect(prisma.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        customerId: 'user-1',
        restaurantId: 'rest-1',
        totalCents: 1900,
        items: {
          create: [
            { menuItemId: 'item-1', quantity: 2, priceCents: 700 },
            { menuItemId: 'item-2', quantity: 1, priceCents: 500 },
          ],
        },
      }),
      include: {
        items: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
      },
    });
  });

  it('throws 404 when restaurant is missing or inactive', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(null);
    await expect(
      createOrder('user-1', {
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'item-1', quantity: 1 }],
        pickupEtaMin: 10,
        routeOrigin: 'Campus',
        routeDestination: 'Downtown',
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('throws when menu items are missing or unavailable', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(restaurant as any);
    prisma.menuItem.findMany.mockResolvedValue([menuItems[0]] as any);
    await expect(
      createOrder('user-1', {
        restaurantId: 'rest-1',
        items: [
          { menuItemId: 'item-1', quantity: 1 },
          { menuItemId: 'missing', quantity: 1 },
        ],
        pickupEtaMin: 10,
        routeOrigin: 'Campus',
        routeDestination: 'Downtown',
      }),
    ).rejects.toMatchObject({ status: 400, message: 'Some menu items are unavailable' });
  });

  it('calculates totals using item quantities and prices', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(restaurant as any);
    prisma.menuItem.findMany.mockResolvedValue(menuItems as any);
    prisma.order.create.mockResolvedValue({ id: 'order-1', totalCents: 1900 } as any);

    await createOrder('user-1', {
      restaurantId: 'rest-1',
      items: [
        { menuItemId: 'item-1', quantity: 1 },
        { menuItemId: 'item-2', quantity: 3 },
      ],
      pickupEtaMin: 10,
      routeOrigin: 'Campus',
      routeDestination: 'Downtown',
    });

    const createArgs = prisma.order.create.mock.calls[0][0];
    expect(createArgs.data.totalCents).toBe(1 * 700 + 3 * 500);
  });

  it('lists orders for a customer', async () => {
    const orders = [{ id: 'order-1' }];
    prisma.order.findMany.mockResolvedValue(orders as any);
    const result = await listOrdersForUser('user-1');
    expect(result).toBe(orders);
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { customerId: 'user-1' },
      include: {
        restaurant: {
          select: { id: true, name: true, address: true, latitude: true, longitude: true },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('lists orders for a restaurant', async () => {
    const orders = [{ id: 'order-1' }];
    prisma.order.findMany.mockResolvedValue(orders as any);
    const result = await listOrdersForRestaurant('rest-1');
    expect(result).toBe(orders);
    expect(prisma.order.findMany).toHaveBeenCalledWith({
      where: { restaurantId: 'rest-1' },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });
  });

  const statusTransitions: Array<[OrderStatus, OrderStatus]> = [
    [OrderStatus.PENDING, OrderStatus.PREPARING],
    [OrderStatus.PENDING, OrderStatus.CANCELED],
    [OrderStatus.PREPARING, OrderStatus.READY],
    [OrderStatus.READY, OrderStatus.COMPLETED],
  ];

  it.each(statusTransitions)(
    'allows status transition from %s to %s',
    async (currentStatus, nextStatus) => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        restaurantId: 'rest-1',
        status: currentStatus,
      } as any);
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        status: nextStatus,
      } as any);

      const order = await updateOrderStatusForRestaurant('rest-1', 'order-1', nextStatus);
      expect(order.status).toBe(nextStatus);
    },
  );

  it('returns existing order when status is unchanged', async () => {
    const existing = { id: 'order-1', restaurantId: 'rest-1', status: OrderStatus.PENDING } as any;
    prisma.order.findUnique.mockResolvedValue(existing);

    const result = await updateOrderStatusForRestaurant('rest-1', 'order-1', OrderStatus.PENDING);
    expect(result).toBe(existing);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });

  it('throws when order not found', async () => {
    prisma.order.findUnique.mockResolvedValue(null);
    await expect(
      updateOrderStatusForRestaurant('rest-1', 'order-1', OrderStatus.PREPARING),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('throws when order belongs to a different restaurant', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      restaurantId: 'rest-2',
      status: OrderStatus.PENDING,
    } as any);
    await expect(
      updateOrderStatusForRestaurant('rest-1', 'order-1', OrderStatus.PREPARING),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('blocks invalid status transitions', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      restaurantId: 'rest-1',
      status: OrderStatus.COMPLETED,
    } as any);
    await expect(
      updateOrderStatusForRestaurant('rest-1', 'order-1', OrderStatus.PENDING),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('fetches a customer order when ownership matches', async () => {
    const order = { id: 'order-1', customerId: 'user-1' };
    prisma.order.findUnique.mockResolvedValue(order as any);
    const result = await getOrderForCustomer('order-1', 'user-1');
    expect(result).toBe(order);
    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      include: {
        restaurant: {
          select: { id: true, name: true, address: true, latitude: true, longitude: true },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true },
            },
          },
        },
      },
    });
  });

  it('throws when fetching order for different customer', async () => {
    prisma.order.findUnique.mockResolvedValue({ id: 'order-1', customerId: 'user-2' } as any);
    await expect(getOrderForCustomer('order-1', 'user-1')).rejects.toMatchObject({ status: 404 });
  });

  it('throws when order does not exist for customer lookup', async () => {
    prisma.order.findUnique.mockResolvedValue(null);
    await expect(getOrderForCustomer('order-1', 'user-1')).rejects.toMatchObject({ status: 404 });
  });

  it('ensures order items store captured price at time of order', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(restaurant as any);
    prisma.menuItem.findMany.mockResolvedValue([menuItems[0]] as any);
    prisma.order.create.mockResolvedValue({ id: 'order-1' } as any);

    await createOrder('user-1', {
      restaurantId: 'rest-1',
      items: [{ menuItemId: 'item-1', quantity: 3 }],
      pickupEtaMin: 20,
      routeOrigin: 'Point A',
      routeDestination: 'Point B',
    });

    const orderItems = prisma.order.create.mock.calls[0][0].data.items.create;
    expect(orderItems[0]).toEqual({ menuItemId: 'item-1', quantity: 3, priceCents: 700 });
  });

  it('honours different restaurants for listOrdersForRestaurant', async () => {
    prisma.order.findMany.mockResolvedValue([]);
    await listOrdersForRestaurant('rest-99');
    expect(prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { restaurantId: 'rest-99' } }),
    );
  });

  it('produces descriptive HttpError instances', async () => {
    prisma.restaurant.findUnique.mockResolvedValue(null);
    await expect(
      createOrder('user-1', {
        restaurantId: 'rest-1',
        items: [{ menuItemId: 'item-1', quantity: 1 }],
        pickupEtaMin: 10,
        routeOrigin: 'A',
        routeDestination: 'B',
      }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
