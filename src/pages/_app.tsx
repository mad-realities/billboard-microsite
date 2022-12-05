import type { AppProps } from "next/app";
import Head from "next/head";
import NavBar from "../components/nav/NavBar";

import "../styles/tailwind.css";
import Link from "next/link";
import { useRouter } from "next/router";

function BillboardApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  if (router.pathname.includes("preview")) {
    return (
      <div className="flex flex-col bg-star-texture bg-contain">
        <Head>
          <title>MAD FAMOUS: THE BILLBOARD</title>
          <meta name="description" content="MAD FAMOUS: THE BILLBOARD" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="align-center flex w-full flex-col items-center text-mr-offwhite">
          <Component {...pageProps} />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen flex-col bg-star-texture bg-contain">
        <Head>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <title>MAD FAMOUS by Mad Realities</title>
        </Head>
        <div className="mx-auto my-2 w-full max-w-md text-mr-offwhite">
          <NavBar />
          <div className="flex h-full w-full px-2 ">
            <div className="align-center flex w-auto grow flex-col items-center rounded-xl border border-white p-1">
              <Link href="/">
                <h1 className="pr-3 text-justify text-[88px] uppercase italic leading-none">Mad Famous</h1>
              </Link>
              <Component {...pageProps} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default BillboardApp;
