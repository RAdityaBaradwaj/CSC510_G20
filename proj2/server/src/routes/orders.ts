import { Router } from "express";
import { z } from "zod";

import { requireAuth, requireRole } from "../middleware/auth";
import { createOrder, getOrderForCustomer, listOrdersForUser } from "../services/orderService";

const orderPayload = z.object({
  restaurantId: z.string().uuid(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().positive().default(1)
      })
    )
    .min(1),
  pickupEtaMin: z.number().int().positive(),
  routeOrigin: z.string().min(1),
  routeDestination: z.string().min(1)
});

const orderIdParam = z.object({
  orderId: z.string().uuid()
});

export const ordersRouter = Router();

ordersRouter.post("/", requireAuth, requireRole("CUSTOMER"), async (req, res, next) => {
  try {
    const payload = orderPayload.parse(req.body);
    const order = await createOrder(req.user!.id, payload);
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/", requireAuth, requireRole("CUSTOMER"), async (req, res, next) => {
  try {
    const orders = await listOrdersForUser(req.user!.id);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

ordersRouter.get("/:orderId", requireAuth, requireRole("CUSTOMER"), async (req, res, next) => {
  try {
    const { orderId } = orderIdParam.parse(req.params);
    const order = await getOrderForCustomer(orderId, req.user!.id);
    res.json({ order });
  } catch (error) {
    next(error);
  }
});
