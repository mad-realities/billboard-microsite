export {};

declare global {
  namespace NodeJS {
    /* eslint-disable-next-line @typescript-eslint/no-empty-interface */
    interface ProcessEnv {
      // Put type definitions for process.env variables here
      NEXT_PUBLIC_PRIVY_APP_ID: string;
      DATABASE_URL: string;
      COMMUNITY_TOKEN: string;
      AMPLITUDE_API_KEY: string;
    }
  }
}
