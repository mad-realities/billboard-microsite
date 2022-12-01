import { match } from "ts-pattern";
import Button, { ButtonProps } from "./Button";

export default function BillboardButton(props: ButtonProps) {
  const { color } = props;

  const borderColor = match(color)
    .with("mr-yellow", () => "border-mr-navy")
    .with("transparent", () => "border-mr-yellow")
    .otherwise(() => "border-white");

  const textColor = match(color)
    .with("mr-yellow", () => "border-mr-navy")
    .with("transparent", () => "text-mr-yellow")
    .otherwise(() => "text-white");

  return (
    // outline-offset-4
    <Button {...props} className={`rounded-[12px] border-4 border-double ${borderColor} ${textColor}`}>
      {props.children}
    </Button>
  );
}
