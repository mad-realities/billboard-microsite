export {};

declare global {
  namespace NodeJS {
    /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
    interface ProcessEnv {
      // Put type definitions for process.env variables here
      DATABASE_URL: string;
      COMMUNITY_TOKEN: string;
      API_SECRET: string;
      UPDATE_SECRET: string;
      NODE_ENV: string;
      HTML_TO_CSS_USER_ID: string;
      HTML_TO_CSS_API_KEY: string;
      NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN: string;
      NEXT_PUBLIC_LEADERBOARD_DONE: boolean;
    }
  }
}
