import { MenuItemAction } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "../errors/HttpError";
import {
  createMenuItem,
  createMenuSection,
  deleteMenuItem,
  deleteMenuSection,
  getActiveRestaurants,
  getRestaurantMenu,
  updateMenuItem,
  updateMenuSection
} from "../services/restaurantService";

type PrismaMock = ReturnType<typeof createPrismaMock>;

function createPrismaMock(): PrismaMock {
  const mock: Record<string, any> = {};
  mock.user = { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() };
  mock.restaurant = { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() };
  mock.menuSection = {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  };
  mock.menuItem = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  };
  mock.menuItemChangeLog = { create: vi.fn() };
  mock.order = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  };
  const prismaMock = mock as PrismaMock;
  prismaMock.$transaction = vi.fn(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(prismaMock)
  );
  return prismaMock;
}

function resetDeepMocks(obj: Record<string, any>) {
  Object.values(obj).forEach((value) => {
    if (typeof value === "function" && "mockReset" in value) {
      value.mockReset();
    } else if (value && typeof value === "object") {
      resetDeepMocks(value as Record<string, any>);
    }
  });
}

function resetPrismaMock(mock: PrismaMock) {
  resetDeepMocks(mock as Record<string, any>);
  mock.$transaction.mockImplementation(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(mock)
  );
}

const logInfoMock = vi.hoisted(() => vi.fn());

const prisma: PrismaMock = vi.hoisted(() => createPrismaMock());

vi.mock("../lib/prisma", () => ({
  prisma
}));

vi.mock("../logger", () => ({
  log: {
    info: logInfoMock,
    error: vi.fn()
  }
}));

