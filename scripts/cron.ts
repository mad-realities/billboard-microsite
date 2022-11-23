import cron from "node-cron";
import { runScript } from "./prisma";

cron.schedule("*/5 * * * *", () => {
  runScript();
});
