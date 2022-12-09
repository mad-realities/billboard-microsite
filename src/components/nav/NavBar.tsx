import Image from "next/image";
import Link from "next/link";
import { mixpanelClient, VISITED_MR } from "../../client/mixpanel";
import { BillboardButton } from "../design-system";

export const NavBar = () => {
  return (
    <nav className="z-50 flex flex-wrap items-center justify-between rounded-lg p-2 text-mr-white">
      <div className="flex w-auto flex-grow place-content-end items-center">
        <div className="mr-6 flex-grow">
          <a
            href="https://madrealities.xyz"
            target="_blank"
            rel="noreferrer"
            onClick={() => mixpanelClient.track(VISITED_MR)}
          >
            <Image src="/MAD-REALITIES.png" alt="Mad Realities wordmark logo" width={150} height={71} />
          </a>
        </div>
        <div className="w-1/4 place-items-end">
          <Link href={"/map"}>
            <BillboardButton color="mr-lime" fill small>
              Map
            </BillboardButton>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
