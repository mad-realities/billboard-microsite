import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import SmallBillboardButton from "../design-system/SmallBillboardButton";

export const NavBar = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { pathname } = useRouter();

  // const items = [];

  return (
    <nav className="z-50 flex flex-wrap items-center justify-between rounded-lg p-2 text-mr-white">
      <div className="flex w-auto flex-grow place-content-end items-center">
        <div className="mr-6">
          <Link href="/">
            <Image src="/MAD-REALITIES.png" alt="Mad Realities wordmark logo" width={120} height={57} />
          </Link>
        </div>
        <div className="flex-grow"></div>
        <div className="w-1/4 place-items-end">
          <Link href={"/map"}>
            <SmallBillboardButton color="mr-lime" fill>
              Map
            </SmallBillboardButton>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