describe("services/restaurantService", () => {
  beforeEach(() => {
    resetPrismaMock(prisma);
    logInfoMock.mockReset();
  });

  it("lists active restaurants ordered by name", async () => {
    const restaurants = [
      { id: "rest-2", name: "Bistro", address: "2 Lane", latitude: 0, longitude: 0 },
      { id: "rest-1", name: "Cafe", address: "1 Lane", latitude: 0, longitude: 0 }
    ];
    prisma.restaurant.findMany.mockResolvedValue(restaurants as any);
    const result = await getActiveRestaurants();
    expect(result).toBe(restaurants);
    expect(prisma.restaurant.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true
      },
      orderBy: { name: "asc" }
    });
  });

  it("returns restaurant menu with structured sections", async () => {
    prisma.restaurant.findUnique.mockResolvedValue({
      id: "rest-1",
      name: "Cafe",
      address: "1 Road",
      latitude: 35.1,
      longitude: -78.1,
      sections: [
        {
          id: "sec-1",
          title: "Breakfast",
          position: 0,
          items: [{ id: "item-1", name: "Toast" }]
        }
      ],
      menuItems: []
    } as any);

    const result = await getRestaurantMenu("rest-1");
    expect(result.restaurant.name).toBe("Cafe");
    expect(result.sections[0].items[0].name).toBe("Toast");
    expect(prisma.restaurant.findUnique).toHaveBeenCalledWith({
      where: { id: "rest-1", isActive: true },
      include: {
        sections: {
          orderBy: { position: "asc" },
          include: {
            items: {
              orderBy: { name: "asc" }
            }
          }
        },
        menuItems: {
          where: { sectionId: null },
          orderBy: { name: "asc" }
        }
      }
    });
  });

  it("uses 'Featured' section for ungrouped menu items", async () => {
    prisma.restaurant.findUnique.mockResolvedValue({
      id: "rest-1",
      name: "Cafe",
      address: "1 Road",
      latitude: 35.1,
      longitude: -78.1,
      sections: [],
      menuItems: [{ id: "item-1", name: "Free Coffee" }]
    } as any);

    const result = await getRestaurantMenu("rest-1");
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0]).toMatchObject({
      id: "ungrouped",
      title: "Featured",
      items: [{ id: "item-1" }]
    });
  });

  it("throws when restaurant is not found or inactive", async () => {
    prisma.restaurant.findUnique.mockResolvedValue(null);
    await expect(getRestaurantMenu("rest-1")).rejects.toMatchObject({ status: 404 });
  });

  it("creates a menu section with default position", async () => {
    const section = { id: "sec-1" };
    prisma.menuSection.create.mockResolvedValue(section as any);
    const result = await createMenuSection("rest-1", { title: "Breakfast" });
    expect(result).toBe(section);
    expect(prisma.menuSection.create).toHaveBeenCalledWith({
      data: { restaurantId: "rest-1", title: "Breakfast", position: 0 }
    });
  });

  it("creates a menu section with explicit position", async () => {
    prisma.menuSection.create.mockResolvedValue({ id: "sec-1" } as any);
    await createMenuSection("rest-1", { title: "Lunch", position: 2 });
    expect(prisma.menuSection.create).toHaveBeenCalledWith({
      data: { restaurantId: "rest-1", title: "Lunch", position: 2 }
    });
  });

  it("updates existing menu sections", async () => {
    prisma.menuSection.findUnique.mockResolvedValue({ id: "sec-1", title: "Breakfast", position: 0 } as any);
    prisma.menuSection.update.mockResolvedValue({ id: "sec-1", title: "Brunch", position: 1 } as any);

    const section = await updateMenuSection("rest-1", "sec-1", { title: "Brunch", position: 1 });
    expect(section.title).toBe("Brunch");
    expect(prisma.menuSection.update).toHaveBeenCalledWith({
      where: { id: "sec-1" },
      data: { title: "Brunch", position: 1 }
    });
  });

  it("throws when updating unknown menu section", async () => {
    prisma.menuSection.findUnique.mockResolvedValue(null);
    await expect(updateMenuSection("rest-1", "sec-1", { title: "Dinner" })).rejects.toMatchObject({
      status: 404
    });
  });

  it("deletes a menu section when found", async () => {
    prisma.menuSection.findUnique.mockResolvedValue({ id: "sec-1" } as any);
    await deleteMenuSection("rest-1", "sec-1");
    expect(prisma.menuSection.delete).toHaveBeenCalledWith({ where: { id: "sec-1" } });
  });

  it("throws when deleting unknown section", async () => {
    prisma.menuSection.findUnique.mockResolvedValue(null);
    await expect(deleteMenuSection("rest-1", "sec-1")).rejects.toMatchObject({ status: 404 });
  });

  it("creates a menu item with defaults and logs change", async () => {
    prisma.menuItem.create.mockResolvedValue({
      id: "item-1",
      restaurantId: "rest-1",
      priceCents: 0,
      tags: []
    } as any);

    const item = await createMenuItem("rest-1", "user-1", {
      name: "New Item",
      priceCents: 500
    });

    expect(prisma.menuItem.create).toHaveBeenCalledWith({
      data: {
        restaurantId: "rest-1",
        sectionId: null,
        name: "New Item",
        description: "",
        priceCents: 500,
        isAvailable: true,
        tags: []
      }
    });
    expect(item.id).toBe("item-1");
    expect(prisma.menuItemChangeLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: MenuItemAction.CREATE,
          restaurantId: "rest-1",
          menuItemId: "item-1",
          userId: "user-1"
        })
      })
    );
    expect(logInfoMock).toHaveBeenCalledWith("menu_item_change", expect.objectContaining({ action: "CREATE" }));
  });

  it("persists supplied section id, availability, and tags when creating items", async () => {
    prisma.menuItem.create.mockResolvedValue({
      id: "item-2",
      restaurantId: "rest-1",
      sectionId: "sec-1",
      name: "Soup",
      description: "",
      priceCents: 700,
      isAvailable: false,
      tags: ["seasonal"]
    } as any);

    await createMenuItem("rest-1", "user-1", {
      sectionId: "sec-1",
      name: "Soup",
      priceCents: 700,
      isAvailable: false,
      tags: ["seasonal"]
    });

    expect(prisma.menuItem.create).toHaveBeenCalledWith({
      data: {
        restaurantId: "rest-1",
        sectionId: "sec-1",
        name: "Soup",
        description: "",
        priceCents: 700,
        isAvailable: false,
        tags: ["seasonal"]
      }
    });
  });

  it("updates a menu item and records before/after snapshots", async () => {
    prisma.menuItem.findFirst.mockResolvedValue({
      id: "item-1",
      restaurantId: "rest-1",
      name: "Old Name",
      description: "",
      priceCents: 1000,
      isAvailable: true,
      tags: ["vegan"],
      sectionId: null
    } as any);
    prisma.menuItem.update.mockResolvedValue({
      id: "item-1",
      restaurantId: "rest-1",
      name: "New Name",
      description: "Fresh",
      priceCents: 1200,
      isAvailable: false,
      tags: ["vegan", "gluten-free"],
      sectionId: "sec-1"
    } as any);

    const updated = await updateMenuItem("rest-1", "item-1", "user-1", {
      name: "New Name",
      description: "Fresh",
      priceCents: 1200,
      isAvailable: false,
      tags: ["vegan", "gluten-free"],
      sectionId: "sec-1"
    });

    expect(updated.name).toBe("New Name");
    expect(prisma.menuItemChangeLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: MenuItemAction.UPDATE,
          restaurantId: "rest-1",
          menuItemId: "item-1",
          beforeJSON: expect.stringContaining("Old Name"),
          afterJSON: expect.stringContaining("New Name")
        })
      })
    );
  });

  it("allows partial updates without overwriting unspecified fields", async () => {
    prisma.menuItem.findFirst.mockResolvedValue({
      id: "item-1",
      restaurantId: "rest-1",
      name: "Old Name",
      description: "Original",
      priceCents: 1000,
      isAvailable: true,
      tags: ["vegan"],
      sectionId: "sec-1"
    } as any);
    prisma.menuItem.update.mockResolvedValue({
      id: "item-1",
      restaurantId: "rest-1",
      name: "Old Name",
      description: "Original",
      priceCents: 1000,
      isAvailable: false,
      tags: ["vegan"],
      sectionId: "sec-1"
    } as any);

    await updateMenuItem("rest-1", "item-1", "user-1", { isAvailable: false });

    expect(prisma.menuItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: {
        sectionId: "sec-1",
        name: "Old Name",
        description: "Original",
        priceCents: 1000,
        isAvailable: false,
        tags: ["vegan"]
      }
    });
  });

  it("throws when updating missing menu item", async () => {
    prisma.menuItem.findFirst.mockResolvedValue(null);
    await expect(updateMenuItem("rest-1", "item-1", "user-1", {})).rejects.toMatchObject({
      status: 404
    });
  });

  it("deletes menu items and logs deletion", async () => {
    prisma.menuItem.findFirst.mockResolvedValue({
      id: "item-1",
      name: "Old Name",
      restaurantId: "rest-1"
    } as any);
    prisma.menuItem.delete.mockResolvedValue(undefined as any);

    await deleteMenuItem("rest-1", "item-1", "user-1");
    expect(prisma.menuItem.delete).toHaveBeenCalledWith({ where: { id: "item-1" } });
    expect(prisma.menuItemChangeLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: MenuItemAction.DELETE,
          menuItemId: "item-1",
          beforeJSON: expect.stringContaining("Old Name"),
          afterJSON: undefined
        })
      })
    );
  });

  it("throws when deleting missing menu item", async () => {
    prisma.menuItem.findFirst.mockResolvedValue(null);
    await expect(deleteMenuItem("rest-1", "item-1", "user-1")).rejects.toMatchObject({ status: 404 });
  });

  it("logs readable metadata for menu operations", async () => {
    prisma.menuItem.create.mockResolvedValue({
      id: "item-1",
      restaurantId: "rest-1",
      name: "Sandwich",
      description: "",
      priceCents: 900,
      isAvailable: true,
      tags: []
    } as any);
    await createMenuItem("rest-1", "user-1", { name: "Sandwich", priceCents: 900 });
    expect(logInfoMock).toHaveBeenCalledWith("menu_item_change", {
      action: "CREATE",
      restaurantId: "rest-1",
      menuItemId: "item-1"
    });
  });

  it("returns latitude/longitude when fetching restaurant menu", async () => {
    prisma.restaurant.findUnique.mockResolvedValue({
      id: "rest-1",
      name: "Cafe",
      address: "1 Road",
      latitude: 35.1,
      longitude: -78.1,
      sections: [],
      menuItems: []
    } as any);
    const result = await getRestaurantMenu("rest-1");
    expect(result.restaurant.latitude).toBe(35.1);
    expect(result.restaurant.longitude).toBe(-78.1);
  });

  it("throws HttpError instances with descriptive messages", async () => {
    prisma.menuItem.findFirst.mockResolvedValue(null);
    await expect(updateMenuItem("rest-1", "missing", "user-1", {})).rejects.toThrow(HttpError);
    await expect(deleteMenuSection("rest-1", "missing")).rejects.toThrow("Section not found");
  });
});
