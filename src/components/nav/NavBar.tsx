import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";

import { Button } from "../design-system/Button";

export const NavBar = () => {
  const { ready, authenticated, login, logout } = usePrivy();

  return (
    <nav className="z-50 flex flex-wrap items-center justify-between rounded-lg border border-2 border-mr-pink bg-mr-lilac p-4 text-mr-white">
      <div className="flex w-auto flex-grow place-content-end items-center">
        <div className="mr-6">
          <Link href="/">
            <Image src="/mr-wordmark.png" alt="Mad Realities wordmark logo" width={120} height={57} />
          </Link>
        </div>
        <div className="flex-grow">
          {/* <Link href="/home" className="mt-0 mr-4 inline-block font-semibold">
            Home
          </Link> */}
        </div>
        <div className="place-items-end">
          {(() => {
            if (!authenticated) {
              return (
                <Button onPress={login} loading={!ready} color="mr-sky-blue" size="lg">
                  Login
                </Button>
              );
            } else {
              return (
                <Button onPress={logout} loading={!ready} color="mr-sky-blue" size="lg">
                  Logout
                </Button>
              );
            }
          })()}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
