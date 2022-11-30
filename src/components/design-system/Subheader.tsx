import Button, { ButtonProps } from "./Button";

type SubheaderProps = {
  children: React.ReactNode;
};
export default function Subheader({ children }: SubheaderProps) {
  return <div className="">{children}</div>;
}
