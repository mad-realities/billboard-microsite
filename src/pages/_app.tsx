import type { AppProps } from "next/app";
import Head from "next/head";
import PrivyRelayProvider from "../components/auth/PrivyRelayProvider";
import NavBar from "../components/nav/NavBar";
import { RelayEnvironmentProvider } from "react-relay";
import { createRelayEnvironment } from "../client";

import "../styles/tailwind.css";

function VerificationApp({ Component, pageProps }: AppProps) {
  const relayEnvironment = createRelayEnvironment();

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <PrivyRelayProvider>
        <>
          <Head>
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            <title>Nextjs Skeleton App</title>
          </Head>
          <div className="sticky bg-mr-navy">
            <NavBar />
          </div>

          <div className="min-h-screen bg-mr-navy">
            <Component {...pageProps} />
          </div>
        </>
      </PrivyRelayProvider>
    </RelayEnvironmentProvider>
  );
}
export default VerificationApp;
