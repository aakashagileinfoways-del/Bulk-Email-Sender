import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.PORT, env.HOST, () => {
  console.log(`Dispatch API listening on ${env.HOST}:${env.PORT}`);
});
