import { useRouter } from "next/router";
import BillboardButton from "../components/design-system/BillboardButton";
import Subheader from "../components/design-system/Subheader";
import { useEffect, useState } from "react";
import { getLinkPreview } from "../linkPreviewConfig";

const Vote = () => {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const linkPreview = getLinkPreview("VOTE");

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
    <div className="align-center item-around flex h-full w-full flex-grow grow flex-col items-center gap-3 p-1 text-white">
      {linkPreview}
      <Subheader>
        <div>CHECK RANK</div>
      </Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="transparent" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
      </div>
      <div className="text-xl">WHAT IS THEIR INSTAGRAM HANDLE?</div>
      <div className="flex w-3/4 flex-col gap-2">
        <input
          placeholder="MADREALITIES"
          onInput={(e) => setHandle(e.currentTarget.value)}
          className=" block w-full rounded-lg border border-4 border-double border-white bg-transparent p-2.5 text-center text-sm text-mr-pink placeholder-mr-pink"
        />
        <BillboardButton
          fill
          color="mr-sky-blue"
          onPress={() => {
            if (handleIsValid) {
              router.push("/profile/" + handle);
            }
          }}
        >
          GET RANK {"->"}
        </BillboardButton>
      </div>
      <span className="text-mr-pink"> {error} </span>
    </div>
  );
};

export default Vote;
