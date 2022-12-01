import cron from "node-cron";
import { runScript } from "./script";

cron.schedule("*/5 * * * *", () => {
  runScript();
});
