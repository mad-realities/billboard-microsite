import Image from "next/image";

type SubheaderProps = {
  children: React.ReactNode;
  flipped?: boolean;
};

export default function Subheader({ children, flipped }: SubheaderProps) {
  return (
    <div className="w-full flex-col text-sm">
      {flipped ? <></> : <div className="ml-1 w-5/6 translate-y-5">{children}</div>}
      <div className={`${flipped ? "rotate-180" : ""}`}>
        <Image src={"/subheader.png"} alt="Mad Realities wordmark logo" width={800} height={7} />
      </div>
      {flipped ? <div className="ml-1 w-5/6 translate-y-[-20px] translate-x-12">{children}</div> : <></>}
    </div>
  );
}
