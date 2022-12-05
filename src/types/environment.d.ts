export {};

declare global {
  namespace NodeJS {
    /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
    interface ProcessEnv {
      // Put type definitions for process.env variables here
      DATABASE_URL: string;
      COMMUNITY_TOKEN: string;
      NEXT_PUBLIC_AMPLITUDE_API_KEY: string;
      API_SECRET: string;
      UPDATE_SECRET: string;
    }
  }
}
