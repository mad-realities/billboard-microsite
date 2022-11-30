import type { AppProps } from "next/app";
import Head from "next/head";
import NavBar from "../components/nav/NavBar";
import Image from "next/image";

import "../styles/tailwind.css";
import Link from "next/link";

function VerificationApp({ Component, pageProps }: AppProps) {
  return (
    <div
      className="flex min-h-screen flex-col bg-cover"
      style={{
        backgroundImage: "url('/space.png')",
      }}
    >
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <title>Mad Realities Billboard</title>
      </Head>
      <div className="sticky">
        <NavBar />
      </div>

      <div className="mx-2 flex h-full grow rounded-xl border border-white">
        <div className="align-center flex w-auto flex-grow flex-col items-center p-1">
          <Link href="/">
            <Image src="/MAD-FAMOUS.png" alt="Mad Realities wordmark logo" width={400} height={75} className="mb-0" />
          </Link>
          <Component {...pageProps} />
        </div>
      </div>
    </div>
  );
}
export default VerificationApp;
