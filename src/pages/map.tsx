import React from "react";
import { Map, Marker } from "pigeon-maps";
import { stamenToner } from "pigeon-maps/providers";

const billboards = [
  [40.719873, -74.001863],
  [40.6892, 74.0445],
  [40.719874, -74.001862],
];

export default function MyMap() {
  const [center, setCenter] = React.useState([40.719873, -74.001863]);
  const markers = billboards.map((billboard, i) => (
    <Marker key={i} anchor={[billboard[0], billboard[1]]} color="red" onClick={() => console.log(i, billboard)} />
  ));

  console.log(markers);
  return (
    <div className="align-center flex w-full flex-col content-center items-center justify-center p-10">
      <div className="flex w-11/12 ">
        <Map height={300} defaultCenter={[center[0], center[1]]} defaultZoom={13} provider={stamenToner}>
          <Marker width={50} anchor={[center[0], center[1]]} color="red" onClick={() => console.log("hello")} />
        </Map>
      </div>
    </div>
  );
}
