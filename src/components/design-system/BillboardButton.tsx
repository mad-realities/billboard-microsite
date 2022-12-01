import Button, { ButtonProps } from "./Button";

export default function BillboardButton(props: ButtonProps) {
  return (
    // outline-offset-4
    <Button {...props} className="rounded-[12px] border-4 border-double border-black">
      {props.children}
    </Button>
  );
}
