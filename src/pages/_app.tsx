import type { AppProps } from "next/app";
import Head from "next/head";
import NavBar from "../components/nav/NavBar";

import "../styles/tailwind.css";
import Link from "next/link";

function VerificationApp({ Component, pageProps }: AppProps) {
  return (
    <div className="flex min-h-screen flex-col bg-star-texture bg-contain">
      <Head>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <title>Mad Realities Billboard</title>
      </Head>
      <div className="mx-auto my-2 max-w-lg">
        <NavBar />
        <div className="flex h-full w-full px-2 ">
          <div className="align-center flex w-auto flex-grow grow flex-col items-center rounded-xl border border-white p-1 text-white">
            <Link href="/">
              <h1 className="pr-3 text-justify text-[70px] uppercase italic leading-none">Mad Famous</h1>
            </Link>
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default VerificationApp;
