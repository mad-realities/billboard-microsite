import * as amplitude from "@amplitude/analytics-browser";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config({
  path: ".env.local",
});

amplitude.init(process.env.AMPLITUDE_API_KEY);
export { amplitude };
