import Button, { ButtonProps } from "./Button";

export default function SmallBillboardButton(props: ButtonProps) {
  return (
    <Button {...props} className="h-7 rounded-3xl">
      {props.children}
    </Button>
  );
}
