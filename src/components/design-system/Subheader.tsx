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
        "bg-cover",
        "bg-no-repeat",
        "min-h-[24px]",
        "bg-bottom",
        "pr-[16%]",
        "pb-2",
        flipped && "rotate-180",
      ])}
    >
      <div className={clsx(flipped && "rotate-180")}>{children}</div>
    </div>
  );
}
