import { match } from "ts-pattern";
import Button, { ButtonProps } from "./Button";

interface BillboardButtonProps extends ButtonProps {
  transparentAccent?: BillboardButtonProps["color"];
}

export default function BillboardButton(props: BillboardButtonProps) {
  const { color } = props;

  const borderColor = match(color)
    .with("mr-yellow", () => "border-mr-navy")
    .with("transparent", () => (props.transparentAccent ? `border-${props.transparentAccent}` : "border-mr-yellow"))
    .otherwise(() => "border-black");

  const textColor = match(color)
    .with("mr-yellow", () => "border-mr-navy")
    .with("transparent", () => (props.transparentAccent ? `text-${props.transparentAccent}` : "text-mr-yellow"))
    .otherwise(() => "text-black");

  return (
    <Button {...props} className={`rounded-[12px] border-4 border-double ${borderColor} ${textColor}`}>
      {props.children}
    </Button>
  );
}
