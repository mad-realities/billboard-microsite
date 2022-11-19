import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { Button } from "../design-system/Button";

export const NavBar = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { pathname } = useRouter();

  const items = [];

  if (pathname.includes("leaderboard")) {
    items.push({
      name: "Map",
      href: "/map",
    });
  } else if (pathname.includes("map")) {
    items.push({
      name: "Leaderboard",
      href: "/leaderboard",
    });
  } else {
    items.push({
      name: "Leaderboard",
      href: "/leaderboard",
    });
    items.push({
      name: "Map",
      href: "/map",
    });
  }

  return (
    <nav className="z-50 flex flex-wrap items-center justify-between rounded-lg border border-2 border-mr-pink bg-mr-lilac p-4 text-mr-white">
      <div className="flex w-auto flex-grow place-content-end items-center">
        <div className="mr-6">
          <Link href="/">
            <Image src="/mr-wordmark.png" alt="Mad Realities wordmark logo" width={120} height={57} />
          </Link>
        </div>
        <div className="flex-grow">
          {items.map((item) => (
            <Link className="mt-0 mr-4 inline-block font-semibold" href={item.href} key={item.name}>
              {item.name}
            </Link>
          ))}
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
