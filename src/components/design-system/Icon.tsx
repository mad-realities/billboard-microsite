import * as Icons from "@radix-ui/react-icons";
import { MouseEventHandler } from "react";

type WithoutIconSufix<T> = T extends `${infer P}Icon` ? P : never;
export type IconName = WithoutIconSufix<keyof typeof Icons>;

export interface IconProps {
  iconName: IconName;
  className?: string;
  color?: string;
  onClick?: MouseEventHandler;
}
export const Icon = ({ iconName, className, color, onClick }: IconProps) => {
  const IconComponent = Icons[`${iconName}Icon`];
  return <IconComponent className={className} color={color} onClick={onClick} />;
};

export default Icon;
