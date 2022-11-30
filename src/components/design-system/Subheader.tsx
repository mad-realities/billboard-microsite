import Image from "next/image";

type SubheaderProps = {
  children: React.ReactNode;
};
export default function Subheader({ children }: SubheaderProps) {
  return (
    <div className="w-full flex-col text-sm">
      <div className="ml-1 w-5/6 translate-y-5">{children}</div>
      <div className="">
        <Image src={"/subheader.png"} alt="Mad Realities wordmark logo" width={800} height={7} />
      </div>
    </div>
  );
}
