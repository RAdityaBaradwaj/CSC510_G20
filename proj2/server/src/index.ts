import { createApp } from "./app";
import { env } from "./env";
import { log } from "./logger";

const app = createApp();

app.listen(env.PORT, () => {
  log.info(`RouteDash API running on port ${env.PORT}`);
});
