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

export const createOrder = async (customerId: string, input: CreateOrderInput) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId, isActive: true }
  });
  if (!restaurant) {
    throw new HttpError(404, "Restaurant not found");
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: input.items.map((item) => item.menuItemId) },
      restaurantId: restaurant.id,
      isAvailable: true
    }
  });

  if (menuItems.length !== input.items.length) {
    throw new HttpError(400, "Some menu items are unavailable");
  }

  const totalCents = input.items.reduce((total, item) => {
    const menuItem = menuItems.find((i) => i.id === item.menuItemId)!;
    return total + menuItem.priceCents * item.quantity;
  }, 0);

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
          priceCents: menuItems.find((i) => i.id === item.menuItemId)!.priceCents
        }))
      }
    },
    include: {
      items: {
        include: {
          menuItem: {
            select: { name: true }
          }
        }
      }
    }
  });

  return order;
};

export const listOrdersForUser = (customerId: string) =>
  prisma.order.findMany({
    where: { customerId },
    include: {
      restaurant: {
        select: { id: true, name: true }
      },
      items: {
        include: {
          menuItem: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
