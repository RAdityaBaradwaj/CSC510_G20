import { OrderStatus } from "@prisma/client";

import { HttpError } from "../errors/HttpError";
import { prisma } from "../lib/prisma";

type OrderItemInput = {
  menuItemId: string;
  quantity: number;
};

type CreateOrderInput = {
  restaurantId: string;
  items: OrderItemInput[];
  pickupEtaMin: number;
  routeOrigin: string;
  routeDestination: string;
};

const TAX_RATE = 0.0825;

const calculateSubtotal = (items: Array<{ priceCents: number; quantity: number }>) =>
  items.reduce((total, item) => total + item.priceCents * item.quantity, 0);

const attachFinancials = <T extends { totalCents: number; items: Array<{ priceCents: number; quantity: number }> }>(
  order: T,
  overrides?: { subtotalCents: number; taxCents: number },
) => {
  const subtotalCents = overrides?.subtotalCents ?? calculateSubtotal(order.items);
  const taxCents = overrides?.taxCents ?? Math.max(order.totalCents - subtotalCents, 0);

  return {
    ...order,
    subtotalCents,
    taxCents,
  };
};

export const createOrder = async (customerId: string, input: CreateOrderInput) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId, isActive: true },
  });
  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: input.items.map((item) => item.menuItemId) },
      restaurantId: restaurant.id,
      isAvailable: true,
    },
  });

  if (menuItems.length !== input.items.length) {
    throw new HttpError(400, "Some menu items are unavailable");
  }

  const subtotalCents = input.items.reduce((total, item) => {
    const menuItem = menuItems.find((i) => i.id === item.menuItemId)!;
    return total + menuItem.priceCents * item.quantity;
  }, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  const order = await prisma.order.create({
    data: {
      customerId,
      restaurantId: restaurant.id,
      pickupEtaMin: input.pickupEtaMin,
      routeOrigin: input.routeOrigin,
      routeDestination: input.routeDestination,
      totalCents,
      items: {
        create: input.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceCents: menuItems.find((i) => i.id === item.menuItemId)!.priceCents,
        })),
      },
    },
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

  return attachFinancials(order, { subtotalCents, taxCents });
};

const customerOrderInclude = {
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
} as const;

export const listOrdersForUser = async (customerId: string) => {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: customerOrderInclude,
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => attachFinancials(order));
};

const restaurantOrderInclude = {
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
} as const;

export const listOrdersForRestaurant = async (restaurantId: string) => {
  const orders = await prisma.order.findMany({
    where: { restaurantId },
    include: restaurantOrderInclude,
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  return orders.map((order) => attachFinancials(order));
};

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELED],
  [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELED]: [],
};

export const updateOrderStatusForRestaurant = async (
  restaurantId: string,
  orderId: string,
  nextStatus: OrderStatus,
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: restaurantOrderInclude,
  });

  if (!order || order.restaurantId !== restaurantId) {
    throw new HttpError(404, "Order not found");
  }

  if (order.status === nextStatus) {
    return attachFinancials(order);
  }

  const allowedTransitions = STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowedTransitions.includes(nextStatus)) {
    throw new HttpError(400, "Invalid status transition");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: nextStatus },
    include: restaurantOrderInclude,
  });

  return attachFinancials(updated);
};

export const getOrderForCustomer = async (orderId: string, customerId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: customerOrderInclude,
  });

  if (!order || order.customerId !== customerId) {
    throw new HttpError(404, "Order not found");
  }

  return attachFinancials(order);
};
