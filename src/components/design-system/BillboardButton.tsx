import Button, { ButtonProps } from "./Button";

export default function BillboardButton(props: ButtonProps) {
  return (
    <Button {...props} className="rounded-3xl border-4 border-double border-black ">
      {props.children}
    </Button>
  );
}
