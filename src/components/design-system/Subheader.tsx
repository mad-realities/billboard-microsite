import clsx from "clsx";

type SubheaderProps = {
  children: React.ReactNode;
  flipped?: boolean;
};

export const Subheader = ({ children, flipped }: SubheaderProps) => {
  return (
    <div
      className={clsx([
        "w-full",
        "flex-col",
        "bg-[url('/subheader.png')]",
        "bg-contain",
        "bg-no-repeat",
        "min-h-[36px]",
        "bg-bottom",
        "pr-[14%]",
        "pb-2",
        flipped && "rotate-180",
      ])}
    >
      <div className={clsx(flipped && "rotate-180")}>{children}</div>
    </div>
  );
};

export default Subheader;
