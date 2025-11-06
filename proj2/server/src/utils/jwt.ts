import jwt from "jsonwebtoken";

import { env } from "../env";

type SessionPayload = {
  userId: string;
  role: string;
};

const COOKIE_NAME = "routedash_session";
const TOKEN_EXPIRY = "7d";

export const signSession = (payload: SessionPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

export const verifySession = (token: string) => jwt.verify(token, env.JWT_SECRET) as SessionPayload;

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export { COOKIE_NAME };
