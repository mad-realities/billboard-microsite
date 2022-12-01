import { useRouter } from "next/router";
import Image from "next/image";
import { useWindowSize } from "../client/hooks";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";
import { useEffect, useState } from "react";
import { CONTACT_PHONE_NUMBER } from "../client/constants";
import { getSmsHref } from "../client/utils";

const Vote = () => {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");

  // check if handle is one word
  const handleIsValid = handle.split(" ").length === 1;

  useEffect(() => {
    if (handleIsValid) {
      setError("");
    } else {
      setError("Instagram handle must be valid!");
    }
  }, [handleIsValid]);

  return (
    <div className="align-center item-around flex h-full w-auto flex-grow grow flex-col items-center gap-3 p-1 text-white">
      <Subheader>
        <div className="text-2xs">NOMINATE YOUR FRIEND TO BE ON THE BILLBOARD</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
      </div>
      <div className="text-xl">1. Nominate your friend</div>
      <div className="flex w-full flex-col gap-2">
        <input
          placeholder="MADREALITIES"
          onInput={(e) => setHandle(e.currentTarget.value)}
          className=" block w-full rounded-lg border border-4 border-double border-white bg-transparent p-2.5 text-center text-sm text-mr-pink placeholder-mr-pink"
        />
        <BillboardButton fill color="mr-sky-blue">
          {handleIsValid ? (
            <a
              href={getSmsHref(handle)}
              className="w-full"
              onClick={() => {
                if (handleIsValid) {
                  router.push("/profile/" + handle);
                }
              }}
            >
              TEXT TO CAST VOTE {"->"}
            </a>
          ) : (
            <>TEXT TO CAST VOTE {"->"}</>
          )}
        </BillboardButton>
      </div>
      <span className="text-mr-pink"> {error} </span>
    </div>
  );
};

export default Vote;
