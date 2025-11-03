import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRole } from "../middleware/auth";
import { ensureRestaurantOwnership } from "../middleware/ownership";
import {
  getActiveRestaurants,
  getRestaurantMenu,
  createMenuSection,
  updateMenuSection,
  deleteMenuSection,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from "../services/restaurantService";

const restaurantIdParam = z.object({
  restaurantId: z.string().uuid()
});

const sectionPayload = z.object({
  title: z.string().min(1),
  position: z.number().int().nonnegative().optional()
});

const sectionUpdatePayload = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().nonnegative().optional()
});

const itemPayload = z.object({
  sectionId: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  isAvailable: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

const itemUpdatePayload = itemPayload.partial();

export const restaurantRouter = Router();

restaurantRouter.get("/", async (_req, res, next) => {
  try {
    const restaurants = await getActiveRestaurants();
    res.json({ restaurants });
  } catch (error) {
    next(error);
  }
});

restaurantRouter.get("/:restaurantId/menu", async (req, res, next) => {
  try {
    const { restaurantId } = restaurantIdParam.parse(req.params);
    const result = await getRestaurantMenu(restaurantId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

restaurantRouter.post(
  "/:restaurantId/menu/sections",
  requireAuth,
  requireRole("RESTAURANT"),
  ensureRestaurantOwnership,
  async (req, res, next) => {
    try {
      const { restaurantId } = restaurantIdParam.parse(req.params);
      const payload = sectionPayload.parse(req.body);
      const section = await createMenuSection(restaurantId, payload);
      res.status(201).json({ section });
    } catch (error) {
      next(error);
    }
  }
);

restaurantRouter.patch(
  "/:restaurantId/menu/sections/:sectionId",
  requireAuth,
  requireRole("RESTAURANT"),
  ensureRestaurantOwnership,
  async (req, res, next) => {
    try {
      const params = restaurantIdParam.extend({ sectionId: z.string().uuid() }).parse(req.params);
      const payload = sectionUpdatePayload.parse(req.body);
      const section = await updateMenuSection(params.restaurantId, params.sectionId, payload);
      res.json({ section });
    } catch (error) {
      next(error);
    }
  }
);

restaurantRouter.delete(
  "/:restaurantId/menu/sections/:sectionId",
  requireAuth,
  requireRole("RESTAURANT"),
  ensureRestaurantOwnership,
  async (req, res, next) => {
    try {
      const params = restaurantIdParam.extend({ sectionId: z.string().uuid() }).parse(req.params);
      await deleteMenuSection(params.restaurantId, params.sectionId);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);

restaurantRouter.post(
  "/:restaurantId/menu/items",
  requireAuth,
  requireRole("RESTAURANT"),
  ensureRestaurantOwnership,
  async (req, res, next) => {
    try {
      const { restaurantId } = restaurantIdParam.parse(req.params);
      const payload = itemPayload.parse(req.body);
      const item = await createMenuItem(restaurantId, req.user!.id, payload);
      res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  }
);

restaurantRouter.patch(
  "/:restaurantId/menu/items/:itemId",
  requireAuth,
  requireRole("RESTAURANT"),
  ensureRestaurantOwnership,
  async (req, res, next) => {
    try {
      const params = restaurantIdParam.extend({ itemId: z.string().uuid() }).parse(req.params);
      const payload = itemUpdatePayload.parse(req.body);
      const item = await updateMenuItem(params.restaurantId, params.itemId, req.user!.id, payload);
      res.json({ item });
    } catch (error) {
      next(error);
    }
  }
);

restaurantRouter.delete(
  "/:restaurantId/menu/items/:itemId",
  requireAuth,
  requireRole("RESTAURANT"),
  ensureRestaurantOwnership,
  async (req, res, next) => {
    try {
      const params = restaurantIdParam.extend({ itemId: z.string().uuid() }).parse(req.params);
      await deleteMenuItem(params.restaurantId, params.itemId, req.user!.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);
