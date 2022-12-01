import Image from "next/image";
import Link from "next/link";
import SmallBillboardButton from "../design-system/SmallBillboardButton";

export const NavBar = () => {
  return (
    <nav className="z-50 flex flex-wrap items-center justify-between rounded-lg p-2 text-mr-white">
      <div className="flex w-auto flex-grow place-content-end items-center">
        <div className="mr-6 flex-grow">
          <Link href="https://madrealities.xyz" target="_blank">
            <Image src="/MAD-REALITIES.png" alt="Mad Realities wordmark logo" width={150} height={71} />
          </Link>
        </div>
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
