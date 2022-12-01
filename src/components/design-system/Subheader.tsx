import clsx from "clsx";

type SubheaderProps = {
  children: React.ReactNode;
  flipped?: boolean;
};

export default function Subheader({ children, flipped }: SubheaderProps) {
  return (
    <div
      className={clsx([
        "w-full",
        "flex-col",
        "bg-[url('/subheader.png')]",
        "bg-contain",
        "bg-no-repeat",
        "min-h-[40px]",
        "bg-bottom",
        "pr-[16%]",
        "pb-3",
        flipped && "rotate-180",
      ])}
    >
      <div className={clsx(flipped && "rotate-180")}>{children}</div>
    </div>
  );
}
