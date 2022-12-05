import React from "react";
import { Map, Marker } from "pigeon-maps";
import { stamenToner } from "pigeon-maps/providers";
import Subheader from "../components/design-system/Subheader";
import BillboardButton from "../components/design-system/BillboardButton";
import { useRouter } from "next/router";
import SmallBillboardButton from "../components/design-system/SmallBillboardButton";

export default function MyMap() {
  // billboard location: 1540 Broadway, New York, NY 10001
  const [center] = React.useState([40.7581352, -73.9850678]);
  const router = useRouter();

  function mapsSelector() {
    const lat = center[0];
    const lng = center[1];
    if (
      /* if we're on iOS, open in Apple Maps */
      navigator.platform.indexOf("iPhone") != -1 ||
      navigator.platform.indexOf("iPad") != -1 ||
      navigator.platform.indexOf("iPod") != -1
    )
      window.open(`maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
    /* else use Google */ else window.open(`https://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`);
  }

  return (
    <div className="align-center flex w-full flex-col items-center gap-5 p-3">
      <Subheader>BILLBOARD LOCATION</Subheader>
      <div className="flex w-full flex-row gap-2">
        <BillboardButton fill color="mr-yellow" onPress={() => router.push("/vote")}>
          NOMINATE
        </BillboardButton>
        <BillboardButton fill color="transparent" onPress={() => router.push("/leaderboard")}>
          LEADERBOARD
        </BillboardButton>
      </div>
      <div className="w-full ">
        <Map height={600} defaultCenter={[center[0], center[1]]} defaultZoom={13} provider={stamenToner}>
          <Marker width={25} anchor={[center[0], center[1]]} color="red" onClick={() => console.log("hello")} />
        </Map>
      </div>
      <div>
        <SmallBillboardButton fill color="mr-sky-blue" onPress={() => mapsSelector()}>
          DIRECTIONS
        </SmallBillboardButton>
      </div>
    </div>
  );
}
