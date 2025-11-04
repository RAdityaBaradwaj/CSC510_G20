import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma";
import { HttpError } from "../errors/HttpError";
import { COOKIE_NAME, verifySession } from "../utils/jwt";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const bearer = req.headers.authorization?.split(" ");
    const token =
      (bearer?.[0] === "Bearer" && bearer[1]) || req.cookies[COOKIE_NAME] || undefined;

    if (!token) {
      throw new HttpError(401, "Authentication required");
    }

    const payload = verifySession(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        restaurants: {
          select: { id: true },
          take: 1
        }
      }
    });

    if (!user) {
      throw new HttpError(401, "Invalid session");
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurants[0]?.id
    };

    next();
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }

    return next(new HttpError(401, "Authentication required"));
  }
};

export const requireRole = (role: "CUSTOMER" | "RESTAURANT") => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return next(new HttpError(403, "Forbidden"));
    }
    return next();
  };
};
