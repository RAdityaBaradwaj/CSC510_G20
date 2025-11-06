import { Router, Response } from 'express';
import { z } from 'zod';

import { HttpError } from '../errors/HttpError';
import { requireAuth } from '../middleware/auth';
import {
  createCustomer,
  createRestaurantOwner,
  authenticateUser,
  serializeUser,
} from '../services/authService';
import { COOKIE_NAME, cookieOptions, signSession } from '../utils/jwt';

export const authRouter = Router();

const registerCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const registerRestaurantSchema = registerCustomerSchema.extend({
  restaurantName: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const sendSession = (res: Response, user: ReturnType<typeof serializeUser>) => {
  const token = signSession({ userId: user.id, role: user.role });
  res.cookie(COOKIE_NAME, token, cookieOptions);
  return res.json({ user });
};

authRouter.post('/register-customer', async (req, res, next) => {
  try {
    const payload = registerCustomerSchema.parse(req.body);
    const user = await createCustomer(payload);
    res.status(201);
    return sendSession(res, serializeUser(user));
  } catch (error) {
    next(error);
  }
});

authRouter.post('/register-restaurant', async (req, res, next) => {
  try {
    const payload = registerRestaurantSchema.parse(req.body);
    const { user, restaurant } = await createRestaurantOwner(payload);
    const serialized = serializeUser({ ...user, restaurants: [{ id: restaurant.id }] });
    res.status(201);
    return sendSession(res, serialized);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await authenticateUser(payload.email, payload.password);
    const serialized = serializeUser(user);
    return sendSession(res, serialized);
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.status(204).end();
});

authRouter.get('/me', requireAuth, (req, res) => {
  if (!req.user) {
    throw new HttpError(401, 'Authentication required');
  }
  return res.json({ user: req.user });
});
