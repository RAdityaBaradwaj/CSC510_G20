import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./env";
import { httpLogger } from "./logger";
import { healthRouter } from "./routes/health";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.NODE_ENV === "production" ? [] : true,
      credentials: true
    })
  );
  app.use(helmet());
  app.use(httpLogger);
  app.use(express.json());
  app.use(cookieParser());

  app.use("/health", healthRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ error: "Internal server error" });
    }
  );

  return app;
};
