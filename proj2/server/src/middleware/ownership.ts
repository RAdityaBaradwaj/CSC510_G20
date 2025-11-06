import { NextFunction, Request, Response } from "express";

import { HttpError } from "../errors/HttpError";

export const ensureRestaurantOwnership = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user?.restaurantId || req.user.restaurantId !== req.params.restaurantId) {
    return next(new HttpError(403, "You do not have access to this restaurant"));
  }
  return next();
};
