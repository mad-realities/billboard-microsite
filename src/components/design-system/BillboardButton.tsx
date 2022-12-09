import { match } from "ts-pattern";
import Button, { ButtonProps } from "./Button";
import clsx from "clsx";

interface BillboardButtonProps extends ButtonProps {
  transparentAccent?: BillboardButtonProps["color"];
  small?: boolean;
}

export const BillboardButton = ({ small, transparentAccent, ...props }: BillboardButtonProps) => {
  const borderColor = match(props.color)
    .with("mr-yellow", () => "border-mr-navy")
    .with("transparent", () => (transparentAccent ? `border-${transparentAccent}` : "border-mr-yellow"))
    .otherwise(() => "border-black");

  const textColor = match(props.color)
    .with("mr-yellow", () => "border-mr-navy")
    .with("transparent", () => (transparentAccent ? `text-${transparentAccent}` : "text-mr-yellow"))
    .otherwise(() => "text-black");

  return (
    <Button
      {...props}
      className={
        small
          ? clsx("h-7", "rounded-3xl", props.className)
          : clsx("rounded-[12px]", "border-4", "border-double", borderColor, textColor, props.className)
      }
    >
      {props.children}
    </Button>
  );
};

export default BillboardButton;
